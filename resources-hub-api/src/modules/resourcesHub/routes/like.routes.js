import express from 'express';
import * as likeController from '../controllers/like.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/:postId', protect, likeController.toggleLike);

export default router;
