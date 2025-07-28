import { model, Schema } from "mongoose";

const subjectSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Subject title is required'],
        trim: true,
        maxLength: [100, 'Subject title should be less than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Subject description is required'],
        maxLength: [500, 'Subject description should be less than 500 characters']
    },
    category: {
        type: String,
        required: [true, 'Subject category is required'],
        enum: ['Programming', 'Design', 'Business', 'Marketing', 'Technology', 'Science', 'Arts', 'Other']
    },
    instructor: {
        type: String,
        required: [true, 'Instructor name is required']
    },
    stage: {
        type: String,
        required: [true, 'Stage is required'],
        enum: ['1 ابتدائي', '2 ابتدائي', '3 ابتدائي', '4 ابتدائي', '5 ابتدائي', '6 ابتدائي', '1 إعدادي', '2 إعدادي', '3 إعدادي', '1 ثانوي', '2 ثانوي', '3 ثانوي', '1 جامعة', '2 جامعة', '3 جامعة', '4 جامعة']
    },
    image: {
        public_id: {
            type: String,
            default: null
        },
        secure_url: {
            type: String,
            default: null
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'featured'],
        default: 'active'
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    studentsEnrolled: {
        type: Number,
        default: 0
    },
    lessons: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    grade: {
        type: Schema.Types.ObjectId,
        ref: 'Grade',
        default: null
    }
}, {
    timestamps: true
});

// Create index for better search performance
subjectSchema.index({ title: 'text', description: 'text', category: 'text' });

const Subject = model("Subject", subjectSchema);

export default Subject; 