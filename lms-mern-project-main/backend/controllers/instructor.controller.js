import Instructor from '../models/instructor.model.js';
import Course from '../models/course.model.js';
import AppError from '../utils/error.utils.js';
import cloudinary from 'cloudinary';

// Create a new instructor
const createInstructor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      bio,
      specialization,
      experience,
      education,
      socialLinks,
      featured
    } = req.body;

    // Check if instructor already exists
    const existingInstructor = await Instructor.findOne({ email: email.toLowerCase() });
    if (existingInstructor) {
      return res.status(400).json({
        success: false,
        message: 'Instructor with this email already exists'
      });
    }

    // Handle profile image upload
    let profileImage = {};
    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: 'instructors',
        width: 300,
        crop: 'scale'
      });
      profileImage = {
        public_id: result.public_id,
        secure_url: result.secure_url
      };
    }

    const instructor = new Instructor({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      bio: bio?.trim() || '',
      specialization: specialization?.trim() || '',
      experience: experience || 0,
      education: education?.trim() || '',
      socialLinks: socialLinks || {},
      profileImage,
      featured: featured || false
    });

    await instructor.save();

    return res.status(201).json({
      success: true,
      message: 'Instructor created successfully',
      data: { instructor }
    });
  } catch (error) {
    console.error('Error creating instructor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create instructor'
    });
  }
};

// Get all instructors with optional filtering
const getAllInstructors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, specialization, featured, isActive } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const instructors = await Instructor.find(query)
      .populate('courses', 'title description thumbnail')
      .sort({ featured: -1, rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Instructor.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: 'Instructors retrieved successfully',
      data: {
        instructors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting instructors:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get instructors'
    });
  }
};

// Get featured instructors
const getFeaturedInstructors = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;

    const instructors = await Instructor.find({ 
      featured: true, 
      isActive: true 
    })
      .populate('courses', 'title description thumbnail')
      .sort({ rating: -1, totalStudents: -1 })
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      message: 'Featured instructors retrieved successfully',
      data: { instructors }
    });
  } catch (error) {
    console.error('Error getting featured instructors:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get featured instructors'
    });
  }
};

// Get instructor by ID
const getInstructorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const instructor = await Instructor.findById(id)
      .populate('courses', 'title description thumbnail price')
      .populate({
        path: 'courses',
        populate: {
          path: 'units',
          select: 'title lessons'
        }
      });
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Instructor retrieved successfully',
      data: { instructor }
    });
  } catch (error) {
    console.error('Error getting instructor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get instructor'
    });
  }
};

// Update instructor
const updateInstructor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      bio,
      specialization,
      experience,
      education,
      socialLinks,
      featured,
      isActive
    } = req.body;

    const instructor = await Instructor.findById(id);
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email.toLowerCase() !== instructor.email) {
      const existingInstructor = await Instructor.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: id } 
      });
      if (existingInstructor) {
        return res.status(400).json({
          success: false,
          message: 'Instructor with this email already exists'
        });
      }
    }

    // Handle profile image upload
    let profileImage = instructor.profileImage;
    if (req.file) {
      // Delete old image if exists
      if (instructor.profileImage.public_id) {
        await cloudinary.v2.uploader.destroy(instructor.profileImage.public_id);
      }
      
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: 'instructors',
        width: 300,
        crop: 'scale'
      });
      profileImage = {
        public_id: result.public_id,
        secure_url: result.secure_url
      };
    }

    // Update instructor
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (bio !== undefined) updateData.bio = bio?.trim() || '';
    if (specialization !== undefined) updateData.specialization = specialization?.trim() || '';
    if (experience !== undefined) updateData.experience = experience;
    if (education !== undefined) updateData.education = education?.trim() || '';
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
    if (featured !== undefined) updateData.featured = featured;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (req.file) updateData.profileImage = profileImage;

    const updatedInstructor = await Instructor.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('courses', 'title description thumbnail');

    return res.status(200).json({
      success: true,
      message: 'Instructor updated successfully',
      data: { instructor: updatedInstructor }
    });
  } catch (error) {
    console.error('Error updating instructor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update instructor'
    });
  }
};

// Delete instructor
const deleteInstructor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const instructor = await Instructor.findById(id);
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    // Check if instructor has associated courses
    if (instructor.courses.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete instructor with associated courses. Please remove courses first.'
      });
    }

    // Delete profile image if exists
    if (instructor.profileImage.public_id) {
      await cloudinary.v2.uploader.destroy(instructor.profileImage.public_id);
    }

    await Instructor.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Instructor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting instructor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete instructor'
    });
  }
};

// Add course to instructor
const addCourseToInstructor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    const instructor = await Instructor.findById(id);
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course is already assigned to this instructor
    if (instructor.courses.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Course is already assigned to this instructor'
      });
    }

    // Add course to instructor
    instructor.courses.push(courseId);
    await instructor.save();

    // Update instructor stats
    const totalStudents = await Course.aggregate([
      { $match: { _id: { $in: instructor.courses } } },
      { $group: { _id: null, total: { $sum: '$enrolledStudents' } } }
    ]);

    instructor.totalStudents = totalStudents[0]?.total || 0;
    await instructor.save();

    const updatedInstructor = await Instructor.findById(id)
      .populate('courses', 'title description thumbnail');

    return res.status(200).json({
      success: true,
      message: 'Course added to instructor successfully',
      data: { instructor: updatedInstructor }
    });
  } catch (error) {
    console.error('Error adding course to instructor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add course to instructor'
    });
  }
};

// Remove course from instructor
const removeCourseFromInstructor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    const instructor = await Instructor.findById(id);
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    // Remove course from instructor
    instructor.courses = instructor.courses.filter(course => course.toString() !== courseId);
    await instructor.save();

    // Update instructor stats
    const totalStudents = await Course.aggregate([
      { $match: { _id: { $in: instructor.courses } } },
      { $group: { _id: null, total: { $sum: '$enrolledStudents' } } }
    ]);

    instructor.totalStudents = totalStudents[0]?.total || 0;
    await instructor.save();

    const updatedInstructor = await Instructor.findById(id)
      .populate('courses', 'title description thumbnail');

    return res.status(200).json({
      success: true,
      message: 'Course removed from instructor successfully',
      data: { instructor: updatedInstructor }
    });
  } catch (error) {
    console.error('Error removing course from instructor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove course from instructor'
    });
  }
};

// Get instructor statistics
const getInstructorStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const instructor = await Instructor.findById(id);
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    // Get detailed statistics
    const stats = await Course.aggregate([
      { $match: { _id: { $in: instructor.courses } } },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          totalStudents: { $sum: '$enrolledStudents' },
          totalRevenue: { $sum: '$price' },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    const instructorStats = {
      totalCourses: instructor.courses.length,
      totalStudents: instructor.totalStudents,
      rating: instructor.rating,
      experience: instructor.experience,
      ...stats[0]
    };

    return res.status(200).json({
      success: true,
      message: 'Instructor statistics retrieved successfully',
      data: { stats: instructorStats }
    });
  } catch (error) {
    console.error('Error getting instructor statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get instructor statistics'
    });
  }
};

export {
  createInstructor,
  getAllInstructors,
  getFeaturedInstructors,
  getInstructorById,
  updateInstructor,
  deleteInstructor,
  addCourseToInstructor,
  removeCourseFromInstructor,
  getInstructorStats
}; 