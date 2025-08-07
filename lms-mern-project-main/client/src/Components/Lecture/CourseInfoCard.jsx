import React from 'react';
import { FaUser, FaBook, FaClock, FaWallet } from 'react-icons/fa';
import { useSelector } from 'react-redux';

export default function CourseInfoCard({ course, lecturesCount }) {
  const { balance } = useSelector((state) => state.wallet);
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-6">
      <div className="mb-6">
        <img
          src={course.thumbnail?.secure_url || '/placeholder-course.jpg'}
          alt={course.title}
          className="w-full h-48 object-cover rounded-lg"
        />
      </div>
      
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {course.title}
      </h2>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {course.description}
      </p>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <FaUser className="text-blue-500" />
          <span className="text-gray-600 dark:text-gray-400">
            {course.createdBy || 'المدرس'}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <FaBook className="text-purple-500" />
          <span className="text-gray-600 dark:text-gray-400">
            {lecturesCount} محاضرة
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <FaClock className="text-green-500" />
          <span className="text-gray-600 dark:text-gray-400">
            ذاتي التقدم
          </span>
        </div>
        
        {isLoggedIn && user?.role !== 'ADMIN' && (
          <div className="flex items-center gap-3">
            <FaWallet className="text-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">
              رصيد المحفظة: {balance} نقطة
            </span>
          </div>
        )}
        
        {isLoggedIn && user?.role === 'ADMIN' && (
          <div className="flex items-center gap-3">
            <FaUser className="text-green-500" />
            <span className="text-gray-600 dark:text-gray-400">
              مدير النظام - وصول غير محدود
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 