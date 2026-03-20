import express from 'express';
import * as searchController from '../controllers/search.controller.js';
import * as exploreController from '../controllers/explore.controller.js';
import { optionalAuth } from '../middleware/optionalAuth.middleware.js';

const router = express.Router();

router.get('/', optionalAuth, searchController.search);
router.get('/users', optionalAuth, searchController.searchUsers);
router.get('/trending', optionalAuth, exploreController.getTrending);

export default router;
