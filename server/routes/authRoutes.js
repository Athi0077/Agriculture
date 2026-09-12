import express from 'express';
import { signup, login, getMe, updateSettings } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/settings', protect, updateSettings);

export default router;
