import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  price: {
    type: Number,
    default: 0
  },
  content: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

const unitSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  price: {
    type: Number,
    default: 0
  },
  lessons: [lessonSchema]
}, {
  timestamps: true
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor',
    required: true
  },
  stage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stage',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  units: [unitSchema],
  directLessons: [lessonSchema]
}, {
  timestamps: true
});

export default mongoose.model('Course', courseSchema);