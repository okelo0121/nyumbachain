import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

/**
 * Upload a file buffer to Cloudinary and return the secure CDN URL.
 * Validates MIME type — only image formats allowed.
 */
export const uploadPhoto = async (
  fileBuffer: Buffer,
  originalname: string,
  mimetype: string
): Promise<string> => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowed.includes(mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'nyumbachain',
        public_id: `${uuidv4()}`,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error('Failed to upload photo to Cloudinary.'));
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Unknown upload error occurred.'));
        }
      }
    );

    uploadStream.write(fileBuffer);
    uploadStream.end();
  });
};

/**
 * Delete a photo from Cloudinary by its URL.
 */
export const deletePhoto = async (photoUrl: string): Promise<void> => {
  try {
    // Extract public ID from Cloudinary URL
    // Format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[folder]/[public_id].[ext]
    const parts = photoUrl.split('/');
    const fileWithExt = parts.pop() || '';
    const folder = parts.pop() || '';
    const publicId = fileWithExt.split('.')[0];
    const fullPublicId = `${folder}/${publicId}`;

    await cloudinary.uploader.destroy(fullPublicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err);
  }
};
