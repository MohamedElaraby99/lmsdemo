import userModel from "../models/user.model.js";
import AppError from "../utils/error.utils.js";

// Get all users with pagination and filters
const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, role, status, search, stage } = req.query;
        const skip = (page - 1) * limit;

        let query = {};

        // Filter by role
        if (role && role !== 'all') {
            query.role = role;
        }

        // Filter by status (active/inactive)
        if (status && status !== 'all') {
            query.isActive = status === 'active';
        }

        // Filter by stage
        if (stage && stage !== 'all') {
            query.stage = stage;
        }

        // Search by name or email
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        console.log('Query:', query);
        console.log('Admin requesting users. User ID:', req.user.id);

        const users = await userModel.find(query)
            .select('-password -forgotPasswordToken -forgotPasswordExpiry')
            .populate('stage', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        console.log('Found users:', users.length);

        const total = await userModel.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        // Calculate statistics
        const stats = await userModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
                    inactiveUsers: { $sum: { $cond: ['$isActive', 0, 1] } },
                    adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'ADMIN'] }, 1, 0] } },
                    regularUsers: { $sum: { $cond: [{ $eq: ['$role', 'USER'] }, 1, 0] } }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: {
                users: users.map(user => ({
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    isActive: user.isActive !== false, // Default to true if not set
                    governorate: user.governorate,
                    grade: user.grade,
                    stage: user.stage,
                    age: user.age,
                    walletBalance: user.wallet?.balance || 0,
                    totalTransactions: user.wallet?.transactions?.length || 0,
                    subscriptionStatus: user.subscription?.status || 'inactive',
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    total,
                    limit: parseInt(limit)
                },
                stats: stats[0] || {
                    totalUsers: 0,
                    activeUsers: 0,
                    inactiveUsers: 0,
                    adminUsers: 0,
                    regularUsers: 0
                }
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Create new user (Admin only)
const createUser = async (req, res, next) => {
    try {
        const { 
            fullName, 
            username, 
            email, 
            password, 
            role = 'USER',
            phoneNumber,
            fatherPhoneNumber,
            governorate,
            stage,
            age 
        } = req.body;

        // Validate required fields
        if (!fullName || !username || !email || !password || !role) {
            return next(new AppError("Full name, username, email, password, and role are required", 400));
        }

        // Validate role
        if (!['USER', 'ADMIN'].includes(role)) {
            return next(new AppError("Role must be either USER or ADMIN", 400));
        }

        // For USER role, require additional fields
        if (role === 'USER') {
            if (!phoneNumber || !fatherPhoneNumber || !governorate || !stage || !age) {
                return next(new AppError("Phone number, father phone number, governorate, stage, and age are required for regular users", 400));
            }
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return next(new AppError("Email already exists", 400));
            }
            if (existingUser.username === username) {
                return next(new AppError("Username already exists", 400));
            }
        }

        // Prepare user data
        const userData = {
            fullName,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password,
            role,
            isActive: true,
            avatar: {
                public_id: email,
                secure_url: "",
            }
        };

        // Add optional fields for USER role
        if (role === 'USER') {
            userData.phoneNumber = phoneNumber;
            userData.fatherPhoneNumber = fatherPhoneNumber;
            userData.governorate = governorate;
            userData.stage = stage;
            userData.age = parseInt(age);
        }

        // Create user
        const user = await userModel.create(userData);

        if (!user) {
            return next(new AppError("Failed to create user", 500));
        }

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: `${role} account created successfully`,
            data: {
                user: {
                    id: userResponse._id,
                    fullName: userResponse.fullName,
                    username: userResponse.username,
                    email: userResponse.email,
                    role: userResponse.role,
                    isActive: userResponse.isActive,
                    phoneNumber: userResponse.phoneNumber,
                    fatherPhoneNumber: userResponse.fatherPhoneNumber,
                    governorate: userResponse.governorate,
                    stage: userResponse.stage,
                    age: userResponse.age,
                    createdAt: userResponse.createdAt
                }
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get user details with activities
const getUserDetails = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await userModel.findById(userId)
            .select('-password -forgotPasswordToken -forgotPasswordExpiry');

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Get user statistics
        const userStats = {
            walletBalance: user.wallet?.balance || 0,
            totalTransactions: user.wallet?.transactions?.length || 0,
            totalRecharges: user.wallet?.transactions?.filter(t => t.type === 'recharge').length || 0,
            totalPurchases: user.wallet?.transactions?.filter(t => t.type === 'purchase').length || 0,
            subscriptionStatus: user.subscription?.status || 'inactive'
        };

        res.status(200).json({
            success: true,
            message: "User details retrieved successfully",
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    fatherPhoneNumber: user.fatherPhoneNumber,
                    governorate: user.governorate,
                    grade: user.grade,
                    age: user.age,
                    role: user.role,
                    isActive: user.isActive !== false,
                    avatar: user.avatar,
                    subscription: user.subscription,
                    wallet: user.wallet,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin
                },
                stats: userStats
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Toggle user active status
const toggleUserStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Prevent admin from deactivating themselves
        if (user._id.toString() === req.user.id) {
            return next(new AppError("You cannot deactivate your own account", 400));
        }

        user.isActive = isActive;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                userId: user._id,
                isActive: user.isActive
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Delete user
const deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await userModel.findById(userId);
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user.id) {
            return next(new AppError("You cannot delete your own account", 400));
        }

        // Prevent deleting other admins
        if (user.role === 'ADMIN') {
            return next(new AppError("Cannot delete admin accounts", 400));
        }

        await userModel.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Update user role
const updateUserRole = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['USER', 'ADMIN'].includes(role)) {
            return next(new AppError("Invalid role", 400));
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Prevent admin from changing their own role
        if (user._id.toString() === req.user.id) {
            return next(new AppError("You cannot change your own role", 400));
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            success: true,
            message: "User role updated successfully",
            data: {
                userId: user._id,
                role: user.role
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get user activities (transactions, etc.)
const getUserActivities = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const user = await userModel.findById(userId);
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        const transactions = user.wallet?.transactions || [];
        const totalTransactions = transactions.length;
        const totalPages = Math.ceil(totalTransactions / limit);

        // Paginate transactions
        const paginatedTransactions = transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(skip, skip + parseInt(limit));

        res.status(200).json({
            success: true,
            message: "User activities retrieved successfully",
            data: {
                activities: paginatedTransactions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    total: totalTransactions,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get user statistics
const getUserStats = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await userModel.findById(userId);
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        const transactions = user.wallet?.transactions || [];
        
        const stats = {
            walletBalance: user.wallet?.balance || 0,
            totalTransactions: transactions.length,
            totalRecharges: transactions.filter(t => t.type === 'recharge').length,
            totalPurchases: transactions.filter(t => t.type === 'purchase').length,
            totalRefunds: transactions.filter(t => t.type === 'refund').length,
            totalSpent: transactions
                .filter(t => t.type === 'purchase')
                .reduce((sum, t) => sum + t.amount, 0),
            totalRecharged: transactions
                .filter(t => t.type === 'recharge')
                .reduce((sum, t) => sum + t.amount, 0),
            subscriptionStatus: user.subscription?.status || 'inactive',
            accountAge: Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) // days
        };

        res.status(200).json({
            success: true,
            message: "User statistics retrieved successfully",
            data: {
                stats
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

export {
    getAllUsers,
    createUser,
    getUserDetails,
    toggleUserStatus,
    deleteUser,
    updateUserRole,
    getUserActivities,
    getUserStats
}; 