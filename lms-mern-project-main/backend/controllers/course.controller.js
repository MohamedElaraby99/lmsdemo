import courseModel from '../models/course.model.js'
import AppError from '../utils/error.utils.js';
import cloudinary from 'cloudinary';
import fs from 'fs';

// Function to extract YouTube video ID from various YouTube URL formats
const extractYouTubeVideoId = (url) => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    return null;
};

// get all courses
const getAllCourses = async (req, res, next) => {
    try {
        const courses = await courseModel.find({}).select('-lectures');

        res.status(200).json({
            success: true,
            message: 'All courses',
            courses
        })
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

// get specific course
const getLecturesByCourseId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.user || {}; // Get user role if available

        const course = await courseModel.findById(id)
        if (!course) {
            return next(new AppError('course not found', 500));
        }

        // Helper function to filter scheduled videos
        const filterScheduledVideos = (lessons, isAdmin = false) => {
            return lessons.map(lesson => {
                const lessonCopy = { ...lesson.toObject() };
                
                // Check if video is scheduled and not yet published
                if (lesson.lecture?.isScheduled && lesson.lecture?.scheduledPublishDate) {
                    const now = new Date();
                    const publishDate = new Date(lesson.lecture.scheduledPublishDate);
                    
                    if (publishDate > now && !isAdmin) {
                        // For non-admin users, hide the video URL but keep the lesson visible
                        lessonCopy.lecture = {
                            ...lessonCopy.lecture,
                            youtubeUrl: null,
                            public_id: null,
                            secure_url: null
                        };
                        lessonCopy.isScheduled = true;
                        lessonCopy.scheduledPublishDate = lesson.lecture.scheduledPublishDate;
                    } else {
                        lessonCopy.isScheduled = false;
                    }
                } else {
                    lessonCopy.isScheduled = false;
                }
                
                return lessonCopy;
            });
        };

        // Filter scheduled videos based on user role
        const isAdmin = role === 'ADMIN';
        const filteredUnits = course.units.map(unit => ({
            ...unit.toObject(),
            lessons: filterScheduledVideos(unit.lessons || [], isAdmin)
        }));
        
        const filteredDirectLessons = filterScheduledVideos(course.directLessons || [], isAdmin);

        const filteredCourse = {
            ...course.toObject(),
            units: filteredUnits,
            directLessons: filteredDirectLessons
        };

        res.status(200).json({
            success: true,
            message: 'course',
            course: filteredCourse
        })
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

// get course structure (units and lessons)
const getCourseStructure = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.user || {}; // Get user role if available

        const course = await courseModel.findById(id).select('title description units directLessons numberOfLectures');
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        // Helper function to filter scheduled videos
        const filterScheduledVideos = (lessons, isAdmin = false) => {
            return lessons.map(lesson => {
                const lessonCopy = { ...lesson.toObject() };
                
                // Check if video is scheduled and not yet published
                if (lesson.lecture?.isScheduled && lesson.lecture?.scheduledPublishDate) {
                    const now = new Date();
                    const publishDate = new Date(lesson.lecture.scheduledPublishDate);
                    
                    if (publishDate > now && !isAdmin) {
                        // For non-admin users, hide the video URL but keep the lesson visible
                        lessonCopy.lecture = {
                            ...lessonCopy.lecture,
                            youtubeUrl: null,
                            public_id: null,
                            secure_url: null
                        };
                        lessonCopy.isScheduled = true;
                        lessonCopy.scheduledPublishDate = lesson.lecture.scheduledPublishDate;
                    } else {
                        lessonCopy.isScheduled = false;
                    }
                } else {
                    lessonCopy.isScheduled = false;
                }
                
                return lessonCopy;
            });
        };

        // Filter scheduled videos based on user role
        const isAdmin = role === 'ADMIN';
        const filteredUnits = course.units.map(unit => ({
            ...unit.toObject(),
            lessons: filterScheduledVideos(unit.lessons || [], isAdmin)
        }));
        
        const filteredDirectLessons = filterScheduledVideos(course.directLessons || [], isAdmin);

        // Calculate total lessons from structure (including scheduled ones)
        const totalUnitLessons = filteredUnits.reduce((sum, unit) => sum + (unit.lessons?.length || 0), 0);
        const totalDirectLessons = filteredDirectLessons.length;
        const totalLessons = totalUnitLessons + totalDirectLessons;

        res.status(200).json({
            success: true,
            message: 'Course structure retrieved successfully',
            course: {
                _id: course._id,
                title: course.title,
                description: course.description,
                units: filteredUnits,
                directLessons: filteredDirectLessons,
                totalLessons: totalLessons,
                numberOfLectures: course.numberOfLectures
            }
        })
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

// create course
const createCourse = async (req, res, next) => {
    try {
        const { title, description, category, subject, stage, createdBy, numberOfLectures, courseStructure, price, currency, isPaid, structureType } = req.body;

        if (!title || !description || !subject || !stage) {
            return next(new AppError('Title, description, subject, and stage are mandatory', 400));
        }

        // Parse course structure if provided
        let units = [];
        let directLessons = [];
        let totalLessons = numberOfLectures || 0;

        if (courseStructure) {
            try {
                const structure = JSON.parse(courseStructure);
                units = structure.units || [];
                directLessons = structure.directLessons || [];
                
                // Recalculate total lessons from structure
                const totalUnitLessons = units.reduce((sum, unit) => sum + (unit.lessons?.length || 0), 0);
                const totalDirectLessons = directLessons.length;
                totalLessons = totalUnitLessons + totalDirectLessons;
            } catch (error) {
                console.log('Error parsing course structure:', error);
            }
        }

        const course = await courseModel.create({
            title,
            description,
            category: category || 'General',
            subject,
            stage,
            createdBy: createdBy || 'Admin',
            units: units,
            directLessons: directLessons,
            numberOfLectures: totalLessons,
            price: price || 0,
            currency: currency || 'EGP',
            isPaid: isPaid || false,
            structureType: structureType || 'direct-lessons',
            status: 'draft'
        })

        if (!course) {
            return next(new AppError('Course could not created, please try again', 500));
        }

        // file upload
        if (req.file) {
            try {
                // Check if Cloudinary is properly configured
                if (process.env.CLOUDINARY_CLOUD_NAME === 'placeholder' || 
                    process.env.CLOUDINARY_API_KEY === 'placeholder' || 
                    process.env.CLOUDINARY_API_SECRET === 'placeholder') {
                    // Use local file storage when Cloudinary is not configured
                    course.thumbnail.public_id = req.file.filename;
                    course.thumbnail.secure_url = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
                } else {
                    const result = await cloudinary.v2.uploader.upload(req.file.path, {
                        folder: 'Learning-Management-System'
                    })

                    if (result) {
                        course.thumbnail.public_id = result.public_id;
                        course.thumbnail.secure_url = result.secure_url;
                    }

                    // Remove file from server only after successful Cloudinary upload
                    if (fs.existsSync(`uploads/${req.file.filename}`)) {
                        fs.rmSync(`uploads/${req.file.filename}`);
                    }
                }
            } catch (e) {
                console.log('File upload error:', e.message);
                // Set placeholder thumbnail if upload fails
                course.thumbnail.public_id = 'placeholder';
                course.thumbnail.secure_url = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzRGNDZFNSIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj4KICAgIENvdXJzZSBUaHVtYm5haWwKICA8L3RleHQ+Cjwvc3ZnPgo=';
            }
        }

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Course successfully created',
            course
        })

    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

// update course
const updateCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, category, subject, stage, createdBy, numberOfLectures, courseStructure, structureType } = req.body;

        // Find the course first
        const course = await courseModel.findById(id);

        if (!course) {
            return next(new AppError('Course with given id does not exist', 500));
        }

        // Update basic fields
        if (title) course.title = title;
        if (description) course.description = description;
        if (category) course.category = category;
        if (subject) course.subject = subject;
        if (stage) course.stage = stage;
        if (createdBy) course.createdBy = createdBy;
        if (structureType) course.structureType = structureType;

        // Parse and update course structure if provided
        if (courseStructure) {
            try {
                const structure = JSON.parse(courseStructure);
                course.units = structure.units || [];
                course.directLessons = structure.directLessons || [];
                
                // Recalculate total lessons from structure
                const totalUnitLessons = course.units.reduce((sum, unit) => sum + (unit.lessons?.length || 0), 0);
                const totalDirectLessons = course.directLessons.length;
                course.numberOfLectures = totalUnitLessons + totalDirectLessons;
            } catch (error) {
                console.log('Error parsing course structure:', error);
            }
        }

        // Handle file upload
        if (req.file) {
            try {
                // Check if Cloudinary is properly configured
                if (process.env.CLOUDINARY_CLOUD_NAME === 'placeholder' || 
                    process.env.CLOUDINARY_API_KEY === 'placeholder' || 
                    process.env.CLOUDINARY_API_SECRET === 'placeholder') {
                    // Use local file storage when Cloudinary is not configured
                    
                    // Remove old local file if it exists
                    if (course.thumbnail.public_id && course.thumbnail.public_id !== 'placeholder' && 
                        !course.thumbnail.public_id.startsWith('http')) {
                        const oldFilePath = `uploads/${course.thumbnail.public_id}`;
                        if (fs.existsSync(oldFilePath)) {
                            fs.rmSync(oldFilePath);
                        }
                    }
                    
                    course.thumbnail.public_id = req.file.filename;
                    course.thumbnail.secure_url = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
                } else {
                    // Only destroy if we have a valid public_id
                    if (course.thumbnail.public_id && course.thumbnail.public_id !== 'placeholder') {
                        await cloudinary.v2.uploader.destroy(course.thumbnail.public_id);
                    }

                    const result = await cloudinary.v2.uploader.upload(req.file.path, {
                        folder: 'Learning-Management-System'
                    })

                    if (result) {
                        course.thumbnail.public_id = result.public_id;
                        course.thumbnail.secure_url = result.secure_url;
                    }

                    // Remove file from server only after successful Cloudinary upload
                    if (fs.existsSync(`uploads/${req.file.filename}`)) {
                        fs.rmSync(`uploads/${req.file.filename}`);
                    }
                }
            } catch (e) {
                // Set placeholder thumbnail if upload fails
                course.thumbnail.public_id = 'placeholder';
                course.thumbnail.secure_url = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzRGNDZFNSIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj4KICAgIENvdXJzZSBUaHVtYm5haWwKICA8L3RleHQ+Cjwvc3ZnPgo=';
            }
        }

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            course
        })
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

// remove course
const removeCourse = async (req, res, next) => {
    try {
        const { id } = req.params;

        const course = await courseModel.findById(id);

        if (!course) {
            return next(new AppError('Course with given id does not exist', 500));
        }

        await courseModel.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'course deleted successfully'
        })

    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

// add lecture to course by id
const addLectureToCourseById = async (req, res, next) => {
    try {
        const { title, description, youtubeUrl, lessonId, unitId, isScheduled, scheduledPublishDate } = req.body;
        const { id } = req.params;

        if (!title || !description) {
            return next(new AppError('all fields are required', 500));
        }

        const course = await courseModel.findById(id);

        if (!course) {
            return next(new AppError('course with given id does not exist', 500));
        }

        const lectureData = {
            title,
            description,
            lecture: {
                isScheduled: isScheduled === 'true' || isScheduled === true,
                scheduledPublishDate: (isScheduled === 'true' || isScheduled === true) && scheduledPublishDate ? new Date(scheduledPublishDate) : null
            }
        }

        // Handle YouTube URL
        if (youtubeUrl) {
            // Extract video ID from YouTube URL
            const videoId = extractYouTubeVideoId(youtubeUrl);
            if (videoId) {
                lectureData.lecture.youtubeUrl = youtubeUrl;
                lectureData.lecture.secure_url = `https://www.youtube.com/embed/${videoId}`;
                lectureData.lecture.public_id = videoId;
            } else {
                return next(new AppError('Invalid YouTube URL', 400));
            }
        }

        // file upload (only if no YouTube URL provided)
        if (req.file && !youtubeUrl) {
            try {
                // Check if Cloudinary is properly configured
                if (process.env.CLOUDINARY_CLOUD_NAME === 'placeholder' || 
                    process.env.CLOUDINARY_API_KEY === 'placeholder' || 
                    process.env.CLOUDINARY_API_SECRET === 'placeholder') {
                    // Skip Cloudinary upload if using placeholder credentials
                    console.log('Cloudinary not configured, skipping file upload');
                    lectureData.lecture.public_id = 'placeholder';
                    lectureData.lecture.secure_url = '';
                } else {
                    const result = await cloudinary.v2.uploader.upload(req.file.path, {
                        folder: 'Learning-Management-System',
                        resource_type: "video"
                    });
                    if (result) {
                        lectureData.lecture.public_id = result.public_id;
                        lectureData.lecture.secure_url = result.secure_url;
                    }
                }

                // Remove file from server
                if (fs.existsSync(`uploads/${req.file.filename}`)) {
                    fs.rmSync(`uploads/${req.file.filename}`);
                }
            } catch (e) {
                console.log('File upload error:', e.message);
                // Don't fail lecture creation if file upload fails
                lectureData.lecture.public_id = 'placeholder';
                lectureData.lecture.secure_url = '';
            }
        }

        // Add lecture to course structure if lessonId is provided
        if (lessonId) {
            if (unitId) {
                // Add to unit lesson
                const unit = course.units.find(u => u._id.toString() === unitId);
                if (unit) {
                    const lesson = unit.lessons.find(l => l._id.toString() === lessonId);
                    if (lesson) {
                        lesson.lecture = lectureData.lecture;
                    }
                }
            } else {
                // Add to direct lesson
                const lesson = course.directLessons.find(l => l._id.toString() === lessonId);
                if (lesson) {
                    lesson.lecture = lectureData.lecture;
                }
            }
        } else {
            // Fallback - create a new direct lesson with the video
            const newDirectLesson = {
                title: lectureData.title,
                description: lectureData.description,
                lecture: lectureData.lecture,
                duration: 0,
                order: course.directLessons.length
            };
            course.directLessons.push(newDirectLesson);
        }

        // Update lecture count
        const totalUnitLessons = course.units.reduce((sum, unit) => sum + (unit.lessons?.length || 0), 0);
        const totalDirectLessons = course.directLessons.length;
        course.numberOfLectures = totalUnitLessons + totalDirectLessons;

        await course.save();

        res.status(200).json({
            success: true,
            message: 'lecture added successfully'
        })

    } catch (e) {
         return next(new AppError(e.message, 500));
    }
}

// delete lecture by course id and lecture id
const deleteCourseLecture = async (req, res, next) => {
    try {
        const { courseId, lectureId } = req.query;

        const course = await courseModel.findById(courseId);

        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        const lectureIndex = course.lectures.findIndex(lecture => lecture._id.toString() === lectureId);

        if (lectureIndex === -1) {
            return next(new AppError('Lecture not found in the course', 404));
        }

        course.lectures.splice(lectureIndex, 1);

        course.numberOfLectures = course.lectures.length;

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Lecture deleted successfully'
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};


// update lecture by course id and lecture id
const updateCourseLecture = async (req, res, next) => {
    try {
        const { courseId, lectureId } = req.query;
        const { title, description, youtubeUrl } = req.body;

        if (!title || !description) {
            return next(new AppError('All fields are required', 400));
        }

        const course = await courseModel.findById(courseId);

        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        const lectureIndex = course.lectures.findIndex(lecture => lecture._id.toString() === lectureId);

        if (lectureIndex === -1) {
            return next(new AppError('Lecture not found in the course', 404));
        }

        const updatedLectureData = {
            title,
            description,
            lecture: {
                public_id: course.lectures[lectureIndex].lecture.public_id,
                secure_url: course.lectures[lectureIndex].lecture.secure_url,
                youtubeUrl: course.lectures[lectureIndex].lecture.youtubeUrl,
                isScheduled: course.lectures[lectureIndex].lecture.isScheduled || false,
                scheduledPublishDate: course.lectures[lectureIndex].lecture.scheduledPublishDate || null
            }
        };

        // Handle YouTube URL
        if (youtubeUrl) {
            // Extract video ID from YouTube URL
            const videoId = extractYouTubeVideoId(youtubeUrl);
            if (videoId) {
                updatedLectureData.lecture.youtubeUrl = youtubeUrl;
                updatedLectureData.lecture.secure_url = `https://www.youtube.com/embed/${videoId}`;
                updatedLectureData.lecture.public_id = videoId;
            } else {
                return next(new AppError('Invalid YouTube URL', 400));
            }
        }

        if (req.file && !youtubeUrl) {
            try {
                // Check if Cloudinary is properly configured
                if (process.env.CLOUDINARY_CLOUD_NAME === 'placeholder' || 
                    process.env.CLOUDINARY_API_KEY === 'placeholder' || 
                    process.env.CLOUDINARY_API_SECRET === 'placeholder') {
                    // Skip Cloudinary upload if using placeholder credentials
                    console.log('Cloudinary not configured, skipping file upload');
                    updatedLectureData.lecture.public_id = 'placeholder';
                    updatedLectureData.lecture.secure_url = '';
                } else {
                    const result = await cloudinary.v2.uploader.upload(req.file.path, {
                        folder: 'Learning-Management-System',
                        resource_type: "video"
                    });
                    if (result) {
                        updatedLectureData.lecture.public_id = result.public_id;
                        updatedLectureData.lecture.secure_url = result.secure_url;
                    }

                    // If there's an existing video, delete the old one from Cloudinary
                    if (course.lectures[lectureIndex].lecture.public_id && 
                        course.lectures[lectureIndex].lecture.public_id !== 'placeholder') {
                        await cloudinary.v2.uploader.destroy(course.lectures[lectureIndex].lecture.public_id);
                    }
                }

                // Remove file from server
                if (fs.existsSync(`uploads/${req.file.filename}`)) {
                    fs.rmSync(`uploads/${req.file.filename}`);
                }
            } catch (e) {
                console.log('File upload error:', e.message);
                // Don't fail lecture update if file upload fails
                updatedLectureData.lecture.public_id = 'placeholder';
                updatedLectureData.lecture.secure_url = '';
            }
        }

        // Update the lecture details
        course.lectures[lectureIndex] = updatedLectureData;

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Lecture updated successfully'
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};


// Update unit name and description
const updateUnit = async (req, res, next) => {
    try {
        const { courseId, unitId } = req.params;
        const { title, description } = req.body;

        if (!title && !description) {
            return next(new AppError('Title or description is required', 400));
        }

        const course = await courseModel.findById(courseId);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        // Find the unit and update it
        const unitIndex = course.units.findIndex(unit => 
            unit._id.toString() === unitId || unit.id === unitId
        );

        if (unitIndex === -1) {
            return next(new AppError('Unit not found', 404));
        }

        // Update unit fields
        if (title) course.units[unitIndex].title = title;
        if (description) course.units[unitIndex].description = description;

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Unit updated successfully',
            unit: course.units[unitIndex]
        });

    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Update lesson name and description
const updateLesson = async (req, res, next) => {
    try {
        const { courseId, unitId, lessonId } = req.params;
        const { title, description, duration, lecture } = req.body;

        if (!title && !description && duration === undefined && !lecture) {
            return next(new AppError('At least one field is required', 400));
        }

        const course = await courseModel.findById(courseId);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        // Find the unit
        const unitIndex = course.units.findIndex(unit => 
            unit._id.toString() === unitId || unit.id === unitId
        );

        if (unitIndex === -1) {
            return next(new AppError('Unit not found', 404));
        }

        // Find the lesson within the unit
        const lessonIndex = course.units[unitIndex].lessons.findIndex(lesson => 
            lesson._id.toString() === lessonId || lesson.id === lessonId
        );

        if (lessonIndex === -1) {
            return next(new AppError('Lesson not found', 404));
        }

        // Update lesson fields
        if (title) course.units[unitIndex].lessons[lessonIndex].title = title;
        if (description) course.units[unitIndex].lessons[lessonIndex].description = description;
        if (duration !== undefined) course.units[unitIndex].lessons[lessonIndex].duration = duration;
        if (lecture) {
            course.units[unitIndex].lessons[lessonIndex].lecture = {
                ...course.units[unitIndex].lessons[lessonIndex].lecture,
                ...lecture
            };
        }

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Lesson updated successfully',
            lesson: course.units[unitIndex].lessons[lessonIndex]
        });

    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Update direct lesson name and description
const updateDirectLesson = async (req, res, next) => {
    try {
        const { courseId, lessonId } = req.params;
        const { title, description, duration, lecture } = req.body;

        if (!title && !description && duration === undefined && !lecture) {
            return next(new AppError('At least one field is required', 400));
        }

        const course = await courseModel.findById(courseId);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        // Find the direct lesson
        const lessonIndex = course.directLessons.findIndex(lesson => 
            lesson._id.toString() === lessonId || lesson.id === lessonId
        );

        if (lessonIndex === -1) {
            return next(new AppError('Direct lesson not found', 404));
        }

        // Update lesson fields
        if (title) course.directLessons[lessonIndex].title = title;
        if (description) course.directLessons[lessonIndex].description = description;
        if (duration !== undefined) course.directLessons[lessonIndex].duration = duration;
        if (lecture) {
            course.directLessons[lessonIndex].lecture = {
                ...course.directLessons[lessonIndex].lecture,
                ...lecture
            };
        }

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Direct lesson updated successfully',
            lesson: course.directLessons[lessonIndex]
        });

    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Simulate course sale for testing
const simulateCourseSale = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { quantity = 1 } = req.body;

        const course = await courseModel.findById(courseId);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        if (!course.isPaid || course.price <= 0) {
            return next(new AppError('Course is not a paid course', 400));
        }

        // Update sales count and revenue
        course.salesCount = (course.salesCount || 0) + quantity;
        course.totalRevenue = (course.totalRevenue || 0) + (course.price * quantity);

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Course sale simulated successfully',
            course: {
                id: course._id,
                title: course.title,
                salesCount: course.salesCount,
                totalRevenue: course.totalRevenue,
                currency: course.currency
            }
        });

    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Schedule video publish date
const scheduleVideoPublish = async (req, res, next) => {
    try {
        const { courseId, lessonId, lessonType } = req.params; // lessonType: 'unit' or 'direct'
        const { scheduledPublishDate, isScheduled } = req.body;

        if (!scheduledPublishDate && isScheduled) {
            return next(new AppError('Publish date is required when scheduling is enabled', 400));
        }

        const course = await courseModel.findById(courseId);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        let lessonIndex = -1;
        let lesson = null;

        if (lessonType === 'unit') {
            // Find lesson in units
            for (let unitIndex = 0; unitIndex < course.units.length; unitIndex++) {
                const unit = course.units[unitIndex];
                lessonIndex = unit.lessons.findIndex(lesson => 
                    lesson._id.toString() === lessonId || lesson.id === lessonId
                );
                if (lessonIndex !== -1) {
                    lesson = unit.lessons[lessonIndex];
                    break;
                }
            }
        } else if (lessonType === 'direct') {
            // Find lesson in directLessons
            lessonIndex = course.directLessons.findIndex(lesson => 
                lesson._id.toString() === lessonId || lesson.id === lessonId
            );
            if (lessonIndex !== -1) {
                lesson = course.directLessons[lessonIndex];
            }
        } else {
            return next(new AppError('Invalid lesson type. Must be "unit" or "direct"', 400));
        }

        if (!lesson) {
            return next(new AppError('Lesson not found', 404));
        }

        // Update scheduling fields
        if (isScheduled) {
            lesson.lecture.isScheduled = true;
            lesson.lecture.scheduledPublishDate = new Date(scheduledPublishDate);
        } else {
            lesson.lecture.isScheduled = false;
            lesson.lecture.scheduledPublishDate = null;
        }

        await course.save();

        res.status(200).json({
            success: true,
            message: isScheduled ? 'Video scheduled successfully' : 'Video scheduling removed',
            lesson: {
                _id: lesson._id,
                title: lesson.title,
                isScheduled: lesson.lecture.isScheduled,
                scheduledPublishDate: lesson.lecture.scheduledPublishDate
            }
        });

    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Update complete course structure
const updateCourseStructure = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { units, directLessons, title, description, category, createdBy } = req.body;

        const course = await courseModel.findById(courseId);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        // Calculate total lessons
        const totalUnitLessons = units.reduce((sum, unit) => sum + unit.lessons.length, 0);
        const totalDirectLessons = directLessons.length;
        const totalLessons = totalUnitLessons + totalDirectLessons;

        // Update course structure
        const updatedCourse = await courseModel.findByIdAndUpdate(
            courseId,
            {
                title: title || course.title,
                description: description || course.description,
                category: category || course.category,
                createdBy: createdBy || course.createdBy,
                units: units.map(unit => ({
                    title: unit.title,
                    description: unit.description,
                    lessons: unit.lessons.map(lesson => ({
                        title: lesson.title,
                        description: lesson.description,
                        lecture: lesson.lecture || {},
                        duration: lesson.duration || 0,
                        order: lesson.order || 0
                    })),
                    order: unit.order || 0
                })),
                directLessons: directLessons.map(lesson => ({
                    title: lesson.title,
                    description: lesson.description,
                    lecture: lesson.lecture || {},
                    duration: lesson.duration || 0,
                    order: lesson.order || 0
                })),
                numberOfLectures: totalLessons,
                structureType: units.length > 0 && directLessons.length > 0 ? 'mixed' : 
                              units.length > 0 ? 'units' : 'direct-lessons'
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Course structure updated successfully',
            course: updatedCourse
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Delete unit
const deleteUnit = async (req, res, next) => {
    try {
        const { courseId, unitId } = req.params;

        const course = await courseModel.findById(courseId);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        // Find the unit index
        const unitIndex = course.units.findIndex(unit => 
            unit._id.toString() === unitId || unit.id === unitId
        );

        if (unitIndex === -1) {
            return next(new AppError('Unit not found', 404));
        }

        // Remove the unit
        course.units.splice(unitIndex, 1);

        // Update the course
        await course.save();

        res.status(200).json({
            success: true,
            message: 'Unit deleted successfully'
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Delete lesson from unit
const deleteLesson = async (req, res, next) => {
    try {
        const { courseId, unitId, lessonId } = req.params;

        const course = await courseModel.findById(courseId);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        // Find the unit
        const unit = course.units.find(unit => 
            unit._id.toString() === unitId || unit.id === unitId
        );

        if (!unit) {
            return next(new AppError('Unit not found', 404));
        }

        // Find the lesson index
        const lessonIndex = unit.lessons.findIndex(lesson => 
            lesson._id.toString() === lessonId || lesson.id === lessonId
        );

        if (lessonIndex === -1) {
            return next(new AppError('Lesson not found', 404));
        }

        // Remove the lesson
        unit.lessons.splice(lessonIndex, 1);

        // Update the course
        await course.save();

        res.status(200).json({
            success: true,
            message: 'Lesson deleted successfully'
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Add lesson to unit
const addLessonToUnit = async (req, res, next) => {
    try {
        const { courseId, unitId } = req.params;
        const { title, description, lecture } = req.body;

        if (!title) {
            return next(new AppError('Lesson title is required', 400));
        }

        const course = await courseModel.findById(courseId);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        // Find the unit
        const unit = course.units.find(unit => 
            unit._id.toString() === unitId || unit.id === unitId
        );

        if (!unit) {
            return next(new AppError('Unit not found', 404));
        }

        // Create new lesson
        const newLesson = {
            title,
            description: description || '',
            lecture: lecture || {},
            duration: 0,
            order: unit.lessons.length + 1
        };

        // Add lesson to unit
        unit.lessons.push(newLesson);

        // Update the course
        await course.save();

        // Get the newly created lesson (it will have an _id now)
        const createdLesson = unit.lessons[unit.lessons.length - 1];

        res.status(201).json({
            success: true,
            message: 'Lesson added successfully',
            lesson: createdLesson
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Delete direct lesson
const deleteDirectLesson = async (req, res, next) => {
    try {
        const { courseId, lessonId } = req.params;

        const course = await courseModel.findById(courseId);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        // Find the lesson index
        const lessonIndex = course.directLessons.findIndex(lesson => 
            lesson._id.toString() === lessonId || lesson.id === lessonId
        );

        if (lessonIndex === -1) {
            return next(new AppError('Lesson not found', 404));
        }

        // Remove the lesson
        course.directLessons.splice(lessonIndex, 1);

        // Update the course
        await course.save();

        res.status(200).json({
            success: true,
            message: 'Direct lesson deleted successfully'
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

export {
    getAllCourses,
    getLecturesByCourseId,
    getCourseStructure,
    createCourse,
    updateCourse,
    removeCourse,
    addLectureToCourseById,
    deleteCourseLecture,
    updateCourseLecture,
    updateUnit,
    updateLesson,
    updateDirectLesson,
    simulateCourseSale,
    scheduleVideoPublish,
    updateCourseStructure,
    deleteUnit,
    deleteLesson,
    deleteDirectLesson,
    addLessonToUnit
}