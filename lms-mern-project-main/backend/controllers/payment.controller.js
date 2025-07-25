import AppError from '../utils/error.utils.js';
import paymentModel from '../models/payment.model.js';
import courseModel from '../models/course.model.js';
import userModel from '../models/user.model.js';

// Record a course purchase
const recordCoursePurchase = async (req, res, next) => {
    try {
        const { courseId, userId, amount, currency = 'EGP' } = req.body;

        if (!courseId || !userId || !amount) {
            return next(new AppError('Course ID, User ID, and amount are required', 400));
        }

        // Verify course exists and is paid
        const course = await courseModel.findById(courseId);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        if (!course.isPaid || course.price <= 0) {
            return next(new AppError('Course is not a paid course', 400));
        }

        // Verify user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Check if user already purchased this course
        const existingPurchase = await paymentModel.findOne({
            user: userId,
            course: courseId,
            status: 'completed'
        });

        if (existingPurchase) {
            return next(new AppError('User has already purchased this course', 400));
        }

        // Create payment record
        const payment = await paymentModel.create({
            user: userId,
            course: courseId,
            amount: amount,
            currency: currency,
            status: 'completed',
            transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            description: `Purchase of ${course.title}`,
            metadata: {
                courseTitle: course.title,
                coursePrice: course.price,
                userEmail: user.email,
                userName: user.fullName
            }
        });

        // Update course sales statistics
        course.salesCount = (course.salesCount || 0) + 1;
        course.totalRevenue = (course.totalRevenue || 0) + amount;
        await course.save();

        res.status(201).json({
            success: true,
            message: 'Course purchase recorded successfully',
            payment: {
                id: payment._id,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                transactionId: payment.transactionId,
                courseTitle: course.title,
                userName: user.fullName
            }
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

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
            .populate('course', 'title price')
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            message: 'Payment statistics retrieved successfully',
            totalRevenue,
            totalPayments,
            monthlyRevenue,
            recentPayments: recentPayments.map(payment => ({
                id: payment._id,
                amount: payment.amount,
                currency: payment.currency,
                courseTitle: payment.course?.title,
                userName: payment.user?.fullName,
                userEmail: payment.user?.email,
                date: payment.createdAt,
                transactionId: payment.transactionId
            }))
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
        .populate('course', 'title description thumbnail price')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'User purchases retrieved successfully',
            purchases: purchases.map(purchase => ({
                id: purchase._id,
                amount: purchase.amount,
                currency: purchase.currency,
                course: purchase.course,
                date: purchase.createdAt,
                transactionId: purchase.transactionId
            }))
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Simulate course purchase (for testing)
const simulateCoursePurchase = async (req, res, next) => {
    try {
        const { courseId, userId, amount } = req.body;

        if (!courseId || !userId || !amount) {
            return next(new AppError('Course ID, User ID, and amount are required', 400));
        }

        // Verify course exists
        const course = await courseModel.findById(courseId);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        // Verify user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Record the purchase
        const payment = await paymentModel.create({
            user: userId,
            course: courseId,
            amount: amount,
            currency: 'EGP',
            status: 'completed',
            transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            description: `Simulated purchase of ${course.title}`,
            metadata: {
                courseTitle: course.title,
                coursePrice: course.price,
                userEmail: user.email,
                userName: user.fullName
            }
        });

        // Update course sales statistics
        course.salesCount = (course.salesCount || 0) + 1;
        course.totalRevenue = (course.totalRevenue || 0) + amount;
        await course.save();

        res.status(201).json({
                success: true,
            message: 'Course purchase simulated successfully',
            payment: {
                id: payment._id,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                transactionId: payment.transactionId,
                courseTitle: course.title,
                userName: user.fullName
                }
            });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

export { 
    recordCoursePurchase, 
    getPaymentStats, 
    getUserPurchases, 
    simulateCoursePurchase 
}; 