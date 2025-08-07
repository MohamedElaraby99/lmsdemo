import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaPlay, 
  FaFilePdf, 
  FaClipboardCheck, 
  FaGraduationCap as FaExam,
  FaVideo,
  FaDownload,
  FaShoppingCart,
  FaCheck,
  FaLock,
  FaUnlock,
  FaClock,
  FaStar,
  FaUsers,
  FaEye,
  FaDollarSign,
  FaFolder,
  FaHistory,
  FaCalendarAlt,
  FaPlus
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../Helpers/axiosInstance';
import CustomVideoPlayer from './CustomVideoPlayer';
import TakeExamModal from './TakeExamModal';

const LessonDetailModal = ({ 
  lesson, 
  unit, 
  isOpen, 
  onClose, 
  onPurchase, 
  isPurchased: propIsPurchased, 
  canAfford, 
  purchaseLoading,
  role,
  balance,
  lessonPrice,
  courseData,
  onAddVideo,
  onAddPdf,
  onAddTrainingExam,
  onAddFinalExam
}) => {
  // Safety check for unit object
  const safeUnit = unit && typeof unit === 'object' && !unit.nativeEvent ? unit : null;
  const [activeTab, setActiveTab] = useState('overview');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isLoadingPurchaseStatus, setIsLoadingPurchaseStatus] = useState(true);
  const [showExamModal, setShowExamModal] = useState(false);
  const [examType, setExamType] = useState('training');
  const [showExamHistory, setShowExamHistory] = useState(false);
  const [examHistory, setExamHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [trainingExamTaken, setTrainingExamTaken] = useState(false);
  const [finalExamTaken, setFinalExamTaken] = useState(false);
  const [trainingExamResult, setTrainingExamResult] = useState(null);
  const [finalExamResult, setFinalExamResult] = useState(null);

  // Helper function to safely get lesson title
  const getLessonTitle = (lesson) => {
    if (!lesson) return 'درس بدون عنوان';
    if (typeof lesson.title === 'string') return lesson.title;
    if (lesson.title && typeof lesson.title === 'object' && lesson.title.title) return lesson.title.title;
    return lesson.title || 'درس بدون عنوان';
  };

  // Helper function to safely get lesson description
  const getLessonDescription = (lesson) => {
    if (!lesson) return 'لا يوجد وصف متاح لهذا الدرس.';
    if (typeof lesson.description === 'string') return lesson.description;
    if (lesson.description && typeof lesson.description === 'object' && lesson.description.description) return lesson.description.description;
    return lesson.description || 'لا يوجد وصف متاح لهذا الدرس.';
  };

  // Helper function to safely get lesson duration
  const getLessonDuration = (lesson) => {
    if (!lesson) return '0';
    if (typeof lesson.duration === 'number') return lesson.duration.toString();
    if (lesson.duration && typeof lesson.duration === 'object' && lesson.duration.duration) return lesson.duration.duration.toString();
    return (lesson.duration || '0').toString();
  };

  // Helper function to safely get lesson price
  const getLessonPrice = (lesson) => {
    if (!lesson) return 0;
    if (typeof lesson.price === 'number') return lesson.price;
    if (lesson.price && typeof lesson.price === 'object' && lesson.price.price) return lesson.price.price;
    return lesson.price || 0;
  };

  // Check purchase status and exam status when modal opens
  useEffect(() => {
    if (isOpen && actualLesson && courseData) {
      // Check exam status
      const checkExamStatus = async () => {
        try {
          // Check training exam
          if (hasTrainingExam(actualLesson)) {
            const trainingResponse = await axiosInstance.get(`/exams/check/${courseData._id}/${actualLesson._id}/training`);
            const { hasTaken: trainingTaken, result: trainingResult } = trainingResponse.data.data;
            setTrainingExamTaken(trainingTaken);
            setTrainingExamResult(trainingResult);
          }

          // Check final exam
          if (hasFinalExam(actualLesson)) {
            const finalResponse = await axiosInstance.get(`/exams/check/${courseData._id}/${actualLesson._id}/final`);
            const { hasTaken: finalTaken, result: finalResult } = finalResponse.data.data;
            setFinalExamTaken(finalTaken);
            setFinalExamResult(finalResult);
          }
        } catch (error) {
          console.error('Error checking exam status:', error);
        }
      };

      checkExamStatus();

      // Give a small delay to allow purchase data to load
      const timer = setTimeout(() => {
        setIsLoadingPurchaseStatus(false);
      }, 1000); // Increased delay to ensure purchase data is loaded
      
      return () => clearTimeout(timer);
    } else {
      setIsLoadingPurchaseStatus(true);
      setTrainingExamTaken(false);
      setFinalExamTaken(false);
      setTrainingExamResult(null);
      setFinalExamResult(null);
    }
  }, [isOpen, lesson, courseData]);

  const hasVideo = (lesson) => {
    return lesson.lecture && (lesson.lecture.secure_url || lesson.lecture.youtubeUrl);
  };

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  const getYouTubeThumbnail = (url) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;
    
    // Return high quality thumbnail
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const getYouTubeThumbnailFallback = (url) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;
    
    // Return medium quality thumbnail as fallback
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  const hasPdf = (lesson) => {
    return lesson.pdf && lesson.pdf.secure_url;
  };

  const hasTrainingExam = (lesson) => {
    return lesson.trainingExam && lesson.trainingExam.questions && lesson.trainingExam.questions.length > 0;
  };

  const hasFinalExam = (lesson) => {
    return lesson.finalExam && lesson.finalExam.questions && lesson.finalExam.questions.length > 0;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP'
    }).format(price);
  };

  // Get lesson data from course unifiedStructure
  const getLessonFromCourseData = () => {
    if (!courseData?.unifiedStructure || !lesson) return lesson;
    
    const lessonId = lesson._id || lesson.id;
    const lessonTitle = getLessonTitle(lesson);
    
    // Search in unifiedStructure for the lesson
    for (const item of courseData.unifiedStructure) {
      if (item.type === 'lesson') {
        const itemLesson = item.data;
        if (itemLesson._id === lessonId || 
            itemLesson.id === lessonId || 
            getLessonTitle(itemLesson) === lessonTitle) {
          console.log('Found lesson in unifiedStructure:', itemLesson);
          return itemLesson;
        }
      } else if (item.type === 'unit' && item.data.lessons) {
        // Search in unit lessons
        for (const unitLesson of item.data.lessons) {
          if (unitLesson._id === lessonId || 
              unitLesson.id === lessonId || 
              getLessonTitle(unitLesson) === lessonTitle) {
            console.log('Found lesson in unit:', unitLesson);
            return unitLesson;
          }
        }
      }
    }
    
    console.log('Lesson not found in unifiedStructure, using original lesson');
    return lesson;
  };

  // Get the actual lesson data from course API
  const actualLesson = getLessonFromCourseData();

  // Check purchase status internally
  const checkPurchaseStatus = () => {
    // Admin has access to all lessons
    if (role === 'ADMIN') {
      return true;
    }
    
    // Check if lesson has access flags
    if (actualLesson._hasAccess === true || actualLesson._purchased === true) {
      return true;
    }
    
    // Check if lesson has purchases array
    if (actualLesson.purchases && Array.isArray(actualLesson.purchases) && actualLesson.purchases.length > 0) {
      return true;
    }
    
    // Use the prop as fallback
    return propIsPurchased;
  };

  const isPurchased = checkPurchaseStatus();
  
  // Debug: Log the purchase status
  console.log('🔍 LessonDetailModal Debug:', {
    lessonTitle: getLessonTitle(actualLesson),
    lessonId: actualLesson._id || actualLesson.id,
    role: role,
    propIsPurchased: propIsPurchased,
    lessonHasAccess: actualLesson._hasAccess,
    lessonPurchased: actualLesson._purchased,
    lessonPurchases: actualLesson.purchases,
    calculatedIsPurchased: isPurchased,
    fromUnifiedStructure: actualLesson !== lesson
  });

  const handlePurchase = () => {
    if (role === 'ADMIN') {
      toast.success('يمكن للمدير الوصول لجميع المحتويات');
      onClose();
      return;
    }
    
    if (isPurchased) {
      toast.success('أنت تملك هذا الدرس بالفعل');
      onClose();
      return;
    }

    if (!canAfford) {
      toast.error('رصيد غير كافي');
      return;
    }

    // Call the purchase function - the modal will be updated when purchase is successful
    onPurchase(actualLesson);
  };

  const handleDownloadPdf = () => {
    if (hasPdf(lesson)) {
      window.open(lesson.pdf.secure_url, '_blank');
    }
  };

  const handleStartTrainingExam = () => {
    if (hasTrainingExam(lesson)) {
      setExamType('training');
      setShowExamModal(true);
    }
  };

  const handleStartFinalExam = () => {
    if (hasFinalExam(lesson)) {
      setExamType('final');
      setShowExamModal(true);
    }
  };

  const handleWatchVideo = () => {
    if (hasVideo(lesson)) {
      setShowVideoModal(true);
    }
  };

  const handleViewExamHistory = async (examType) => {
    setLoadingHistory(true);
    try {
      const response = await axiosInstance.get(`/exams/check/${courseData._id}/${lesson._id}/${examType}`);
      const { result } = response.data.data;
      if (result) {
        setExamHistory(result);
        setShowExamHistory(true);
      } else {
        toast.error('لا يوجد تاريخ امتحان لهذا الدرس');
      }
    } catch (error) {
      console.error('Error fetching exam history:', error);
      toast.error('فشل في تحميل تاريخ الامتحان');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Force refresh lesson status when modal opens
  useEffect(() => {
    if (isOpen && lesson) {
      console.log('🔄 Modal opened, checking lesson status:', {
        lessonTitle: getLessonTitle(lesson),
        lessonId: lesson._id || lesson.id,
        hasAccess: lesson._hasAccess,
        purchased: lesson._purchased
      });
    }
  }, [isOpen, lesson]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaPlay className="text-white text-sm sm:text-lg" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                  {getLessonTitle(actualLesson)}
                </h2>
                {safeUnit && (
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    الوحدة: {safeUnit.title && typeof safeUnit.title === 'string' ? safeUnit.title : 'وحدة غير معروفة'}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              <FaTimes className="text-gray-500 text-lg sm:text-xl" />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row h-[calc(95vh-200px)] sm:h-[calc(90vh-200px)]">
            {/* Loading State */}
            {isLoadingPurchaseStatus ? (
              <div className="w-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">جاري التحقق من حالة الشراء...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Left Side - Tabs */}
                <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">محتوى الدرس</h3>
                    
                    {/* Show different content based on purchase status */}
                    {console.log('LessonDetailModal Debug:', {
                      isPurchased,
                      role,
                      lessonId: lesson?._id || lesson?.id,
                      lessonTitle: lesson?.title,
                      isLoadingPurchaseStatus,
                      unit: unit
                    })}
                    {isPurchased || role === 'ADMIN' ? (
                      <>
                        {/* Tab Navigation */}
                        <div className="space-y-1 sm:space-y-2">
                          <button
                            onClick={() => setActiveTab('overview')}
                            className={`w-full text-left p-2 sm:p-3 rounded-lg transition-colors ${
                              activeTab === 'overview'
                                ? 'bg-blue-500 text-white'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <FaEye className="text-sm sm:text-base" />
                              <span className="text-xs sm:text-sm">نظرة عامة</span>
                            </div>
                          </button>

                          <button
                            onClick={() => setActiveTab('video')}
                            className={`w-full text-left p-2 sm:p-3 rounded-lg transition-colors ${
                              activeTab === 'video'
                                ? 'bg-green-500 text-white'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <FaVideo className="text-sm sm:text-base" />
                              <span className="text-xs sm:text-sm">محاضرة فيديو</span>
                            </div>
                          </button>

                          <button
                            onClick={() => setActiveTab('pdf')}
                            className={`w-full text-left p-2 sm:p-3 rounded-lg transition-colors ${
                              activeTab === 'pdf'
                                ? 'bg-blue-500 text-white'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                                <FaFilePdf className="text-sm sm:text-base" />
                                <span className="text-xs sm:text-sm">المادة الدراسية</span>
                            </div>
                          </button>

                                                    <button
                            onClick={() => setActiveTab('training')}
                            className={`w-full text-left p-2 sm:p-3 rounded-lg transition-colors ${
                              activeTab === 'training'
                                ? 'bg-purple-500 text-white'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <FaClipboardCheck className="text-sm sm:text-base" />
                              <span className="text-xs sm:text-sm">امتحان تدريبي</span>
                            </div>
                          </button>

                          <button
                            onClick={() => setActiveTab('final')}
                            className={`w-full text-left p-2 sm:p-3 rounded-lg transition-colors ${
                              activeTab === 'final'
                                ? 'bg-red-500 text-white'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <FaExam className="text-sm sm:text-base" />
                              <span className="text-xs sm:text-sm">الامتحان النهائي</span>
                            </div>
                          </button>
                        </div>
                      </>
                    ) : (
                      /* Preview content for unpurchased lessons */
                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                          <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <FaLock className="text-gray-500 text-sm sm:text-base" />
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">معاينة الدرس</h4>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            اشتر هذا الدرس لفتح جميع المحتويات بما في ذلك الفيديوهات المرئية والمواد الدراسية والامتحانات.
                          </p>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <FaEye className="text-sm sm:text-base" />
                            <span>نظرة عامة على الدرس</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <FaClock className="text-sm sm:text-base" />
                            <span>المدة: {getLessonDuration(lesson)} دقيقة</span>
                          </div>
                          {hasVideo(lesson) && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              <FaVideo className="text-green-500 text-sm sm:text-base" />
                              <span>محاضرة فيديو</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Content */}
                <div className="w-full lg:w-2/3 p-3 sm:p-6 overflow-y-auto">
                  {console.log('Right side - isPurchased:', isPurchased, 'role:', role)}
                  {(isPurchased || role === 'ADMIN') ? (
                    <>
                      {/* Active tab content */}
                      {activeTab === 'overview' && (
                        <div className="space-y-4 sm:space-y-6">
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">نظرة عامة على الدرس</h3>
                          
                          {/* Lesson Description */}
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6">
                            <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">حول هذا الدرس</h4>
                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                              {getLessonDescription(actualLesson)}
                            </p>
                          </div>

                          {/* Lesson Details Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <FaClock className="text-blue-500 text-sm sm:text-base" />
                                <h5 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">المدة</h5>
                              </div>
                                                              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{getLessonDuration(actualLesson)} دقيقة</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <FaDollarSign className="text-green-500 text-sm sm:text-base" />
                                <h5 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">السعر</h5>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{formatPrice(getLessonPrice(actualLesson))}</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <FaVideo className="text-blue-500 text-sm sm:text-base" />
                                <h5 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">الفيديو</h5>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                {hasVideo(actualLesson) ? 'متاح' : 'غير متاح'}
                              </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <FaFilePdf className="text-red-500 text-sm sm:text-base" />
                                <h5 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">المادة الدراسية</h5>
                              </div>
                                                              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                  {hasPdf(actualLesson) ? 'متاح' : 'غير متاح'}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <FaClipboardCheck className="text-purple-500 text-sm sm:text-base" />
                                <h5 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">الامتحان التدريبي</h5>
                              </div>
                                                              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                  {hasTrainingExam(actualLesson) ? 'متاح' : 'غير متاح'}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <FaExam className="text-red-500 text-sm sm:text-base" />
                                <h5 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">الامتحان النهائي</h5>
                              </div>
                                                              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                  {hasFinalExam(actualLesson) ? 'متاح' : 'غير متاح'}
                                </p>
                            </div>
                          </div>

                          {/* Unit Information */}
                          {safeUnit && (
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">معلومات الوحدة</h4>
                              <div className="flex items-center gap-3">
                                <FaFolder className="text-blue-500" />
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-white">{safeUnit.title && typeof safeUnit.title === 'string' ? safeUnit.title : 'Unknown Unit'}</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {safeUnit.description || 'وصف الوحدة غير متاح'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Course Information */}
                          {courseData && (
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">معلومات الدورة</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-white">عنوان الدورة</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{courseData.title}</p>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-white">الفئة</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{courseData.category}</p>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-white">المادة</h5>
                                                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {courseData.subject && typeof courseData.subject === 'object' && courseData.subject.name 
                                        ? courseData.subject.name 
                                        : (courseData.subject && typeof courseData.subject === 'string' 
                                          ? courseData.subject 
                                          : 'مادة غير معروفة')}
                                    </p>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-white">المرحلة</h5>
                                                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {courseData.stage && typeof courseData.stage === 'object' && courseData.stage.name 
                                        ? courseData.stage.name 
                                        : (courseData.stage && typeof courseData.stage === 'string' 
                                          ? courseData.stage 
                                          : 'مرحلة غير معروفة')}
                                    </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'video' && (
                        <div className="space-y-3 sm:space-y-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">محاضرة فيديو</h3>
                          {hasVideo(actualLesson) ? (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                              {/* Video Thumbnail */}
                              {actualLesson.lecture.youtubeUrl && getYouTubeThumbnail(actualLesson.lecture.youtubeUrl) && (
                                <div className="relative mb-4 rounded-lg overflow-hidden">
                                  <img 
                                    src={getYouTubeThumbnail(actualLesson.lecture.youtubeUrl)}
                                    alt="Video thumbnail"
                                    className="w-full h-48 sm:h-56 object-cover rounded-lg"
                                    onError={(e) => {
                                      // Fallback to medium quality if maxresdefault fails
                                      const fallbackUrl = getYouTubeThumbnailFallback(actualLesson.lecture.youtubeUrl);
                                      if (fallbackUrl) {
                                        e.target.src = fallbackUrl;
                                      }
                                    }}
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-black bg-opacity-50 rounded-full p-3">
                                      <FaPlay className="text-white text-2xl" />
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                <FaVideo className="text-lg sm:text-2xl text-blue-500" />
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{actualLesson.lecture.title || 'محاضرة فيديو'}</h4>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{actualLesson.lecture.description || 'محتوى الفيديو'}</p>
                                </div>
                              </div>
                              <button
                                onClick={handleWatchVideo}
                                className="w-full bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                              >
                                <FaPlay className="text-sm sm:text-base" />
                                <span className="hidden sm:inline">مشاهدة الفيديو</span>
                                <span className="sm:hidden">مشاهدة</span>
                              </button>
                            </div>
                          ) : (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 sm:p-6 text-center">
                              <FaVideo className="text-3xl sm:text-4xl text-gray-400 mx-auto mb-3 sm:mb-4" />
                              <h4 className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">لا يوجد فيديو متاح</h4>
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mb-4">لم يتم إضافة محتوى الفيديو لهذا الدرس بعد.</p>
                              {role === 'ADMIN' && onAddVideo && (
                                <button
                                  onClick={() => onAddVideo(lesson, safeUnit)}
                                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
                                >
                                  <FaPlus className="text-sm" />
                                  إضافة فيديو
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'pdf' && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">المادة الدراسية</h3>
                          {hasPdf(actualLesson) ? (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-4">
                                <FaFilePdf className="text-2xl text-red-500" />
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">{actualLesson.pdf.title || 'المادة الدراسية'}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">مستند PDF</p>
                                </div>
                              </div>
                              <button
                                onClick={handleDownloadPdf}
                                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                              >
                                <FaDownload />
                                تحميل PDF
                              </button>
                            </div>
                          ) : (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center">
                              <FaFilePdf className="text-4xl text-gray-400 mx-auto mb-4" />
                              <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">لا توجد مادة دراسية متاحة</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">لم يتم إضافة المواد الدراسية PDF لهذا الدرس بعد.</p>
                              {role === 'ADMIN' && onAddPdf && (
                                <button
                                  onClick={() => onAddPdf(lesson, safeUnit)}
                                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
                                >
                                  <FaPlus className="text-sm" />
                                  إضافة PDF
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'training' && (
                        <div className="space-y-3 sm:space-y-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">الامتحان التدريبي</h3>
                          {hasTrainingExam(actualLesson) ? (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                <FaClipboardCheck className="text-lg sm:text-2xl text-purple-500" />
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">امتحان تدريبي</h4>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{actualLesson.trainingExam.questions.length} سؤال • {actualLesson.trainingExam.timeLimit} دقيقة</p>
                                </div>
                              </div>
                              <div className="space-y-2 mb-3 sm:mb-4">
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                  <FaClock className="text-sm sm:text-base" />
                                  <span>الحد الزمني: {actualLesson.trainingExam.timeLimit} دقيقة</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                  <FaStar className="text-sm sm:text-base" />
                                  <span>الدرجة المطلوبة: {actualLesson.trainingExam.passingScore}%</span>
                                </div>
                              </div>
                              
                              {trainingExamTaken ? (
                                <div className="space-y-3">
                                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700">
                                    <div className="flex items-center gap-2 mb-2">
                                      <FaCheck className="text-green-500 text-sm sm:text-base" />
                                      <span className="text-sm sm:text-base font-medium text-green-700 dark:text-green-300">تم الانتهاء من الامتحان</span>
                                    </div>
                                    <div className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                                      الدرجة: {trainingExamResult?.score}% • {trainingExamResult?.passed ? 'ناجح' : 'راسب'}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleViewExamHistory('training')}
                                      className="flex-1 bg-purple-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                                    >
                                      <FaHistory className="text-sm sm:text-base" />
                                      <span className="hidden sm:inline">عرض التاريخ</span>
                                      <span className="sm:hidden">التاريخ</span>
                                    </button>
                                    <button
                                      onClick={handleStartTrainingExam}
                                      className="flex-1 bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
                                      disabled
                                    >
                                      تم الإجابة عليه
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={handleStartTrainingExam}
                                  className="w-full bg-purple-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                  <FaClipboardCheck className="text-sm sm:text-base" />
                                  <span className="hidden sm:inline">بدء الامتحان التدريبي</span>
                                  <span className="sm:hidden">بدء الامتحان</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 sm:p-6 text-center">
                              <FaClipboardCheck className="text-3xl sm:text-4xl text-gray-400 mx-auto mb-3 sm:mb-4" />
                              <h4 className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">لا يوجد امتحان تدريبي متاح</h4>
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mb-4">لم يتم إضافة الامتحان التدريبي لهذا الدرس بعد.</p>
                              {role === 'ADMIN' && onAddTrainingExam && (
                                <button
                                  onClick={() => onAddTrainingExam(lesson, safeUnit)}
                                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2 mx-auto"
                                >
                                  <FaPlus className="text-sm" />
                                  إضافة امتحان تدريبي
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'final' && (
                        <div className="space-y-3 sm:space-y-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">الامتحان النهائي</h3>
                          {hasFinalExam(actualLesson) ? (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                <FaExam className="text-lg sm:text-2xl text-red-500" />
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">التقييم النهائي</h4>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{actualLesson.finalExam.questions.length} سؤال • {actualLesson.finalExam.timeLimit} دقيقة</p>
                                </div>
                              </div>
                              <div className="space-y-2 mb-3 sm:mb-4">
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                  <FaClock className="text-sm sm:text-base" />
                                  <span>الحد الزمني: {actualLesson.finalExam.timeLimit} دقيقة</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                  <FaStar className="text-sm sm:text-base" />
                                  <span>الدرجة المطلوبة: {actualLesson.finalExam.passingScore}%</span>
                                </div>
                              </div>
                              
                              {finalExamTaken ? (
                                <div className="space-y-3">
                                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700">
                                    <div className="flex items-center gap-2 mb-2">
                                      <FaCheck className="text-green-500 text-sm sm:text-base" />
                                      <span className="text-sm sm:text-base font-medium text-green-700 dark:text-green-300">تم الانتهاء من الامتحان</span>
                                    </div>
                                    <div className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                                      الدرجة: {finalExamResult?.score}% • {finalExamResult?.passed ? 'ناجح' : 'راسب'}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleViewExamHistory('final')}
                                      className="flex-1 bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                                    >
                                      <FaHistory className="text-sm sm:text-base" />
                                      <span className="hidden sm:inline">عرض التاريخ</span>
                                      <span className="sm:hidden">التاريخ</span>
                                    </button>
                                    <button
                                      onClick={handleStartFinalExam}
                                      className="flex-1 bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
                                      disabled
                                    >
                                      تم الإجابة عليه
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={handleStartFinalExam}
                                  className="w-full bg-red-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                  <FaExam className="text-sm sm:text-base" />
                                  <span className="hidden sm:inline">بدء الامتحان النهائي</span>
                                  <span className="sm:hidden">بدء الامتحان</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 sm:p-6 text-center">
                              <FaExam className="text-3xl sm:text-4xl text-gray-400 mx-auto mb-3 sm:mb-4" />
                              <h4 className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">لا يوجد امتحان نهائي متاح</h4>
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mb-4">لم يتم إضافة الامتحان النهائي لهذا الدرس بعد.</p>
                              {role === 'ADMIN' && onAddFinalExam && (
                                <button
                                  onClick={() => onAddFinalExam(lesson, safeUnit)}
                                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 mx-auto"
                                >
                                  <FaPlus className="text-sm" />
                                  إضافة امتحان نهائي
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    /* Locked content message for unpurchased lessons */
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <FaLock className="text-lg sm:text-2xl text-gray-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          المحتوى مقفل
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                          اشتر هذا الدرس لفتح جميع المحتويات بما في ذلك الدروسالمرئية والمواد الدراسية والامتحانات.
                        </p>
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg">
                          <p className="font-semibold text-sm sm:text-base">{formatPrice(lessonPrice)}</p>
                          <p className="text-xs sm:text-sm opacity-90">اضغط على "شراء الدرس" أدناه للفتح</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer - Purchase Section - Only show if not purchased */}
          {!isPurchased && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">السعر</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(lessonPrice)}
                    </p>
                  </div>
                  {role === 'USER' && (
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">رصيدك</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        {formatPrice(balance)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {role === 'ADMIN' ? (
                    <button
                      onClick={onClose}
                      className="bg-green-500 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center gap-2 text-sm sm:text-base"
                    >
                      <FaUnlock className="text-sm sm:text-base" />
                      <span className="hidden sm:inline">الوصول للمحتوى</span>
                      <span className="sm:hidden">الوصول</span>
                    </button>
                  ) : (
                    <button
                      onClick={handlePurchase}
                      disabled={!canAfford || purchaseLoading}
                      className={`px-4 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 text-sm sm:text-base ${
                        canAfford
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {purchaseLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span className="hidden sm:inline">جاري الشراء...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : (
                        <>
                          <FaShoppingCart className="text-sm sm:text-base" />
                          <span className="hidden sm:inline">شراء الدرس</span>
                          <span className="sm:hidden">شراء</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer - Already Purchased Section */}
          {isPurchased && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center justify-center">
                <button
                  onClick={onClose}
                  className="bg-green-500 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center gap-2 text-sm sm:text-base"
                >
                  <FaCheck className="text-sm sm:text-base" />
                  <span className="hidden sm:inline">تم الشراء مسبقاً - الوصول للمحتوى</span>
                  <span className="sm:hidden">تم الشراء مسبقاً</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Video Player Modal */}
      {showVideoModal && lesson && hasVideo(lesson) && (
        <CustomVideoPlayer
                      video={actualLesson.lecture}
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
                      courseTitle={courseData?.title || getLessonTitle(actualLesson) || "Lesson Video"}
          userName="User"
          courseId={courseData?._id}
          showProgress={true}
        />
      )}

      {/* Take Exam Modal */}
      {showExamModal && lesson && (
        <TakeExamModal
          isOpen={showExamModal}
          onClose={() => setShowExamModal(false)}
                      lesson={actualLesson}
          courseId={courseData?._id}
                                        unitId={safeUnit?._id}
          examType={examType}
        />
      )}

      {/* Exam History Modal */}
      {showExamHistory && examHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90] p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <FaHistory className="text-2xl text-blue-500" />
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    تاريخ الامتحان
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getLessonTitle(actualLesson)} • {examHistory.examType === 'training' ? 'تدريبي' : 'نهائي'} امتحان
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExamHistory(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaTimes className="text-gray-500 text-xl" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Score Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 sm:p-6">
                  <div className="text-center">
                    <div className={`text-4xl sm:text-5xl font-bold mb-2 ${examHistory.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {examHistory.score}%
                    </div>
                    <div className={`text-lg font-semibold mb-2 ${examHistory.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {examHistory.passed ? 'ناجح' : 'راسب'}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {examHistory.correctAnswers} من أصل {examHistory.totalQuestions} سؤال صحيح
                    </p>
                  </div>
                </div>

                {/* Exam Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <FaClock className="text-blue-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">الوقت المستغرق</h4>
                    </div>
                                          <p className="text-gray-600 dark:text-gray-400">{examHistory.timeTaken} دقيقة</p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <FaStar className="text-yellow-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">الدرجة المطلوبة</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{examHistory.passingScore}%</p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <FaCheck className="text-green-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">الإجابات الصحيحة</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{examHistory.correctAnswers}</p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <FaTimes className="text-red-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">الإجابات الخاطئة</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{examHistory.wrongAnswers}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCalendarAlt className="text-gray-500" />
                                          <h4 className="font-semibold text-gray-900 dark:text-white">تاريخ الامتحان</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(examHistory.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LessonDetailModal; 