import { model, Schema } from "mongoose";

const lessonPurchaseSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    lessonId: {
        type: String,
        required: true
    },
    lessonTitle: {
        type: String,
        required: true
    },
    unitId: {
        type: String,
        default: null // null for direct lessons
    },
    unitTitle: {
        type: String,
        default: null
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'EGP'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'completed'
    },
    paymentMethod: {
        type: String,
        default: 'wallet'
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    description: {
        type: String,
        default: 'Lesson purchase'
    },
    metadata: {
        courseTitle: String,
        lessonPrice: Number,
        userEmail: String,
        userName: String
    }
}, {
    timestamps: true
});

// Index for better query performance
lessonPurchaseSchema.index({ user: 1, course: 1, lessonId: 1 }, { unique: true });
lessonPurchaseSchema.index({ user: 1 });
lessonPurchaseSchema.index({ course: 1 });

const LessonPurchase = model("LessonPurchase", lessonPurchaseSchema);

export default LessonPurchase; 