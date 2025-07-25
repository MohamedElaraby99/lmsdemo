import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaBook, FaUser, FaClock, FaStar, FaGraduationCap } from "react-icons/fa";
import { placeholderImages } from "../utils/placeholderImages";

export default function CourseCard({ data, viewMode = "grid" }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/courses/description/", { state: { ...data } });
  };

  if (viewMode === "list") {
    return (
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-200 dark:border-gray-700"
        onClick={handleClick}
      >
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative md:w-64 w-full h-48 md:h-auto overflow-hidden">
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              src={data?.thumbnail?.secure_url || placeholderImages.course}
              alt="course thumbnail"
              onError={(e) => {
                e.target.src = placeholderImages.course;
              }}
            />
            <div className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg">
              <FaPlay className="text-blue-600 dark:text-blue-400 text-sm" />
            </div>
            <div className="absolute bottom-3 left-3">
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                {data?.category || "Course"}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                  {data?.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                  {data?.description}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FaUser className="text-blue-500" />
                  <span>{data?.createdBy || "Instructor"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FaBook className="text-purple-500" />
                  <span>{data?.numberoflectures || 0} lectures</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FaClock className="text-green-500" />
                  <span>Self-paced</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FaStar className="text-yellow-500" />
                  <span>4.5 (120)</span>
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105">
                  View Course
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-200 dark:border-gray-700 transform hover:-translate-y-1"
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          src={data?.thumbnail?.secure_url || placeholderImages.course}
          alt="course thumbnail"
          onError={(e) => {
            e.target.src = placeholderImages.course;
          }}
        />
        
        {/* Play Button */}
        <div className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <FaPlay className="text-blue-600 dark:text-blue-400 text-sm" />
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
            {data?.category || "Course"}
          </span>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
          {data?.title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {data?.description}
        </p>

        {/* Stats */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FaUser className="text-blue-500" />
            <span className="truncate">{data?.createdBy || "Instructor"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FaBook className="text-purple-500" />
            <span>{data?.numberoflectures || 0} lectures</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar 
                key={star} 
                className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">(120 reviews)</span>
        </div>

        {/* Action Button */}
        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105">
          View Course
        </button>
      </div>
    </div>
  );
}
