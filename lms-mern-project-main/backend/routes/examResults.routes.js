import express from 'express';
import { isLoggedIn, authorisedRoles } from '../middleware/auth.middleware.js';
import {
    getAllExamResults,
    getExamResultsStats,
    getExamResultById,
    exportExamResults
} from '../controllers/examResults.controller.js';

const router = express.Router();

// All routes require admin authentication
router.use(isLoggedIn);
router.use(authorisedRoles('ADMIN'));

// Get all exam results with filtering and pagination
router.get('/', getAllExamResults);

// Export exam results to CSV
router.get('/export', exportExamResults);

// Get exam results statistics
router.get('/stats', getExamResultsStats);

// Get specific exam result by ID
router.get('/:id', getExamResultById);

export default router;
