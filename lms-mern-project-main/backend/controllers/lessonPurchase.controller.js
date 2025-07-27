import AppError from '../utils/error.utils.js';
import lessonPurchaseModel from '../models/lessonPurchase.model.js';
import courseModel from '../models/course.model.js';
import userModel from '../models/user.model.js';

// Purchase a single lesson
const purchaseLesson = async (req, res, next) => {
    try {
        const { courseId, lessonId, unitId, lessonTitle, unitTitle, amount } = req.body;
        const userId = req.user.id;

        if (!courseId || !lessonId || !lessonTitle || !amount) {
            return next(new AppError('Course ID, Lesson ID, Lesson Title, and amount are required', 400));
        }

        // Verify course exists
        const course = await courseModel.findById(courseId);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        // Verify user exists and get wallet balance
        const user = await userModel.findById(userId);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Check if user has sufficient balance
        const userBalance = user.wallet?.balance || 0;
        if (userBalance < amount) {
            return next(new AppError(`Insufficient balance. You have ${userBalance} EGP but need ${amount} EGP`, 400));
        }

        // Check if user already purchased this lesson
        const existingPurchase = await lessonPurchaseModel.findOne({
            user: userId,
            course: courseId,
            lessonId: lessonId,
            status: 'completed'
        });

        if (existingPurchase) {
            return next(new AppError('You have already purchased this lesson', 400));
        }

        // Deduct amount from user's wallet
        user.wallet.balance -= amount;

        // Add transaction to wallet history
        const walletTransaction = {
            type: 'purchase',
            amount: -amount, // Negative for purchase
            code: `LESSON_${lessonId}`,
            description: `Lesson purchase: ${lessonTitle}`,
            date: new Date(),
            status: 'completed'
        };

        if (!user.wallet.transactions) {
            user.wallet.transactions = [];
        }
        user.wallet.transactions.push(walletTransaction);

        // Create lesson purchase record
        const lessonPurchase = await lessonPurchaseModel.create({
            user: userId,
            course: courseId,
            lessonId: lessonId,
            lessonTitle: lessonTitle,
            unitId: unitId || null,
            unitTitle: unitTitle || null,
            amount: amount,
            currency: 'EGP',
            status: 'completed',
            transactionId: `LESSON_TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            description: `Purchase of lesson: ${lessonTitle}`,
            metadata: {
                courseTitle: course.title,
                lessonPrice: amount,
                userEmail: user.email,
                userName: user.fullName
            }
        });

        // Save user with updated wallet
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Lesson purchased successfully',
            data: {
                purchase: {
                    id: lessonPurchase._id,
                    lessonId: lessonPurchase.lessonId,
                    lessonTitle: lessonPurchase.lessonTitle,
                    amount: lessonPurchase.amount,
                    currency: lessonPurchase.currency,
                    transactionId: lessonPurchase.transactionId
                },
                wallet: {
                    newBalance: user.wallet.balance,
                    transaction: walletTransaction
                }
            }
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Check if user has purchased a specific lesson
const checkLessonPurchase = async (req, res, next) => {
    try {
        const { courseId, lessonId } = req.params;
        const userId = req.user.id;

        if (!courseId || !lessonId) {
            return next(new AppError('Course ID and Lesson ID are required', 400));
        }

        const purchase = await lessonPurchaseModel.findOne({
            user: userId,
            course: courseId,
            lessonId: lessonId,
            status: 'completed'
        });

        res.status(200).json({
            success: true,
            message: 'Lesson purchase status checked',
            data: {
                hasPurchased: !!purchase,
                purchase: purchase ? {
                    id: purchase._id,
                    lessonId: purchase.lessonId,
                    lessonTitle: purchase.lessonTitle,
                    amount: purchase.amount,
                    purchaseDate: purchase.createdAt
                } : null
            }
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get user's lesson purchase history
const getUserLessonPurchases = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const purchases = await lessonPurchaseModel.find({ 
            user: userId, 
            status: 'completed' 
        })
        .populate('course', 'title description thumbnail')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Lesson purchases retrieved successfully',
            data: {
                purchases: purchases.map(purchase => ({
                    id: purchase._id,
                    lessonId: purchase.lessonId,
                    lessonTitle: purchase.lessonTitle,
                    unitTitle: purchase.unitTitle,
                    amount: purchase.amount,
                    currency: purchase.currency,
                    course: purchase.course,
                    purchaseDate: purchase.createdAt,
                    transactionId: purchase.transactionId
                })),
                totalPurchases: purchases.length
            }
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get lesson purchase statistics for admin
const getLessonPurchaseStats = async (req, res, next) => {
    try {
        const { courseId } = req.params;

        if (!courseId) {
            return next(new AppError('Course ID is required', 400));
        }

        const stats = await lessonPurchaseModel.aggregate([
            {
                $match: {
                    course: courseId,
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: '$lessonId',
                    lessonTitle: { $first: '$lessonTitle' },
                    unitTitle: { $first: '$unitTitle' },
                    totalPurchases: { $sum: 1 },
                    totalRevenue: { $sum: '$amount' },
                    averagePrice: { $avg: '$amount' }
                }
            },
            {
                $sort: { totalPurchases: -1 }
            }
        ]);

        const totalRevenue = stats.reduce((sum, stat) => sum + stat.totalRevenue, 0);
        const totalPurchases = stats.reduce((sum, stat) => sum + stat.totalPurchases, 0);

        res.status(200).json({
            success: true,
            message: 'Lesson purchase statistics retrieved successfully',
            data: {
                lessonStats: stats,
                summary: {
                    totalRevenue,
                    totalPurchases,
                    averageRevenuePerLesson: totalPurchases > 0 ? totalRevenue / totalPurchases : 0
                }
            }
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

export {
    purchaseLesson,
    checkLessonPurchase,
    getUserLessonPurchases,
    getLessonPurchaseStats
}; 