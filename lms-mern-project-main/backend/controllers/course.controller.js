import Course from '../models/course.model.js';
import AppError from '../utils/error.utils.js';

// Create a new course
export const createCourse = async (req, res, next) => {
  try {
    const { title, description, instructor, stage, subject } = req.body;
    if (!title || !instructor || !stage || !subject) {
      return res.status(400).json({ success: false, message: 'Title, instructor, stage, and subject are required' });
    }
    const course = await Course.create({
      title,
      description,
      instructor,
      stage,
      subject,
      units: [],
      directLessons: []
    });
    return res.status(201).json({ success: true, message: 'Course created', data: { course } });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Get all courses
export const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'name')
      .populate('stage', 'name')
      .populate('subject', 'name');
    return res.status(200).json({ success: true, data: { courses } });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Get featured courses
export const getFeaturedCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().populate('instructor', 'name').populate('stage', 'name').limit(6);
    return res.status(200).json({ success: true, data: { courses } });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Get course by ID
export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id)
      .populate('instructor', 'name')
      .populate('stage', 'name')
      .populate('subject', 'name');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    return res.status(200).json({ success: true, data: { course } });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Update course
export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, instructor, stage, subject } = req.body;
    const course = await Course.findByIdAndUpdate(
      id,
      { title, description, instructor, stage, subject },
      { new: true }
    )
      .populate('instructor', 'name')
      .populate('stage', 'name')
      .populate('subject', 'name');
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    return res.status(200).json({ success: true, message: 'Course updated', data: { course } });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Delete course
export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    return res.status(200).json({ success: true, message: 'Course deleted' });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Get course stats
export const getCourseStats = async (req, res, next) => {
  try {
    const totalCourses = await Course.countDocuments();
    const totalUnits = await Course.aggregate([
      { $unwind: '$units' },
      { $count: 'total' }
    ]);
    const totalLessons = await Course.aggregate([
      { $unwind: '$units' },
      { $unwind: '$units.lessons' },
      { $count: 'total' }
    ]);
    
    const stats = {
      totalCourses,
      totalUnits: totalUnits[0]?.total || 0,
      totalLessons: totalLessons[0]?.total || 0
    };
    
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Add a unit to a course
export const addUnitToCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description, price } = req.body.unitData;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Unit title is required' });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    course.units.push({ title, description, price, lessons: [] });
    await course.save();
    return res.status(200).json({ success: true, message: 'Unit added', data: { course } });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Add a lesson to a unit by unit ID
export const addLessonToUnit = async (req, res, next) => {
  try {
    const { courseId, unitId } = req.params;
    const { lessonData } = req.body;
    const { title, description, price, content } = lessonData;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Lesson title is required' });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    const unit = course.units.id(unitId);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }
    unit.lessons.push({ title, description, price, content });
    await course.save();
    return res.status(200).json({ success: true, message: 'Lesson added to unit', data: { course } });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Add a direct lesson to a course
export const addDirectLessonToCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { lessonData } = req.body;
    const { title, description, price, content } = lessonData;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Lesson title is required' });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    course.directLessons.push({ title, description, price, content });
    await course.save();
    return res.status(200).json({ success: true, message: 'Direct lesson added', data: { course } });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Update a lesson by lesson ID
export const updateLesson = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { unitId, lessonData } = req.body;
    const { title, description, price } = lessonData;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Lesson title is required' });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (unitId) {
      // Update lesson in unit
      const unit = course.units.id(unitId);
      if (!unit) {
        return res.status(404).json({ success: false, message: 'Unit not found' });
      }
      const lesson = unit.lessons.id(lessonId);
      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Lesson not found in unit' });
      }
      lesson.title = title;
      lesson.description = description;
      lesson.price = price;
    } else {
      // Update direct lesson
      const lesson = course.directLessons.id(lessonId);
      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Direct lesson not found' });
      }
      lesson.title = title;
      lesson.description = description;
      lesson.price = price;
    }
    await course.save();
    return res.status(200).json({ success: true, message: 'Lesson updated', data: { course } });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Delete a lesson by lesson ID
export const deleteLesson = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { unitId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    if (unitId) {
      // Delete lesson from unit
      const unit = course.units.id(unitId);
      if (!unit) {
        return res.status(404).json({ success: false, message: 'Unit not found' });
      }
      const lesson = unit.lessons.id(lessonId);
      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Lesson not found in unit' });
      }
      lesson.deleteOne();
    } else {
      // Delete direct lesson
      const lesson = course.directLessons.id(lessonId);
      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Direct lesson not found' });
      }
      lesson.deleteOne();
    }
    
    await course.save();
    return res.status(200).json({ success: true, message: 'Lesson deleted', data: { course } });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Delete a unit by unit ID
export const deleteUnit = async (req, res, next) => {
  try {
    const { courseId, unitId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    const unit = course.units.id(unitId);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }
    
    unit.deleteOne();
    await course.save();
    return res.status(200).json({ success: true, message: 'Unit deleted', data: { course } });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Update a unit by unit ID
export const updateUnit = async (req, res, next) => {
  try {
    const { courseId, unitId } = req.params;
    const { unitData } = req.body;
    const { title, description, price } = unitData;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Unit title is required' });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    const unit = course.units.id(unitId);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }
    unit.title = title;
    unit.description = description;
    unit.price = price;
    await course.save();
    return res.status(200).json({ success: true, message: 'Unit updated', data: { course } });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Reorder lessons in a unit or direct lessons
export const reorderLessons = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { unitId, lessonId, newIndex } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    if (unitId) {
      // Reorder lesson in unit
      const unit = course.units.id(unitId);
      if (!unit) {
        return res.status(404).json({ success: false, message: 'Unit not found' });
      }
      const lesson = unit.lessons.id(lessonId);
      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Lesson not found in unit' });
      }
      
      // Remove lesson from current position
      lesson.deleteOne();
      // Insert at new position
      unit.lessons.splice(newIndex, 0, lesson);
    } else {
      // Reorder direct lesson
      const lesson = course.directLessons.id(lessonId);
      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Direct lesson not found' });
      }
      
      // Remove lesson from current position
      lesson.deleteOne();
      // Insert at new position
      course.directLessons.splice(newIndex, 0, lesson);
    }
    
    await course.save();
    return res.status(200).json({ success: true, message: 'Lesson reordered', data: { course } });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
