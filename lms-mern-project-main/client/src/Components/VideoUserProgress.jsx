import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaUsers, 
  FaClock, 
  FaUser, 
  FaPlay, 
  FaPause, 
  FaCheckCircle,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { getAllUsersProgress } from '../Redux/Slices/VideoProgressSlice';

const VideoUserProgress = ({ videoId, courseId }) => {
  const dispatch = useDispatch();
  const { allUsersProgress, loading } = useSelector((state) => state.videoProgress);
  const [showDetails, setShowDetails] = useState(false);
  const [sortBy, setSortBy] = useState('watchTime'); // 'watchTime', 'progress', 'lastWatched'

  useEffect(() => {
    if (videoId && courseId) {
      console.log('Fetching all users progress for video:', videoId);
      dispatch(getAllUsersProgress({ videoId, courseId }));
    }
  }, [dispatch, videoId, courseId]);

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getProgressColor = (progress) => {
    if (progress >= 90) return 'text-green-500';
    if (progress >= 70) return 'text-yellow-500';
    if (progress >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getStatusIcon = (progress, isCompleted, totalWatchTime) => {
    // Only show completed if they have significant watch time (at least 1 minute)
    if ((isCompleted || progress >= 90) && (totalWatchTime || 0) >= 60) {
      return <FaCheckCircle className="text-green-500" />;
    }
    if (progress > 0) {
      return <FaPlay className="text-blue-500" />;
    }
    return <FaPause className="text-gray-400" />;
  };

  const sortUsers = (users) => {
    if (!users || users.length === 0) return [];
    
    return [...users].sort((a, b) => {
      switch (sortBy) {
        case 'watchTime':
          return (b.totalWatchTime || 0) - (a.totalWatchTime || 0);
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        case 'lastWatched':
          return new Date(b.lastWatched || 0) - new Date(a.lastWatched || 0);
        default:
          return 0;
      }
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading user progress...</span>
        </div>
      </div>
    );
  }

  if (!allUsersProgress || allUsersProgress.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-4">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <FaUsers className="mx-auto text-4xl mb-2" />
          <p>No users have watched this video yet</p>
        </div>
      </div>
    );
  }

  const sortedUsers = sortUsers(allUsersProgress);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FaUsers className="text-blue-500 text-xl" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              All Users Progress
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {sortedUsers.length} user{sortedUsers.length !== 1 ? 's' : ''} watched this video
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="watchTime">Sort by Watch Time</option>
            <option value="progress">Sort by Progress</option>
            <option value="lastWatched">Sort by Last Watched</option>
          </select>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title={showDetails ? "Hide Details" : "Show Details"}
          >
            {showDetails ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {sortedUsers.map((userProgress, index) => (
          <div key={userProgress._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaUser className="text-gray-400" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {userProgress.user?.username || userProgress.user?.fullName || 'Unknown User'}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaClock />
                      {formatTime(userProgress.totalWatchTime || 0)} watched
                    </span>
                    <span className={`font-medium ${getProgressColor(userProgress.progress || 0)}`}>
                      {userProgress.progress || 0}% complete
                    </span>
                                         {getStatusIcon(userProgress.progress || 0, userProgress.isCompleted, userProgress.totalWatchTime)}
                  </div>
                </div>
              </div>
              
              <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                <div>Last: {formatDate(userProgress.lastWatched)}</div>
                                 {userProgress.isCompleted && (userProgress.totalWatchTime || 0) >= 60 && (
                   <div className="text-green-500 text-xs">Completed</div>
                 )}
              </div>
            </div>

            {/* Detailed Information */}
            {showDetails && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Current Time:</span>
                    <div className="font-medium">{formatTime(userProgress.currentTime || 0)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Video Duration:</span>
                    <div className="font-medium">{formatTime(userProgress.duration || 0)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Checkpoints Reached:</span>
                    <div className="font-medium">{userProgress.reachedPercentages?.length || 0}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Started:</span>
                    <div className="font-medium">{formatDate(userProgress.createdAt)}</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{userProgress.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        userProgress.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${userProgress.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{sortedUsers.length}</div>
            <div className="text-gray-500 dark:text-gray-400">Total Users</div>
          </div>
                     <div className="text-center">
             <div className="text-2xl font-bold text-green-500">
               {sortedUsers.filter(u => u.isCompleted && (u.totalWatchTime || 0) >= 60).length}
             </div>
             <div className="text-gray-500 dark:text-gray-400">Completed</div>
           </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {Math.round(sortedUsers.reduce((sum, u) => sum + (u.progress || 0), 0) / sortedUsers.length)}%
            </div>
            <div className="text-gray-500 dark:text-gray-400">Avg Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">
              {formatTime(Math.round(sortedUsers.reduce((sum, u) => sum + (u.totalWatchTime || 0), 0) / sortedUsers.length))}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Avg Watch Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUserProgress; 