import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY || '',
  },
});

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET || 'nyumbachain-photos';
const CDN_URL = process.env.CLOUDFLARE_R2_CDN_URL || process.env.CLOUDFLARE_R2_ENDPOINT;

/**
 * Upload a file buffer to R2 and return the CDN URL.
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

  const ext = path.extname(originalname).toLowerCase();
  const key = `properties/${uuidv4()}${ext}`; // Random UUID key — never user-supplied filename

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: mimetype,
  });

  await s3.send(command);

  return `${CDN_URL}/${key}`;
};

/**
 * Delete a photo from R2 by its URL.
 */
export const deletePhoto = async (photoUrl: string): Promise<void> => {
  const key = photoUrl.replace(`${CDN_URL}/`, '');
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  await s3.send(command);
};
