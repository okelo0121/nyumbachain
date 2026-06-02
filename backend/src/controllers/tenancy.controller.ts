import { Response } from 'express';
import { z } from 'zod';
import { Op } from 'sequelize';
import { sequelize } from '../config/db.config';
import {
  Application,
  Unit,
  Property,
  User,
  Tenancy,
  Payment,
} from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { stellarService } from '../services/stellar.service';
import { emailService } from '../services/email.service';

// Zod Schemas
export const createApplicationSchema = z.object({
  unit_id: z.string().uuid('Invalid unit ID'),
  message: z.string().max(1000).optional(),
});

// Controllers

/**
 * POST /api/applications
 * Tenant submits application for a unit.
 */
export const submitApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { unit_id, message } = req.body;

    // Verify unit exists and is available
    const unit = await Unit.findByPk(unit_id, {
      include: [{ model: Property, as: 'property' }],
    });

    if (!unit || !unit.is_available) {
      return res.status(400).json({ error: 'Unit is not available.' });
    }

    // Check for duplicate pending application
    const existing = await Application.findOne({
      where: { unit_id, tenant_id: req.user.id, status: 'pending' },
    });
    if (existing) {
      return res.status(409).json({ error: 'You already have a pending application for this unit.' });
    }

    const application = await Application.create({
      unit_id,
      tenant_id: req.user.id,
      message,
      status: 'pending',
    });

    // Notify landlord via email
    const property = unit.get('property') as Property;
    const landlord = await User.findByPk(property.landlord_id, {
      attributes: ['email', 'full_name'],
    });
    const tenant = await User.findByPk(req.user.id, {
      attributes: ['full_name', 'email', 'phone'],
    });

    if (landlord && tenant) {
      await emailService.sendApplicationNotification(
        landlord.email,
        landlord.full_name,
        tenant.full_name,
        tenant.email,
        property.title,
        message || ''
      );
    }

    return res.status(201).json(application);
  } catch (error) {
    console.error('Submit application error:', error);
    return res.status(500).json({ error: 'Server error submitting application.' });
  }
};

/**
 * GET /api/applications/mine
 * Tenant views their own applications.
 */
export const getMyApplications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const applications = await Application.findAll({
      where: { tenant_id: req.user.id },
      include: [
        {
          model: Unit,
          as: 'unit',
          include: [{ model: Property, as: 'property' }],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    return res.status(500).json({ error: 'Server error retrieving applications.' });
  }
};

/**
 * GET /api/applications/incoming
 * Landlord views applications for their properties.
 */
export const getIncomingApplications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    // Find all units belonging to landlord's properties
    const landlordProperties = await Property.findAll({
      where: { landlord_id: req.user.id, is_active: true },
      attributes: ['id'],
    });
    const propertyIds = landlordProperties.map((p) => p.id);

    const landlordUnits = await Unit.findAll({
      where: { property_id: { [Op.in]: propertyIds } },
      attributes: ['id'],
    });
    const unitIds = landlordUnits.map((u) => u.id);

    const applications = await Application.findAll({
      where: { unit_id: { [Op.in]: unitIds } },
      include: [
        {
          model: Unit,
          as: 'unit',
          include: [{ model: Property, as: 'property' }],
        },
        {
          model: User,
          as: 'tenant',
          attributes: ['id', 'full_name', 'email', 'phone', 'stellar_wallet', 'kyc_verified'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.json(applications);
  } catch (error) {
    console.error('Get incoming applications error:', error);
    return res.status(500).json({ error: 'Server error retrieving incoming applications.' });
  }
};

/**
 * PUT /api/applications/:id/approve
 * Landlord approves application → creates tenancy + deploys escrow contract.
 */
export const approveApplication = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  const t = await sequelize.transaction();
  try {

    const { id } = req.params;
    const { payment_day, start_date } = req.body;

    const application = await Application.findByPk(id, {
      include: [
        {
          model: Unit,
          as: 'unit',
          include: [{ model: Property, as: 'property' }],
        },
        { model: User, as: 'tenant' },
      ],
      transaction: t,
    });

    if (!application) {
      await t.rollback();
      return res.status(404).json({ error: 'Application not found.' });
    }

    if (application.status !== 'pending') {
      await t.rollback();
      return res.status(400).json({ error: 'Application is no longer pending.' });
    }

    const unit = application.get('unit') as Unit;
    const property = unit.get('property') as Property;
    const tenant = application.get('tenant') as User;

    // Ensure the landlord owns this property
    if (property.landlord_id !== req.user.id) {
      await t.rollback();
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    if (!unit.is_available) {
      await t.rollback();
      return res.status(400).json({ error: 'Unit is no longer available.' });
    }

    // 1. Mark application as approved
    await application.update({ status: 'approved' }, { transaction: t });

    // 2. Mark unit as unavailable
    await unit.update({ is_available: false }, { transaction: t });

    // 3. Create tenancy record
    const tenancy = await Tenancy.create(
      {
        unit_id: unit.id,
        tenant_id: application.tenant_id,
        landlord_id: req.user.id,
        start_date: start_date ? new Date(start_date) : new Date(),
        payment_day: payment_day || 1,
        monthly_rent_usdc: unit.monthly_rent_usdc,
        deposit_usdc: unit.deposit_usdc,
        status: 'active',
      },
      { transaction: t }
    );

    await t.commit();

    // 4. Deploy Soroban escrow contract (outside transaction — async blockchain op)
    let contractId: string | null = null;
    let escrowWallet: string | null = null;

    try {
      const landlordUser = await User.findByPk(req.user.id, {
        attributes: ['stellar_wallet'],
      });

      const result = await stellarService.deployEscrowContract({
        landlordKey: landlordUser?.stellar_wallet || '',
        tenantKey: tenant.stellar_wallet || '',
        monthlyRentUsdc: unit.monthly_rent_usdc,
        depositUsdc: unit.deposit_usdc,
        paymentDay: payment_day || 1,
      });

      contractId = result.contractId;
      escrowWallet = result.escrowWallet;

      // 5. Update tenancy with contract info
      await tenancy.update({
        escrow_contract_id: contractId,
        escrow_wallet_address: escrowWallet,
      });
    } catch (contractError) {
      console.error('Contract deployment error (non-fatal):', contractError);
      // Don't fail the whole approval — tenancy is created, contract can be retried
    }

    // 6. Email notifications
    await emailService.sendLeaseApproved(
      tenant.email,
      tenant.full_name,
      property.title,
      unit.monthly_rent_usdc,
      unit.deposit_usdc,
      escrowWallet || 'Pending deployment',
      String(tenancy.id)
    );

    return res.json({
      message: 'Application approved. Tenancy and escrow contract created.',
      tenancy,
      contract_id: contractId,
      escrow_wallet: escrowWallet,
    });
  } catch (error) {
    await t.rollback();
    console.error('Approve application error:', error);
    return res.status(500).json({ error: 'Server error approving application.' });
  }
};

/**
 * PUT /api/applications/:id/reject
 * Landlord rejects an application.
 */
export const rejectApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { id } = req.params;
    const application = await Application.findByPk(id, {
      include: [
        {
          model: Unit,
          as: 'unit',
          include: [{ model: Property, as: 'property' }],
        },
        { model: User, as: 'tenant' },
      ],
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const unit = application.get('unit') as Unit;
    const property = unit.get('property') as Property;

    if (property.landlord_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Application is no longer pending.' });
    }

    await application.update({ status: 'rejected' });

    const tenant = application.get('tenant') as User;
    await emailService.sendApplicationRejected(
      tenant.email,
      tenant.full_name,
      property.title
    );

    return res.json({ message: 'Application rejected.' });
  } catch (error) {
    console.error('Reject application error:', error);
    return res.status(500).json({ error: 'Server error rejecting application.' });
  }
};

/**
 * GET /api/tenancies/mine
 * Tenant views their active tenancy.
 */
export const getMyTenancy = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    const tenancy = await Tenancy.findOne({
      where: { tenant_id: req.user.id, status: 'active' },
      include: [
        {
          model: Unit,
          as: 'unit',
          include: [{ model: Property, as: 'property' }],
        },
        {
          model: User,
          as: 'landlord',
          attributes: ['id', 'full_name', 'email', 'phone', 'stellar_wallet'],
        },
      ],
    });

    if (!tenancy) {
      return res.status(404).json({ error: 'No active tenancy found.' });
    }

    // Calculate next payment date
    const today = new Date();
    const nextPayment = new Date(today.getFullYear(), today.getMonth(), tenancy.payment_day);
    if (nextPayment <= today) {
      nextPayment.setMonth(nextPayment.getMonth() + 1);
    }

    return res.json({ tenancy, nextPaymentDate: nextPayment });
  } catch (error) {
    console.error('Get tenancy error:', error);
    return res.status(500).json({ error: 'Server error retrieving tenancy.' });
  }
};

/**
 * GET /api/tenancies/:id/payments
 * Full payment history for a tenancy.
 */
export const getPaymentHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const tenancy = await Tenancy.findByPk(id);
    if (!tenancy) {
      return res.status(404).json({ error: 'Tenancy not found.' });
    }

    // Only allow tenant or landlord of this tenancy
    if (req.user?.id !== tenancy.tenant_id && req.user?.id !== tenancy.landlord_id) {
      return res.status(403).json({ error: 'Access forbidden.' });
    }

    const payments = await Payment.findAll({
      where: { tenancy_id: id },
      order: [['due_date', 'DESC']],
    });

    return res.json(payments);
  } catch (error) {
    console.error('Get payment history error:', error);
    return res.status(500).json({ error: 'Server error retrieving payment history.' });
  }
};

/**
 * GET /api/tenancies/:id/balance
 * Live USDC balance from the escrow Soroban contract.
 */
export const getEscrowBalance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tenancy = await Tenancy.findByPk(id);

    if (!tenancy || !tenancy.escrow_contract_id) {
      return res.status(404).json({ error: 'Tenancy or escrow contract not found.' });
    }

    if (req.user?.id !== tenancy.tenant_id && req.user?.id !== tenancy.landlord_id) {
      return res.status(403).json({ error: 'Access forbidden.' });
    }

    const balanceStroops = await stellarService.getContractBalance(tenancy.escrow_contract_id);
    const balanceUsdc = Number(balanceStroops) / 1e7;

    return res.json({
      balance_usdc: balanceUsdc,
      balance_stroops: String(balanceStroops),
      monthly_rent_usdc: tenancy.monthly_rent_usdc,
      deposit_usdc: tenancy.deposit_usdc,
    });
  } catch (error) {
    console.error('Get balance error:', error);
    return res.status(500).json({ error: 'Server error retrieving balance.' });
  }
};

/**
 * POST /api/tenancies/:id/end-lease
 * Landlord ends the lease — contract.terminate() is called.
 */
export const endLease = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { id } = req.params;
    const tenancy = await Tenancy.findByPk(id);

    if (!tenancy || tenancy.landlord_id !== req.user.id) {
      return res.status(404).json({ error: 'Tenancy not found or unauthorized.' });
    }

    if (tenancy.status !== 'active') {
      return res.status(400).json({ error: 'Tenancy is not currently active.' });
    }

    // Call contract.terminate()
    if (tenancy.escrow_contract_id) {
      await stellarService.terminateContract(tenancy.escrow_contract_id);
    }

    await tenancy.update({ status: 'ending', end_date: new Date() });

    // Reopen the unit
    await Unit.update({ is_available: true }, { where: { id: tenancy.unit_id } });

    const tenant = await User.findByPk(tenancy.tenant_id, { attributes: ['email', 'full_name'] });
    const landlord = await User.findByPk(req.user.id, { attributes: ['email', 'full_name'] });

    if (tenant && landlord) {
      await emailService.sendLeaseEnding(tenant.email, tenant.full_name, landlord.full_name);
    }

    return res.json({ message: 'Lease termination initiated. 7-day inspection window has started.' });
  } catch (error) {
    console.error('End lease error:', error);
    return res.status(500).json({ error: 'Server error ending lease.' });
  }
};

/**
 * POST /api/tenancies/:id/claim-deposit
 * Landlord claims deposit during the 7-day inspection window.
 */
export const claimDeposit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const tenancy = await Tenancy.findByPk(id);
    if (!tenancy || tenancy.landlord_id !== req.user.id) {
      return res.status(404).json({ error: 'Tenancy not found or unauthorized.' });
    }

    if (tenancy.status !== 'ending') {
      return res.status(400).json({ error: 'Tenancy is not in ending state. Cannot claim deposit.' });
    }

    if (tenancy.escrow_contract_id) {
      await stellarService.claimDeposit(tenancy.escrow_contract_id, reason);
    }

    await tenancy.update({ status: 'disputed' });

    // Record deposit claim in payments table
    await Payment.create({
      tenancy_id: tenancy.id!,
      amount_usdc: tenancy.deposit_usdc,
      payment_type: 'deposit',
      status: 'executed',
      due_date: new Date(),
      executed_at: new Date(),
    });

    return res.json({ message: 'Deposit claim initiated. Reason recorded on-chain.' });
  } catch (error) {
    console.error('Claim deposit error:', error);
    return res.status(500).json({ error: 'Server error claiming deposit.' });
  }
};
