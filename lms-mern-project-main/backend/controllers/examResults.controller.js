import ExamResult from '../models/examResult.model.js';
import User from '../models/user.model.js';
import Course from '../models/course.model.js';
import AppError from '../utils/error.utils.js';

// Get all exam results for admin dashboard
const getAllExamResults = async (req, res, next) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            userId, 
            courseId, 
            examType, 
            passed, 
            sortBy = 'completedAt', 
            sortOrder = 'desc',
            search
        } = req.query;

        const skip = (page - 1) * limit;
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Build match filter
        let matchFilter = {};
        
        if (userId) {
            matchFilter.user = userId;
        }
        
        if (courseId) {
            matchFilter.course = courseId;
        }
        
        if (examType) {
            matchFilter.examType = examType;
        }
        
        if (passed !== undefined) {
            matchFilter.passed = passed === 'true';
        }

        // Build aggregation pipeline
        const pipeline = [
            { $match: matchFilter },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'courseInfo'
                }
            },
            { $unwind: '$userInfo' },
            { $unwind: '$courseInfo' },
            {
                $lookup: {
                    from: 'instructors',
                    localField: 'courseInfo.instructor',
                    foreignField: '_id',
                    as: 'instructorInfo'
                }
            },
            {
                $lookup: {
                    from: 'stages',
                    localField: 'courseInfo.stage',
                    foreignField: '_id',
                    as: 'stageInfo'
                }
            },
            {
                $lookup: {
                    from: 'subjects',
                    localField: 'courseInfo.subject',
                    foreignField: '_id',
                    as: 'subjectInfo'
                }
            },
            {
                $addFields: {
                    instructorInfo: { $arrayElemAt: ['$instructorInfo', 0] },
                    stageInfo: { $arrayElemAt: ['$stageInfo', 0] },
                    subjectInfo: { $arrayElemAt: ['$subjectInfo', 0] }
                }
            }
        ];

        // Add search filter if provided
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'userInfo.fullName': { $regex: search, $options: 'i' } },
                        { 'userInfo.email': { $regex: search, $options: 'i' } },
                        { 'courseInfo.title': { $regex: search, $options: 'i' } },
                        { lessonTitle: { $regex: search, $options: 'i' } },
                        { unitTitle: { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }

        // Add sorting and pagination
        pipeline.push(
            { $sort: sort },
            { $skip: skip },
            { $limit: parseInt(limit) }
        );

        // Execute aggregation
        const results = await ExamResult.aggregate(pipeline);

        // Get total count for pagination
        const totalPipeline = [
            { $match: matchFilter },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'courseInfo'
                }
            },
            { $unwind: '$userInfo' },
            { $unwind: '$courseInfo' }
        ];

        if (search) {
            totalPipeline.push({
                $match: {
                    $or: [
                        { 'userInfo.fullName': { $regex: search, $options: 'i' } },
                        { 'userInfo.email': { $regex: search, $options: 'i' } },
                        { 'courseInfo.title': { $regex: search, $options: 'i' } },
                        { lessonTitle: { $regex: search, $options: 'i' } },
                        { unitTitle: { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }

        totalPipeline.push({ $count: 'total' });
        const totalResult = await ExamResult.aggregate(totalPipeline);
        const total = totalResult[0]?.total || 0;
        const totalPages = Math.ceil(total / limit);

        // Format the results
        const formattedResults = results.map(result => ({
            id: result._id,
            user: {
                id: result.userInfo._id,
                name: result.userInfo.fullName,
                email: result.userInfo.email,
                username: result.userInfo.username
            },
            course: {
                id: result.courseInfo._id,
                title: result.courseInfo.title,
                instructor: result.instructorInfo?.name || 'Unknown Instructor',
                stage: result.stageInfo?.name || 'Unknown Stage',
                subject: result.subjectInfo?.name || 'Unknown Subject'
            },
            lesson: {
                id: result.lessonId,
                title: result.lessonTitle,
                unitId: result.unitId,
                unitTitle: result.unitTitle
            },
            exam: {
                type: result.examType,
                score: result.score,
                totalQuestions: result.totalQuestions,
                correctAnswers: result.correctAnswers,
                wrongAnswers: result.wrongAnswers,
                timeTaken: result.timeTaken,
                timeLimit: result.timeLimit,
                passingScore: result.passingScore,
                passed: result.passed,
                percentage: Math.round((result.correctAnswers / result.totalQuestions) * 100)
            },
            completedAt: result.completedAt,
            createdAt: result.createdAt
        }));

        res.status(200).json({
            success: true,
            message: 'Exam results retrieved successfully',
            data: {
                results: formattedResults,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    total,
                    limit: parseInt(limit),
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get exam results statistics
const getExamResultsStats = async (req, res, next) => {
    try {
        // Overall statistics
        const totalResults = await ExamResult.countDocuments();
        const passedResults = await ExamResult.countDocuments({ passed: true });
        const failedResults = await ExamResult.countDocuments({ passed: false });
        const trainingExams = await ExamResult.countDocuments({ examType: 'training' });
        const finalExams = await ExamResult.countDocuments({ examType: 'final' });

        // Average score
        const avgScoreResult = await ExamResult.aggregate([
            {
                $group: {
                    _id: null,
                    averageScore: { $avg: '$score' },
                    averageTimeTaken: { $avg: '$timeTaken' }
                }
            }
        ]);

        const averageScore = avgScoreResult[0]?.averageScore || 0;
        const averageTimeTaken = avgScoreResult[0]?.averageTimeTaken || 0;

        // Top performing users
        const topUsers = await ExamResult.aggregate([
            {
                $group: {
                    _id: '$user',
                    averageScore: { $avg: '$score' },
                    totalExams: { $sum: 1 },
                    passedExams: { $sum: { $cond: ['$passed', 1, 0] } }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    userId: '$_id',
                    name: '$userInfo.fullName',
                    email: '$userInfo.email',
                    averageScore: { $round: ['$averageScore', 2] },
                    totalExams: 1,
                    passedExams: 1,
                    passRate: { 
                        $round: [
                            { $multiply: [{ $divide: ['$passedExams', '$totalExams'] }, 100] },
                            2
                        ]
                    }
                }
            },
            { $sort: { averageScore: -1 } },
            { $limit: 10 }
        ]);

        // Course performance
        const coursePerformance = await ExamResult.aggregate([
            {
                $group: {
                    _id: '$course',
                    averageScore: { $avg: '$score' },
                    totalAttempts: { $sum: 1 },
                    passedAttempts: { $sum: { $cond: ['$passed', 1, 0] } }
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'courseInfo'
                }
            },
            { $unwind: '$courseInfo' },
            {
                $project: {
                    courseId: '$_id',
                    title: '$courseInfo.title',
                    averageScore: { $round: ['$averageScore', 2] },
                    totalAttempts: 1,
                    passedAttempts: 1,
                    passRate: { 
                        $round: [
                            { $multiply: [{ $divide: ['$passedAttempts', '$totalAttempts'] }, 100] },
                            2
                        ]
                    }
                }
            },
            { $sort: { averageScore: -1 } },
            { $limit: 10 }
        ]);

        // Recent exam results
        const recentResults = await ExamResult.find()
            .populate('user', 'fullName email')
            .populate('course', 'title')
            .sort({ completedAt: -1 })
            .limit(5)
            .select('user course lessonTitle examType score passed completedAt');

        res.status(200).json({
            success: true,
            message: 'Exam results statistics retrieved successfully',
            data: {
                overview: {
                    totalResults,
                    passedResults,
                    failedResults,
                    trainingExams,
                    finalExams,
                    passRate: totalResults > 0 ? Math.round((passedResults / totalResults) * 100) : 0,
                    averageScore: Math.round(averageScore * 100) / 100,
                    averageTimeTaken: Math.round(averageTimeTaken * 100) / 100
                },
                topUsers,
                coursePerformance,
                recentResults: recentResults.map(result => ({
                    id: result._id,
                    userName: result.user?.fullName || 'Unknown User',
                    userEmail: result.user?.email || 'Unknown Email',
                    courseTitle: result.course?.title || 'Unknown Course',
                    lessonTitle: result.lessonTitle,
                    examType: result.examType,
                    score: result.score,
                    passed: result.passed,
                    completedAt: result.completedAt
                }))
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get detailed exam result by ID
const getExamResultById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await ExamResult.findById(id)
            .populate('user', 'fullName email username')
            .populate({
                path: 'course',
                select: 'title description',
                populate: [
                    { path: 'instructor', select: 'name' },
                    { path: 'stage', select: 'name' },
                    { path: 'subject', select: 'name' }
                ]
            });

        if (!result) {
            return next(new AppError('Exam result not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Exam result retrieved successfully',
            data: {
                id: result._id,
                user: {
                    id: result.user._id,
                    name: result.user.fullName,
                    email: result.user.email,
                    username: result.user.username
                },
                course: {
                    id: result.course._id,
                    title: result.course.title,
                    description: result.course.description,
                    instructor: result.course.instructor?.name || 'Unknown Instructor',
                    stage: result.course.stage?.name || 'Unknown Stage',
                    subject: result.course.subject?.name || 'Unknown Subject'
                },
                lesson: {
                    id: result.lessonId,
                    title: result.lessonTitle,
                    unitId: result.unitId,
                    unitTitle: result.unitTitle
                },
                exam: {
                    type: result.examType,
                    score: result.score,
                    totalQuestions: result.totalQuestions,
                    correctAnswers: result.correctAnswers,
                    wrongAnswers: result.wrongAnswers,
                    timeTaken: result.timeTaken,
                    timeLimit: result.timeLimit,
                    passingScore: result.passingScore,
                    passed: result.passed,
                    percentage: Math.round((result.correctAnswers / result.totalQuestions) * 100)
                },
                answers: result.answers,
                completedAt: result.completedAt,
                createdAt: result.createdAt,
                updatedAt: result.updatedAt
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

export {
    getAllExamResults,
    getExamResultsStats,
    getExamResultById
};
