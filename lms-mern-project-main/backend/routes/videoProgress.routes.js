import express from "express";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import {
  getVideoProgress,
  updateVideoProgress,
  getCourseProgress,
  getVideoProgressForAllUsers,
  resetVideoProgress
} from "../controllers/videoProgress.controller.js";

const router = express.Router();

// Get user's progress for all videos in a course
router.get("/course/:courseId", isLoggedIn, getCourseProgress);

// Get all users' progress for a specific video (admin only)
router.get("/admin/video/:videoId", isLoggedIn, getVideoProgressForAllUsers);

// Get or create video progress for a user
router.get("/:courseId/:videoId", isLoggedIn, getVideoProgress);

// Update video progress
router.put("/:courseId/:videoId", isLoggedIn, updateVideoProgress);

// Reset video progress
router.delete("/:videoId", isLoggedIn, resetVideoProgress);

export default router; 