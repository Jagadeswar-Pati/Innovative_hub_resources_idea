import express from 'express';
import * as messageController from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/fee', messageController.getMessageFee);
router.get('/conversations', protect, messageController.getMyConversations);
router.post('/start', protect, messageController.startOrGetConversation);
router.post('/pay-access', protect, messageController.payMessageAccess);
router.get('/conversations/:conversationId', protect, messageController.getMessages);
router.post('/conversations/:conversationId/image', protect, uploadSingle, messageController.sendImageMessage);
router.post('/conversations/:conversationId', protect, messageController.sendMessage);

export default router;
