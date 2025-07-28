import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
import Layout from '../../Layout/Layout';
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
  FaEdit,
  FaTimes,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaYoutube,
  FaUpload
} from 'react-icons/fa';
import { fetchCourseById } from '../../Redux/Slices/CourseSlice';
import LessonDetailModal from '../../Components/LessonDetailModal';
import LessonCard from '../../Components/Course/LessonCard';
import UnitCard from '../../Components/Course/UnitCard';
import UnifiedStructureList from '../../Components/Course/UnifiedStructureList';
import DirectLessonsList from '../../Components/Course/DirectLessonsList';
import CourseOverview from '../../Components/Course/CourseOverview';

export default function DisplayLecture() {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { courseData, loading, error } = useSelector((state) => state.course);
  const role = user?.role || 'USER';

  // Get course data from location state if available
  const courseFromState = location.state;

  // State for modals
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [showLessonDetailModal, setShowLessonDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // State for selected items
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // State for forms
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    isScheduled: false,
    scheduledPublishDate: ''
  });

  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    duration: '',
    price: '',
    isScheduled: false,
    scheduledPublishDate: ''
  });

  // State for confirmation modal
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  // Fetch course data
  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(id));
    }
  }, [dispatch, id]);

  // Use course data from state if available, otherwise use from Redux
  const currentCourseData = courseFromState || courseData;

  // Helper functions
  const hasVideo = (lesson) => {
    return lesson.video && (lesson.video.youtubeUrl || lesson.video.fileUrl);
  };

  const hasPdf = (lesson) => {
    return lesson.pdf && lesson.pdf.fileUrl;
  };

  const hasTrainingExam = (lesson) => {
    return lesson.trainingExam && lesson.trainingExam.questions && lesson.trainingExam.questions.length > 0;
  };

  const hasFinalExam = (lesson) => {
    return lesson.finalExam && lesson.finalExam.questions && lesson.finalExam.questions.length > 0;
  };

  const getLessonTitle = (lesson) => {
    return typeof lesson.title === 'string' ? lesson.title : lesson.title?.title || 'بدون عنوان';
  };

  const getLessonDescription = (lesson) => {
    return typeof lesson.description === 'string' ? lesson.description : lesson.description?.description || 'لا يوجد وصف';
  };

  const getLessonDuration = (lesson) => {
    return typeof lesson.duration === 'number' ? lesson.duration : lesson.duration?.duration || 0;
  };

  const getLessonPrice = (lesson) => {
    return typeof lesson.price === 'number' ? lesson.price : lesson.price?.price || 0;
  };

  const getAllLessons = () => {
    const lessons = [];
    
    // Add lessons from units
    if (currentCourseData?.units) {
      currentCourseData.units.forEach(unit => {
        if (unit.lessons) {
          unit.lessons.forEach(lesson => {
            lessons.push({ ...lesson, unitTitle: unit.title });
          });
        }
      });
    }
    
    // Add direct lessons
    if (currentCourseData?.directLessons) {
      currentCourseData.directLessons.forEach(lesson => {
        lessons.push(lesson);
      });
    }
    
    return lessons;
  };

  // Modal handlers
  const openVideoModal = (lesson) => {
    setSelectedLesson(lesson);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedLesson(null);
  };

  const openAddVideoModal = (lesson, unit = null) => {
    setSelectedLesson(lesson);
    setSelectedUnit(unit);
    setVideoForm({
      title: '',
      description: '',
      youtubeUrl: '',
      isScheduled: false,
      scheduledPublishDate: ''
    });
    setShowAddVideoModal(true);
  };

  const closeAddVideoModal = () => {
    setShowAddVideoModal(false);
    setSelectedLesson(null);
    setSelectedUnit(null);
  };

  const openLessonDetailModal = (lesson, unit = null) => {
    setSelectedLesson(lesson);
    setSelectedUnit(unit);
    setShowLessonDetailModal(true);
  };

  const closeLessonDetailModal = () => {
    setShowLessonDetailModal(false);
    setSelectedLesson(null);
    setSelectedUnit(null);
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    // Implementation for adding video
    closeAddVideoModal();
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle file upload
    }
  };

  const formatPrice = (price) => {
    return `${price} نقطة`;
  };

  const getPriceBadgeColor = (price) => {
    if (price === 0) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (price <= 50) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    if (price <= 100) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  const isLessonPurchasedByUser = (lesson) => {
    // Implementation for checking if lesson is purchased
    return false;
  };

  const canAffordLesson = (lesson) => {
    // Implementation for checking if user can afford lesson
    return true;
  };

  const handlePurchaseLesson = async (lesson) => {
    // Implementation for purchasing lesson
  };

  if (loading && !courseFromState) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل الدورة...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !courseFromState) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">خطأ في تحميل الدورة</h2>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentCourseData) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">لم يتم العثور على الدورة</h2>
            <p className="text-gray-600 dark:text-gray-400">الدورة غير موجودة أو تم حذفها</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Course Header */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                  {currentCourseData.title}
                </h1>
                <p className="text-lg text-blue-100 mb-6">
                  {currentCourseData.description}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <FaClock />
                    {currentCourseData.duration || 0} دقيقة
                  </span>
                  <span className="flex items-center gap-2">
                    <FaPlay />
                    {getAllLessons().length} درس
                  </span>
                  {currentCourseData.price > 0 && (
                    <span className="flex items-center gap-2">
                      <FaGem />
                      {formatPrice(currentCourseData.price)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                {currentCourseData.thumbnail ? (
                  <img
                    src={currentCourseData.thumbnail}
                    alt={currentCourseData.title}
                    className="w-64 h-48 object-cover rounded-lg shadow-2xl"
                  />
                ) : (
                  <div className="w-64 h-48 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    <FaPlay className="text-4xl text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Course Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Admin View */}
            {role === 'ADMIN' && (
              <>
                {/* Course Overview */}
                <CourseOverview 
                  courseData={currentCourseData}
                  getAllLessons={getAllLessons}
                  getTotalLessons={() => getAllLessons().length}
                />

                {/* Unified Structure Section */}
                {currentCourseData.unifiedStructure && currentCourseData.unifiedStructure.length > 0 && (
                  <UnifiedStructureList 
                    unifiedStructure={currentCourseData.unifiedStructure}
                    role={role}
                    onLessonDetail={openLessonDetailModal}
                    onAddVideo={openAddVideoModal}
                    getLessonTitle={getLessonTitle}
                    getLessonDescription={getLessonDescription}
                    getLessonDuration={getLessonDuration}
                    getLessonPrice={getLessonPrice}
                    hasVideo={hasVideo}
                    hasPdf={hasPdf}
                    hasTrainingExam={hasTrainingExam}
                    hasFinalExam={hasFinalExam}
                    isLessonPurchasedByUser={isLessonPurchasedByUser}
                    canAffordLesson={canAffordLesson}
                    formatPrice={formatPrice}
                    getPriceBadgeColor={getPriceBadgeColor}
                  />
                )}

                {/* Units Section */}
                {currentCourseData.units && currentCourseData.units.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">الوحدات</h2>
                    {currentCourseData.units.map((unit, index) => (
                      <UnitCard 
                        key={unit._id || index}
                        unit={unit}
                        role={role}
                        onLessonDetail={openLessonDetailModal}
                        onAddVideo={openAddVideoModal}
                        getLessonTitle={getLessonTitle}
                        getLessonDescription={getLessonDescription}
                        getLessonDuration={getLessonDuration}
                        getLessonPrice={getLessonPrice}
                        hasVideo={hasVideo}
                        hasPdf={hasPdf}
                        hasTrainingExam={hasTrainingExam}
                        hasFinalExam={hasFinalExam}
                        isLessonPurchasedByUser={isLessonPurchasedByUser}
                        canAffordLesson={canAffordLesson}
                        formatPrice={formatPrice}
                        getPriceBadgeColor={getPriceBadgeColor}
                      />
                    ))}
                  </div>
                )}

                {/* Direct Lessons Section */}
                {currentCourseData.directLessons && currentCourseData.directLessons.length > 0 && (
                  <DirectLessonsList 
                    directLessons={currentCourseData.directLessons}
                    role={role}
                    onLessonDetail={openLessonDetailModal}
                    onAddVideo={openAddVideoModal}
                    getLessonTitle={getLessonTitle}
                    getLessonDescription={getLessonDescription}
                    getLessonDuration={getLessonDuration}
                    getLessonPrice={getLessonPrice}
                    hasVideo={hasVideo}
                    hasPdf={hasPdf}
                    hasTrainingExam={hasTrainingExam}
                    hasFinalExam={hasFinalExam}
                    isLessonPurchasedByUser={isLessonPurchasedByUser}
                    canAffordLesson={canAffordLesson}
                    formatPrice={formatPrice}
                    getPriceBadgeColor={getPriceBadgeColor}
                  />
                )}
              </>
            )}

            {/* User View - Simplified Lessons List */}
            {role === 'USER' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    دروس الدورة
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    اختر الدرس الذي تريد مشاهدته أو شراؤه
                  </p>
                </div>

                {/* All Lessons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getAllLessons().map((lesson, index) => (
                    <LessonCard 
                      key={lesson._id || lesson.id || index}
                      lesson={lesson}
                      role={role}
                      onDetail={openLessonDetailModal}
                      onAddVideo={openAddVideoModal}
                      isPurchased={isLessonPurchasedByUser(lesson)}
                      canAfford={canAffordLesson(lesson)}
                      onPurchase={handlePurchaseLesson}
                      getLessonTitle={getLessonTitle}
                      getLessonDescription={getLessonDescription}
                      getLessonDuration={getLessonDuration}
                      getLessonPrice={getLessonPrice}
                      hasVideo={hasVideo}
                      hasPdf={hasPdf}
                      hasTrainingExam={hasTrainingExam}
                      hasFinalExam={hasFinalExam}
                      formatPrice={formatPrice}
                      getPriceBadgeColor={getPriceBadgeColor}
                    />
                  ))}
                </div>

                {/* Empty State */}
                {getAllLessons().length === 0 && (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <FaPlay className="text-4xl text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      لا توجد دروس متاحة حالياً
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400">
                      سيتم إضافة الدروس قريباً
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Modals */}
        {showLessonDetailModal && selectedLesson && (
          <LessonDetailModal
            lesson={selectedLesson}
            unit={selectedUnit}
            onClose={closeLessonDetailModal}
            onAddVideo={openAddVideoModal}
            hasVideo={hasVideo}
            hasPdf={hasPdf}
            hasTrainingExam={hasTrainingExam}
            hasFinalExam={hasFinalExam}
            getLessonTitle={getLessonTitle}
            getLessonDescription={getLessonDescription}
            getLessonDuration={getLessonDuration}
            getLessonPrice={getLessonPrice}
            formatPrice={formatPrice}
            getPriceBadgeColor={getPriceBadgeColor}
          />
        )}

        {/* Add Video Modal */}
        {showAddVideoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FaVideo className="text-blue-500" />
                    {selectedLesson ? (hasVideo(selectedLesson) ? 'Update Video' : 'Add Video') : 'Add Unit Video'}
                  </h3>
                  <button
                    onClick={closeAddVideoModal}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                <form onSubmit={handleAddVideo} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={videoForm.title}
                      onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Video title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={videoForm.description}
                      onChange={(e) => setVideoForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Video description"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FaYoutube className="inline text-red-500 mr-2" />
                        YouTube URL
                      </label>
                      <input
                        type="url"
                        value={videoForm.youtubeUrl}
                        onChange={(e) => setVideoForm(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FaUpload className="inline text-blue-500 mr-2" />
                        Upload Video File
                      </label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoFileChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Max size: 100MB</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeAddVideoModal}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <FaPlus />
                      Add Video
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
