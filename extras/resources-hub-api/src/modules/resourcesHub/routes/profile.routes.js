import express from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { optionalAuth } from '../middleware/optionalAuth.middleware.js';
import { uploadAvatar, uploadCover } from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/handle/:handle', optionalAuth, profileController.getProfileByHandle);

router.use(protect);
router.get('/me', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.post('/follow/:userId', profileController.followUser);
router.post('/unfollow/:userId', profileController.unfollowUser);
router.post('/avatar', uploadAvatar, profileController.uploadAvatar);
router.post('/cover', uploadCover, profileController.uploadCover);

export default router;
