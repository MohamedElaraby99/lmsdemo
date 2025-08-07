import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

export default function LectureHeader({ courseTitle }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span>العودة</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {courseTitle}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              دروسالدورة
            </p>
          </div>
          
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>
    </div>
  );
} 