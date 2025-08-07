import { Schema, model } from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const userSchema = new Schema({
    fullName: {
        type: String,
        required: [true, 'Name is required'],
        minLength: [3, 'Name must be at least 3 character'],
        maxLength: [50, 'Name should be less than 50 character'],
        lowercase: true,
        trim: true
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        minLength: [3, 'Username must be at least 3 characters'],
        maxLength: [20, 'Username should be less than 20 characters'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        lowercase: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [4, 'Password must be at least 4 character'],
        select: false
    },
    phoneNumber: {
        type: String,
        required: function() {
            return this.role !== 'ADMIN';
        },
        trim: true
    },
    fatherPhoneNumber: {
        type: String,
        required: function() {
            return this.role !== 'ADMIN';
        },
        trim: true
    },
    governorate: {
        type: String,
        required: function() {
            return this.role !== 'ADMIN';
        },
        trim: true
    },

    stage: {
        type: Schema.Types.ObjectId,
        ref: 'Stage',
        required: function() {
            return this.role !== 'ADMIN';
        }
    },
    age: {
        type: Number,
        required: function() {
            return this.role !== 'ADMIN';
        },
        min: [5, 'Age must be at least 5'],
        max: [100, 'Age cannot exceed 100']
    },
    avatar: {
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    role: {
        type: String,
        default: 'USER',
        enum: ['USER', 'ADMIN']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    subscription: {
        id: String,
        status: String
    },
    // Track purchased courses and lessons
    hasPurchasedCourse: [{
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }],
    purchasedContentIds: [{
        type: Schema.Types.ObjectId,
        required: true
    }],
    wallet: {
        balance: {
            type: Number,
            default: 0
        },
        transactions: [{
            type: {
                type: String,
                enum: ['recharge', 'purchase', 'refund'],
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            code: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            },
            status: {
                type: String,
                enum: ['pending', 'completed', 'failed'],
                default: 'completed'
            }
        }]
    }
},
    {
        timestamps: true
    });


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    return next();
});

userSchema.methods = {
    generateJWTToken: function () {
        return jwt.sign(
            { id: this._id, email: this.email, role: this.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        )
    },

    generatePasswordResetToken: async function () {
        const resetToken = await crypto.randomBytes(20).toString('hex');

        this.forgotPasswordToken = await crypto
            .createHash('sha256')  
            .update(resetToken)
            .digest('hex');

        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 min from now

        return resetToken;
    }

}


export default model("User", userSchema);