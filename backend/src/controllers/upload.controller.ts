import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Property } from '../models';
import { uploadPhoto } from '../services/storage.service';

export const uploadPhotos = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    if (property.landlord_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized. You do not own this property.' });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No photos uploaded.' });
    }

    // Upload each file to R2
    const uploadedUrls: string[] = [];
    for (const file of files) {
      const url = await uploadPhoto(file.buffer, file.originalname, file.mimetype);
      uploadedUrls.push(url);
    }

    // Append to existing photos
    const existingPhotos: string[] = (property.photos as string[]) || [];
    const allPhotos = [...existingPhotos, ...uploadedUrls];

    await property.update({ photos: allPhotos });

    return res.json({
      message: `${uploadedUrls.length} photo(s) uploaded successfully.`,
      photos: allPhotos,
    });
  } catch (error: any) {
    console.error('Photo upload error:', error);
    return res.status(500).json({ error: error.message || 'Server error during photo upload.' });
  }
};
