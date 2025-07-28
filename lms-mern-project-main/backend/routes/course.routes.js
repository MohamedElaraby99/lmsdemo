import { Router } from "express";
const router = Router();
import { getAllCourses, getLecturesByCourseId, getCourseStructure, createCourse, updateCourse, removeCourse, addLectureToCourseById, deleteCourseLecture, updateCourseLecture, updateUnit, updateLesson, updateDirectLesson, simulateCourseSale, scheduleVideoPublish, updateCourseStructure, deleteUnit, deleteLesson, deleteDirectLesson, addLessonToUnit, addPdfToLesson, addTrainingExam, addFinalExam, deletePdfFromLesson, deleteTrainingExam, deleteFinalExam } from '../controllers/course.controller.js'
import { isLoggedIn, authorisedRoles, authorizeSubscriber } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js"; 

router.route('/')
    .get(getAllCourses)
    .post(isLoggedIn, authorisedRoles('ADMIN'), upload.single("thumbnail"), createCourse)
    .delete(isLoggedIn, authorisedRoles('ADMIN'), deleteCourseLecture)
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

// Complete course structure update route
router.route('/:courseId/structure/update')
    .put(isLoggedIn, authorisedRoles("ADMIN"), updateCourseStructure);

// Unit and lesson update routes
router.route('/:courseId/units/:unitId')
    .put(isLoggedIn, authorisedRoles("ADMIN"), updateUnit)
    .delete(isLoggedIn, authorisedRoles("ADMIN"), deleteUnit);

router.route('/:courseId/units/:unitId/lessons')
    .post(isLoggedIn, authorisedRoles("ADMIN"), addLessonToUnit);

router.route('/:courseId/units/:unitId/lessons/:lessonId')
    .put(isLoggedIn, authorisedRoles("ADMIN"), updateLesson)
    .delete(isLoggedIn, authorisedRoles("ADMIN"), deleteLesson);

router.route('/:courseId/direct-lessons/:lessonId')
    .put(isLoggedIn, authorisedRoles("ADMIN"), updateDirectLesson)
    .delete(isLoggedIn, authorisedRoles("ADMIN"), deleteDirectLesson);

// Video scheduling routes
router.route('/:courseId/lessons/:lessonId/schedule/:lessonType')
    .put(isLoggedIn, authorisedRoles("ADMIN"), scheduleVideoPublish);

router.route('/:courseId/simulate-sale')
    .post(isLoggedIn, authorisedRoles("ADMIN"), simulateCourseSale);

// PDF management routes
router.route('/:courseId/units/:unitId/lessons/:lessonId/pdf')
    .post(isLoggedIn, authorisedRoles("ADMIN"), upload.single("pdf"), addPdfToLesson)
    .delete(isLoggedIn, authorisedRoles("ADMIN"), deletePdfFromLesson);

router.route('/:courseId/direct-lessons/:lessonId/pdf')
    .post(isLoggedIn, authorisedRoles("ADMIN"), upload.single("pdf"), addPdfToLesson)
    .delete(isLoggedIn, authorisedRoles("ADMIN"), deletePdfFromLesson);

// Training exam management routes
router.route('/:courseId/units/:unitId/lessons/:lessonId/training-exam')
    .post(isLoggedIn, authorisedRoles("ADMIN"), addTrainingExam)
    .delete(isLoggedIn, authorisedRoles("ADMIN"), deleteTrainingExam);

router.route('/:courseId/direct-lessons/:lessonId/training-exam')
    .post(isLoggedIn, authorisedRoles("ADMIN"), addTrainingExam)
    .delete(isLoggedIn, authorisedRoles("ADMIN"), deleteTrainingExam);

// Final exam management routes
router.route('/:courseId/units/:unitId/lessons/:lessonId/final-exam')
    .post(isLoggedIn, authorisedRoles("ADMIN"), addFinalExam)
    .delete(isLoggedIn, authorisedRoles("ADMIN"), deleteFinalExam);

router.route('/:courseId/direct-lessons/:lessonId/final-exam')
    .post(isLoggedIn, authorisedRoles("ADMIN"), addFinalExam)
    .delete(isLoggedIn, authorisedRoles("ADMIN"), deleteFinalExam);

export default router