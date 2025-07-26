import { Router } from "express";
const router = Router();
import { getAllCourses, getLecturesByCourseId, getCourseStructure, createCourse, updateCourse, removeCourse, addLectureToCourseById, deleteCourseLecture, updateCourseLecture, updateUnit, updateLesson, updateDirectLesson, simulateCourseSale, scheduleVideoPublish } from '../controllers/course.controller.js'
import { isLoggedIn, authorisedRoles, authorizeSubscriber } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js"; 

router.route('/')
    .get(getAllCourses)
    .post(isLoggedIn, authorisedRoles('ADMIN'), upload.single("thumbnail"), createCourse)
    .delete(isLoggedIn, authorisedRoles('ADMIN'), deleteCourseLecture)
    .put(isLoggedIn, authorisedRoles('ADMIN'), upload.single("lecture"), updateCourseLecture)

router.route('/:id')
    .get(isLoggedIn, authorizeSubscriber, getLecturesByCourseId)
    .put(isLoggedIn, authorisedRoles("ADMIN"), upload.single("thumbnail"), updateCourse)
    .delete(isLoggedIn, authorisedRoles('ADMIN'), removeCourse)
    .post(isLoggedIn, authorisedRoles("ADMIN"), upload.single("lecture"), addLectureToCourseById);

router.route('/:id/structure')
    .get(getCourseStructure);

// Unit and lesson update routes
router.route('/:courseId/units/:unitId')
    .put(isLoggedIn, authorisedRoles("ADMIN"), updateUnit);

router.route('/:courseId/units/:unitId/lessons/:lessonId')
    .put(isLoggedIn, authorisedRoles("ADMIN"), updateLesson);

router.route('/:courseId/direct-lessons/:lessonId')
    .put(isLoggedIn, authorisedRoles("ADMIN"), updateDirectLesson);

// Video scheduling routes
router.route('/:courseId/lessons/:lessonId/schedule/:lessonType')
    .put(isLoggedIn, authorisedRoles("ADMIN"), scheduleVideoPublish);

router.route('/:courseId/simulate-sale')
    .post(isLoggedIn, authorisedRoles("ADMIN"), simulateCourseSale);

export default router