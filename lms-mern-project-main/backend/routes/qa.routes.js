import { Router } from "express";
import { 
    getAllQAs, 
    getQAById, 
    createQA, 
    updateQA, 
    deleteQA, 
    upvoteQA, 
    downvoteQA, 
    getFeaturedQAs 
} from '../controllers/qa.controller.js';
import { isLoggedIn } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.get('/qas', getAllQAs);
router.get('/qas/featured', getFeaturedQAs);
router.get('/qas/:id', getQAById);
router.post('/qas/:id/upvote', upvoteQA);
router.post('/qas/:id/downvote', downvoteQA);

// Protected routes (Admin only)
router.post('/qas', isLoggedIn, createQA);
router.put('/qas/:id', isLoggedIn, updateQA);
router.delete('/qas/:id', isLoggedIn, deleteQA);

export default router; 