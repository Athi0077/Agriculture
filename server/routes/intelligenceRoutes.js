import express from 'express';
import { analyzeIntelligence, askDoubt } from '../controllers/intelligenceController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/analyze', protect, upload.single('image'), analyzeIntelligence);
router.post('/ask-doubt', protect, askDoubt);

export default router;
