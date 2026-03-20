import express from 'express';
import * as collaborationController from '../controllers/collaboration.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/apply/:postId', protect, collaborationController.apply);
router.post('/accept/:collabId', protect, collaborationController.accept);
router.post('/reject/:collabId', protect, collaborationController.reject);
router.post('/confirm-payment/:collabId', protect, collaborationController.confirmPayment);
router.post('/complete/:collabId', protect, collaborationController.complete);
router.get('/my', protect, collaborationController.getMyCollaborations);
router.get('/post/:postId', protect, collaborationController.getPostApplications);

export default router;
