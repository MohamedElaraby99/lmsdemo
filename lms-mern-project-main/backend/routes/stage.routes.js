import express from 'express';
import { isLoggedIn, authorisedRoles } from '../middleware/auth.middleware.js';
import {
    getAllStages,
    getStageById,
    createStage,
    updateStage,
    deleteStage,
    getStageStats,
    getAllStagesWithStats,
    toggleStageStatus
} from '../controllers/stage.controller.js';

const router = express.Router();

// Public routes
router.route('/')
    .get(getAllStages);

router.route('/stats')
    .get(getAllStagesWithStats);

router.route('/:id')
    .get(getStageById);

router.route('/:id/stats')
    .get(getStageStats);

// Admin only routes
router.use(isLoggedIn);
router.use(authorisedRoles('ADMIN'));

router.route('/')
    .post(createStage);

router.route('/:id')
    .put(updateStage)
    .delete(deleteStage);

router.route('/:id/toggle-status')
    .put(toggleStageStatus);

export default router; 