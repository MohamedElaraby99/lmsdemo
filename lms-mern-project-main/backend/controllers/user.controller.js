import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import fs from 'fs';
import cloudinary from 'cloudinary';
import AppError from "../utils/error.utils.js";
import sendEmail from "../utils/sendEmail.js";
import UserDevice from '../models/userDevice.model.js';
import { generateDeviceFingerprint, parseDeviceInfo, generateDeviceName } from '../utils/deviceUtils.js';
import { generateProductionFileUrl } from '../utils/fileUtils.js';

const cookieOptions = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: true, 
    sameSite: 'none'
}


// Register  
const register = async (req, res, next) => {
    try {
        const { fullName, username, email, password, phoneNumber, fatherPhoneNumber, governorate, stage, age, adminCode } = req.body;

        // Determine user role based on admin code
        let userRole = 'USER';
        if (adminCode === 'ADMIN123') {
            userRole = 'ADMIN';
        }

        // Check required fields based on role
        if (!fullName || !username || !email || !password) {
            return next(new AppError("Name, username, email, and password are required", 400));
        }

        // For regular users, check all required fields
        if (userRole === 'USER') {
            if (!phoneNumber || !fatherPhoneNumber || !governorate || !stage || !age) {
                return next(new AppError("All fields are required for regular users", 400));
            }
        }

        // Check if the user already exists
        const userExist = await userModel.findOne({ 
            $or: [{ email }, { username }] 
        });
        if (userExist) {
            if (userExist.email === email) {
                return next(new AppError("Email already exists, please login", 400));
            }
            if (userExist.username === username) {
                return next(new AppError("Username already exists, please choose another", 400));
            }
        }

        // Prepare user data based on role
        const userData = {
            fullName,
            username,
            email,
            password,
            role: userRole,
            avatar: {
                public_id: email,
                secure_url: "",
            },
        };

        // Add optional fields for regular users
        if (userRole === 'USER') {
            userData.phoneNumber = phoneNumber;
            userData.fatherPhoneNumber = fatherPhoneNumber;
            userData.governorate = governorate;
            userData.stage = stage;
            userData.age = parseInt(age);
        }

        // Save user in the database and log the user in
        const user = await userModel.create(userData);

        if (!user) {
            return next(new AppError("User registration failed, please try again", 400));
        }

        // File upload
        if (req.file) {
            try {
                // Use local file storage for avatars instead of Cloudinary
                const fileName = req.file.filename;
                
                // Create avatars directory if it doesn't exist
                const avatarsDir = 'uploads/avatars';
                if (!fs.existsSync(avatarsDir)) {
                    fs.mkdirSync(avatarsDir, { recursive: true });
                }
                
                // Move file to avatars directory
                const oldPath = `uploads/${fileName}`;
                const newPath = `${avatarsDir}/${fileName}`;
                
                if (fs.existsSync(oldPath)) {
                    fs.renameSync(oldPath, newPath);
                }
                
                // Generate the proper production URL
                const avatarUrl = generateProductionFileUrl(fileName, 'avatars');
                
                // Save the avatar information
                user.avatar.public_id = `local_${fileName}`;
                user.avatar.secure_url = avatarUrl;
                
                console.log('Avatar saved locally:', avatarUrl);
                
            } catch (e) {
                console.log('File upload error:', e.message);
                // Set placeholder avatar if upload fails
                user.avatar.public_id = 'placeholder';
                user.avatar.secure_url = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iIzRGNDZFNSIvPgogIDx0ZXh0IHg9IjEyNSIgeT0iMTI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj4KICAgIFVzZXIgQXZhdGFyCiAgPC90ZXh0Pgo8L3N2Zz4K';
            }
        }

        await user.save();

        user.password = undefined;

        const token = await user.generateJWTToken();

        res.cookie("token", token, cookieOptions);

        res.status(201).json({
            success: true,
            message: `User registered successfully as ${userRole}`,
            user,
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};



// login
const login = async (req, res, next) => {
    try {
        const { email, password, deviceInfo } = req.body;

        // check if user miss any field
        if (!email || !password) {
            return next(new AppError('All fields are required', 400))
        }

        const user = await userModel.findOne({ email }).select('+password');

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return next(new AppError('Email or Password does not match', 400))
        }

        // Skip device check for admin users
        if (user.role !== 'ADMIN') {
            // Check device authorization before allowing login
            try {
                const deviceFingerprint = generateDeviceFingerprint(req, deviceInfo || {});
                
                console.log('=== LOGIN DEVICE CHECK ===');
                console.log('User ID:', user._id);
                console.log('Device fingerprint:', deviceFingerprint);
                
                // Check if this device is already authorized
                const existingDevice = await UserDevice.findOne({
                    user: user._id,
                    deviceFingerprint,
                    isActive: true
                });

                if (existingDevice) {
                    // Device is authorized, update last login
                    existingDevice.lastActivity = new Date();
                    existingDevice.loginCount += 1;
                    await existingDevice.save();
                    console.log('Device already authorized, login allowed');
                } else {
                    // Check if user has reached device limit
                    const userDeviceCount = await UserDevice.countDocuments({
                        user: user._id,
                        isActive: true
                    });

                    const MAX_DEVICES = 2;
                    
                    if (userDeviceCount >= MAX_DEVICES) {
                        console.log(`User has reached device limit: ${userDeviceCount}/${MAX_DEVICES}`);
                        return next(new AppError(
                            `تم الوصول للحد الأقصى من الأجهزة المسموحة (${MAX_DEVICES} أجهزة). يرجى التواصل مع الإدارة لإعادة تعيين الأجهزة المصرحة.`,
                            403
                        ));
                    }

                    // Register new device automatically on login
                    const deviceName = generateDeviceName(deviceInfo || {}, req);
                    const parsedDeviceInfo = parseDeviceInfo(req, deviceInfo || {});

                    const newDevice = await UserDevice.create({
                        user: user._id,
                        deviceFingerprint,
                        deviceName,
                        deviceInfo: parsedDeviceInfo,
                        isActive: true,
                        firstLoginAt: new Date(),
                        lastActivity: new Date(),
                        loginCount: 1
                    });

                    console.log('New device registered automatically on login:', newDevice._id);
                }
            } catch (deviceError) {
                console.error('Device check error during login:', deviceError);
                // Continue with login if device check fails (fallback)
                console.log('Device check failed, allowing login as fallback');
            }
        }

        const token = await user.generateJWTToken();

        user.password = undefined;

        res.cookie('token', token, cookieOptions)

        res.status(200).json({
            success: true,
            message: 'User loggedin successfully',
            user,
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}


// logout
const logout = async (req, res, next) => {
    try {
        res.cookie('token', null, {
            secure: true,
            maxAge: 0,
            httpOnly: true
        })

        res.status(200).json({
            success: true,
            message: 'User loggedout successfully'
        })
    }
    catch (e) {
        return next(new AppError(e.message, 500))
    }
}


// getProfile
const getProfile = async (req, res) => {
    try {
        const { id } = req.user;
        const user = await userModel.findById(id).populate('stage');

        console.log('User profile data being sent:', {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            fatherPhoneNumber: user.fatherPhoneNumber,
            governorate: user.governorate,
            grade: user.grade,
            stage: user.stage,
            age: user.age,
            role: user.role
        });

        res.status(200).json({
            success: true,
            message: 'User details',
            user
        })
    } catch (e) {
        return next(new AppError('Failed to fetch user profile', 500))
    }
}

// forgot password
const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    // check if user does'nt pass email
    if (!email) {
        return next(new AppError('Email is required', 400))
    }

    const user = await userModel.findOne({ email });
    // check if user not registered with the email
    if (!user) {
        return next(new AppError('Email not registered', 400))
    }

    const resetToken = await user.generatePasswordResetToken();

    await user.save();

    const resetPasswordURL = `${process.env.CLIENT_URL}/user/profile/reset-password/${resetToken}`

    const subject = 'Reset Password';
    const message = `You can reset your password by clicking ${resetPasswordURL} Reset your password</$>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordURL}.\n If you have not requested this, kindly ignore.`;

    try {
        await sendEmail(email, subject, message);

        res.status(200).json({
            success: true,
            message: `Reset password token has been sent to ${email}`,
        });
    } catch (e) {
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        await user.save();
        return next(new AppError(e.message, 500));
    }

}


// reset password
const resetPassword = async (req, res, next) => {
    try {
        const { resetToken } = req.params;

        const { password } = req.body; 

        const forgotPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const user = await userModel.findOne({
            forgotPasswordToken,
            forgotPasswordExpiry: { $gt: Date.now() }
        })

        if (!user) {
            return next(new AppError("Token is invalid or expired, please try again", 400));
        }

        user.password = password;
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

// change password
const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const { id } = req.user;

        if (!oldPassword || !newPassword) {
            return next(new AppError("All fields are requared", 400));
        }

        const user = await userModel.findById(id).select('+password');

        if (!user) {
            return next(new AppError("User does not exist", 400));
        }

        if (!(await bcrypt.compare(oldPassword, user.password))) {
            return next(new AppError("Invalid Old Password", 400));
        }

        user.password = newPassword;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }

}

// update profile
const updateUser = async (req, res, next) => {
    try {
        const { fullName, username, phoneNumber, fatherPhoneNumber, governorate, stage, age } = req.body;
        const { id } = req.user;

        console.log('Update user data:', { fullName, username, phoneNumber, fatherPhoneNumber, governorate, stage, age });

        const user = await userModel.findById(id);

        if (!user) {
            return next(new AppError("user does not exist", 400));
        }

        // Update user fields if provided
        if (fullName) {
            user.fullName = fullName;
        }
        if (username) {
            // Check if username is already taken by another user
            const existingUser = await userModel.findOne({ 
                username: username, 
                _id: { $ne: id } 
            });
            if (existingUser) {
                return next(new AppError("Username already exists, please choose another", 400));
            }
            user.username = username;
        }
        if (phoneNumber) {
            user.phoneNumber = phoneNumber;
        }
        if (fatherPhoneNumber) {
            user.fatherPhoneNumber = fatherPhoneNumber;
        }
        if (governorate) {
            user.governorate = governorate;
        }
        if (stage) {
            user.stage = stage;
        }
        if (age) {
            user.age = parseInt(age);
        }

        if (req.file) {
            try {
                // Use local file storage for avatars instead of Cloudinary
                const fileName = req.file.filename;
                
                // Create avatars directory if it doesn't exist
                const avatarsDir = 'uploads/avatars';
                if (!fs.existsSync(avatarsDir)) {
                    fs.mkdirSync(avatarsDir, { recursive: true });
                }
                
                // Move file to avatars directory
                const oldPath = `uploads/${fileName}`;
                const newPath = `${avatarsDir}/${fileName}`;
                
                if (fs.existsSync(oldPath)) {
                    fs.renameSync(oldPath, newPath);
                }
                
                // Remove old avatar file if it exists and is not a placeholder
                if (user.avatar.public_id && user.avatar.public_id !== 'placeholder' && user.avatar.public_id.startsWith('local_')) {
                    // Extract filename from old URL to build proper file path
                    const oldFileName = user.avatar.secure_url.split('/').pop();
                    const oldAvatarPath = `uploads/avatars/${oldFileName}`;
                    if (fs.existsSync(oldAvatarPath)) {
                        fs.rmSync(oldAvatarPath);
                    }
                }
                
                // Generate the proper production URL
                const avatarUrl = generateProductionFileUrl(fileName, 'avatars');
                
                // Save the avatar information
                user.avatar.public_id = `local_${fileName}`;
                user.avatar.secure_url = avatarUrl;
                
                console.log('Avatar saved locally:', avatarUrl);
                
            } catch (e) {
                console.log('File upload error:', e.message);
                // Set placeholder avatar if upload fails
                user.avatar.public_id = 'placeholder';
                user.avatar.secure_url = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iIzRGNDZFNSIvPgogIDx0ZXh0IHg9IjEyNSIgeT0iMTI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj4KICAgIFVzZXIgQXZhdGFyCiAgPC90ZXh0Pgo8L3N2Zz4K';
            }
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "User update successfully",
            user
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser
}