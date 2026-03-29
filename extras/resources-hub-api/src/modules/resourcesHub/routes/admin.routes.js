import express from 'express';
import * as adminController from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/posts', adminController.getAllPosts);
router.delete('/posts/:id', adminController.deletePost);
router.get('/collaborations/paid', adminController.getPaidCollaborations);
router.get('/revenue', adminController.getRevenueStats);
router.post('/users/:userId/ban', adminController.banUser);
router.post('/users/:userId/unban', adminController.unbanUser);

export default router;
