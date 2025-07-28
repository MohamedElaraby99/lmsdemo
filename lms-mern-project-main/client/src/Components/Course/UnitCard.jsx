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
  FaLock,
  FaPlus,
  FaTrash,
  FaEdit
} from 'react-icons/fa';

export default function UnitCard({ 
  unit, 
  unitIndex,
  role, 
  expanded, 
  onToggle, 
  onAddLesson, 
  onDeleteUnit, 
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
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200">
      {/* Unit Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <FaFolder className="text-white text-lg" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                {unit.title || `Unit ${unitIndex + 1}`}
              </h4>
              {unit.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {unit.description}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {unit.lessons?.length || 0} lessons
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggle(unit._id || unit.id)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title={expanded ? "Collapse Unit" : "Expand Unit"}
            >
              {expanded ? <FaChevronDown /> : <FaChevronRight />}
            </button>
            
            {role === 'ADMIN' && (
              <>
                <button
                  onClick={() => onAddLesson(unit)}
                  className="text-blue-500 hover:text-blue-700 p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900"
                  title="Add Lesson"
                >
                  <FaPlus />
                </button>
                <button
                  onClick={() => onDeleteUnit(unit)}
                  className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-100 dark:hover:bg-red-900"
                  title="Delete Unit"
                >
                  <FaTrash />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Unit Lessons */}
      {expanded && unit.lessons && unit.lessons.length > 0 && (
        <div className="p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unit.lessons.map((lesson, lessonIndex) => (
              <div key={lesson._id || lesson.id || lessonIndex} className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaPlay className="text-white text-sm" />
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
                        onClick={() => onLessonDetail(lesson, unit)}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900"
                        title="View Details"
                      >
                        <FaEye className="text-sm" />
                      </button>
                      
                      {role === 'ADMIN' && (
                        <>
                          <button
                            onClick={() => onAddVideo(lesson, unit)}
                            className="text-green-500 hover:text-green-700 p-1 rounded hover:bg-green-100 dark:hover:bg-green-900"
                            title="Add Video"
                          >
                            <FaVideo className="text-sm" />
                          </button>
                          <button
                            onClick={() => onAddPdf(lesson, unit)}
                            className="text-purple-500 hover:text-purple-700 p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-900"
                            title="Add PDF"
                          >
                            <FaFilePdf className="text-sm" />
                          </button>
                          <button
                            onClick={() => onAddTrainingExam(lesson, unit)}
                            className="text-orange-500 hover:text-orange-700 p-1 rounded hover:bg-orange-100 dark:hover:bg-orange-900"
                            title="Add Training Exam"
                          >
                            <FaClipboardCheck className="text-sm" />
                          </button>
                          <button
                            onClick={() => onAddFinalExam(lesson, unit)}
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
                          onClick={() => onLessonDetail(lesson, unit)}
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
      )}
    </div>
  );
} 