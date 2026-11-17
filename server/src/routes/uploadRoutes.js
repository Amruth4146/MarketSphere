import express from 'express';
import {
  upload,
  uploadImage,
  getPresignedUrl,
  deleteImage,
} from '../controllers/uploadController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected upload routes (Vendor and Admin only)
router.post(
  '/image',
  protect,
  authorize('vendor', 'admin'),
  upload.single('image'),
  uploadImage
);

router.post(
  '/presign',
  protect,
  authorize('vendor', 'admin'),
  getPresignedUrl
);

router.delete(
  '/image',
  protect,
  authorize('vendor', 'admin'),
  deleteImage
);

export default router;

