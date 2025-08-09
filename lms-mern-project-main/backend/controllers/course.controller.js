import Course from '../models/course.model.js';
import AppError from '../utils/error.utils.js';
import cloudinary from 'cloudinary';
import fs from 'fs';

// Create a new course
export const createCourse = async (req, res, next) => {
  try {
    const { title, description, instructor, stage, subject } = req.body;
    if (!title || !instructor || !stage || !subject) {
      return res.status(400).json({ success: false, message: 'Title, instructor, stage, and subject are required' });
    }

    // Prepare course data
    const courseData = {
            title,
            description,
      instructor,
            stage,
      subject,
      units: [],
      directLessons: []
    };

    // Handle image upload if provided
    if (req.file) {
      try {
        // Check if Cloudinary is properly configured
        if (process.env.CLOUDINARY_CLOUD_NAME === 'placeholder' || 
            process.env.CLOUDINARY_API_KEY === 'placeholder' || 
            process.env.CLOUDINARY_API_SECRET === 'placeholder') {
          // Skip Cloudinary upload if using placeholder credentials
          console.log('Cloudinary not configured, using placeholder course image');
          courseData.image = {
            public_id: 'placeholder',
            secure_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzRGNDZFNSIvPgogIDx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj4KICAgIENvdXJzZSBJbWFnZQogIDwvdGV4dD4KPC9zdmc+Cg=='
          };
        } else {
          const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: 'lms-courses',
            width: 800,
            height: 600,
            crop: 'fill'
          });
          
          courseData.image = {
            public_id: result.public_id,
            secure_url: result.secure_url
          };
        }

        // Remove the file from the server
        if (fs.existsSync(`uploads/${req.file.filename}`)) {
          fs.rmSync(`uploads/${req.file.filename}`);
        }
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        // Continue without image if upload fails
        
        // Clean up file even if upload fails
        if (req.file && fs.existsSync(`uploads/${req.file.filename}`)) {
          fs.rmSync(`uploads/${req.file.filename}`);
        }
      }
    }

    const course = await Course.create(courseData);
    return res.status(201).json({ success: true, message: 'Course created', data: { course } });
            } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Get all courses for admin (full data with content)
export const getAdminCourses = async (req, res, next) => {
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

// Get all courses (secure version for public listing)
export const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'name')
      .populate('stage', 'name')
      .populate('subject', 'name')
      .select('-units.lessons.exams.questions.correctAnswer -units.lessons.trainings.questions.correctAnswer -directLessons.exams.questions.correctAnswer -directLessons.trainings.questions.correctAnswer -units.lessons.exams.userAttempts -units.lessons.trainings.userAttempts -directLessons.exams.userAttempts -directLessons.trainings.userAttempts');

    // Further filter sensitive data from nested structures
    const secureCourses = courses.map(course => {
      const courseObj = course.toObject();
      
      // Clean up units and lessons
      if (courseObj.units) {
        courseObj.units = courseObj.units.map(unit => ({
          ...unit,
          lessons: unit.lessons?.map(lesson => ({
            _id: lesson._id,
            title: lesson.title,
            description: lesson.description,
            price: lesson.price,
            videosCount: lesson.videos?.length || 0,
            pdfsCount: lesson.pdfs?.length || 0,
            examsCount: lesson.exams?.length || 0,
            trainingsCount: lesson.trainings?.length || 0
            // Exclude actual content for security
          })) || []
        }));
      }
      
      // Clean up direct lessons
      if (courseObj.directLessons) {
        courseObj.directLessons = courseObj.directLessons.map(lesson => ({
          _id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          price: lesson.price,
          videosCount: lesson.videos?.length || 0,
          pdfsCount: lesson.pdfs?.length || 0,
          examsCount: lesson.exams?.length || 0,
          trainingsCount: lesson.trainings?.length || 0
          // Exclude actual content for security
        }));
      }
      
      return courseObj;
    });

    return res.status(200).json({ success: true, data: { courses: secureCourses } });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Get featured courses (secure version)
export const getFeaturedCourses = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'name')
      .populate('stage', 'name')
      .populate('subject', 'name')
      .limit(6);

    // Create secure versions without sensitive data
    const secureCourses = courses.map(course => {
      const courseObj = course.toObject();
      
      // Remove sensitive lesson content
      if (courseObj.units) {
        courseObj.units = courseObj.units.map(unit => ({
          ...unit,
          lessons: unit.lessons?.map(lesson => ({
            _id: lesson._id,
            title: lesson.title,
            description: lesson.description,
            price: lesson.price,
            videosCount: lesson.videos?.length || 0,
            pdfsCount: lesson.pdfs?.length || 0,
            examsCount: lesson.exams?.length || 0,
            trainingsCount: lesson.trainings?.length || 0
          })) || []
        }));
      }
      
      if (courseObj.directLessons) {
        courseObj.directLessons = courseObj.directLessons.map(lesson => ({
          _id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          price: lesson.price,
          videosCount: lesson.videos?.length || 0,
          pdfsCount: lesson.pdfs?.length || 0,
          examsCount: lesson.exams?.length || 0,
          trainingsCount: lesson.trainings?.length || 0
        }));
      }
      
      return courseObj;
    });

    return res.status(200).json({ success: true, data: { courses: secureCourses } });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Get course by ID (secure version for public viewing)
export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id)
      .populate('instructor', 'name')
      .populate('stage', 'name')
      .populate('subject', 'title');
        
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Create secure version of course without sensitive data
    const courseObj = course.toObject();
    
    // Clean up units and lessons
    if (courseObj.units) {
      courseObj.units = courseObj.units.map(unit => ({
        ...unit,
        lessons: unit.lessons?.map(lesson => ({
          _id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          price: lesson.price,
          content: lesson.content,
          videosCount: lesson.videos?.length || 0,
          pdfsCount: lesson.pdfs?.length || 0,
          examsCount: lesson.exams?.length || 0,
          trainingsCount: lesson.trainings?.length || 0
          // Exclude actual videos, pdfs, exams, trainings for security
        })) || []
      }));
    }
    
    // Clean up direct lessons
    if (courseObj.directLessons) {
      courseObj.directLessons = courseObj.directLessons.map(lesson => ({
        _id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        price: lesson.price,
        content: lesson.content,
        videosCount: lesson.videos?.length || 0,
        pdfsCount: lesson.pdfs?.length || 0,
        examsCount: lesson.exams?.length || 0,
        trainingsCount: lesson.trainings?.length || 0
        // Exclude actual videos, pdfs, exams, trainings for security
      }));
    }

    return res.status(200).json({ success: true, data: { course: courseObj } });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Get optimized lesson data with processed exam results
export const getLessonById = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { unitId } = req.query;
    const userId = req.user?._id || req.user?.id;

    const course = await Course.findById(courseId).select('title instructor stage subject units directLessons');
        if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    let lesson;
    if (unitId) {
      const unit = course.units.id(unitId);
      if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
      lesson = unit.lessons.id(lessonId);
    } else {
      lesson = course.directLessons.id(lessonId);
    }

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Process exam data with user results
    const processedExams = lesson.exams.map((exam, examIndex) => {
      const userAttempt = userId ? exam.userAttempts.find(attempt => 
        attempt.userId.toString() === userId.toString()
      ) : null;

      return {
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        timeLimit: exam.timeLimit,
        openDate: exam.openDate,
        closeDate: exam.closeDate,
        questionsCount: exam.questions.length,
        questions: exam.questions.map(q => ({
          _id: q._id,
          question: q.question,
          options: q.options,
          image: q.image
          // Note: correctAnswer is intentionally excluded for security
        })),
        userResult: userAttempt ? {
          score: userAttempt.score,
          totalQuestions: userAttempt.totalQuestions,
          percentage: Math.round((userAttempt.score / userAttempt.totalQuestions) * 100),
          takenAt: userAttempt.takenAt,
          hasTaken: true
        } : { hasTaken: false }
      };
    });

    // Process training data with user results
    const processedTrainings = lesson.trainings.map((training, trainingIndex) => {
      const userAttempts = userId ? training.userAttempts.filter(attempt => 
        attempt.userId.toString() === userId.toString()
      ) : [];

      return {
        _id: training._id,
        title: training.title,
        description: training.description,
        timeLimit: training.timeLimit,
        openDate: training.openDate,
        questionsCount: training.questions.length,
        questions: training.questions.map(q => ({
          _id: q._id,
          question: q.question,
          options: q.options,
          image: q.image
          // Note: correctAnswer is intentionally excluded for security
        })),
        userResults: userAttempts.map(attempt => ({
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
          takenAt: attempt.takenAt
        })),
        attemptCount: userAttempts.length,
        canRetake: true // Training can always be retaken
      };
    });

    // Optimized lesson response with only necessary data
    const optimizedLesson = {
      _id: lesson._id,
      title: lesson.title,
      description: lesson.description,
      price: lesson.price,
      content: lesson.content,
      videos: lesson.videos.map(video => ({
        _id: video._id,
        url: video.url,
        title: video.title,
        description: video.description
      })),
      pdfs: lesson.pdfs.map(pdf => ({
        _id: pdf._id,
        url: pdf.url,
        title: pdf.title,
        fileName: pdf.fileName
      })),
      exams: processedExams,
      trainings: processedTrainings
    };

    return res.status(200).json({ 
      success: true, 
      data: { 
        lesson: optimizedLesson,
        courseInfo: {
          _id: course._id,
          title: course.title
        }
      } 
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Update course
export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, instructor, stage, subject } = req.body;

    console.log('🔄 Updating course:', { id, title, description, instructor, stage, subject });
    console.log('📁 File uploaded:', req.file ? 'Yes' : 'No');

    // Find the existing course
    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Prepare update data
    const updateData = { title, description, instructor, stage, subject };

    // Handle image upload if provided
    if (req.file) {
      try {
        // Check if Cloudinary is properly configured
        if (process.env.CLOUDINARY_CLOUD_NAME === 'placeholder' || 
            process.env.CLOUDINARY_API_KEY === 'placeholder' || 
            process.env.CLOUDINARY_API_SECRET === 'placeholder') {
          // Skip Cloudinary upload if using placeholder credentials
          console.log('Cloudinary not configured, using placeholder course image');
          updateData.image = {
            public_id: 'placeholder',
            secure_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzRGNDZFNSIvPgogIDx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj4KICAgIENvdXJzZSBJbWFnZQogIDwvdGV4dD4KPC9zdmc+Cg=='
          };
        } else {
          // Delete old image if exists and it's not a placeholder
          if (existingCourse.image?.public_id && existingCourse.image.public_id !== 'placeholder') {
            await cloudinary.v2.uploader.destroy(existingCourse.image.public_id);
          }

          // Upload new image
          const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: 'lms-courses',
            width: 800,
            height: 600,
            crop: 'fill'
          });
          
          updateData.image = {
            public_id: result.public_id,
            secure_url: result.secure_url
          };
        }

        // Remove the file from the server
        if (fs.existsSync(`uploads/${req.file.filename}`)) {
          fs.rmSync(`uploads/${req.file.filename}`);
        }

        console.log('📸 Image processed successfully');
      } catch (uploadError) {
        console.error('❌ Image upload error:', uploadError);
        
        // Clean up file even if upload fails
        if (req.file && fs.existsSync(`uploads/${req.file.filename}`)) {
          fs.rmSync(`uploads/${req.file.filename}`);
        }
        
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to upload image' 
        });
      }
    }

    // Update course with only basic info (NOT the full content)
    const course = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('instructor', 'name')
      .populate('stage', 'name')
      .populate('subject', 'name')
      .select('title description instructor stage subject image createdAt updatedAt'); // Only select basic fields
    
    console.log('✅ Course updated successfully');
    return res.status(200).json({ 
      success: true, 
      message: 'Course updated', 
      data: { course } 
    });
  } catch (error) {
    console.error('❌ Update course error:', error);
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

// Update a lesson content by lesson ID
export const updateLessonContent = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { unitId, videos, pdfs, exams, trainings } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    let lesson;
        if (unitId) {
      const unit = course.units.id(unitId);
      if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
      lesson = unit.lessons.id(lessonId);
        } else {
      lesson = course.directLessons.id(lessonId);
    }
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    if (videos !== undefined) lesson.videos = videos;
    if (pdfs !== undefined) lesson.pdfs = pdfs;
    if (exams !== undefined) lesson.exams = exams;
    if (trainings !== undefined) lesson.trainings = trainings;
        await course.save();
    return res.status(200).json({ success: true, message: 'Lesson content updated', data: { lesson } });
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

// Take an exam
export const takeExam = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { unitId, examIndex, answers } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    let lesson;
        if (unitId) {
      const unit = course.units.id(unitId);
      if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
      lesson = unit.lessons.id(lessonId);
    } else {
      lesson = course.directLessons.id(lessonId);
    }
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    const exam = lesson.exams[examIndex];
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    // Check if user has already taken this exam
    const existingAttempt = exam.userAttempts.find(attempt => attempt.userId.toString() === userId.toString());
    if (existingAttempt) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already taken this exam',
        data: { 
          score: existingAttempt.score,
          totalQuestions: existingAttempt.totalQuestions,
          takenAt: existingAttempt.takenAt
        }
      });
    }

    // Check if exam is open
    const now = new Date();
    if (exam.openDate && now < new Date(exam.openDate)) {
      return res.status(400).json({ success: false, message: 'Exam is not open yet' });
    }
    if (exam.closeDate && now > new Date(exam.closeDate)) {
      return res.status(400).json({ success: false, message: 'Exam is closed' });
    }

    // Calculate score
    let score = 0;
    const answerDetails = [];
    
    exam.questions.forEach((question, questionIndex) => {
      const userAnswer = answers.find(ans => ans.questionIndex === questionIndex);
      const isCorrect = userAnswer && userAnswer.selectedAnswer === question.correctAnswer;
      
      if (isCorrect) score++;
      
      answerDetails.push({
        questionIndex,
        selectedAnswer: userAnswer ? userAnswer.selectedAnswer : -1,
        isCorrect
      });
    });

    // Save attempt
    const attempt = {
      userId,
      takenAt: now,
      score,
      totalQuestions: exam.questions.length,
      answers: answerDetails
    };

    exam.userAttempts.push(attempt);
    await course.save();

    return res.status(200).json({
            success: true,
      message: 'Exam submitted successfully',
            data: {
        score,
        totalQuestions: exam.questions.length,
        percentage: Math.round((score / exam.questions.length) * 100)
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get exam results for a user
export const getExamResults = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { unitId, examIndex } = req.query;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    let lesson;
    if (unitId) {
      const unit = course.units.id(unitId);
      if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
      lesson = unit.lessons.id(lessonId);
    } else {
      lesson = course.directLessons.id(lessonId);
    }
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    const exam = lesson.exams[examIndex];
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const attempt = exam.userAttempts.find(attempt => attempt.userId.toString() === userId.toString());
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'No exam attempt found' });
    }

            return res.status(200).json({
                success: true,
                data: {
        exam: {
          title: exam.title,
          description: exam.description,
          openDate: exam.openDate,
          closeDate: exam.closeDate
        },
        attempt: {
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
          takenAt: attempt.takenAt,
          answers: attempt.answers
        }
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Submit a training attempt
export const submitTrainingAttempt = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { unitId, trainingIndex, answers } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    let lesson;
    if (unitId) {
      const unit = course.units.id(unitId);
      if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
      lesson = unit.lessons.id(lessonId);
    } else {
      lesson = course.directLessons.id(lessonId);
    }
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    const training = lesson.trainings[trainingIndex];
    if (!training) return res.status(404).json({ success: false, message: 'Training not found' });

    // Check if training is open
    const now = new Date();
    if (training.openDate && now < new Date(training.openDate)) {
      return res.status(400).json({ success: false, message: 'Training is not open yet' });
    }

    // Calculate score
    let score = 0;
    const answerDetails = [];
    
    training.questions.forEach((question, questionIndex) => {
      const userAnswer = answers.find(ans => ans.questionIndex === questionIndex);
      const isCorrect = userAnswer && userAnswer.selectedAnswer === question.correctAnswer;
      
      if (isCorrect) score++;
      
      answerDetails.push({
        questionIndex,
        selectedAnswer: userAnswer ? userAnswer.selectedAnswer : -1,
        isCorrect
      });
    });

    // Save attempt (no restriction on number of attempts)
    const attempt = {
      userId,
      takenAt: now,
      score,
      totalQuestions: training.questions.length,
      answers: answerDetails
    };

    training.userAttempts.push(attempt);
    await course.save();

    return res.status(200).json({
            success: true,
      message: 'Training attempt submitted successfully',
            data: {
        score,
        totalQuestions: training.questions.length,
        percentage: Math.round((score / training.questions.length) * 100)
      }
    });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};
