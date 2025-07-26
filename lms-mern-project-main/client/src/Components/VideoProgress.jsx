import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getVideoProgress, 
  updateVideoProgress,
  resetVideoProgress 
} from '../Redux/Slices/VideoProgressSlice';
import { 
  FaPlay, 
  FaPause, 
  FaClock, 
  FaUser, 
  FaCheckCircle, 
  FaCircle,
  FaUndo,
  FaChartLine,
  FaEye,
  FaEyeSlash,
  FaList
} from 'react-icons/fa';
import CheckpointDetails from './CheckpointDetails';

const VideoProgress = ({ 
  videoId, 
  courseId, 
  currentTime = 0, 
  duration = 0, 
  isPlaying = false,
  onSeek,
  showProgress = true 
}) => {
  const dispatch = useDispatch();
  const { currentVideoProgress, loading } = useSelector((state) => state.videoProgress);
  const { data: userData } = useSelector((state) => state.auth);
  const [showDetails, setShowDetails] = useState(false);
  const [showCheckpointDetails, setShowCheckpointDetails] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);

  // Get video progress when component mounts
  useEffect(() => {
    if (videoId && courseId) {
      console.log('Getting video progress for:', { courseId, videoId });
      dispatch(getVideoProgress({ courseId, videoId }));
    }
  }, [dispatch, videoId, courseId]);

  // Generate checkpoints based on video duration
  const generateCheckpoints = (duration) => {
    if (!duration || duration <= 0) return [];
    
    const percentages = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    return percentages.map(percentage => ({
      percentage,
      time: Math.round((duration * percentage) / 100),
      reached: false
    }));
  };

  // Get current checkpoints
  const currentCheckpoints = generateCheckpoints(duration);
  
  // Track reached checkpoints
  const [reachedCheckpoints, setReachedCheckpoints] = useState(new Set());

  // Update progress and checkpoints periodically
  useEffect(() => {
    if (isPlaying && duration > 0) {
      const interval = setInterval(() => {
        const progress = Math.round((currentTime / duration) * 100);
        let newReachedPercentage = null;
        
        // Check which checkpoints have been reached
        currentCheckpoints.forEach((checkpoint, index) => {
          if (!reachedCheckpoints.has(index) && currentTime >= checkpoint.time && checkpoint.time > 0) {
            setReachedCheckpoints(prev => new Set([...prev, index]));
            newReachedPercentage = checkpoint.percentage;
          }
        });
        
        // Only update if progress has changed significantly or new checkpoint reached
        const shouldUpdate = Math.abs(progress - (currentVideoProgress?.progress || 0)) > 1 || newReachedPercentage !== null;
        
        if (shouldUpdate) {
          dispatch(updateVideoProgress({
            courseId,
            videoId,
            progressData: {
              currentTime,
              duration,
              watchTime: 1, // 1 second interval
              reachedPercentage: newReachedPercentage
            }
          }));
          setLastUpdateTime(Date.now());
        }
      }, 1000); // Update every second

      return () => clearInterval(interval);
    }
  }, [dispatch, courseId, videoId, currentTime, duration, isPlaying, currentVideoProgress, currentCheckpoints, reachedCheckpoints]);

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset your progress for this video?')) {
      dispatch(resetVideoProgress(videoId));
      setReachedCheckpoints(new Set()); // Reset local checkpoint tracking
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = (progress) => {
    if (progress >= 90) return 'text-green-500';
    if (progress >= 70) return 'text-yellow-500';
    if (progress >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getCheckpointStatus = (checkpoint, index) => {
    if (checkpoint.reached) {
      return { icon: FaCheckCircle, color: 'text-green-500' };
    }
    if (reachedCheckpoints.has(index) || currentTime >= checkpoint.time) {
      return { icon: FaCheckCircle, color: 'text-green-500' };
    }
    return { icon: FaCircle, color: 'text-gray-400' };
  };

  if (!showProgress) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FaUser className="text-blue-500" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {userData?.username || userData?.fullName || 'User'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Video Progress
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title={showDetails ? "Hide Details" : "Show Details"}
          >
            {showDetails ? <FaEyeSlash /> : <FaEye />}
          </button>
          
          <button
            onClick={() => setShowCheckpointDetails(!showCheckpointDetails)}
            className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
            title={showCheckpointDetails ? "Hide Checkpoint Details" : "Show Checkpoint Details"}
          >
            <FaList />
          </button>
          
          <button
            onClick={handleResetProgress}
            className="p-2 text-red-500 hover:text-red-700 transition-colors"
            title="Reset Progress"
          >
            <FaUndo />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span className={`font-semibold ${getProgressColor(currentVideoProgress?.progress || 0)}`}>
            {currentVideoProgress?.progress || 0}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${currentVideoProgress?.progress || 0}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Checkpoints */}
      {currentCheckpoints.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <FaClock />
            Progress Checkpoints
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {currentCheckpoints.map((checkpoint, index) => {
              const { icon: Icon, color } = getCheckpointStatus(checkpoint, index);
              const hasValidTime = checkpoint.time > 0;
              return (
                <div key={index} className="text-center">
                  <Icon className={`mx-auto mb-1 ${color}`} />
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {checkpoint.percentage}%
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {hasValidTime ? formatTime(checkpoint.time) : 'Loading...'}
                  </div>
                </div>
              );
            })}
          </div>
          {duration === 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Video duration will be available once video loads
            </div>
          )}
        </div>
      )}

      {/* Detailed Information */}
      {showDetails && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Status:</span>
              <span className={`ml-2 font-semibold ${
                currentVideoProgress?.isCompleted ? 'text-green-500' : 'text-yellow-500'
              }`}>
                {currentVideoProgress?.isCompleted ? 'Completed' : 'In Progress'}
              </span>
            </div>
            
            <div>
              <span className="text-gray-500 dark:text-gray-400">Total Watch Time:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {formatTime(currentVideoProgress?.totalWatchTime || 0)}
              </span>
            </div>
            
            <div>
              <span className="text-gray-500 dark:text-gray-400">Last Watched:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {currentVideoProgress?.lastWatched ? 
                  new Date(currentVideoProgress.lastWatched).toLocaleDateString() : 
                  'Never'
                }
              </span>
            </div>
            
            <div>
              <span className="text-gray-500 dark:text-gray-400">Checkpoints Reached:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {reachedCheckpoints.size} / {currentCheckpoints.length}
              </span>
            </div>
            
            <div>
              <span className="text-gray-500 dark:text-gray-400">Latest Checkpoint:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {(() => {
                  const reachedPercentages = currentVideoProgress?.reachedPercentages || [];
                  if (reachedPercentages.length > 0) {
                    const latest = reachedPercentages[reachedPercentages.length - 1];
                    return `${latest.percentage}% (${formatTime(latest.time)})`;
                  }
                  return 'None';
                })()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Checkpoint View */}
      {showCheckpointDetails && currentCheckpoints.length > 0 && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <CheckpointDetails 
            checkpoints={currentCheckpoints}
            currentTime={currentTime}
            reachedCheckpoints={reachedCheckpoints}
          />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Updating progress...</span>
        </div>
      )}
    </div>
  );
};

export default VideoProgress; 