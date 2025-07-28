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

export default function DirectLessonsList({ 
  directLessons, 
  role, 
  onLessonDetail, 
  onAddVideo, 
  onAddPdf, 
  onAddTrainingExam, 
  onAddFinalExam,
  getLessonTitle,
  getLessonDescription,
  getLessonDuration,
  getLessonPrice,
  hasVideo,
  hasPdf,
  hasTrainingExam,
  hasFinalExam,
  isLessonPurchasedByUser,
  canAffordLesson,
  formatPrice,
  getPriceBadgeColor
}) {
  if (!directLessons || directLessons.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-2">
        <FaPlay className="text-blue-500" />
        الدروس المباشرة ({directLessons.length} درس)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {directLessons.map((lesson, index) => (
          <div key={lesson._id || lesson.id || index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaPlay className="text-white text-sm" />
                    </div>
                    {hasVideo(lesson) && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <FaGem className="text-white text-xs" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h6 className="font-medium text-gray-900 dark:text-white truncate">
                      {getLessonTitle(lesson)}
                    </h6>
                    {lesson.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {getLessonDescription(lesson)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onLessonDetail(lesson)}
                    className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900"
                    title="View Details"
                  >
                    <FaEye className="text-sm" />
                  </button>
                  
                  {role === 'ADMIN' && (
                    <>
                      <button
                        onClick={() => onAddVideo(lesson)}
                        className="text-green-500 hover:text-green-700 p-1 rounded hover:bg-green-100 dark:hover:bg-green-900"
                        title="Add Video"
                      >
                        <FaVideo className="text-sm" />
                      </button>
                      <button
                        onClick={() => onAddPdf(lesson)}
                        className="text-purple-500 hover:text-purple-700 p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-900"
                        title="Add PDF"
                      >
                        <FaFilePdf className="text-sm" />
                      </button>
                      <button
                        onClick={() => onAddTrainingExam(lesson)}
                        className="text-orange-500 hover:text-orange-700 p-1 rounded hover:bg-orange-100 dark:hover:bg-orange-900"
                        title="Add Training Exam"
                      >
                        <FaClipboardCheck className="text-sm" />
                      </button>
                      <button
                        onClick={() => onAddFinalExam(lesson)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                        title="Add Final Exam"
                      >
                        <FaClipboardList className="text-sm" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                {lesson.duration && (
                  <span className="flex items-center gap-1">
                    <FaClock />
                    {getLessonDuration(lesson)} دقيقة
                  </span>
                )}
                {hasVideo(lesson) && (
                  <span className="flex items-center gap-1 text-green-600">
                    <FaVideo />
                    فيديو متاح
                  </span>
                )}
                {hasPdf(lesson) && (
                  <span className="flex items-center gap-1 text-blue-600">
                    <FaFilePdf />
                    PDF متاح
                  </span>
                )}
                {hasTrainingExam(lesson) && (
                  <span className="flex items-center gap-1 text-purple-600">
                    <FaClipboardCheck />
                    امتحان تدريبي
                  </span>
                )}
                {hasFinalExam(lesson) && (
                  <span className="flex items-center gap-1 text-orange-600">
                    <FaClipboardList />
                    امتحان نهائي
                  </span>
                )}
              </div>
              
              {/* Video Status and Purchase */}
              {hasVideo(lesson) && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isLessonPurchasedByUser(lesson) ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          <FaCheck className="inline mr-1" />
                          تم الشراء
                        </span>
                      ) : (
                        <>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriceBadgeColor(getLessonPrice(lesson))}`}>
                            {formatPrice(getLessonPrice(lesson))}
                          </span>
                          {!canAffordLesson(lesson) && role === 'USER' && (
                            <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                              <FaLock />
                              رصيد غير كافي
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => onLessonDetail(lesson)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1 shadow-md hover:shadow-lg transform hover:scale-105 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                    >
                      <FaPlay />
                      مشاهدة
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 