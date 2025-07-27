import { Router } from "express";
const router = Router();
import { 
    purchaseLesson, 
    checkLessonPurchase, 
    getUserLessonPurchases, 
    getLessonPurchaseStats 
} from '../controllers/lessonPurchase.controller.js';
import { isLoggedIn, authorisedRoles } from "../middleware/auth.middleware.js";

// Purchase a lesson
router.post('/purchase', isLoggedIn, purchaseLesson);

// Check if user has purchased a specific lesson
router.get('/check/:courseId/:lessonId', isLoggedIn, checkLessonPurchase);

// Get user's lesson purchase history
router.get('/user/history', isLoggedIn, getUserLessonPurchases);

// Get lesson purchase statistics (admin only)
router.get('/stats/:courseId', isLoggedIn, authorisedRoles('ADMIN'), getLessonPurchaseStats);

export default router; 