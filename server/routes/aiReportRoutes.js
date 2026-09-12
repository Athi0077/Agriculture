import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getAIReports, getAIReportById, markReportAsRead } from '../controllers/aiReportController.js';

const router = express.Router();

router.route('/').get(protect, getAIReports);
router.route('/:id').get(protect, getAIReportById);
router.route('/:id/read').post(protect, markReportAsRead);

export default router;
