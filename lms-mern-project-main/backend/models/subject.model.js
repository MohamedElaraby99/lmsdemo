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
    duration: {
        type: String,
        required: [true, 'Course duration is required'],
        default: '4 weeks'
    },
    level: {
        type: String,
        required: [true, 'Course level is required'],
        enum: ['Beginner', 'Intermediate', 'Advanced']
    },
    price: {
        type: Number,
        required: [true, 'Course price is required'],
        min: [0, 'Price cannot be negative']
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
    tags: [{
        type: String,
        trim: true
    }],
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Create index for better search performance
subjectSchema.index({ title: 'text', description: 'text', category: 'text' });

const Subject = model("Subject", subjectSchema);

export default Subject; 