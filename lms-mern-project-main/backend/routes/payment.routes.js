import { Router } from "express";
const router = Router();
import { 
    recordCoursePurchase, 
    getPaymentStats, 
    getUserPurchases, 
    simulateCoursePurchase 
} from '../controllers/payment.controller.js';
import { isLoggedIn, authorisedRoles } from "../middleware/auth.middleware.js";

// Record a course purchase
router.post('/purchase', isLoggedIn, recordCoursePurchase);

// Get payment statistics (admin only)
router.get('/stats', isLoggedIn, authorisedRoles('ADMIN'), getPaymentStats);

// Get user's purchase history
router.get('/user/:userId', isLoggedIn, getUserPurchases);

// Simulate course purchase (for testing - admin only)
router.post('/simulate', isLoggedIn, authorisedRoles('ADMIN'), simulateCoursePurchase);

export default router;