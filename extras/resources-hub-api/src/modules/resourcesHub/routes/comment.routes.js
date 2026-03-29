import express from 'express';
import * as commentController from '../controllers/comment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/post/:postId', protect, commentController.getComments);
router.post('/post/:postId', protect, commentController.createComment);

export default router;
