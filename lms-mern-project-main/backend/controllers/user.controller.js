import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import fs from 'fs';
import cloudinary from 'cloudinary';
import AppError from "../utils/error.utils.js";
import sendEmail from "../utils/sendEmail.js";

const cookieOptions = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: true, 
    sameSite: 'none'
}


// Register  
const register = async (req, res, next) => {
    try {
        const { fullName, email, password, phoneNumber, fatherPhoneNumber, governorate, grade, age, adminCode } = req.body;

        // Determine user role based on admin code
        let userRole = 'USER';
        if (adminCode === 'ADMIN123') {
            userRole = 'ADMIN';
        }

        // Check required fields based on role
        if (!fullName || !email || !password) {
            return next(new AppError("Name, email, and password are required", 400));
        }

        // For regular users, check all required fields
        if (userRole === 'USER') {
            if (!phoneNumber || !fatherPhoneNumber || !governorate || !grade || !age) {
                return next(new AppError("All fields are required for regular users", 400));
            }
        }

        // Check if the user already exists
        const userExist = await userModel.findOne({ email });
        if (userExist) {
            return next(new AppError("Email already exists, please login", 400));
        }

        // Prepare user data based on role
        const userData = {
            fullName,
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
            userData.grade = grade;
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
                // Check if Cloudinary is properly configured
                if (process.env.CLOUDINARY_CLOUD_NAME === 'placeholder' || 
                    process.env.CLOUDINARY_API_KEY === 'placeholder' || 
                    process.env.CLOUDINARY_API_SECRET === 'placeholder') {
                    // Skip Cloudinary upload if using placeholder credentials
                    console.log('Cloudinary not configured, using placeholder avatar');
                    user.avatar.public_id = 'placeholder';
                    user.avatar.secure_url = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iIzRGNDZFNSIvPgogIDx0ZXh0IHg9IjEyNSIgeT0iMTI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj4KICAgIFVzZXIgQXZhdGFyCiAgPC90ZXh0Pgo8L3N2Zz4K';
                } else {
                    const result = await cloudinary.v2.uploader.upload(req.file.path, {
                        folder: "Learning-Management-System",
                        width: 250,
                        height: 250,
                        gravity: "faces",
                        crop: "fill",
                    });

                    if (result) {
                        user.avatar.public_id = result.public_id;
                        user.avatar.secure_url = result.secure_url;
                    }
                }

                // Remove the file from the server
                if (fs.existsSync(`uploads/${req.file.filename}`)) {
                    fs.rmSync(`uploads/${req.file.filename}`);
                }
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
        const { email, password } = req.body;

        // check if user miss any field
        if (!email || !password) {
            return next(new AppError('All fields are required', 400))
        }

        const user = await userModel.findOne({ email }).select('+password');

        if (!user || !(bcrypt.compareSync(password, user.password))) {
            return next(new AppError('Email or Password does not match', 400))
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
        const user = await userModel.findById(id);

        console.log('User profile data being sent:', {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            fatherPhoneNumber: user.fatherPhoneNumber,
            governorate: user.governorate,
            grade: user.grade,
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

        if (!(bcrypt.compareSync(oldPassword, user.password))) {
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
        const { fullName, phoneNumber, fatherPhoneNumber, governorate, grade, age } = req.body;
        const { id } = req.user;

        console.log('Update user data:', { fullName, phoneNumber, fatherPhoneNumber, governorate, grade, age });

        const user = await userModel.findById(id);

        if (!user) {
            return next(new AppError("user does not exist", 400));
        }

        // Update user fields if provided
        if (fullName) {
            user.fullName = fullName;
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
        if (grade) {
            user.grade = grade;
        }
        if (age) {
            user.age = parseInt(age);
        }

        if (req.file) {
            try {
                // Check if Cloudinary is properly configured
                if (process.env.CLOUDINARY_CLOUD_NAME === 'placeholder' || 
                    process.env.CLOUDINARY_API_KEY === 'placeholder' || 
                    process.env.CLOUDINARY_API_SECRET === 'placeholder') {
                    // Skip Cloudinary upload if using placeholder credentials
                    console.log('Cloudinary not configured, using placeholder avatar');
                    user.avatar.public_id = 'placeholder';
                    user.avatar.secure_url = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iIzRGNDZFNSIvPgogIDx0ZXh0IHg9IjEyNSIgeT0iMTI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj4KICAgIFVzZXIgQXZhdGFyCiAgPC90ZXh0Pgo8L3N2Zz4K';
                } else {
                    // Only destroy if we have a valid public_id
                    if (user.avatar.public_id && user.avatar.public_id !== 'placeholder') {
                        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
                    }

                    const result = await cloudinary.v2.uploader.upload(req.file.path, {
                        folder: 'Learning-Management-System',
                        width: 250,
                        height: 250,
                        gravity: 'faces',
                        crop: 'fill'
                    })

                    if (result) {
                        user.avatar.public_id = result.public_id;
                        user.avatar.secure_url = result.secure_url;
                    }
                }

                // Remove file from server
                if (fs.existsSync(`uploads/${req.file.filename}`)) {
                    fs.rmSync(`uploads/${req.file.filename}`);
                }
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