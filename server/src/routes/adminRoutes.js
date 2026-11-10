import express from 'express';
import {
  getAdminDashboardMetrics,
  getCommissionReports,
  updateVendorStatus,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboardMetrics);
router.get('/commissions', getCommissionReports);
router.put('/vendors/:id/status', updateVendorStatus);

export default router;
