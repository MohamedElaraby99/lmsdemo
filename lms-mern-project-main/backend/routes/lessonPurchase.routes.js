import express from 'express';
import { 
    purchaseLesson, 
    checkLessonAccess, 
    getUserPurchases, 
    getLessonPurchaseStats 
} from '../controllers/lessonPurchase.controller.js';
import { isLoggedIn } from '../middleware/auth.middleware.js';
import { authorisedRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Simple purchase lesson - only needs lessonId and userId
router.post('/purchase', isLoggedIn, purchaseLesson);

// Check if user has access to lesson
router.get('/access/:lessonId', isLoggedIn, checkLessonAccess);

// Get user's purchased lessons
router.get('/user-purchases', isLoggedIn, getUserPurchases);

// Get lesson purchase statistics (admin only)
router.get('/stats', isLoggedIn, authorisedRoles('ADMIN'), getLessonPurchaseStats);

export default router; 