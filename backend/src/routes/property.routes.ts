import { Router } from 'express';
import {
  createProperty,
  getPropertyDetails,
  updateProperty,
  deleteProperty,
  searchProperties,
  addUnit,
  updateUnit,
  createPropertySchema,
  updatePropertySchema,
  createUnitSchema,
  updateUnitSchema,
} from '../controllers/property.controller';
import { uploadPhotos } from '../controllers/upload.controller';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { upload } from '../middleware/multer';

const router = Router();

// Properties
router.get('/', searchProperties);
router.get('/:id', getPropertyDetails);
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('landlord'),
  validateRequest(createPropertySchema),
  createProperty
);
router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('landlord'),
  validateRequest(updatePropertySchema),
  updateProperty
);
router.delete('/:id', authenticateJWT, authorizeRoles('landlord'), deleteProperty);

// Photo upload
router.post(
  '/:id/photos',
  authenticateJWT,
  authorizeRoles('landlord'),
  upload.array('photos', 10),
  uploadPhotos
);

// Units
router.post(
  '/units',
  authenticateJWT,
  authorizeRoles('landlord'),
  validateRequest(createUnitSchema),
  addUnit
);
router.put(
  '/units/:id',
  authenticateJWT,
  authorizeRoles('landlord'),
  validateRequest(updateUnitSchema),
  updateUnit
);

export default router;
