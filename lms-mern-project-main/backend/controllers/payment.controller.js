import AppError from '../utils/error.utils.js';
import paymentModel from '../models/payment.model.js';
import userModel from '../models/user.model.js';

// Get payment statistics
const getPaymentStats = async (req, res, next) => {
    try {
        // Get all completed payments
        const allPayments = await paymentModel.find({ status: 'completed' });
        
        // Calculate total revenue
        const totalRevenue = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
        
        // Get total number of payments
        const totalPayments = allPayments.length;
        
        // Calculate monthly revenue for current year
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = new Array(12).fill(0);
        
        allPayments.forEach(payment => {
            const paymentYear = payment.createdAt.getFullYear();
            if (paymentYear === currentYear) {
                const month = payment.createdAt.getMonth();
                monthlyRevenue[month] += payment.amount;
            }
        });

        // Get recent payments
        const recentPayments = await paymentModel.find({ status: 'completed' })
            .populate('user', 'fullName email')
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            message: 'Payment statistics retrieved successfully',
            stats: {
                totalRevenue,
                totalPayments,
                monthlyRevenue,
                recentPayments: recentPayments.map(payment => ({
                    id: payment._id,
                    amount: payment.amount,
                    currency: payment.currency,
                    userName: payment.user?.fullName || 'Unknown User',
                    userEmail: payment.user?.email || 'Unknown Email',
                    date: payment.createdAt,
                    transactionId: payment.transactionId
                }))
            }
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get user's purchase history
const getUserPurchases = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const purchases = await paymentModel.find({ 
            user: userId, 
            status: 'completed' 
        })
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'User purchases retrieved successfully',
            purchases: purchases.map(purchase => ({
                id: purchase._id,
                amount: purchase.amount,
                currency: purchase.currency,
                date: purchase.createdAt,
                transactionId: purchase.transactionId
            }))
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Record a course purchase
const recordCoursePurchase = async (req, res, next) => {
    try {
        const { courseId, amount, currency = 'USD', transactionId } = req.body;
        const userId = req.user.id;

        if (!courseId || !amount) {
            return next(new AppError('Course ID and amount are required', 400));
        }

        // Create a new payment record
        const payment = await paymentModel.create({
            user: userId,
            course: courseId,
            amount,
            currency,
            transactionId,
            status: 'completed',
            paymentMethod: req.body.paymentMethod || 'unknown'
        });

        res.status(201).json({
            success: true,
            message: 'Course purchase recorded successfully',
            payment: {
                id: payment._id,
                amount: payment.amount,
                currency: payment.currency,
                transactionId: payment.transactionId,
                date: payment.createdAt
            }
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Simulate course purchase (for testing)
const simulateCoursePurchase = async (req, res, next) => {
    try {
        const { courseId, amount, currency = 'USD', userId } = req.body;

        if (!courseId || !amount || !userId) {
            return next(new AppError('Course ID, amount, and user ID are required', 400));
        }

        // Create a simulated payment record
        const payment = await paymentModel.create({
            user: userId,
            course: courseId,
            amount,
            currency,
            transactionId: `SIM_${Date.now()}`,
            status: 'completed',
            paymentMethod: 'simulated'
        });

        res.status(201).json({
            success: true,
            message: 'Simulated course purchase recorded successfully',
            payment: {
                id: payment._id,
                amount: payment.amount,
                currency: payment.currency,
                transactionId: payment.transactionId,
                date: payment.createdAt
            }
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

export { 
    getPaymentStats, 
    getUserPurchases,
    recordCoursePurchase,
    simulateCoursePurchase
}; 