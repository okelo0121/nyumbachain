/**
 * email.service.ts
 * Transactional email via Resend API.
 * Falls back to console log in development if RESEND_API_KEY is not set.
 */

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'NyumbaChain <noreply@nyumbachain.app>';

const sendEmail = async (payload: EmailPayload): Promise<void> => {
  if (!RESEND_API_KEY) {
    console.log(`[EMAIL - DEV MODE] To: ${payload.to} | Subject: ${payload.subject}`);
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Resend email error:', err);
  }
};

export const emailService = {
  /**
   * Notify landlord that a tenant has applied.
   */
  sendApplicationNotification: async (
    landlordEmail: string,
    landlordName: string,
    tenantName: string,
    tenantEmail: string,
    propertyTitle: string,
    message: string
  ) => {
    await sendEmail({
      to: landlordEmail,
      subject: `New Application for ${propertyTitle}`,
      html: `
        <h2>New Rental Application</h2>
        <p>Hi ${landlordName},</p>
        <p><strong>${tenantName}</strong> (${tenantEmail}) has applied for a unit at <strong>${propertyTitle}</strong>.</p>
        ${message ? `<p><em>Message from tenant:</em> "${message}"</p>` : ''}
        <p>Log in to your NyumbaChain dashboard to review and approve or reject this application.</p>
      `,
    });
  },

  /**
   * Notify tenant their application was approved and provide escrow wallet info.
   */
  sendLeaseApproved: async (
    tenantEmail: string,
    tenantName: string,
    propertyTitle: string,
    monthlyRentUsdc: number,
    depositUsdc: number,
    escrowWallet: string,
    tenancyId: string
  ) => {
    await sendEmail({
      to: tenantEmail,
      subject: `🎉 Your lease for ${propertyTitle} has been approved!`,
      html: `
        <h2>Lease Approved</h2>
        <p>Hi ${tenantName},</p>
        <p>Great news! Your application for <strong>${propertyTitle}</strong> has been approved.</p>
        <h3>Your Escrow Wallet Details</h3>
        <p><strong>Escrow Wallet Address:</strong> <code>${escrowWallet}</code></p>
        <p><strong>Monthly Rent:</strong> ${monthlyRentUsdc} USDC</p>
        <p><strong>Security Deposit:</strong> ${depositUsdc} USDC</p>
        <p><strong>Amount to fund initially:</strong> ${(monthlyRentUsdc + depositUsdc).toFixed(2)} USDC (deposit + first month)</p>
        <p>Send USDC from any Stellar wallet (Freighter, Lobstr, etc.) to the above escrow wallet address to activate your lease.</p>
        <p>Your rent will be automatically released to your landlord on the agreed payment day each month.</p>
        <p><a href="${process.env.FRONTEND_URL}/tenant/wallet">View your wallet dashboard</a></p>
      `,
    });
  },

  /**
   * Notify tenant their application was rejected.
   */
  sendApplicationRejected: async (
    tenantEmail: string,
    tenantName: string,
    propertyTitle: string
  ) => {
    await sendEmail({
      to: tenantEmail,
      subject: `Your application for ${propertyTitle}`,
      html: `
        <h2>Application Update</h2>
        <p>Hi ${tenantName},</p>
        <p>We regret to inform you that your application for <strong>${propertyTitle}</strong> was not approved at this time.</p>
        <p>Please continue searching for available properties on NyumbaChain.</p>
        <p><a href="${process.env.FRONTEND_URL}/search">Search properties</a></p>
      `,
    });
  },

  /**
   * Send payment receipt to both landlord and tenant after successful execution.
   */
  sendPaymentReceipt: async (
    landlordEmail: string,
    tenantEmail: string,
    landlordName: string,
    tenantName: string,
    amountUsdc: number,
    txHash: string,
    propertyTitle: string
  ) => {
    const stellarExpertUrl = `https://stellar.expert/explorer/testnet/tx/${txHash}`;
    const html = `
      <h2>✅ Rent Payment Executed</h2>
      <p>Rent of <strong>${amountUsdc} USDC</strong> for <strong>${propertyTitle}</strong> has been successfully transferred.</p>
      <p><strong>Transaction Hash:</strong> <a href="${stellarExpertUrl}">${txHash}</a></p>
      <p>This payment is permanently recorded on the Stellar blockchain.</p>
    `;

    await sendEmail({ to: landlordEmail, subject: `Rent received: ${amountUsdc} USDC`, html: `<p>Hi ${landlordName},</p>${html}` });
    await sendEmail({ to: tenantEmail, subject: `Rent paid: ${amountUsdc} USDC`, html: `<p>Hi ${tenantName},</p>${html}` });
  },

  /**
   * Alert tenant about insufficient funds — sent immediately, then again at 9am/6pm.
   */
  sendInsufficientFundsAlert: async (
    tenantEmail: string,
    tenantName: string,
    requiredUsdc: number,
    availableUsdc: number,
    escrowWallet: string
  ) => {
    await sendEmail({
      to: tenantEmail,
      subject: '⚠️ Insufficient funds — Rent payment failed',
      html: `
        <h2>Rent Payment Failed</h2>
        <p>Hi ${tenantName},</p>
        <p>Your rent payment could not be processed due to insufficient funds in your escrow wallet.</p>
        <p><strong>Required:</strong> ${requiredUsdc} USDC</p>
        <p><strong>Available:</strong> ${availableUsdc} USDC</p>
        <p><strong>Shortfall:</strong> ${(requiredUsdc - availableUsdc).toFixed(2)} USDC</p>
        <p>Please top up your escrow wallet immediately: <code>${escrowWallet}</code></p>
        <p>You have a 3-day grace period before a late fee is applied.</p>
        <p><a href="${process.env.FRONTEND_URL}/tenant/wallet">Top up now</a></p>
      `,
    });
  },

  /**
   * Notify both parties that the lease is ending.
   */
  sendLeaseEnding: async (
    tenantEmail: string,
    tenantName: string,
    landlordName: string
  ) => {
    await sendEmail({
      to: tenantEmail,
      subject: 'Your lease has been terminated',
      html: `
        <h2>Lease Termination Notice</h2>
        <p>Hi ${tenantName},</p>
        <p>${landlordName} has initiated lease termination. A 7-day inspection window is now underway.</p>
        <p>If no damage claim is made by the landlord within 7 days, your deposit will be automatically returned to your Stellar wallet.</p>
      `,
    });
  },

  /**
   * Notify tenant their deposit has been returned.
   */
  sendDepositReturned: async (
    tenantEmail: string,
    tenantName: string,
    landlordName: string,
    depositUsdc: number,
    txHash: string
  ) => {
    const stellarExpertUrl = txHash
      ? `https://stellar.expert/explorer/testnet/tx/${txHash}`
      : null;
    await sendEmail({
      to: tenantEmail,
      subject: `Your deposit of ${depositUsdc} USDC has been returned`,
      html: `
        <h2>Deposit Returned</h2>
        <p>Hi ${tenantName},</p>
        <p>Your security deposit of <strong>${depositUsdc} USDC</strong> has been released back to your Stellar wallet by ${landlordName}.</p>
        ${stellarExpertUrl ? `<p><strong>Transaction:</strong> <a href="${stellarExpertUrl}">${txHash}</a></p>` : ''}
        <p>Thank you for using NyumbaChain.</p>
      `,
    });
  },
};
