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
        type: Schema.Types.ObjectId,
        ref: 'Stage',
        required: [true, 'Stage is required']
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
                    // PDF Material
                    pdf: {
                        public_id: {
                            type: String
                        },
                        secure_url: {
                            type: String
                        },
                        title: {
                            type: String,
                            default: "Study Material"
                        }
                    },
                    // Training Exam
                    trainingExam: {
                        questions: [
                            {
                                question: {
                                    type: String,
                                    required: true
                                },
                                options: [{
                                    type: String,
                                    required: true
                                }],
                                correctAnswer: {
                                    type: Number,
                                    required: true,
                                    min: 0
                                },
                                explanation: {
                                    type: String,
                                    default: ""
                                }
                            }
                        ],
                        passingScore: {
                            type: Number,
                            default: 70,
                            min: 0,
                            max: 100
                        },
                        timeLimit: {
                            type: Number, // in minutes
                            default: 30
                        }
                    },
                    // Final Exam
                    finalExam: {
                        questions: [
                            {
                                question: {
                                    type: String,
                                    required: true
                                },
                                options: [{
                                    type: String,
                                    required: true
                                }],
                                correctAnswer: {
                                    type: Number,
                                    required: true,
                                    min: 0
                                },
                                explanation: {
                                    type: String,
                                    default: ""
                                }
                            }
                        ],
                        passingScore: {
                            type: Number,
                            default: 80,
                            min: 0,
                            max: 100
                        },
                        timeLimit: {
                            type: Number, // in minutes
                            default: 45
                        }
                    },
                    duration: {
                        type: Number, // in minutes
                        default: 0
                    },
                    order: {
                        type: Number,
                        default: 0
                    },
                    price: {
                        type: Number,
                        default: 10, // Default price for individual lessons
                        min: 0
                    }
                }
            ],
            order: {
                type: Number,
                default: 0
            },
            price: {
                type: Number,
                default: 10, // Default price for individual lessons
                min: 0
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
            // PDF Material
            pdf: {
                public_id: {
                    type: String
                },
                secure_url: {
                    type: String
                },
                title: {
                    type: String,
                    default: "Study Material"
                }
            },
            // Training Exam
            trainingExam: {
                questions: [
                    {
                        question: {
                            type: String,
                            required: true
                        },
                        options: [{
                            type: String,
                            required: true
                        }],
                        correctAnswer: {
                            type: Number,
                            required: true,
                            min: 0
                        },
                        explanation: {
                            type: String,
                            default: ""
                        }
                    }
                ],
                passingScore: {
                    type: Number,
                    default: 70,
                    min: 0,
                    max: 100
                },
                timeLimit: {
                    type: Number, // in minutes
                    default: 30
                }
            },
            // Final Exam
            finalExam: {
                questions: [
                    {
                        question: {
                            type: String,
                            required: true
                        },
                        options: [{
                            type: String,
                            required: true
                        }],
                        correctAnswer: {
                            type: Number,
                            required: true,
                            min: 0
                        },
                        explanation: {
                            type: String,
                            default: ""
                        }
                    }
                ],
                passingScore: {
                    type: Number,
                    default: 80,
                    min: 0,
                    max: 100
                },
                timeLimit: {
                    type: Number, // in minutes
                    default: 45
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