import subjectModel from '../models/subject.model.js';
import AppError from '../utils/error.utils.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Get all subjects
export const getAllSubjects = async (req, res, next) => {
    try {
        const { page = 1, limit = 12, category, search, status, featured } = req.query;
        
        let query = {};
        
        // Filter by category
        if (category) {
            query.category = category;
        }
        
        // Filter by status
        if (status) {
            query.status = status;
        }
        
        // Filter by featured
        if (featured === 'true') {
            query.featured = true;
        }
        
        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }
        
        const subjects = await subjectModel.find(query)
            .sort({ featured: -1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
            
        const total = await subjectModel.countDocuments(query);
        
        res.status(200).json({
            success: true,
            message: 'Subjects fetched successfully',
            subjects,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Get single subject by ID
export const getSubjectById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const subject = await subjectModel.findById(id);
        
        if (!subject) {
            return next(new AppError('Subject not found', 404));
        }
        
        res.status(200).json({
            success: true,
            message: 'Subject fetched successfully',
            subject
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Create new subject
export const createSubject = async (req, res, next) => {
    try {
        const { 
            title, 
            description, 
            category, 
            instructor, 
            duration, 
            level, 
            price, 
            tags,
            featured 
        } = req.body;
        
        if (!title || !description || !category || !instructor || !level || !price) {
            return next(new AppError('All required fields must be provided', 400));
        }
        
        const subjectData = {
            title,
            description,
            category,
            instructor,
            duration: duration || '4 weeks',
            level,
            price: parseFloat(price),
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            featured: featured === 'true'
        };
        
        // Handle image upload
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'subjects',
                    width: 300,
                    height: 200,
                    crop: 'fill'
                });
                
                subjectData.image = {
                    public_id: result.public_id,
                    secure_url: result.secure_url
                };
                
                // Remove file from uploads folder
                fs.rmSync(req.file.path);
            } catch (error) {
                console.error('Cloudinary upload error:', error);
                // If Cloudinary fails, use local file
                subjectData.image = {
                    public_id: req.file.filename,
                    secure_url: `/uploads/${req.file.filename}`
                };
            }
        } else {
            // Use placeholder image if no image uploaded
            subjectData.image = {
                public_id: 'placeholder',
                secure_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE1MCAxMDAgMTUwIDEwMCAxNTAgMTAwWiIgZmlsbD0iI0QxRDFEMSIvPgo8L3N2Zz4K'
            };
        }
        
        const subject = await subjectModel.create(subjectData);
        
        res.status(201).json({
            success: true,
            message: 'Subject created successfully',
            subject
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Update subject
export const updateSubject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { 
            title, 
            description, 
            category, 
            instructor, 
            duration, 
            level, 
            price, 
            tags,
            featured,
            status 
        } = req.body;
        
        const subject = await subjectModel.findById(id);
        
        if (!subject) {
            return next(new AppError('Subject not found', 404));
        }
        
        const updateData = {};
        
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (category) updateData.category = category;
        if (instructor) updateData.instructor = instructor;
        if (duration) updateData.duration = duration;
        if (level) updateData.level = level;
        if (price) updateData.price = parseFloat(price);
        if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());
        if (featured !== undefined) updateData.featured = featured === 'true';
        if (status) updateData.status = status;
        
        // Handle image upload
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'subjects',
                    width: 300,
                    height: 200,
                    crop: 'fill'
                });
                
                updateData.image = {
                    public_id: result.public_id,
                    secure_url: result.secure_url
                };
                
                // Remove file from uploads folder
                fs.rmSync(req.file.path);
            } catch (error) {
                console.error('Cloudinary upload error:', error);
                // If Cloudinary fails, use local file
                updateData.image = {
                    public_id: req.file.filename,
                    secure_url: `/uploads/${req.file.filename}`
                };
            }
        }
        
        const updatedSubject = await subjectModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        
        res.status(200).json({
            success: true,
            message: 'Subject updated successfully',
            subject: updatedSubject
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Delete subject
export const deleteSubject = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const subject = await subjectModel.findById(id);
        
        if (!subject) {
            return next(new AppError('Subject not found', 404));
        }
        
        await subjectModel.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: 'Subject deleted successfully'
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Get featured subjects
export const getFeaturedSubjects = async (req, res, next) => {
    try {
        const featuredSubjects = await subjectModel.find({ 
            featured: true, 
            status: 'active' 
        })
        .sort({ createdAt: -1 })
        .limit(6);
        
        res.status(200).json({
            success: true,
            message: 'Featured subjects fetched successfully',
            subjects: featuredSubjects
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Toggle subject featured status
export const toggleFeatured = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const subject = await subjectModel.findById(id);
        
        if (!subject) {
            return next(new AppError('Subject not found', 404));
        }
        
        subject.featured = !subject.featured;
        await subject.save();
        
        res.status(200).json({
            success: true,
            message: `Subject ${subject.featured ? 'featured' : 'unfeatured'} successfully`,
            subject
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Update subject status
export const updateSubjectStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status || !['active', 'inactive', 'featured'].includes(status)) {
            return next(new AppError('Valid status is required', 400));
        }
        
        const subject = await subjectModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        
        if (!subject) {
            return next(new AppError('Subject not found', 404));
        }
        
        res.status(200).json({
            success: true,
            message: 'Subject status updated successfully',
            subject
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}; 