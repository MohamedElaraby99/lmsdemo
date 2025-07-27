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
  FaFolder
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
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
  courseData
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isLoadingPurchaseStatus, setIsLoadingPurchaseStatus] = useState(true);
  const [showExamModal, setShowExamModal] = useState(false);
  const [examType, setExamType] = useState('training');

  // Check purchase status when modal opens
  useEffect(() => {
    if (isOpen && lesson) {
      // Give a small delay to allow purchase data to load
      const timer = setTimeout(() => {
        setIsLoadingPurchaseStatus(false);
      }, 1000); // Increased delay to ensure purchase data is loaded
      
      return () => clearTimeout(timer);
    } else {
      setIsLoadingPurchaseStatus(true);
    }
  }, [isOpen, lesson]);

  const hasVideo = (lesson) => {
    return lesson.lecture && (lesson.lecture.secure_url || lesson.lecture.youtubeUrl);
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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaPlay className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {lesson.title}
                </h2>
                {unit && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Unit: {unit.title}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FaTimes className="text-gray-500 text-xl" />
            </button>
          </div>

          {/* Content */}
          <div className="flex h-[calc(90vh-200px)]">
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
                <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Lesson Content</h3>
                    
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
                        <div className="space-y-2">
                          <button
                            onClick={() => setActiveTab('overview')}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                              activeTab === 'overview'
                                ? 'bg-blue-500 text-white'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <FaEye />
                              <span>Overview</span>
                            </div>
                          </button>

                          <button
                            onClick={() => setActiveTab('video')}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                              activeTab === 'video'
                                ? 'bg-green-500 text-white'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <FaVideo />
                              <span>Video Lecture</span>
                            </div>
                          </button>

                          <button
                            onClick={() => setActiveTab('pdf')}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                              activeTab === 'pdf'
                                ? 'bg-blue-500 text-white'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                                <FaFilePdf />
                                <span>Study Material</span>
                            </div>
                          </button>

                          <button
                            onClick={() => setActiveTab('training')}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                              activeTab === 'training'
                                ? 'bg-purple-500 text-white'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                                <FaClipboardCheck />
                                <span>Training Exam</span>
                            </div>
                          </button>

                          <button
                            onClick={() => setActiveTab('final')}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                              activeTab === 'final'
                                ? 'bg-red-500 text-white'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                                <FaExam />
                                <span>Final Exam</span>
                            </div>
                          </button>
                        </div>
                      </>
                    ) : (
                      /* Preview content for unpurchased lessons */
                      <div className="space-y-4">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <FaLock className="text-gray-500" />
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">Lesson Preview</h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Purchase this lesson to unlock all content including video lectures, study materials, and exams.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <FaEye />
                            <span>Lesson Overview</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <FaClock />
                            <span>Duration: {lesson.duration || '0'} minutes</span>
                          </div>
                          {hasVideo(lesson) && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <FaVideo className="text-green-500" />
                              <span>Video Lecture</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Content */}
                <div className="w-2/3 p-6 overflow-y-auto">
                  {console.log('Right side - isPurchased:', isPurchased, 'role:', role)}
                  {(isPurchased || role === 'ADMIN') ? (
                    <>
                      {/* Active tab content */}
                      {activeTab === 'overview' && (
                        <div className="space-y-6">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Lesson Overview</h3>
                          
                          {/* Lesson Description */}
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About this lesson</h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              {lesson.description || 'No description available for this lesson.'}
                            </p>
                          </div>

                          {/* Lesson Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-3 mb-3">
                                <FaClock className="text-blue-500" />
                                <h5 className="font-semibold text-gray-900 dark:text-white">Duration</h5>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400">{lesson.duration || '0'} minutes</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-3 mb-3">
                                <FaDollarSign className="text-green-500" />
                                <h5 className="font-semibold text-gray-900 dark:text-white">Price</h5>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400">{formatPrice(lesson.price || 0)}</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-3 mb-3">
                                <FaVideo className="text-blue-500" />
                                <h5 className="font-semibold text-gray-900 dark:text-white">Video</h5>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400">
                                {hasVideo(lesson) ? 'Available' : 'Not available'}
                              </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-3 mb-3">
                                <FaFilePdf className="text-red-500" />
                                <h5 className="font-semibold text-gray-900 dark:text-white">Study Material</h5>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400">
                                {hasPdf(lesson) ? 'Available' : 'Not available'}
                              </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-3 mb-3">
                                <FaClipboardCheck className="text-purple-500" />
                                <h5 className="font-semibold text-gray-900 dark:text-white">Training Exam</h5>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400">
                                {hasTrainingExam(lesson) ? 'Available' : 'Not available'}
                              </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center gap-3 mb-3">
                                <FaExam className="text-red-500" />
                                <h5 className="font-semibold text-gray-900 dark:text-white">Final Exam</h5>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400">
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
                                  <h5 className="font-medium text-gray-900 dark:text-white">{unit.title}</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {unit.description || 'Unit description not available'}
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
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{courseData.stage}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'video' && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Video Lecture</h3>
                          {hasVideo(lesson) ? (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-4">
                                <FaVideo className="text-2xl text-blue-500" />
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">{lesson.lecture.title || 'Video Lecture'}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{lesson.lecture.description || 'Video content'}</p>
                                </div>
                              </div>
                              <button
                                onClick={handleWatchVideo}
                                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                              >
                                <FaPlay />
                                Watch Video
                              </button>
                            </div>
                          ) : (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center">
                              <FaVideo className="text-4xl text-gray-400 mx-auto mb-4" />
                              <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No Video Available</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-500">Video content has not been added to this lesson yet.</p>
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
                              <p className="text-sm text-gray-500 dark:text-gray-500">PDF study materials have not been added to this lesson yet.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'training' && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Training Exam</h3>
                          {hasTrainingExam(lesson) ? (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-4">
                                <FaClipboardCheck className="text-2xl text-purple-500" />
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">Practice Exam</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{lesson.trainingExam.questions.length} questions • {lesson.trainingExam.timeLimit} minutes</p>
                                </div>
                              </div>
                              <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <FaClock />
                                  <span>Time Limit: {lesson.trainingExam.timeLimit} minutes</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <FaStar />
                                  <span>Passing Score: {lesson.trainingExam.passingScore}%</span>
                                </div>
                              </div>
                              <button
                                onClick={handleStartTrainingExam}
                                className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                              >
                                Start Training Exam
                              </button>
                            </div>
                          ) : (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center">
                              <FaClipboardCheck className="text-4xl text-gray-400 mx-auto mb-4" />
                              <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No Training Exam Available</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-500">Training exam has not been added to this lesson yet.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'final' && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Final Exam</h3>
                          {hasFinalExam(lesson) ? (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-4">
                                <FaExam className="text-2xl text-red-500" />
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">Final Assessment</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{lesson.finalExam.questions.length} questions • {lesson.finalExam.timeLimit} minutes</p>
                                </div>
                              </div>
                              <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <FaClock />
                                  <span>Time Limit: {lesson.finalExam.timeLimit} minutes</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <FaStar />
                                  <span>Passing Score: {lesson.finalExam.passingScore}%</span>
                                </div>
                              </div>
                              <button
                                onClick={handleStartFinalExam}
                                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                              >
                                Start Final Exam
                              </button>
                            </div>
                          ) : (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center">
                              <FaExam className="text-4xl text-gray-400 mx-auto mb-4" />
                              <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No Final Exam Available</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-500">Final exam has not been added to this lesson yet.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    /* Locked content message for unpurchased lessons */
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FaLock className="text-2xl text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Content Locked
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          Purchase this lesson to unlock all content including video lectures, study materials, and exams.
                        </p>
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg">
                          <p className="font-semibold">{formatPrice(lessonPrice)}</p>
                          <p className="text-sm opacity-90">Click "Purchase Lesson" below to unlock</p>
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
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(lessonPrice)}
                    </p>
                  </div>
                  {role === 'USER' && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Your Balance</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatPrice(balance)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {role === 'ADMIN' ? (
                    <button
                      onClick={onClose}
                      className="bg-green-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
                    >
                      <FaUnlock />
                      Access Content
                    </button>
                  ) : (
                    <button
                      onClick={handlePurchase}
                      disabled={!canAfford || purchaseLoading}
                      className={`px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 ${
                        canAfford
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {purchaseLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Purchasing...
                        </>
                      ) : (
                        <>
                          <FaShoppingCart />
                          Purchase Lesson
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
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center justify-center">
                <button
                  onClick={onClose}
                  className="bg-green-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <FaCheck />
                  Already Purchased - Access Content
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
    </>
  );
};

export default LessonDetailModal; 