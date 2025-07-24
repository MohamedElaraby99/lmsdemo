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
        
        // Calculate revenue from actual payment records
        const allPayments = await paymentModel.find({ status: 'completed' });
        const totalPayments = allPayments.length;
        const totalRevenue = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
        
        // Calculate monthly sales data for the current year
        const currentYear = new Date().getFullYear();
        const monthlySalesData = new Array(12).fill(0);
        
        // Calculate monthly revenue from actual payments
        allPayments.forEach(payment => {
            const paymentYear = payment.createdAt.getFullYear();
            if (paymentYear === currentYear) {
                const month = payment.createdAt.getMonth();
                monthlySalesData[month] += payment.amount;
            }
        });
        
        // Recent activities (actual payments)
        const recentPayments = await paymentModel.find({ status: 'completed' })
            .populate('user', 'fullName email')
            .populate('course', 'title price')
            .sort({ createdAt: -1 })
            .limit(5)
            .then(payments => payments.map(payment => ({
                id: payment._id,
                title: payment.course?.title || 'Unknown Course',
                amount: payment.amount,
                currency: payment.currency,
                userName: payment.user?.fullName || 'Unknown User',
                userEmail: payment.user?.email || 'Unknown Email',
                date: payment.createdAt,
                transactionId: payment.transactionId
            })));
            
        const recentCourses = await courseModel.find({})
            .sort({ createdAt: -1 })
            .limit(5);
 
        res.status(200).json({
            success: true,
            message: 'Stats retrieved successfully with actual payment data',
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
