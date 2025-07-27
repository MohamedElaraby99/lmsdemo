import ExamResult from "../models/examResult.model.js";
import Course from "../models/course.model.js";
import AppError from "../utils/error.utils.js";

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Take training exam
const takeTrainingExam = asyncHandler(async (req, res) => {
    const { courseId, lessonId, unitId, answers } = req.body;
    const userId = req.user._id;

    // Find the course and lesson
    const course = await Course.findById(courseId);
    if (!course) {
        throw new AppError("Course not found", 404);
    }

    let lesson = null;
    let unit = null;

    // Find lesson in units or direct lessons
    if (unitId) {
        unit = course.units.find(u => u._id.toString() === unitId);
        if (!unit) {
            throw new AppError("Unit not found", 404);
        }
        lesson = unit.lessons.find(l => l._id.toString() === lessonId);
    } else {
        lesson = course.directLessons.find(l => l._id.toString() === lessonId);
    }

    if (!lesson) {
        throw new AppError("Lesson not found", 404);
    }

    if (!lesson.trainingExam || lesson.trainingExam.questions.length === 0) {
        throw new AppError("No training exam available for this lesson", 400);
    }

    // Check if user has already taken this exam
    const existingResult = await ExamResult.findOne({
        user: userId,
        course: courseId,
        lessonId,
        examType: 'training'
    });

    if (existingResult) {
        throw new AppError("You have already taken this training exam", 400);
    }

    // Calculate results
    const questions = lesson.trainingExam.questions;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    const detailedAnswers = [];

    answers.forEach((answer, index) => {
        const question = questions[index];
        const isCorrect = answer.selectedAnswer === question.correctAnswer;
        
        if (isCorrect) {
            correctAnswers++;
        } else {
            wrongAnswers++;
        }

        detailedAnswers.push({
            questionIndex: index,
            selectedAnswer: answer.selectedAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect
        });
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= lesson.trainingExam.passingScore;

    // Create exam result
    const examResult = await ExamResult.create({
        user: userId,
        course: courseId,
        lessonId,
        lessonTitle: lesson.title,
        unitId: unitId || null,
        unitTitle: unit ? unit.title : null,
        examType: 'training',
        score,
        totalQuestions: questions.length,
        correctAnswers,
        wrongAnswers,
        timeTaken: req.body.timeTaken || 0,
        timeLimit: lesson.trainingExam.timeLimit,
        passingScore: lesson.trainingExam.passingScore,
        passed,
        answers: detailedAnswers
    });

    res.status(201).json({
        success: true,
        message: "Training exam completed successfully",
        data: {
            examResult,
            questions: questions.map((q, index) => ({
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                userAnswer: answers[index]?.selectedAnswer,
                isCorrect: answers[index]?.selectedAnswer === q.correctAnswer
            }))
        }
    });
});

// Take final exam
const takeFinalExam = asyncHandler(async (req, res) => {
    const { courseId, lessonId, unitId, answers } = req.body;
    const userId = req.user._id;

    // Find the course and lesson
    const course = await Course.findById(courseId);
    if (!course) {
        throw new AppError("Course not found", 404);
    }

    let lesson = null;
    let unit = null;

    // Find lesson in units or direct lessons
    if (unitId) {
        unit = course.units.find(u => u._id.toString() === unitId);
        if (!unit) {
            throw new AppError("Unit not found", 404);
        }
        lesson = unit.lessons.find(l => l._id.toString() === lessonId);
    } else {
        lesson = course.directLessons.find(l => l._id.toString() === lessonId);
    }

    if (!lesson) {
        throw new AppError("Lesson not found", 404);
    }

    if (!lesson.finalExam || lesson.finalExam.questions.length === 0) {
        throw new AppError("No final exam available for this lesson", 400);
    }

    // Check if user has already taken this exam
    const existingResult = await ExamResult.findOne({
        user: userId,
        course: courseId,
        lessonId,
        examType: 'final'
    });

    if (existingResult) {
        throw new AppError("You have already taken this final exam", 400);
    }

    // Calculate results
    const questions = lesson.finalExam.questions;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    const detailedAnswers = [];

    answers.forEach((answer, index) => {
        const question = questions[index];
        const isCorrect = answer.selectedAnswer === question.correctAnswer;
        
        if (isCorrect) {
            correctAnswers++;
        } else {
            wrongAnswers++;
        }

        detailedAnswers.push({
            questionIndex: index,
            selectedAnswer: answer.selectedAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect
        });
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= lesson.finalExam.passingScore;

    // Create exam result
    const examResult = await ExamResult.create({
        user: userId,
        course: courseId,
        lessonId,
        lessonTitle: lesson.title,
        unitId: unitId || null,
        unitTitle: unit ? unit.title : null,
        examType: 'final',
        score,
        totalQuestions: questions.length,
        correctAnswers,
        wrongAnswers,
        timeTaken: req.body.timeTaken || 0,
        timeLimit: lesson.finalExam.timeLimit,
        passingScore: lesson.finalExam.passingScore,
        passed,
        answers: detailedAnswers
    });

    res.status(201).json({
        success: true,
        message: "Final exam completed successfully",
        data: {
            examResult,
            questions: questions.map((q, index) => ({
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                userAnswer: answers[index]?.selectedAnswer,
                isCorrect: answers[index]?.selectedAnswer === q.correctAnswer
            }))
        }
    });
});

// Get exam results for a lesson
const getExamResults = asyncHandler(async (req, res) => {
    const { courseId, lessonId } = req.params;
    const userId = req.user._id;

    const results = await ExamResult.find({
        user: userId,
        course: courseId,
        lessonId
    }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: results
    });
});

// Get user's exam history
const getUserExamHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const results = await ExamResult.find({ user: userId })
        .populate('course', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await ExamResult.countDocuments({ user: userId });

    res.status(200).json({
        success: true,
        data: results,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalResults: total,
            resultsPerPage: parseInt(limit)
        }
    });
});

// Get exam statistics for admin
const getExamStatistics = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const stats = await ExamResult.aggregate([
        {
            $match: {
                course: courseId
            }
        },
        {
            $group: {
                _id: {
                    lessonId: "$lessonId",
                    examType: "$examType"
                },
                totalAttempts: { $sum: 1 },
                averageScore: { $avg: "$score" },
                passedCount: {
                    $sum: { $cond: ["$passed", 1, 0] }
                },
                failedCount: {
                    $sum: { $cond: ["$passed", 0, 1] }
                }
            }
        },
        {
            $group: {
                _id: "$_id.lessonId",
                exams: {
                    $push: {
                        examType: "$_id.examType",
                        totalAttempts: "$totalAttempts",
                        averageScore: "$averageScore",
                        passedCount: "$passedCount",
                        failedCount: "$failedCount"
                    }
                }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: stats
    });
});

export {
    takeTrainingExam,
    takeFinalExam,
    getExamResults,
    getUserExamHistory,
    getExamStatistics
}; 