import { Router } from "express";
import { 
    getAllBlogs, 
    getAllBlogsForAdmin,
    getBlogById, 
    createBlog, 
    updateBlog, 
    deleteBlog, 
    likeBlog 
} from '../controllers/blog.controller.js';
import { isLoggedIn } from "../middleware/auth.middleware.js";
import upload from '../middleware/multer.middleware.js';

const router = Router();

// Public routes
router.get('/blogs', getAllBlogs);
router.get('/blogs/:id', getBlogById);
router.post('/blogs/:id/like', likeBlog);

// Protected routes (Admin only)
router.get('/admin/blogs', isLoggedIn, getAllBlogsForAdmin);
router.post('/blogs', isLoggedIn, upload.single("image"), createBlog);
router.put('/blogs/:id', isLoggedIn, upload.single("image"), updateBlog);
router.delete('/blogs/:id', isLoggedIn, deleteBlog);

export default router; 