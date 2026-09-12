import express from 'express';
import { analyzeScan, getUserScans, getScanById, deleteScan, getCommunityScans } from '../controllers/scanController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/community', protect, getCommunityScans);
router.post('/analyze', protect, upload.single('image'), analyzeScan);
router.get('/', protect, getUserScans);
router.get('/:id', protect, getScanById);
router.delete('/:id', protect, deleteScan);

export default router;
