import express from 'express';
import { createPost, getPosts, addComment } from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createPost);
router.get('/', protect, getPosts);
router.post('/:id/comments', protect, addComment);

export default router;
