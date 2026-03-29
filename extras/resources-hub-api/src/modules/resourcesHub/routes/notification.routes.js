import express from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.get('/', notificationController.getMyNotifications);
router.put('/:id/read', notificationController.markRead);
router.put('/read-all', notificationController.markAllRead);

export default router;
