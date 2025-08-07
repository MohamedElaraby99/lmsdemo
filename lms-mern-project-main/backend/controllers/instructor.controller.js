import Instructor from '../models/instructor.model.js';

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
    let profileImage = {
      public_id: 'placeholder',
      secure_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzRGNDZFNSIvPgogIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj4KICAgIEluc3RydWN0b3IgQXZhdGFyCiAgPC90ZXh0Pgo8L3N2Zz4K'
    };
    if (req.file) {
      // Check if Cloudinary is properly configured
      if (process.env.CLOUDINARY_CLOUD_NAME === 'placeholder' ||
          process.env.CLOUDINARY_API_KEY === 'placeholder' ||
          process.env.CLOUDINARY_API_SECRET === 'placeholder') {
        // Use local file storage when Cloudinary is not configured
        console.log('Cloudinary not configured, using local file path');
        profileImage = {
          public_id: 'local',
          secure_url: `${process.env.BACKEND_URL || 'http://localhost:4000'}/uploads/${req.file.filename}`
        };
      } else {
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
      .populate({
        path: 'courses',
        select: 'title description thumbnail',
        match: { isActive: true }
      })
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
      .populate({
        path: 'courses',
        select: 'title description thumbnail',
        match: { isActive: true }
      })
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
      .populate({
        path: 'courses',
        select: 'title description thumbnail price',
        match: { isActive: true },
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
    console.log('=== Update Instructor Debug ===');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
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

    console.log('Extracted data:', {
      name, email, bio, specialization, experience, education, socialLinks, featured, isActive
    });

    const instructor = await Instructor.findById(id);
    if (!instructor) {
      console.log('Instructor not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    console.log('Found instructor:', instructor.name);

    // Check if email is being changed and if it already exists
    if (email && email.toLowerCase() !== instructor.email) {
      const existingInstructor = await Instructor.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: id } 
      });
      if (existingInstructor) {
        console.log('Email already exists:', email);
        return res.status(400).json({
          success: false,
          message: 'Instructor with this email already exists'
        });
      }
    }

    // Handle profile image upload
    let profileImage = instructor.profileImage;
    if (req.file) {
      console.log('Processing file upload:', req.file);
      // Delete old image if exists and not placeholder
      if (instructor.profileImage && instructor.profileImage.public_id && instructor.profileImage.public_id !== 'placeholder') {
        try {
          console.log('Deleting old image:', instructor.profileImage.public_id);
          await cloudinary.v2.uploader.destroy(instructor.profileImage.public_id);
        } catch (cloudinaryError) {
          console.error('Error deleting old image:', cloudinaryError);
        }
      }
      
      // Check if Cloudinary is properly configured
      if (process.env.CLOUDINARY_CLOUD_NAME === 'placeholder' ||
          process.env.CLOUDINARY_API_KEY === 'placeholder' ||
          process.env.CLOUDINARY_API_SECRET === 'placeholder') {
        // Use local file storage when Cloudinary is not configured
        console.log('Cloudinary not configured, using local file path');
        profileImage = {
          public_id: 'local',
          secure_url: `${process.env.BACKEND_URL || 'http://localhost:4000'}/uploads/${req.file.filename}`
        };
      } else {
        console.log('Uploading to cloudinary...');
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: 'instructors',
          width: 300,
          crop: 'scale'
        });
        profileImage = {
          public_id: result.public_id,
          secure_url: result.secure_url
        };
        console.log('Upload successful:', result.public_id);
      }
    }

    // Parse socialLinks if it's a JSON string
    let parsedSocialLinks = socialLinks;
    if (typeof socialLinks === 'string') {
      try {
        parsedSocialLinks = JSON.parse(socialLinks);
        console.log('Parsed socialLinks:', parsedSocialLinks);
      } catch (error) {
        console.error('Error parsing socialLinks:', error);
        parsedSocialLinks = {
          linkedin: '',
          twitter: '',
          website: ''
        };
      }
    }

    // Update instructor
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (bio !== undefined) updateData.bio = bio?.trim() || '';
    if (specialization !== undefined) updateData.specialization = specialization?.trim() || '';
    if (experience !== undefined) updateData.experience = experience;
    if (education !== undefined) updateData.education = education?.trim() || '';
    if (parsedSocialLinks !== undefined) updateData.socialLinks = parsedSocialLinks;
    if (featured !== undefined) updateData.featured = featured;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (req.file) updateData.profileImage = profileImage;

    console.log('Update data:', updateData);

    const updatedInstructor = await Instructor.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path: 'courses',
      select: 'title description thumbnail',
      match: { isActive: true }
    });

    console.log('Update successful:', updatedInstructor.name);

    return res.status(200).json({
      success: true,
      message: 'Instructor updated successfully',
      data: { instructor: updatedInstructor }
    });
  } catch (error) {
    console.error('Error updating instructor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update instructor',
      error: error.message
    });
  }
};

// Delete instructor
const deleteInstructor = async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log('Attempting to delete instructor:', id);

    const instructor = await Instructor.findById(id);
    if (!instructor) {
      console.log('Instructor not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    console.log('Found instructor:', instructor.name);

    // Check if instructor has associated courses
    if (instructor.courses && instructor.courses.length > 0) {
      console.log('Instructor has courses:', instructor.courses.length);
      return res.status(400).json({
        success: false,
        message: 'Cannot delete instructor with associated courses. Please remove courses first.'
      });
    }

    // Check if instructor has associated subjects
    try {
      const Subject = await import('../models/subject.model.js');
      const associatedSubjects = await Subject.default.countDocuments({ instructor: id });
      
      console.log('Associated subjects:', associatedSubjects);
      
      if (associatedSubjects > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete instructor with associated subjects. Please remove subjects first.'
        });
      }
    } catch (subjectError) {
      console.error('Error checking subjects:', subjectError);
      // Continue with deletion even if subject check fails
    }

    // Delete profile image if exists
    if (instructor.profileImage && instructor.profileImage.public_id && instructor.profileImage.public_id !== 'placeholder' && instructor.profileImage.public_id !== 'local') {
      try {
        console.log('Deleting cloudinary image:', instructor.profileImage.public_id);
        await cloudinary.v2.uploader.destroy(instructor.profileImage.public_id);
      } catch (cloudinaryError) {
        console.error('Error deleting cloudinary image:', cloudinaryError);
        // Continue with deletion even if cloudinary fails
      }
    }

    console.log('Deleting instructor from database');
    await Instructor.findByIdAndDelete(id);

    console.log('Instructor deleted successfully');
    return res.status(200).json({
      success: true,
      message: 'Instructor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting instructor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete instructor',
      error: error.message
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

    const instructorStats = {
      totalStudents: instructor.totalStudents || 0,
      rating: instructor.rating || 0,
      experience: instructor.experience || 0
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
  getInstructorStats
}; 