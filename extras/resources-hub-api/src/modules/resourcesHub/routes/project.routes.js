import express from 'express';
import * as projectController from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { optionalAuth } from '../middleware/optionalAuth.middleware.js';

const router = express.Router();

router.get('/', optionalAuth, projectController.getProjects);
router.post('/', protect, projectController.createProject);
router.get('/:id', optionalAuth, projectController.getProjectById);

export default router;
