import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getSellerOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createOrderValidator } from '../validators/orderValidator.js';

const router = express.Router();

// Protected user routes
router.post('/', protect, createOrderValidator, validateRequest, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/seller', protect, authorize('seller', 'admin'), getSellerOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, authorize('seller', 'admin'), updateOrderStatus);

export default router;
