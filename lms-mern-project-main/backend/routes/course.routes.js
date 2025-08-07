import express from 'express';
import upload from '../middleware/multer.middleware.js';
import { isLoggedIn, authorisedRoles } from '../middleware/auth.middleware.js';
import {
  createCourse,
  getAllCourses,
  getFeaturedCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCourseStats,
  addUnitToCourse,
  addLessonToUnit,
  addDirectLessonToCourse,
  updateLesson,
  deleteLesson,
  reorderLessons,
  deleteUnit,
  updateUnit
} from '../controllers/course.controller.js';

const router = express.Router();

// Public routes
router.get('/', getAllCourses);
router.get('/featured', getFeaturedCourses);
router.get('/stats', getCourseStats);
router.get('/:id', getCourseById);

// Protected routes
router.post('/', upload.single('thumbnail'), isLoggedIn, authorisedRoles('ADMIN', 'INSTRUCTOR'), createCourse);
router.put('/:id', upload.single('thumbnail'), isLoggedIn, authorisedRoles('ADMIN', 'INSTRUCTOR'), updateCourse);
router.delete('/:id', isLoggedIn, authorisedRoles('ADMIN', 'INSTRUCTOR'), deleteCourse);

// Course structure management - Unit operations
router.post('/:courseId/units', isLoggedIn, authorisedRoles('ADMIN', 'INSTRUCTOR'), addUnitToCourse);
router.put('/:courseId/units/:unitId', isLoggedIn, authorisedRoles('ADMIN', 'INSTRUCTOR'), updateUnit);
router.delete('/:courseId/units/:unitId', isLoggedIn, authorisedRoles('ADMIN', 'INSTRUCTOR'), deleteUnit);

// Course structure management - Lesson operations
router.post('/:courseId/units/:unitId/lessons', 
  upload.fields([
    { name: 'videoFile', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]), 
  isLoggedIn, 
  authorisedRoles('ADMIN', 'INSTRUCTOR'), 
  addLessonToUnit
);

router.post('/:courseId/direct-lessons', 
  upload.fields([
    { name: 'videoFile', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]), 
  isLoggedIn, 
  authorisedRoles('ADMIN', 'INSTRUCTOR'), 
  addDirectLessonToCourse
);

router.put('/:courseId/lessons/:lessonId', 
  upload.fields([
    { name: 'videoFile', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]), 
  isLoggedIn, 
  authorisedRoles('ADMIN', 'INSTRUCTOR'), 
  updateLesson
);

router.delete('/:courseId/lessons/:lessonId', isLoggedIn, authorisedRoles('ADMIN', 'INSTRUCTOR'), deleteLesson);
router.put('/:courseId/reorder-lessons', isLoggedIn, authorisedRoles('ADMIN', 'INSTRUCTOR'), reorderLessons);

export default router;
