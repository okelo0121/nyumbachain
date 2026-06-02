import cron from 'node-cron';
import { Op } from 'sequelize';
import { sequelize } from '../config/db.config';
import { Tenancy, Payment, User } from '../models';
import { stellarService } from '../services/stellar.service';
import { emailService } from '../services/email.service';

/**
 * Payment Cron Job — runs daily at 00:05 UTC.
 * 
 * Critical rules (from doc):
 * 1. IDEMPOTENCY FIRST: check existing executed payment for current month before calling execute_payment()
 * 2. AUDIT EVERY ATTEMPT: write every success AND failure to payments table
 * 3. TIMEOUT: 30s timeout per Stellar call — never crash the cron
 * 4. NOTIFICATIONS: notify tenant within 5 minutes on failure
 */
export const startPaymentCron = () => {
  cron.schedule('5 0 * * *', async () => {
    console.log(`[CRON] Payment cron started at ${new Date().toISOString()}`);

    const today = new Date();
    const todayDay = today.getDate();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    // Find all active tenancies where payment_day = today
    let dueTenancies: Tenancy[];
    try {
      dueTenancies = await Tenancy.findAll({
        where: {
          status: 'active',
          payment_day: todayDay,
          [Op.and]: sequelize.literal('escrow_contract_id IS NOT NULL'),
        } as any,
        include: [
          { model: User, as: 'tenant', attributes: ['id', 'email', 'full_name', 'stellar_wallet'] },
          { model: User, as: 'landlord', attributes: ['id', 'email', 'full_name', 'stellar_wallet'] },
        ],
      });
    } catch (err) {
      console.error('[CRON] Failed to fetch due tenancies:', err);
      return;
    }

    console.log(`[CRON] Found ${dueTenancies.length} tenancies due today (day ${todayDay})`);

    for (const tenancy of dueTenancies) {
      await processPayment(tenancy, startOfMonth, endOfMonth, today);
    }

    console.log(`[CRON] Payment cron completed at ${new Date().toISOString()}`);
  }, {
    timezone: 'UTC',
  });

  console.log('[CRON] Payment cron scheduled: 00:05 UTC daily');
};

async function processPayment(
  tenancy: Tenancy,
  startOfMonth: Date,
  endOfMonth: Date,
  dueDate: Date
): Promise<void> {
  const tenancyId = tenancy.id!;

  try {
    // ── IDEMPOTENCY CHECK ──────────────────────────────────────────
    // This is the single most critical check — prevents double charging.
    const existing = await Payment.findOne({
      where: {
        tenancy_id: tenancyId,
        due_date: { [Op.between]: [startOfMonth, endOfMonth] },
        status: 'executed',
      },
    });

    if (existing) {
      console.log(`[CRON] Skipping tenancy ${tenancyId} — payment already executed this month.`);
      return;
    }

    // ── CREATE PENDING RECORD (audit trail) ───────────────────────
    const paymentRecord = await Payment.create({
      tenancy_id: tenancyId,
      amount_usdc: tenancy.monthly_rent_usdc,
      payment_type: 'rent',
      status: 'pending',
      due_date: dueDate,
    });

    console.log(`[CRON] Processing payment for tenancy ${tenancyId}...`);

    // ── CALL SOROBAN CONTRACT (30s timeout) ────────────────────────
    const txHash = await Promise.race([
      stellarService.executePayment(tenancy.escrow_contract_id!),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Stellar call timed out after 30s')), 30_000)
      ),
    ]);

    // ── SUCCESS ───────────────────────────────────────────────────
    await paymentRecord.update({
      status: 'executed',
      stellar_tx_hash: txHash,
      executed_at: new Date(),
    });

    console.log(`[CRON] ✅ Payment executed for tenancy ${tenancyId}. TX: ${txHash}`);

    // Send receipt to both parties
    const tenant = tenancy.get('tenant') as User;
    const landlord = tenancy.get('landlord') as User;
    if (tenant && landlord) {
      await emailService.sendPaymentReceipt(
        landlord.email,
        tenant.email,
        landlord.full_name,
        tenant.full_name,
        tenancy.monthly_rent_usdc,
        txHash,
        `Tenancy ${tenancyId}` // Property title would require an extra join — use tenancy ID for now
      );
    }
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    console.error(`[CRON] ❌ Payment FAILED for tenancy ${tenancyId}: ${errorMessage}`);

    // ── AUDIT THE FAILURE ─────────────────────────────────────────
    try {
      await Payment.update(
        {
          status: 'failed',
          failure_reason: errorMessage,
        },
        {
          where: {
            tenancy_id: tenancyId,
            status: 'pending',
            due_date: { [Op.between]: [new Date(Date.now() - 60_000), new Date()] },
          },
        }
      );
    } catch (dbErr) {
      console.error('[CRON] Failed to update payment failure record:', dbErr);
    }

    // ── NOTIFY TENANT ─────────────────────────────────────────────
    try {
      const tenant = tenancy.get('tenant') as User;
      if (tenant) {
        const insufficientMatch = errorMessage.toLowerCase().includes('insufficient funds');
        if (insufficientMatch) {
          const balanceStroops = await stellarService.getContractBalance(tenancy.escrow_contract_id!);
          const available = Number(balanceStroops) / 1e7;
          await emailService.sendInsufficientFundsAlert(
            tenant.email,
            tenant.full_name,
            tenancy.monthly_rent_usdc,
            available,
            tenancy.escrow_wallet_address || tenancy.escrow_contract_id!
          );
        }
      }
    } catch (notifyErr) {
      console.error('[CRON] Failed to send failure notification:', notifyErr);
    }
  }
}
