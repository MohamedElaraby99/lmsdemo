import { Router } from "express";
import { 
    getAllSubjects, 
    getSubjectById, 
    createSubject, 
    updateSubject, 
    deleteSubject, 
    getFeaturedSubjects,
    toggleFeatured,
    updateSubjectStatus
} from '../controllers/subject.controller.js';
import { isLoggedIn } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();

// Public routes
router.get('/subjects', getAllSubjects);
router.get('/subjects/featured', getFeaturedSubjects);
router.get('/subjects/:id', getSubjectById);

// Protected routes (Admin only)
router.post('/subjects', isLoggedIn, upload.single('image'), createSubject);
router.put('/subjects/:id', isLoggedIn, upload.single('image'), updateSubject);
router.delete('/subjects/:id', isLoggedIn, deleteSubject);
router.post('/subjects/:id/toggle-featured', isLoggedIn, toggleFeatured);
router.put('/subjects/:id/status', isLoggedIn, updateSubjectStatus);

export default router; 