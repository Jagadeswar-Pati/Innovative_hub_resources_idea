import express from 'express';
import * as communityController from '../controllers/community.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { optionalAuth } from '../middleware/optionalAuth.middleware.js';

const router = express.Router();

router.get('/', optionalAuth, communityController.listCommunities);
router.get('/:id', optionalAuth, communityController.getCommunity);
router.get('/:id/messages', optionalAuth, communityController.getCommunityMessages);
router.post('/', protect, communityController.createCommunity);
router.post('/:id/join', protect, communityController.joinCommunity);
router.post('/:id/leave', protect, communityController.leaveCommunity);
router.post('/:id/messages', protect, communityController.createCommunityMessage);
router.delete('/:id/messages/:messageId', protect, communityController.deleteCommunityMessage);
router.post('/:id/admins', protect, communityController.addCommunityAdmin);
router.delete('/:id/admins/:userId', protect, communityController.removeCommunityAdmin);
router.delete('/:id', protect, communityController.deleteCommunity);

export default router;
