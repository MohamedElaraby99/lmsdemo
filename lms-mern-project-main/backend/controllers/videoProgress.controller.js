import videoProgressModel from "../models/videoProgress.model.js";
import courseModel from "../models/course.model.js";
import userModel from "../models/user.model.js";
import AppError from "../utils/error.utils.js";

// Get or create video progress for a user
const getVideoProgress = async (req, res, next) => {
  try {
    const { videoId, courseId } = req.params;
    const userId = req.user.id;

    // Validate course exists and user has access
    const course = await courseModel.findById(courseId);
    if (!course) {
      return next(new AppError("Course not found", 404));
    }

    // Find existing progress or create new one
    let progress = await videoProgressModel.findOne({ userId, videoId });
    
    if (!progress) {
      // Create new progress
      progress = await videoProgressModel.create({
        userId,
        videoId,
        courseId,
        currentTime: 0,
        duration: 0,
        progress: 0
      });
    }

    res.status(200).json({
      success: true,
      message: "Video progress retrieved",
      data: progress
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Update video progress
const updateVideoProgress = async (req, res, next) => {
  try {
    const { videoId, courseId } = req.params;
    const { currentTime, duration, watchTime, reachedPercentage } = req.body;
    const userId = req.user.id;

    // Find existing progress
    let progress = await videoProgressModel.findOne({ userId, videoId });
    
    if (!progress) {
      // Create new progress
      progress = await videoProgressModel.create({
        userId,
        videoId,
        courseId,
        currentTime,
        duration,
        progress: 0
      });
    }

    // Update progress
    await progress.updateProgress(currentTime, duration);
    
    // Add reached percentage if provided
    if (reachedPercentage && typeof reachedPercentage === 'number') {
      const percentageExists = progress.reachedPercentages.some(rp => rp.percentage === reachedPercentage);
      if (!percentageExists) {
        progress.reachedPercentages.push({
          percentage: reachedPercentage,
          time: currentTime,
          reachedAt: new Date()
        });
        await progress.save();
      }
    }
    
    // Add watch time if provided
    if (watchTime && watchTime > 0) {
      await progress.addWatchTime(watchTime);
    }

    res.status(200).json({
      success: true,
      message: "Video progress updated",
      data: progress
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Get user's progress for all videos in a course
const getCourseProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const progress = await videoProgressModel.find({ userId, courseId })
      .populate('userId', 'username fullName')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      message: "Course progress retrieved",
      data: progress
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Get all users' progress for a specific video (for admin)
const getVideoProgressForAllUsers = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { role } = req.user;

    // Only admins can see all users' progress
    if (role !== 'ADMIN') {
      return next(new AppError("Unauthorized access", 403));
    }

    const progress = await videoProgressModel.find({ videoId })
      .populate('userId', 'username fullName email')
      .sort({ lastWatched: -1 });

    res.status(200).json({
      success: true,
      message: "Video progress for all users retrieved",
      data: progress
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Reset video progress (for admin or user)
const resetVideoProgress = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;
    const { role } = req.user;

    // Find progress to reset
    const progress = await videoProgressModel.findOne({ videoId });
    
    if (!progress) {
      return next(new AppError("Video progress not found", 404));
    }

    // Only allow reset if user owns the progress or is admin
    if (progress.userId.toString() !== userId && role !== 'ADMIN') {
      return next(new AppError("Unauthorized access", 403));
    }

    // Reset progress
    progress.currentTime = 0;
    progress.progress = 0;
    progress.isCompleted = false;
    progress.checkpoints.forEach(checkpoint => {
      checkpoint.reached = false;
      checkpoint.reachedAt = null;
    });

    await progress.save();

    res.status(200).json({
      success: true,
      message: "Video progress reset successfully",
      data: progress
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};



export {
  getVideoProgress,
  updateVideoProgress,
  getCourseProgress,
  getVideoProgressForAllUsers,
  resetVideoProgress
}; 