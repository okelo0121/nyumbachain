import multer from 'multer';

// Use memory storage — we process the buffer and upload to R2 directly
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
    files: 10,                  // Max 10 files per request
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    } else {
      cb(null, true);
    }
  },
});
