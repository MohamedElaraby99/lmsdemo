import React from "react";
import { Link } from "react-router-dom";
import { FaStar, FaUsers, FaClock, FaTag, FaPlay } from "react-icons/fa";

const SubjectCard = ({ subject, showActions = false, onEdit, onDelete, onToggleFeatured, onUpdateStatus }) => {
  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'featured': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Programming': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Design': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Business': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Marketing': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Technology': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Science': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      'Arts': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={subject.image?.secure_url?.startsWith('/uploads/') 
            ? `http://localhost:5000${subject.image.secure_url}` 
            : subject.image?.secure_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE1MCAxMDAgMTUwIDEwMCAxNTAgMTAwWiIgZmlsbD0iI0QxRDFEMSIvPgo8L3N2Zz4K'}
          alt={subject.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE1MCAxMDAgMTUwIDEwMCAxNTAgMTAwWiIgZmlsbD0iI0QxRDFEMSIvPgo8L3N2Zz4K';
          }}
        />
        
        {/* Featured Badge */}
        {subject.featured && (
          <div className="absolute top-2 left-2">
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              مميز
            </span>
          </div>
        )}
        
        {/* Status Badge */}
        {showActions && (
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subject.status)}`}>
              {subject.status}
            </span>
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
          <div className="bg-white bg-opacity-90 rounded-full p-3 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <FaPlay className="text-gray-800" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category and Level */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(subject.category)}`}>
            {subject.category}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(subject.level)}`}>
            {subject.level}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
          {subject.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {subject.description}
        </p>

        {/* Instructor */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          بواسطة {subject.instructor}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <FaClock />
              {subject.duration}
            </span>
            <span className="flex items-center gap-1">
              <FaUsers />
              {subject.studentsEnrolled} طالب
            </span>
            <span className="flex items-center gap-1">
              <FaPlay />
              {subject.lessons} درس
            </span>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-1">
            <FaStar className="text-yellow-500" />
            <span>{subject.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Tags */}
        {subject.tags && subject.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {subject.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                <FaTag className="mr-1" />
                {tag}
              </span>
            ))}
            {subject.tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{subject.tags.length - 3} المزيد
              </span>
            )}
          </div>
        )}

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ${subject.price}
          </div>
          
          {showActions ? (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(subject)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
              >
                تعديل
              </button>
              <button
                onClick={() => onToggleFeatured(subject._id)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  subject.featured 
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {subject.featured ? 'إلغاء التميز' : 'تمييز'}
              </button>
              <button
                onClick={() => onDelete(subject._id)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
              >
                حذف
              </button>
            </div>
          ) : (
            <Link
              to={`/subjects/${subject._id}`}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <FaPlay />
              عرض الدورة
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectCard; 