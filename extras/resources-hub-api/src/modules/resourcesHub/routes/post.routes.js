import express from 'express';
import * as postController from '../controllers/post.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { optionalAuth } from '../middleware/optionalAuth.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/', optionalAuth, postController.getPosts);
router.get('/:id', optionalAuth, postController.getPostById);
router.post('/', protect, uploadSingle, postController.createPost);
router.put('/:id', protect, uploadSingle, postController.updatePost);
router.delete('/:id', protect, postController.deletePost);

export default router;
