import { Router } from "express";
const router = Router();
import { getAllCourses, getLecturesByCourseId, getCourseStructure, createCourse, updateCourse, removeCourse, addLectureToCourseById, updateCourseLecture, updateUnit, simulateCourseSale, scheduleVideoPublish, updateCourseStructure, deleteUnit, addTrainingExam, addFinalExam, deletePdfFromLesson, deleteTrainingExam, deleteFinalExam, grantContentAccess, purchaseLessonAccess } from '../controllers/course.controller.js'
import { isLoggedIn, authorisedRoles, authorizeSubscriber } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js"; 

router.route('/')
    .get(getAllCourses)
    .post(isLoggedIn, authorisedRoles('ADMIN'), upload.single("thumbnail"), createCourse)
    .put(isLoggedIn, authorisedRoles('ADMIN'), upload.single("lecture"), updateCourseLecture)

router.route('/:id/structure')
    .get(getCourseStructure);

router.route('/:id')
    .get(isLoggedIn, authorizeSubscriber, getLecturesByCourseId)
    .put(isLoggedIn, authorisedRoles("ADMIN"), upload.single("thumbnail"), updateCourse)
    .delete(isLoggedIn, authorisedRoles('ADMIN'), removeCourse)
    .post(isLoggedIn, authorisedRoles("ADMIN"), upload.single("lecture"), addLectureToCourseById);

// Admin route for getting course data (without subscriber authorization)
router.route('/admin/:id')
    .get(isLoggedIn, authorisedRoles("ADMIN"), getLecturesByCourseId);

// Public route for getting course data (without subscriber authorization)
router.route('/public/:id')
    .get(isLoggedIn, getLecturesByCourseId);

// Complete course structure update route
router.route('/:courseId/structure/update')
    .put(isLoggedIn, authorisedRoles("ADMIN"), updateCourseStructure);

// Unit update and delete
router.route('/:courseId/units/:unitId')
    .put(isLoggedIn, authorisedRoles("ADMIN"), updateUnit)
    .delete(isLoggedIn, authorisedRoles("ADMIN"), deleteUnit);

// Video scheduling
router.route('/:courseId/lessons/:lessonId/schedule/:lessonType')
    .put(isLoggedIn, authorisedRoles("ADMIN"), scheduleVideoPublish);

// Simulate course sale
router.route('/:courseId/simulate-sale')
    .post(isLoggedIn, authorisedRoles("ADMIN"), simulateCourseSale);

// PDF management
router.route('/:courseId/units/:unitId/lessons/:lessonId/pdf')
    .delete(isLoggedIn, authorisedRoles("ADMIN"), deletePdfFromLesson);

router.route('/:courseId/direct-lessons/:lessonId/pdf')
    .delete(isLoggedIn, authorisedRoles("ADMIN"), deletePdfFromLesson);

// Training exam management
router.route('/:courseId/units/:unitId/lessons/:lessonId/training-exam')
    .post(isLoggedIn, authorisedRoles("ADMIN"), addTrainingExam)
    .delete(isLoggedIn, authorisedRoles("ADMIN"), deleteTrainingExam);

router.route('/:courseId/direct-lessons/:lessonId/training-exam')
    .post(isLoggedIn, authorisedRoles("ADMIN"), addTrainingExam)
    .delete(isLoggedIn, authorisedRoles("ADMIN"), deleteTrainingExam);

// Final exam management
router.route('/:courseId/units/:unitId/lessons/:lessonId/final-exam')
    .post(isLoggedIn, authorisedRoles("ADMIN"), addFinalExam)
    .delete(isLoggedIn, authorisedRoles("ADMIN"), deleteFinalExam);

router.route('/:courseId/direct-lessons/:lessonId/final-exam')
    .post(isLoggedIn, authorisedRoles("ADMIN"), addFinalExam)
    .delete(isLoggedIn, authorisedRoles("ADMIN"), deleteFinalExam);

// Add simple route to grant content access (admin only)
router.route('/grant-access')
    .post(isLoggedIn, authorisedRoles("ADMIN"), grantContentAccess);

// Route for users to purchase lesson access with wallet points
router.route('/purchase-lesson')
    .post(isLoggedIn, purchaseLessonAccess);

export default router;