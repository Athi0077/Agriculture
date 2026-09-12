import express from 'express';
import { getUserChats, getChatById, sendMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getUserChats)
  .post(protect, upload.single('image'), sendMessage);

router.route('/:id')
  .get(protect, getChatById);

export default router;
