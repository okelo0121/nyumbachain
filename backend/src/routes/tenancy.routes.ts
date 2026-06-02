import { Router } from 'express';
import {
  submitApplication,
  getMyApplications,
  getIncomingApplications,
  approveApplication,
  rejectApplication,
  getMyTenancy,
  getPaymentHistory,
  getEscrowBalance,
  endLease,
  claimDeposit,
  createApplicationSchema,
} from '../controllers/tenancy.controller';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const applicationRouter = Router();
const tenancyRouter = Router();

// ── Application Routes ──────────────────────────────────────────────────────

// Tenant: submit application
applicationRouter.post(
  '/',
  authenticateJWT,
  authorizeRoles('tenant'),
  validateRequest(createApplicationSchema),
  submitApplication
);

// Tenant: view own applications
applicationRouter.get('/mine', authenticateJWT, authorizeRoles('tenant'), getMyApplications);

// Landlord: view incoming applications
applicationRouter.get(
  '/incoming',
  authenticateJWT,
  authorizeRoles('landlord'),
  getIncomingApplications
);

// Landlord: approve application (triggers tenancy + contract deploy)
applicationRouter.put(
  '/:id/approve',
  authenticateJWT,
  authorizeRoles('landlord'),
  approveApplication
);

// Landlord: reject application
applicationRouter.put(
  '/:id/reject',
  authenticateJWT,
  authorizeRoles('landlord'),
  rejectApplication
);

// ── Tenancy Routes ──────────────────────────────────────────────────────────

// Tenant/Landlord: view active tenancy
tenancyRouter.get('/mine', authenticateJWT, getMyTenancy);

// Tenant/Landlord: payment history
tenancyRouter.get('/:id/payments', authenticateJWT, getPaymentHistory);

// Tenant/Landlord: live escrow balance from contract
tenancyRouter.get('/:id/balance', authenticateJWT, getEscrowBalance);

// Landlord: end lease
tenancyRouter.post('/:id/end-lease', authenticateJWT, authorizeRoles('landlord'), endLease);

// Landlord: claim deposit during inspection window
tenancyRouter.post(
  '/:id/claim-deposit',
  authenticateJWT,
  authorizeRoles('landlord'),
  claimDeposit
);

export { applicationRouter, tenancyRouter };
