import React from 'react';
import { 
  FaTimes, 
  FaClock, 
  FaLock, 
  FaPlay,
  FaShoppingCart,
  FaWallet
} from 'react-icons/fa';
import { useSelector } from 'react-redux';

export default function LectureModal({ 
  selectedLecture, 
  course, 
  onClose,
  onPurchaseClick,
  isPurchasing,
  hasLessonAccess
}) {
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.wallet);
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:00`;
    }
    return `${minutes}:00`;
  };

  if (!selectedLecture) return null;

  // Check if user has access to this lesson
  const hasAccess = hasLessonAccess ? hasLessonAccess(selectedLecture._id) : true;
  const isPaidLesson = selectedLecture.price > 0;
  
  // Show purchase section if:
  // 1. User is not logged in and lesson is paid, OR
  // 2. User is logged in but doesn't have access to paid lesson
  // 3. But NOT if user is admin (admins have unlimited access)
  const shouldShowPurchaseSection = (!isLoggedIn && isPaidLesson) || (isLoggedIn && !hasAccess && isPaidLesson && user?.role !== 'admin');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedLecture.title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {selectedLecture.description}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <FaClock className="w-3 h-3" />
                {formatDuration(selectedLecture.duration || 0)}
              </span>
              
                             {isPaidLesson && (
                <span className="flex items-center gap-1">
                  <FaLock className="w-3 h-3" />
                  محاضرة مدفوعة
                </span>
              )}
            </div>
          </div>
          
          {shouldShowPurchaseSection ? (
            // Purchase required section
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center p-8">
                <FaLock className="text-6xl text-gray-400 mx-auto mb-6" />
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  محتوى مدفوع
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  هذا المحتوى يتطلب شراء للوصول إليه
                </p>
                
                {isLoggedIn ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-2 space-x-reverse text-sm text-gray-600 dark:text-gray-400">
                      <FaWallet className="text-yellow-500" />
                      <span>رصيد المحفظة: {balance} نقطة</span>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-2 space-x-reverse text-lg font-bold text-orange-600 dark:text-orange-400">
                      <span>السعر: {selectedLecture.price || 10} نقطة</span>
                    </div>
                    
                    <button
                      onClick={() => onPurchaseClick && onPurchaseClick(selectedLecture)}
                      disabled={isPurchasing || balance < (selectedLecture.price || 10)}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 space-x-reverse mx-auto ${
                        isPurchasing || balance < (selectedLecture.price || 10)
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                    >
                      <FaShoppingCart size={16} />
                      <span>
                        {isPurchasing 
                          ? 'جاري الشراء...' 
                          : balance < (selectedLecture.price || 10)
                            ? 'رصيد غير كافي'
                            : 'شراء المحتوى'
                        }
                      </span>
                    </button>
                    
                    {balance < (selectedLecture.price || 10) && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        رصيد المحفظة غير كافي لشراء هذا المحتوى
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      يرجى تسجيل الدخول لشراء هذا المحتوى
                    </p>
                    <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
                      تسجيل الدخول
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : selectedLecture.lecture?.secure_url ? (
            // Video content (user has access)
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              <video
                src={selectedLecture.lecture.secure_url}
                controls
                className="w-full h-full"
                poster={course.thumbnail?.secure_url}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            // No video available
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FaPlay className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  لا يوجد فيديو متاح لهذه المحاضرة
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 