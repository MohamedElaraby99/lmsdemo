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

// Update video progress with smart tracking
const updateVideoProgress = async (req, res, next) => {
  try {
    const { videoId, courseId } = req.params;
    const { currentTime, duration, progress, watchTime, reachedPercentage } = req.body;
    const userId = req.user.id;

    // Find existing progress
    let progressRecord = await videoProgressModel.findOne({ userId, videoId });
    
    if (!progressRecord) {
      // Create new progress
      progressRecord = await videoProgressModel.create({
        userId,
        videoId,
        courseId,
        currentTime: currentTime || 0,
        duration: duration || 0,
        progress: progress || 0,
        totalWatchTime: 0
      });
    }

    // Update basic progress data
    if (currentTime !== undefined) progressRecord.currentTime = currentTime;
    if (duration !== undefined) progressRecord.duration = duration;
    if (progress !== undefined) progressRecord.progress = progress;
    
    // Update last watched timestamp
    progressRecord.lastWatched = new Date();
    
    // Check if video is completed (watched 90% or more AND has significant watch time)
    if (progress >= 90 && progressRecord.totalWatchTime >= 60) { // At least 1 minute watched
      progressRecord.isCompleted = true;
    } else if (progress < 90) {
      // If progress drops below 90%, mark as not completed
      progressRecord.isCompleted = false;
    }
    
    // Add reached percentage if provided (smart checkpoint)
    if (reachedPercentage && typeof reachedPercentage === 'number') {
      // Validate that the reached percentage makes sense with current progress
      const currentProgressPercent = Math.round((currentTime / duration) * 100);
      
      // Only allow checkpoint if current progress is close to or exceeds the checkpoint percentage
      if (currentProgressPercent >= reachedPercentage - 5) { // Allow 5% tolerance
        const percentageExists = progressRecord.reachedPercentages.some(rp => rp.percentage === reachedPercentage);
        if (!percentageExists) {
          progressRecord.reachedPercentages.push({
            percentage: reachedPercentage,
            time: currentTime,
            reachedAt: new Date()
          });
        }
      } else {
        console.log(`Invalid checkpoint: ${reachedPercentage}% reached but current progress is only ${currentProgressPercent}%`);
      }
    }
    
    // Add accurate watch time if provided
    if (watchTime && watchTime > 0) {
      // Always increment, never decrease
      progressRecord.totalWatchTime = Math.max((progressRecord.totalWatchTime || 0) + watchTime, progressRecord.totalWatchTime || 0);
    }
    
    await progressRecord.save();

    res.status(200).json({
      success: true,
      message: "Video progress updated with smart tracking",
      data: progressRecord
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

    // Transform the data to include user information
    const transformedProgress = progress.map(item => ({
      _id: item._id,
      userId: item.userId,
      videoId: item.videoId,
      courseId: item.courseId,
      currentTime: item.currentTime,
      duration: item.duration,
      progress: item.progress,
      reachedPercentages: item.reachedPercentages,
      isCompleted: item.isCompleted,
      totalWatchTime: item.totalWatchTime,
      lastWatched: item.lastWatched,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      user: {
        _id: item.userId._id,
        username: item.userId.username,
        fullName: item.userId.fullName,
        email: item.userId.email
      }
    }));

    res.status(200).json({
      success: true,
      message: "Video progress for all users retrieved",
      data: transformedProgress
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