import express from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProductBySlugOrId,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { productValidator } from '../validators/productValidator.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:identifier', getProductBySlugOrId);

// Seller/Admin protected routes
router.post(
  '/',
  protect,
  authorize('seller', 'admin'),
  productValidator,
  validateRequest,
  createProduct
);
router.put('/:id', protect, authorize('seller', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct);

// Reviews
router.post('/:id/reviews', protect, addReview);

export default router;
