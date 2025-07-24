import blogModel from '../models/blog.model.js';
import AppError from '../utils/error.utils.js';
import fs from 'fs';
import cloudinary from 'cloudinary';

// Get all blogs
export const getAllBlogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, category, search } = req.query;
        
        let query = { status: 'published' };
        
        // Filter by category
        if (category) {
            query.category = category;
        }
        
        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }
        
        const blogs = await blogModel.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
            
        const total = await blogModel.countDocuments(query);
        
        res.status(200).json({
            success: true,
            message: 'Blogs fetched successfully',
            blogs,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Get single blog by ID
export const getBlogById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const blog = await blogModel.findById(id);
        
        if (!blog) {
            return next(new AppError('Blog not found', 404));
        }
        
        // Increment views
        blog.views += 1;
        await blog.save();
        
        res.status(200).json({
            success: true,
            message: 'Blog fetched successfully',
            blog
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Create new blog
export const createBlog = async (req, res, next) => {
    try {
        const { title, content, excerpt, category, tags, author } = req.body;
        
        if (!title || !content || !excerpt || !category || !author) {
            return next(new AppError('All required fields must be provided', 400));
        }
        
        const blogData = {
            title,
            content,
            excerpt,
            category,
            author,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        };
        
        // Handle image upload
        if (req.file) {
            try {
                // Check if Cloudinary is properly configured
                if (process.env.CLOUDINARY_CLOUD_NAME === 'placeholder' || 
                    process.env.CLOUDINARY_API_KEY === 'placeholder' || 
                    process.env.CLOUDINARY_API_SECRET === 'placeholder') {
                    // Skip Cloudinary upload if using placeholder credentials
                    console.log('Cloudinary not configured, skipping image upload');
                    blogData.image = {
                        public_id: 'placeholder',
                        secure_url: ''
                    };
                } else {
                    const result = await cloudinary.v2.uploader.upload(req.file.path, {
                        folder: 'Learning-Management-System/blogs',
                        width: 800,
                        height: 400,
                        crop: 'fill'
                    });
                    
                    if (result) {
                        blogData.image.public_id = result.public_id;
                        blogData.image.secure_url = result.secure_url;
                    }
                }
                
                // Remove file from server
                if (fs.existsSync(`uploads/${req.file.filename}`)) {
                    fs.rmSync(`uploads/${req.file.filename}`);
                }
            } catch (e) {
                console.log('Image upload error:', e.message);
                blogData.image = {
                    public_id: 'placeholder',
                    secure_url: ''
                };
            }
        }
        
        const blog = await blogModel.create(blogData);
        
        res.status(201).json({
            success: true,
            message: 'Blog created successfully',
            blog
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Update blog
export const updateBlog = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, content, excerpt, category, tags, status } = req.body;
        
        const blog = await blogModel.findById(id);
        
        if (!blog) {
            return next(new AppError('Blog not found', 404));
        }
        
        // Update fields
        if (title) blog.title = title;
        if (content) blog.content = content;
        if (excerpt) blog.excerpt = excerpt;
        if (category) blog.category = category;
        if (tags) blog.tags = tags.split(',').map(tag => tag.trim());
        if (status) blog.status = status;
        
        // Handle image upload
        if (req.file) {
            try {
                // Check if Cloudinary is properly configured
                if (process.env.CLOUDINARY_CLOUD_NAME === 'placeholder' || 
                    process.env.CLOUDINARY_API_KEY === 'placeholder' || 
                    process.env.CLOUDINARY_API_SECRET === 'placeholder') {
                    console.log('Cloudinary not configured, skipping image upload');
                } else {
                    // Delete old image if exists
                    if (blog.image.public_id && blog.image.public_id !== 'placeholder') {
                        await cloudinary.v2.uploader.destroy(blog.image.public_id);
                    }
                    
                    const result = await cloudinary.v2.uploader.upload(req.file.path, {
                        folder: 'Learning-Management-System/blogs',
                        width: 800,
                        height: 400,
                        crop: 'fill'
                    });
                    
                    if (result) {
                        blog.image.public_id = result.public_id;
                        blog.image.secure_url = result.secure_url;
                    }
                }
                
                // Remove file from server
                if (fs.existsSync(`uploads/${req.file.filename}`)) {
                    fs.rmSync(`uploads/${req.file.filename}`);
                }
            } catch (e) {
                console.log('Image upload error:', e.message);
            }
        }
        
        await blog.save();
        
        res.status(200).json({
            success: true,
            message: 'Blog updated successfully',
            blog
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Delete blog
export const deleteBlog = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const blog = await blogModel.findById(id);
        
        if (!blog) {
            return next(new AppError('Blog not found', 404));
        }
        
        // Delete image from Cloudinary if exists
        if (blog.image.public_id && blog.image.public_id !== 'placeholder') {
            try {
                await cloudinary.v2.uploader.destroy(blog.image.public_id);
            } catch (e) {
                console.log('Error deleting image:', e.message);
            }
        }
        
        await blogModel.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: 'Blog deleted successfully'
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Like/Unlike blog
export const likeBlog = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const blog = await blogModel.findById(id);
        
        if (!blog) {
            return next(new AppError('Blog not found', 404));
        }
        
        blog.likes += 1;
        await blog.save();
        
        res.status(200).json({
            success: true,
            message: 'Blog liked successfully',
            likes: blog.likes
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}; 