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

export default function UnifiedStructureList({ 
  unifiedStructure, 
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
  formatPrice
}) {
  if (!unifiedStructure || unifiedStructure.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-2">
        <FaLayerGroup className="text-purple-500" />
        هيكل الدورة الموحد ({unifiedStructure.length} عنصر)
      </h3>
      {unifiedStructure.map((item, index) => (
        <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200">
          <div className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {item.type === 'unit' ? (
                  <>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaFolder className="text-white text-lg" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {item.data.title || `Unit ${index + 1}`}
                      </h4>
                      {item.data.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {item.data.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {item.data.lessons?.length || 0} lessons
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaPlay className="text-white text-lg" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {getLessonTitle(item.data) || `Lesson ${index + 1}`}
                      </h4>
                      {item.data.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {getLessonDescription(item.data)}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {getLessonDuration(item.data)} minutes
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatPrice(getLessonPrice(item.data))}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {item.type === 'lesson' && (
                  <>
                    <button
                      onClick={() => onLessonDetail(item.data, null)}
                      className="text-blue-500 hover:text-blue-700 p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    {role === 'ADMIN' && (
                      <>
                        <button
                          onClick={() => onAddVideo(item.data, null)}
                          className="text-green-500 hover:text-green-700 p-2 rounded hover:bg-green-100 dark:hover:bg-green-900"
                          title="Add Video"
                        >
                          <FaVideo />
                        </button>
                        <button
                          onClick={() => onAddPdf(item.data, null)}
                          className="text-purple-500 hover:text-purple-700 p-2 rounded hover:bg-purple-100 dark:hover:bg-purple-900"
                          title="Add PDF"
                        >
                          <FaFilePdf />
                        </button>
                        <button
                          onClick={() => onAddTrainingExam(item.data, null)}
                          className="text-orange-500 hover:text-orange-700 p-2 rounded hover:bg-orange-100 dark:hover:bg-orange-900"
                          title="Add Training Exam"
                        >
                          <FaClipboardCheck />
                        </button>
                        <button
                          onClick={() => onAddFinalExam(item.data, null)}
                          className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-100 dark:hover:bg-red-900"
                          title="Add Final Exam"
                        >
                          <FaClipboardList />
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 