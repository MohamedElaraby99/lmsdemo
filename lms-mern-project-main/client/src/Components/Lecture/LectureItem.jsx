import React from 'react';
import { FaPlay, FaLock, FaCheck, FaClock, FaShoppingCart, FaUser } from 'react-icons/fa';
import { useSelector } from 'react-redux';

export default function LectureItem({ 
  lecture, 
  isPaid, 
  hasAccess, 
  hasLessonAccess, 
  isCompleted, 
  progress, 
  onLectureClick
}) {
  const { user } = useSelector((state) => state.auth);
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onLectureClick(lecture);
  };



  const isLessonAccessible = hasLessonAccess ? hasLessonAccess(lecture._id) : hasAccess;

  return (
    <div 
      onClick={handleClick}
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
        isCompleted 
          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      } ${!isLessonAccessible ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isCompleted 
              ? 'bg-green-500 text-white' 
              : !isLessonAccessible 
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500' 
                : 'bg-blue-500 text-white'
          }`}>
            {isCompleted ? (
              <FaCheck size={16} />
            ) : !isLessonAccessible ? (
              <FaLock size={16} />
            ) : (
              <FaPlay size={16} />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className={`font-medium text-sm ${
              isCompleted 
                ? 'text-green-700 dark:text-green-300' 
                : 'text-gray-900 dark:text-gray-100'
            }`}>
              {lecture.title}
            </h3>
            <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500 dark:text-gray-400 mt-1">
              <FaClock size={12} />
              <span>{formatDuration(lecture.duration)}</span>
                             {lecture.price > 0 && (
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  مدفوع - {lecture.price || 10} نقطة
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          {isCompleted && (
            <div className="text-green-600 dark:text-green-400 text-sm font-medium">
              مكتمل
            </div>
          )}
          {progress > 0 && progress < 100 && !isCompleted && (
            <div className="text-blue-600 dark:text-blue-400 text-sm">
              {Math.round(progress)}%
            </div>
          )}
                                                                                                        {lecture.price > 0 && !isLessonAccessible && user?.role !== 'admin' && (
             <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
               محتوى مدفوع
             </div>
           )}
           
           {user?.role === 'admin' && lecture.price > 0 && (
             <div className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
               <FaUser size={10} />
               وصول مدير
             </div>
           )}
        </div>
      </div>
    </div>
  );
} 