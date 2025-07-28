import React from 'react';
import { 
  FaPlay, 
  FaEye, 
  FaClock, 
  FaVideo, 
  FaFilePdf, 
  FaClipboardCheck, 
  FaClipboardList, 
  FaGem, 
  FaCheck, 
  FaLock 
} from 'react-icons/fa';

export default function CourseOverview({ 
  courseData, 
  getTotalLessons, 
  hasVideo, 
  hasPdf, 
  hasTrainingExam, 
  hasFinalExam 
}) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
      <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
        <FaBook className="text-blue-500" />
        نظرة عامة على هيكل الدورة
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
          <FaFolder className="text-2xl text-green-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">الوحدات</p>
          <p className="text-lg font-bold text-green-600">
            {courseData.units?.length || 0}
          </p>
        </div>
        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
          <FaPlay className="text-2xl text-blue-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">الدروس</p>
          <p className="text-lg font-bold text-blue-600">
            {getTotalLessons()}
          </p>
        </div>
        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
          <FaVideo className="text-2xl text-purple-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">الفيديوهات</p>
          <p className="text-lg font-bold text-purple-600">
            {courseData.units?.reduce((sum, unit) => 
              sum + unit.lessons?.filter(lesson => hasVideo(lesson)).length, 0) + 
             (courseData.directLessons?.filter(lesson => hasVideo(lesson)).length || 0)}
          </p>
        </div>
        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
          <FaFilePdf className="text-2xl text-orange-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">ملفات PDF</p>
          <p className="text-lg font-bold text-orange-600">
            {courseData.units?.reduce((sum, unit) => 
              sum + unit.lessons?.filter(lesson => hasPdf(lesson)).length, 0) + 
             (courseData.directLessons?.filter(lesson => hasPdf(lesson)).length || 0)}
          </p>
        </div>
      </div>
    </div>
  );
} 