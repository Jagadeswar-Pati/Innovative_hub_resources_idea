import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', protect, authController.getMe);
router.get('/verify-email', authController.verifyEmail);
router.post('/change-password', protect, authController.changePassword);
router.post('/delete-account', protect, authController.deleteAccount);

export default router;
