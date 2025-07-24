import qaModel from '../models/qa.model.js';
import AppError from '../utils/error.utils.js';

// Get all Q&As
export const getAllQAs = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, category, search, status } = req.query;
        
        let query = {};
        
        // Filter by category
        if (category) {
            query.category = category;
        }
        
        // Filter by status
        if (status) {
            query.status = status;
        }
        
        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }
        
        const qas = await qaModel.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
            
        const total = await qaModel.countDocuments(query);
        
        res.status(200).json({
            success: true,
            message: 'Q&As fetched successfully',
            qas,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Get single Q&A by ID
export const getQAById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const qa = await qaModel.findById(id);
        
        if (!qa) {
            return next(new AppError('Q&A not found', 404));
        }
        
        // Increment views
        qa.views += 1;
        await qa.save();
        
        res.status(200).json({
            success: true,
            message: 'Q&A fetched successfully',
            qa
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Create new Q&A
export const createQA = async (req, res, next) => {
    try {
        const { question, answer, category, author, tags } = req.body;
        
        if (!question || !answer || !category || !author) {
            return next(new AppError('All required fields must be provided', 400));
        }
        
        const qaData = {
            question,
            answer,
            category,
            author,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        };
        
        const qa = await qaModel.create(qaData);
        
        res.status(201).json({
            success: true,
            message: 'Q&A created successfully',
            qa
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Update Q&A
export const updateQA = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { question, answer, category, status, tags } = req.body;
        
        const qa = await qaModel.findById(id);
        
        if (!qa) {
            return next(new AppError('Q&A not found', 404));
        }
        
        // Update fields
        if (question) qa.question = question;
        if (answer) qa.answer = answer;
        if (category) qa.category = category;
        if (status) qa.status = status;
        if (tags) qa.tags = tags.split(',').map(tag => tag.trim());
        
        await qa.save();
        
        res.status(200).json({
            success: true,
            message: 'Q&A updated successfully',
            qa
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Delete Q&A
export const deleteQA = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const qa = await qaModel.findById(id);
        
        if (!qa) {
            return next(new AppError('Q&A not found', 404));
        }
        
        await qaModel.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: 'Q&A deleted successfully'
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Upvote Q&A
export const upvoteQA = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const qa = await qaModel.findById(id);
        
        if (!qa) {
            return next(new AppError('Q&A not found', 404));
        }
        
        qa.upvotes += 1;
        await qa.save();
        
        res.status(200).json({
            success: true,
            message: 'Q&A upvoted successfully',
            upvotes: qa.upvotes
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Downvote Q&A
export const downvoteQA = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const qa = await qaModel.findById(id);
        
        if (!qa) {
            return next(new AppError('Q&A not found', 404));
        }
        
        qa.downvotes += 1;
        await qa.save();
        
        res.status(200).json({
            success: true,
            message: 'Q&A downvoted successfully',
            downvotes: qa.downvotes
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Get featured Q&As
export const getFeaturedQAs = async (req, res, next) => {
    try {
        const qas = await qaModel.find({ status: 'featured' })
            .sort({ upvotes: -1, views: -1 })
            .limit(5)
            .exec();
            
        res.status(200).json({
            success: true,
            message: 'Featured Q&As fetched successfully',
            qas
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}; 