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
  isPurchased, 
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

  // Check purchase status and exam status when modal opens
  useEffect(() => {
    if (isOpen && lesson && courseData) {
      // Check exam status
      const checkExamStatus = async () => {
        try {
          // Check training exam
          if (hasTrainingExam(lesson)) {
            const trainingResponse = await axiosInstance.get(`/exams/check/${courseData._id}/${lesson._id}/training`);
            const { hasTaken: trainingTaken, result: trainingResult } = trainingResponse.data.data;
            setTrainingExamTaken(trainingTaken);
            setTrainingExamResult(trainingResult);
          }

          // Check final exam
          if (hasFinalExam(lesson)) {
            const finalResponse = await axiosInstance.get(`/exams/check/${courseData._id}/${lesson._id}/final`);
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

  const handlePurchase = () => {
    if (role === 'ADMIN') {
      toast.success('Admin can access all content');
      onClose();
      return;
    }
    
    if (isPurchased) {
      toast.success('You already own this lesson');
      onClose();
      return;
    }

    if (!canAfford) {
      toast.error('Insufficient balance');
      return;
    }

    // Call the purchase function - the modal will be updated when purchase is successful
    onPurchase(lesson);
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
        toast.error('No exam history found for this lesson');
      }
    } catch (error) {
      console.error('Error fetching exam history:', error);
      toast.error('Failed to load exam history');
    } finally {
      setLoadingHistory(false);
    }
  };

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
                  {lesson.title}
                </h2>
                {unit && (
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    Unit: {typeof unit === 'object' && unit.title ? unit.title : unit}
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
                  <p className="text-gray-600 dark:text-gray-400">Checking purchase status...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Left Side - Tabs */}
                <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">Lesson Content</h3>
                    
                    {/* Show different content based on purchase status */}
                    {console.log('LessonDetailModal Debug:', {
                      isPurchased,
                      role,
                      lessonId: lesson?._id || lesson?.id,
                      lessonTitle: lesson?.title,
                      isLoadingPurchaseStatus
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
                              <span className="text-xs sm:text-sm">Overview</span>
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
                              <span className="text-xs sm:text-sm">Video Lecture</span>
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
                                <span className="text-xs sm:text-sm">Study Material</span>
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
                              <span className="text-xs sm:text-sm">Training Exam</span>
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
                              <span className="text-xs sm:text-sm">Final Exam</span>
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
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">Lesson Preview</h4>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Purchase this lesson to unlock all content including video lectures, study materials, and exams.
                          </p>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <FaEye className="text-sm sm:text-base" />
                            <span>Lesson Overview</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <FaClock className="text-sm sm:text-base" />
                            <span>Duration: {lesson.duration || '0'} minutes</span>
                          </div>
                          {hasVideo(lesson) && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              <FaVideo className="text-green-500 text-sm sm:text-base" />
                              <span>Video Lecture</span>
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
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Lesson Overview</h3>
                          
                          {/* Lesson Description */}
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6">
                            <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">About this lesson</h4>
                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                              {lesson.description || 'No description available for this lesson.'}
                            </p>
                          </div>

                          {/* Lesson Details Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <FaClock className="text-blue-500 text-sm sm:text-base" />
                                <h5 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Duration</h5>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{lesson.duration || '0'} minutes</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <FaDollarSign className="text-green-500 text-sm sm:text-base" />
                                <h5 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Price</h5>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{formatPrice(lesson.price || 0)}</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <FaVideo className="text-blue-500 text-sm sm:text-base" />
                                <h5 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Video</h5>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                {hasVideo(lesson) ? 'Available' : 'Not available'}
                              </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <FaFilePdf className="text-red-500 text-sm sm:text-base" />
                                <h5 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Study Material</h5>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                {hasPdf(lesson) ? 'Available' : 'Not available'}
                              </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <FaClipboardCheck className="text-purple-500 text-sm sm:text-base" />
                                <h5 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Training Exam</h5>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                {hasTrainingExam(lesson) ? 'Available' : 'Not available'}
                              </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <FaExam className="text-red-500 text-sm sm:text-base" />
                                <h5 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Final Exam</h5>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                {hasFinalExam(lesson) ? 'Available' : 'Not available'}
                              </p>
                            </div>
                          </div>

                          {/* Unit Information */}
                          {unit && (
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Unit Information</h4>
                              <div className="flex items-center gap-3">
                                <FaFolder className="text-blue-500" />
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-white">{typeof unit === 'object' && unit.title ? unit.title : unit}</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {typeof unit === 'object' && unit.description ? unit.description : 'Unit description not available'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Course Information */}
                          {courseData && (
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Course Information</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-white">Course Title</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{courseData.title}</p>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-white">Category</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{courseData.category}</p>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-white">Subject</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{courseData.subject?.name || courseData.subject}</p>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-white">Stage</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{typeof courseData.stage === 'object' && courseData.stage.name ? courseData.stage.name : courseData.stage}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'video' && (
                        <div className="space-y-3 sm:space-y-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Video Lecture</h3>
                          {hasVideo(lesson) ? (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                              {/* Video Thumbnail */}
                              {lesson.lecture.youtubeUrl && getYouTubeThumbnail(lesson.lecture.youtubeUrl) && (
                                <div className="relative mb-4 rounded-lg overflow-hidden">
                                  <img 
                                    src={getYouTubeThumbnail(lesson.lecture.youtubeUrl)}
                                    alt="Video thumbnail"
                                    className="w-full h-48 sm:h-56 object-cover rounded-lg"
                                    onError={(e) => {
                                      // Fallback to medium quality if maxresdefault fails
                                      const fallbackUrl = getYouTubeThumbnailFallback(lesson.lecture.youtubeUrl);
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
                                  <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{lesson.lecture.title || 'Video Lecture'}</h4>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{lesson.lecture.description || 'Video content'}</p>
                                </div>
                              </div>
                              <button
                                onClick={handleWatchVideo}
                                className="w-full bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                              >
                                <FaPlay className="text-sm sm:text-base" />
                                <span className="hidden sm:inline">Watch Video</span>
                                <span className="sm:hidden">Watch</span>
                              </button>
                            </div>
                          ) : (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 sm:p-6 text-center">
                              <FaVideo className="text-3xl sm:text-4xl text-gray-400 mx-auto mb-3 sm:mb-4" />
                              <h4 className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No Video Available</h4>
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mb-4">Video content has not been added to this lesson yet.</p>
                              {role === 'ADMIN' && onAddVideo && (
                                <button
                                  onClick={() => onAddVideo(lesson, unit)}
                                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
                                >
                                  <FaPlus className="text-sm" />
                                  Add Video
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'pdf' && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Study Material</h3>
                          {hasPdf(lesson) ? (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-4">
                                <FaFilePdf className="text-2xl text-red-500" />
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">{lesson.pdf.title || 'Study Material'}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">PDF Document</p>
                                </div>
                              </div>
                              <button
                                onClick={handleDownloadPdf}
                                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                              >
                                <FaDownload />
                                Download PDF
                              </button>
                            </div>
                          ) : (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center">
                              <FaFilePdf className="text-4xl text-gray-400 mx-auto mb-4" />
                              <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No Study Material Available</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">PDF study materials have not been added to this lesson yet.</p>
                              {role === 'ADMIN' && onAddPdf && (
                                <button
                                  onClick={() => onAddPdf(lesson, unit)}
                                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
                                >
                                  <FaPlus className="text-sm" />
                                  Add PDF
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'training' && (
                        <div className="space-y-3 sm:space-y-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Training Exam</h3>
                          {hasTrainingExam(lesson) ? (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                <FaClipboardCheck className="text-lg sm:text-2xl text-purple-500" />
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Practice Exam</h4>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{lesson.trainingExam.questions.length} questions • {lesson.trainingExam.timeLimit} minutes</p>
                                </div>
                              </div>
                              <div className="space-y-2 mb-3 sm:mb-4">
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                  <FaClock className="text-sm sm:text-base" />
                                  <span>Time Limit: {lesson.trainingExam.timeLimit} minutes</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                  <FaStar className="text-sm sm:text-base" />
                                  <span>Passing Score: {lesson.trainingExam.passingScore}%</span>
                                </div>
                              </div>
                              
                              {trainingExamTaken ? (
                                <div className="space-y-3">
                                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700">
                                    <div className="flex items-center gap-2 mb-2">
                                      <FaCheck className="text-green-500 text-sm sm:text-base" />
                                      <span className="text-sm sm:text-base font-medium text-green-700 dark:text-green-300">Exam Completed</span>
                                    </div>
                                    <div className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                                      Score: {trainingExamResult?.score}% • {trainingExamResult?.passed ? 'PASSED' : 'FAILED'}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleViewExamHistory('training')}
                                      className="flex-1 bg-purple-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                                    >
                                      <FaHistory className="text-sm sm:text-base" />
                                      <span className="hidden sm:inline">View History</span>
                                      <span className="sm:hidden">History</span>
                                    </button>
                                    <button
                                      onClick={handleStartTrainingExam}
                                      className="flex-1 bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
                                      disabled
                                    >
                                      Already Taken
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={handleStartTrainingExam}
                                  className="w-full bg-purple-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                  <FaClipboardCheck className="text-sm sm:text-base" />
                                  <span className="hidden sm:inline">Start Training Exam</span>
                                  <span className="sm:hidden">Start Exam</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 sm:p-6 text-center">
                              <FaClipboardCheck className="text-3xl sm:text-4xl text-gray-400 mx-auto mb-3 sm:mb-4" />
                              <h4 className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No Training Exam Available</h4>
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mb-4">Training exam has not been added to this lesson yet.</p>
                              {role === 'ADMIN' && onAddTrainingExam && (
                                <button
                                  onClick={() => onAddTrainingExam(lesson, unit)}
                                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2 mx-auto"
                                >
                                  <FaPlus className="text-sm" />
                                  Add Training Exam
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'final' && (
                        <div className="space-y-3 sm:space-y-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Final Exam</h3>
                          {hasFinalExam(lesson) ? (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                <FaExam className="text-lg sm:text-2xl text-red-500" />
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Final Assessment</h4>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{lesson.finalExam.questions.length} questions • {lesson.finalExam.timeLimit} minutes</p>
                                </div>
                              </div>
                              <div className="space-y-2 mb-3 sm:mb-4">
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                  <FaClock className="text-sm sm:text-base" />
                                  <span>Time Limit: {lesson.finalExam.timeLimit} minutes</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                  <FaStar className="text-sm sm:text-base" />
                                  <span>Passing Score: {lesson.finalExam.passingScore}%</span>
                                </div>
                              </div>
                              
                              {finalExamTaken ? (
                                <div className="space-y-3">
                                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700">
                                    <div className="flex items-center gap-2 mb-2">
                                      <FaCheck className="text-green-500 text-sm sm:text-base" />
                                      <span className="text-sm sm:text-base font-medium text-green-700 dark:text-green-300">Exam Completed</span>
                                    </div>
                                    <div className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                                      Score: {finalExamResult?.score}% • {finalExamResult?.passed ? 'PASSED' : 'FAILED'}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleViewExamHistory('final')}
                                      className="flex-1 bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                                    >
                                      <FaHistory className="text-sm sm:text-base" />
                                      <span className="hidden sm:inline">View History</span>
                                      <span className="sm:hidden">History</span>
                                    </button>
                                    <button
                                      onClick={handleStartFinalExam}
                                      className="flex-1 bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
                                      disabled
                                    >
                                      Already Taken
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={handleStartFinalExam}
                                  className="w-full bg-red-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                  <FaExam className="text-sm sm:text-base" />
                                  <span className="hidden sm:inline">Start Final Exam</span>
                                  <span className="sm:hidden">Start Exam</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 sm:p-6 text-center">
                              <FaExam className="text-3xl sm:text-4xl text-gray-400 mx-auto mb-3 sm:mb-4" />
                              <h4 className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No Final Exam Available</h4>
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mb-4">Final exam has not been added to this lesson yet.</p>
                              {role === 'ADMIN' && onAddFinalExam && (
                                <button
                                  onClick={() => onAddFinalExam(lesson, unit)}
                                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 mx-auto"
                                >
                                  <FaPlus className="text-sm" />
                                  Add Final Exam
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
                          Content Locked
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                          Purchase this lesson to unlock all content including video lectures, study materials, and exams.
                        </p>
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg">
                          <p className="font-semibold text-sm sm:text-base">{formatPrice(lessonPrice)}</p>
                          <p className="text-xs sm:text-sm opacity-90">Click "Purchase Lesson" below to unlock</p>
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
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Price</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(lessonPrice)}
                    </p>
                  </div>
                  {role === 'USER' && (
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Your Balance</p>
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
                      <span className="hidden sm:inline">Access Content</span>
                      <span className="sm:hidden">Access</span>
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
                          <span className="hidden sm:inline">Purchasing...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : (
                        <>
                          <FaShoppingCart className="text-sm sm:text-base" />
                          <span className="hidden sm:inline">Purchase Lesson</span>
                          <span className="sm:hidden">Purchase</span>
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
                  <span className="hidden sm:inline">Already Purchased - Access Content</span>
                  <span className="sm:hidden">Already Purchased</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Video Player Modal */}
      {showVideoModal && lesson && hasVideo(lesson) && (
        <CustomVideoPlayer
          video={lesson.lecture}
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          courseTitle={courseData?.title || lesson.title || "Lesson Video"}
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
          lesson={lesson}
          courseId={courseData?._id}
          unitId={unit?._id}
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
                    Exam History
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {lesson.title} • {examHistory.examType === 'training' ? 'Training' : 'Final'} Exam
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
                      {examHistory.passed ? 'PASSED' : 'FAILED'}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {examHistory.correctAnswers} out of {examHistory.totalQuestions} questions correct
                    </p>
                  </div>
                </div>

                {/* Exam Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <FaClock className="text-blue-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Time Taken</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{examHistory.timeTaken} minutes</p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <FaStar className="text-yellow-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Passing Score</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{examHistory.passingScore}%</p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <FaCheck className="text-green-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Correct Answers</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{examHistory.correctAnswers}</p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <FaTimes className="text-red-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Wrong Answers</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{examHistory.wrongAnswers}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCalendarAlt className="text-gray-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Exam Date</h4>
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