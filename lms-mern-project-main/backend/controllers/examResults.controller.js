import ExamResult from '../models/examResult.model.js';
import User from '../models/user.model.js';
import Course from '../models/course.model.js';
import AppError from '../utils/error.utils.js';

// Get all exam results for admin dashboard
const getAllExamResults = async (req, res, next) => {
    try {
        console.log('📊 Getting all exam results for admin dashboard...');
        
        const { 
            page = 1, 
            limit = 20, 
            userId, 
            courseId, 
            examType, 
            passed, 
            sortBy = 'completedAt', 
            sortOrder = 'desc',
            search,
            stageId
        } = req.query;

        console.log('📊 Query parameters:', { page, limit, userId, courseId, examType, passed, search, stageId });

        const skip = (page - 1) * limit;
        
        // Build basic filter
        let filter = {};
        
        if (userId) filter.user = userId;
        if (courseId) filter.course = courseId;
        if (examType) filter.examType = examType;
        if (passed !== undefined) filter.passed = passed === 'true';

        console.log('📊 Basic filter:', filter);

        // Debug: Check what exam results exist and their course IDs
        const rawResults = await ExamResult.find(filter).select('course user lessonTitle').limit(5);
        console.log('📊 Raw exam results sample:', rawResults.map(r => ({
            _id: r._id,
            courseId: r.course,
            userId: r.user,
            lesson: r.lessonTitle
        })));

        // Debug: Check if any courses exist at all
        const courseCount = await Course.countDocuments();
        console.log('📊 Total courses in database:', courseCount);

        // Get exam results with populated data
        let query = ExamResult.find(filter)
            .populate('user', 'fullName email username stage')
            .populate('course', 'title instructor stage subject');

        // Apply sorting
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
        query = query.sort(sortObj);

        // Get total count for pagination
        const totalCount = await ExamResult.countDocuments(filter);
        
        // Apply pagination
        const examResults = await query.skip(skip).limit(parseInt(limit));

        console.log(`📊 Found ${examResults.length} exam results out of ${totalCount} total`);
        
        // Debug: Check what we actually got from the database
        for (let i = 0; i < examResults.length; i++) {
            const result = examResults[i];
            console.log(`📊 Result ${i + 1} debug:`, {
                _id: result._id,
                courseId: result.course,
                coursePopulated: !!result.course,
                courseType: typeof result.course,
                userPopulated: !!result.user,
                lessonTitle: result.lessonTitle
            });
            
            // Check if course exists independently
            if (result.course && typeof result.course === 'string') {
                const courseExists = await Course.findById(result.course);
                console.log(`📊 Course ${result.course} exists:`, !!courseExists);
                if (courseExists) {
                    console.log(`📊 Course details:`, {
                        title: courseExists.title,
                        instructor: courseExists.instructor,
                        stage: courseExists.stage,
                        subject: courseExists.subject
                    });
                }
            }
        }

        // Filter by stage if specified (after population)
        let filteredResults = examResults;
        if (stageId) {
            filteredResults = examResults.filter(result => {
                const userStageId = result.user?.stage?._id?.toString() || result.user?.stage?.toString();
                const courseStageId = result.course?.stage?._id?.toString() || result.course?.stage?.toString();
                return userStageId === stageId || courseStageId === stageId;
            });
            console.log(`📊 After stage filtering (${stageId}): ${filteredResults.length} results`);
        }

        // Apply search filter if provided (after population)
        if (search) {
            const searchLower = search.toLowerCase();
            filteredResults = filteredResults.filter(result => {
                return (
                    result.user?.fullName?.toLowerCase().includes(searchLower) ||
                    result.user?.email?.toLowerCase().includes(searchLower) ||
                    result.course?.title?.toLowerCase().includes(searchLower) ||
                    result.lessonTitle?.toLowerCase().includes(searchLower) ||
                    result.unitTitle?.toLowerCase().includes(searchLower)
                );
            });
            console.log(`📊 After search filtering ("${search}"): ${filteredResults.length} results`);
        }

        // Format the results
        const formattedResults = await Promise.all(filteredResults.map(async (result) => {
            // If course is not populated, try to fetch it manually
            let courseData = result.course;
            if (!courseData || typeof courseData === 'string') {
                try {
                    courseData = await Course.findById(result.course || courseData)
                        .populate('instructor', 'name')
                        .populate('stage', 'name')
                        .populate('subject', 'title');
                    console.log(`📊 Manually fetched course for result ${result._id}:`, courseData ? courseData.title : 'NOT FOUND');
                } catch (error) {
                    console.log(`📊 Error fetching course ${result.course}:`, error.message);
                    courseData = null;
                }
            }
            
            const formatted = {
                _id: result._id,
                user: {
                    _id: result.user?._id,
                    fullName: result.user?.fullName || 'Unknown User',
                    email: result.user?.email || 'No Email',
                    username: result.user?.username,
                    stage: result.user?.stage?.name || 'Unknown Stage'
                },
                course: {
                    _id: courseData?._id || result.course,
                    title: courseData?.title || 'Course Not Found',
                    instructor: courseData?.instructor?.name || 'Unknown Instructor',
                    stage: courseData?.stage?.name || 'Unknown Stage',
                    subject: courseData?.subject?.title || 'Unknown Subject'
                },
                lessonTitle: result.lessonTitle || 'Unknown Lesson',
                unitTitle: result.unitTitle || null,
                examType: result.examType,
                score: result.score,
                totalQuestions: result.totalQuestions,
                correctAnswers: result.correctAnswers,
                wrongAnswers: result.wrongAnswers,
                timeTaken: result.timeTaken,
                timeLimit: result.timeLimit,
                passingScore: result.passingScore,
                passed: result.passed,
                completedAt: result.completedAt,
                answers: result.answers || []
            };
            
            console.log('📊 Formatted result sample:', {
                resultId: formatted._id,
                originalCourseId: result.course,
                user: formatted.user.fullName,
                course: formatted.course.title,
                userStage: formatted.user.stage,
                courseStage: formatted.course.stage,
                score: formatted.score
            });
            
            return formatted;
        }));

        // Calculate summary statistics from all matching results (not just current page)
        const allMatchingResults = await ExamResult.find(filter);
        let summaryResults = allMatchingResults;

        // Apply stage filter to summary if specified
        if (stageId) {
            const populatedSummaryResults = await ExamResult.find(filter)
                .populate('user', 'stage')
                .populate('course', 'stage');
                
            summaryResults = populatedSummaryResults.filter(result => {
                const userStageId = result.user?.stage?._id?.toString() || result.user?.stage?.toString();
                const courseStageId = result.course?.stage?._id?.toString() || result.course?.stage?.toString();
                return userStageId === stageId || courseStageId === stageId;
            });
        }

        const summary = {
            totalAttempts: summaryResults.length,
            averageScore: summaryResults.length > 0 ? summaryResults.reduce((sum, r) => sum + r.score, 0) / summaryResults.length : 0,
            passedCount: summaryResults.filter(r => r.passed).length,
            failedCount: summaryResults.filter(r => !r.passed).length,
            averageTimeTaken: summaryResults.length > 0 ? summaryResults.reduce((sum, r) => sum + (r.timeTaken || 0), 0) / summaryResults.length : 0
        };

        const totalPages = Math.ceil(filteredResults.length / limit);

        console.log('📊 Final summary:', summary);
        console.log('📊 Returning:', {
            totalResults: formattedResults.length,
            currentPage: parseInt(page),
            totalPages
        });

        res.status(200).json({
            success: true,
            message: 'Exam results retrieved successfully',
            data: formattedResults,
            summary: summary,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                total: filteredResults.length,
                limit: parseInt(limit),
                totalResults: filteredResults.length,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('❌ Error in getAllExamResults:', error);
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
            { $sort: { averageScore: -1 } },
            { $limit: 10 },
            {
                $project: {
                    userId: '$_id',
                    userName: '$userInfo.fullName',
                    userEmail: '$userInfo.email',
                    averageScore: 1,
                    totalExams: 1,
                    passedExams: 1,
                    passRate: { $multiply: [{ $divide: ['$passedExams', '$totalExams'] }, 100] }
                }
            }
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
            { $sort: { averageScore: -1 } },
            { $limit: 10 },
            {
                $project: {
                    courseId: '$_id',
                    courseTitle: '$courseInfo.title',
                    averageScore: 1,
                    totalAttempts: 1,
                    passedAttempts: 1,
                    passRate: { $multiply: [{ $divide: ['$passedAttempts', '$totalAttempts'] }, 100] }
                }
            }
        ]);

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
                    averageScore: Math.round(averageScore * 100) / 100,
                    averageTimeTaken: Math.round(averageTimeTaken * 100) / 100,
                    passRate: totalResults > 0 ? Math.round((passedResults / totalResults) * 100) : 0
                },
                topUsers,
                coursePerformance
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get specific exam result by ID
const getExamResultById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const examResult = await ExamResult.findById(id)
            .populate({
                path: 'user',
                select: 'fullName email username'
            })
            .populate({
                path: 'course',
                select: 'title instructor stage subject',
                populate: [
                    {
                        path: 'instructor',
                        select: 'name'
                    },
                    {
                        path: 'stage',
                        select: 'name'
                    },
                    {
                        path: 'subject',
                        select: 'title'
                    }
                ]
            });

        if (!examResult) {
            return next(new AppError('Exam result not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Exam result retrieved successfully',
            data: {
                id: examResult._id,
                user: {
                    id: examResult.user._id,
                    name: examResult.user.fullName,
                    email: examResult.user.email,
                    username: examResult.user.username
                },
                course: {
                    id: examResult.course._id,
                    title: examResult.course.title,
                    instructor: examResult.course.instructor?.name || 'Unknown',
                    stage: examResult.course.stage?.name || 'Unknown',
                    subject: examResult.course.subject?.title || 'Unknown'
                },
                lesson: {
                    id: examResult.lessonId,
                    title: examResult.lessonTitle,
                    unitId: examResult.unitId,
                    unitTitle: examResult.unitTitle
                },
                exam: {
                    type: examResult.examType,
                    score: examResult.score,
                    totalQuestions: examResult.totalQuestions,
                    correctAnswers: examResult.correctAnswers,
                    wrongAnswers: examResult.wrongAnswers,
                    timeTaken: examResult.timeTaken,
                    timeLimit: examResult.timeLimit,
                    passingScore: examResult.passingScore,
                    passed: examResult.passed,
                    answers: examResult.answers
                },
                completedAt: examResult.completedAt,
                createdAt: examResult.createdAt,
                updatedAt: examResult.updatedAt
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Export exam results to CSV
const exportExamResults = async (req, res, next) => {
    try {
        const { 
            userId, 
            courseId, 
            examType, 
            passed, 
            sortBy = 'completedAt', 
            sortOrder = 'desc',
            search
        } = req.query;

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

        // Get all results without pagination for export
        const results = await ExamResult.find(matchFilter)
            .populate('user', 'fullName username email phoneNumber')
            .populate('course', 'title')
            .sort(sort);

        // Apply search filter if provided
        let filteredResults = results;
        if (search) {
            const searchLower = search.toLowerCase();
            filteredResults = results.filter(result => 
                result.user?.fullName?.toLowerCase().includes(searchLower) ||
                result.user?.email?.toLowerCase().includes(searchLower) ||
                result.user?.username?.toLowerCase().includes(searchLower) ||
                result.course?.title?.toLowerCase().includes(searchLower) ||
                result.lessonTitle?.toLowerCase().includes(searchLower)
            );
        }

        // Create CSV content
        const csvHeaders = [
            'اسم الطالب',
            'البريد الإلكتروني',
            'الدورة',
            'الدرس',
            'الوحدة',
            'نوع الامتحان',
            'النتيجة (%)',
            'الإجابات الصحيحة',
            'إجمالي الأسئلة',
            'الإجابات الخاطئة',
            'الوقت المستغرق (دقيقة)',
            'الحد الزمني (دقيقة)',
            'النتيجة المطلوبة للنجاح (%)',
            'حالة النجاح',
            'تاريخ الامتحان'
        ].join(',');

        const csvRows = filteredResults.map(result => [
            `"${result.user?.fullName || ''}"`,
            `"${result.user?.email || ''}"`,
            `"${result.course?.title || ''}"`,
            `"${result.lessonTitle || ''}"`,
            `"${result.unitTitle || ''}"`,
            `"${result.examType === 'final' ? 'امتحان نهائي' : 'تدريب'}"`,
            result.score,
            result.correctAnswers,
            result.totalQuestions,
            result.wrongAnswers,
            result.timeTaken,
            result.timeLimit,
            result.passingScore,
            `"${result.passed ? 'ناجح' : 'راسب'}"`,
            `"${new Date(result.completedAt).toLocaleString('ar-EG')}"`
        ].join(','));

        const csvContent = [csvHeaders, ...csvRows].join('\n');

        // Set response headers for CSV download
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="exam-results-${new Date().toISOString().split('T')[0]}.csv"`);
        
        // Add BOM for proper UTF-8 encoding in Excel
        res.write('\ufeff');
        res.end(csvContent);

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

export {
    getAllExamResults,
    getExamResultsStats,
    getExamResultById,
    exportExamResults
};