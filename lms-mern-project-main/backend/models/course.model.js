import { model, Schema } from "mongoose";

const courseSchema = new Schema({
    title: {
        type: String,
        unique: true,
        required: [true, 'Title is required'],
        minLength: [2, 'Title must be at least 2 characters'],
        maxLength: [59, 'Title should be less than 60 character'],
        trim: true
    },
    description: {
        type: String,
        required: true,
        minLength: [2, 'Description must be at least 2 characters'],
        maxLength: [500, 'Description should be less than 500 character'],
    },
    category: {
        type: String,
        default: 'General',
    },
    // New fields for subject and stage
    subject: {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
        required: [true, 'Subject is required']
    },
    stage: {
        type: String,
        required: [true, 'Stage is required'],
        enum: ['Primary', 'Secondary', 'High School', 'University', 'Professional', 'General'],
        default: 'General'
    },
    thumbnail: {
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    units: [
        {
            title: {
                type: String,
                required: true,
                trim: true
            },
            description: {
                type: String,
                trim: true
            },
            lessons: [
                {
                    title: {
                        type: String,
                        required: true,
                        trim: true
                    },
                    description: {
                        type: String,
                        trim: true
                    },
                    lecture: {
                        public_id: {
                            type: String 
                        },
                        secure_url: {
                            type: String
                        },
                        youtubeUrl: {
                            type: String
                        },
                        // Scheduling fields
                        scheduledPublishDate: {
                            type: Date,
                            default: null
                        },
                        isScheduled: {
                            type: Boolean,
                            default: false
                        }
                    },
                    duration: {
                        type: Number, // in minutes
                        default: 0
                    },
                    order: {
                        type: Number,
                        default: 0
                    }
                }
            ],
            order: {
                type: Number,
                default: 0
            }
        }
    ],
    directLessons: [
        {
            title: {
                type: String,
                required: true,
                trim: true
            },
            description: {
                type: String,
                trim: true
            },
            lecture: {
                public_id: {
                    type: String 
                },
                secure_url: {
                    type: String
                },
                youtubeUrl: {
                    type: String
                },
                // Scheduling fields
                scheduledPublishDate: {
                    type: Date,
                    default: null
                },
                isScheduled: {
                    type: Boolean,
                    default: false
                }
            },
            duration: {
                type: Number, // in minutes
                default: 0
            },
            order: {
                type: Number,
                default: 0
            }
        }
    ],
    numberOfLectures: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        default: 0,
        min: 0
    },
    currency: {
        type: String,
        default: 'EGP'
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    salesCount: {
        type: Number,
        default: 0
    },
    totalRevenue: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: String,
        default: 'Admin',
    },
    // Course structure type
    structureType: {
        type: String,
        enum: ['units', 'direct-lessons', 'mixed'],
        default: 'direct-lessons'
    },
    // Course status
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    }
},
    {
        timestamps: true
    })

const Course = model("Course", courseSchema);

export default Course