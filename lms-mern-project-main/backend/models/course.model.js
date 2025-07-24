import { model, Schema } from "mongoose";

const courseSchema = new Schema({
    title: {
        type: String,
        unique: true,
        required: [true, 'Title is required'],
        minLength: [8, 'Title must be at least 8 character'],
        maxLength: [59, 'Title should be less than 60 character'],
        trim: true
    },
    description: {
        type: String,
        required: true,
        minLength: [8, 'Description must be at least 8 character'],
        maxLength: [500, 'Description should be less than 500 character'],
    },
    category: {
        type: String,
        default: 'General',
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
    }
},
    {
        timestamps: true
    })

const Course = model("Course", courseSchema);

export default Course