import AppError from '../utils/error.utils.js';
import sendEmail from '../utils/sendEmail.js';
import userModel from '../models/user.model.js';
import courseModel from '../models/course.model.js';
import paymentModel from '../models/payment.model.js';

const contactUs = async (req, res, next) => {
    const { name, email, message} = req.body;

    if (!name || !email || !message) {
        return next(new AppError("All fields are required", 400));
    }

    try {
        const emailMessage = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;

        // Send email to the organization
        await sendEmail(
            process.env.CONTACT_US_EMAIL,
            "Contact Us",
            emailMessage,
        );

        // Send confirmation email to the user
        const userMessage = `Hello ${name},\n\nThank you for contacting us! We have received your message and will get in touch with you soon.\n\nBest regards,\nThe LMS Team 😊`;

        await sendEmail(
            email,
            'Thank You for Contacting Us',
            userMessage,
        );

        res.status(200).json({
            success: true,
            message: "Thanks for contacting. We have sent you a confirmation email and will get in touch with you soon.",
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};


const stats = async (req, res, next) => {
    try {
        // Get all users
        const allUsers = await userModel.find({});
        const allUsersCount = allUsers.length;
        const subscribedUsersCount = allUsers.filter((user) => user.subscription?.status === 'active').length;
        
        // Get all courses
        const allCourses = await courseModel.find({});
        const totalCourses = allCourses.length;
        const totalLectures = allCourses.reduce((sum, course) => sum + (course.numberOfLectures || 0), 0);
        
        // Get all payments
        const allPayments = await paymentModel.find({});
        const totalPayments = allPayments.length;
        const totalRevenue = allPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        
        // Get monthly sales data for the current year
        const currentYear = new Date().getFullYear();
        const monthlySales = await paymentModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(currentYear, 0, 1),
                        $lt: new Date(currentYear + 1, 0, 1)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 },
                    revenue: { $sum: '$amount' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);
        
        // Create monthly sales array (12 months)
        const monthlySalesData = new Array(12).fill(0);
        monthlySales.forEach(month => {
            monthlySalesData[month._id - 1] = month.count;
        });
        
        // Get recent activities
        const recentPayments = await paymentModel.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'fullName email');
            
        const recentCourses = await courseModel.find({})
            .sort({ createdAt: -1 })
            .limit(5);
 
        res.status(200).json({
            success: true,
            message: 'Comprehensive stats retrieved successfully',
            allUsersCount,
            subscribedUsersCount,
            totalCourses,
            totalLectures,
            totalPayments,
            totalRevenue,
            monthlySalesData,
            recentPayments,
            recentCourses
        })
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

export { contactUs, stats };
