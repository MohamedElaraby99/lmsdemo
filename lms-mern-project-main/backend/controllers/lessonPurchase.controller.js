import AppError from '../utils/error.utils.js';
import lessonPurchaseModel from '../models/lessonPurchase.model.js';
import userModel from '../models/user.model.js';

// Simple purchase lesson - only needs lessonId and userId
const purchaseLesson = async (req, res, next) => {
    try {
        const { lessonId, amount = 10 } = req.body;
        const userId = req.user.id;

        if (!lessonId) {
            return next(new AppError('Lesson ID is required', 400));
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
            description: `Lesson purchase: ${lessonId}`,
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
            lessonId: lessonId,
            lessonTitle: lessonId, // Using lessonId as title for simplicity
            amount: amount,
            currency: 'EGP',
            status: 'completed',
            transactionId: `LESSON_TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            description: `Purchase of lesson: ${lessonId}`,
            metadata: {
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
        console.error('Error in purchaseLesson:', error);
        next(new AppError('Failed to purchase lesson', 500));
    }
};

// Simple check if user has access to lesson
const checkLessonAccess = async (req, res, next) => {
    try {
        const { lessonId } = req.params;
        const userId = req.user.id;

        if (!lessonId) {
            return next(new AppError('Lesson ID is required', 400));
        }

        // Check if user has purchased this lesson
        const purchase = await lessonPurchaseModel.findOne({
            user: userId,
            lessonId: lessonId,
            status: 'completed'
        });

        res.status(200).json({
            success: true,
            message: 'Lesson access checked',
            data: {
                hasAccess: !!purchase,
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
        console.error('Error in checkLessonAccess:', error);
        next(new AppError('Failed to check lesson access', 500));
    }
};

// Get user's purchased lessons
const getUserPurchases = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const purchases = await lessonPurchaseModel.find({
            user: userId,
            status: 'completed'
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'User purchases retrieved successfully',
            data: {
                purchases: purchases.map(purchase => ({
                    id: purchase._id,
                    lessonId: purchase.lessonId,
                    lessonTitle: purchase.lessonTitle,
                    amount: purchase.amount,
                    currency: purchase.currency,
                    purchaseDate: purchase.createdAt,
                    transactionId: purchase.transactionId
                })),
                totalPurchases: purchases.length,
                totalSpent: purchases.reduce((sum, purchase) => sum + purchase.amount, 0)
            }
        });
    } catch (error) {
        console.error('Error in getUserPurchases:', error);
        next(new AppError('Failed to get user purchases', 500));
    }
};

// Get lesson purchase statistics (for admin)
const getLessonPurchaseStats = async (req, res, next) => {
    try {
        const stats = await lessonPurchaseModel.aggregate([
            {
                $match: { status: 'completed' }
            },
            {
                $group: {
                    _id: null,
                    totalPurchases: { $sum: 1 },
                    totalRevenue: { $sum: '$amount' },
                    averagePrice: { $avg: '$amount' }
                }
            }
        ]);

        const lessonStats = await lessonPurchaseModel.aggregate([
            {
                $match: { status: 'completed' }
            },
            {
                $group: {
                    _id: '$lessonId',
                    purchaseCount: { $sum: 1 },
                    totalRevenue: { $sum: '$amount' }
                }
            },
            {
                $sort: { purchaseCount: -1 }
            },
            {
                $limit: 10
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Lesson purchase statistics retrieved successfully',
            data: {
                overall: stats[0] || {
                    totalPurchases: 0,
                    totalRevenue: 0,
                    averagePrice: 0
                },
                topLessons: lessonStats
            }
        });
    } catch (error) {
        console.error('Error in getLessonPurchaseStats:', error);
        next(new AppError('Failed to get lesson purchase statistics', 500));
    }
};

export {
    purchaseLesson,
    checkLessonAccess,
    getUserPurchases,
    getLessonPurchaseStats
}; 