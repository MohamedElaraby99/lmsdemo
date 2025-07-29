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
  FaUnlock,
  FaPlus,
  FaTrash,
  FaEdit,
  FaTimes,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaYoutube,
  FaUpload,
  FaChevronDown,
  FaChevronRight,
  FaWallet,
  FaShoppingCart,
  FaStar,
  FaBookOpen,
  FaGraduationCap,
  FaUsers,
  FaChartLine,
  FaHeart,
  FaShare,
  FaBookmark,
  FaCrown,
  FaTrophy,
  FaMedal,
  FaRocket,
  FaLightbulb,
  FaBrain,
  FaHandshake,
  FaAward
} from 'react-icons/fa';
import { fetchCourseById } from '../../Redux/Slices/CourseSlice';
import { getWalletBalance } from '../../Redux/Slices/WalletSlice';
import { purchaseLesson, checkLessonPurchase } from '../../Redux/Slices/LessonPurchaseSlice';
import { getUserData } from '../../Redux/Slices/AuthSlice';
import LessonDetailModal from '../../Components/LessonDetailModal';
import PurchaseModal from '../../Components/PurchaseModal';
import { toast } from 'react-hot-toast';

export default function DisplayLecture() {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { data: user, isLoggedIn } = useSelector((state) => state.auth);
  const { courseData, loading, error } = useSelector((state) => state.course);
  const { balance, loading: walletLoading } = useSelector((state) => state.wallet);
  const { purchaseLoading, purchaseError } = useSelector((state) => state.lessonPurchase);
  const role = user?.role || 'USER';

  // Get course data from location state if available
  const courseFromState = location.state;

  // State for modals
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [showLessonDetailModal, setShowLessonDetailModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // State for selected items
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [expandedUnits, setExpandedUnits] = useState(new Set());
  const [purchasedLessons, setPurchasedLessons] = useState(new Set());

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

  // Fetch course data and wallet balance
  useEffect(() => {
    console.log('DisplayLecture Auth State:', { 
    user: user, 
    isLoggedIn: isLoggedIn, 
    role: role,
    userRole: user?.role,
    userId: user?._id,
    localStorage: {
      role: localStorage.getItem('role'),
      data: localStorage.getItem('data'),
      isLoggedIn: localStorage.getItem('isLoggedIn')
    }
  });
    
    // Fetch user data if logged in but user data is not available
    if (isLoggedIn && !user?._id) {
      console.log('Fetching user data...');
      dispatch(getUserData());
      return; // Don't fetch course data until user data is loaded
    }
    
    if (id && isLoggedIn && user?._id) {
      console.log('Fetching course data for ID:', id, 'with role:', role);
      
      // Test if user is actually admin by checking localStorage
      const storedRole = localStorage.getItem('role');
      const storedData = localStorage.getItem('data');
      console.log('Stored role:', storedRole);
      console.log('Stored data:', storedData);
      
      dispatch(fetchCourseById(id));
    }
    if (isLoggedIn && role === 'USER') {
      dispatch(getWalletBalance());
    }
  }, [dispatch, id, role, user, isLoggedIn]);

  // Use course data from state if available, otherwise use from Redux
  const currentCourseData = courseFromState || courseData;
  
  // Debug: Log course data to see available fields
  console.log('Course Data Debug:', {
    courseData: courseData,
    courseFromState: courseFromState,
    currentCourseData: currentCourseData,
    thumbnail: currentCourseData?.thumbnail,
    previewImage: currentCourseData?.previewImage,
    image: currentCourseData?.image
  });

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
    return lesson.title || lesson.lecture?.title || 'Untitled Lesson';
  };

  const getLessonDescription = (lesson) => {
    return lesson.description || lesson.lecture?.description || 'No description available';
  };

  const getLessonDuration = (lesson) => {
    return lesson.duration || lesson.lecture?.duration || 0;
  };

  const getLessonPrice = (lesson) => {
    return lesson.price || 10;
  };

  const getAllLessons = () => {
    const lessons = [];
    
    // Add lessons from unified structure
    if (currentCourseData?.unifiedStructure) {
      currentCourseData.unifiedStructure.forEach(item => {
        if (item.type === 'lesson') {
          lessons.push(item.data);
        } else if (item.type === 'unit' && item.data.lessons) {
          lessons.push(...item.data.lessons);
        }
      });
    }
    
    // Add lessons from legacy structure
    if (currentCourseData?.units) {
      currentCourseData.units.forEach(unit => {
        if (unit.lessons) {
          lessons.push(...unit.lessons);
        }
      });
    }
    
    if (currentCourseData?.directLessons) {
      lessons.push(...currentCourseData.directLessons);
    }
    
    return lessons;
  };

  const toggleUnitExpansion = (unitId) => {
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
  };

  const isLessonPurchasedByUser = (lesson) => {
    // Admin has access to all lessons
    if (role === 'ADMIN') {
      return true;
    }
    return purchasedLessons.has(lesson._id || lesson.id);
  };

  const canAffordLesson = (lesson) => {
    // Admin can always afford lessons
    if (role === 'ADMIN') {
      return true;
    }
    const price = getLessonPrice(lesson);
    return balance >= price;
  };

  const handlePurchaseLesson = async (lesson) => {
    if (!isLoggedIn || !user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }

    // Admin doesn't need to purchase lessons
    if (role === 'ADMIN') {
      toast.success('لديك وصول كامل لجميع الدروس كمدير!');
      setShowPurchaseModal(false);
      return;
    }

    const price = getLessonPrice(lesson);
    // Try to get lesson ID from various sources
    let lessonId = lesson._id || lesson.id || lesson.lessonId;
    
    // If no ID found, create a unique identifier based on lesson title and course
    if (!lessonId) {
      const lessonTitle = getLessonTitle(lesson);
      lessonId = `lesson-${id}-${lessonTitle.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`;
    }
    const lessonTitle = getLessonTitle(lesson);

    console.log('Purchase attempt:', {
      courseId: id,
      lessonId: lessonId,
      lessonTitle: lessonTitle,
      amount: price,
      lesson: lesson,
      selectedUnit: selectedUnit
    });

    // Validate required fields
    if (!lessonId) {
      toast.error('معرف الدرس غير صحيح');
      return;
    }

    if (!lessonTitle) {
      toast.error('عنوان الدرس مطلوب');
      return;
    }

    if (!price || price <= 0) {
      toast.error('سعر الدرس غير صحيح');
      return;
    }

    try {
      const purchaseData = {
        courseId: id,
        lessonId: lessonId,
        lessonTitle: lessonTitle,
        amount: price
      };

      // Add unit information if available
      if (selectedUnit) {
        purchaseData.unitId = selectedUnit.id || selectedUnit._id;
        purchaseData.unitTitle = selectedUnit.data?.title || selectedUnit.title;
      }

      console.log('Sending purchase data:', purchaseData);

      const result = await dispatch(purchaseLesson(purchaseData)).unwrap();

      if (result.success) {
        toast.success('تم شراء الدرس بنجاح!');
        setPurchasedLessons(prev => new Set([...prev, lessonId]));
        setShowPurchaseModal(false);
        // Refresh wallet balance
        dispatch(getWalletBalance());
      }
    } catch (error) {
      if (error.includes('already purchased')) {
        toast.success('أنت تملك هذا الدرس بالفعل!');
        setPurchasedLessons(prev => new Set([...prev, lessonId]));
      } else {
        toast.error(error || 'فشل في شراء الدرس');
      }
    }
  };

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

  const openPurchaseModal = (lesson, unit = null) => {
    setSelectedLesson(lesson);
    setSelectedUnit(unit);
    setShowPurchaseModal(true);
  };

  const closePurchaseModal = () => {
    setShowPurchaseModal(false);
    setSelectedLesson(null);
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    // Implementation for adding video
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

  const getProgressPercentage = () => {
    const allLessons = getAllLessons();
    const purchasedCount = allLessons.filter(lesson => isLessonPurchasedByUser(lesson)).length;
    return allLessons.length > 0 ? Math.round((purchasedCount / allLessons.length) * 100) : 0;
  };

  const getTotalPrice = () => {
    return getAllLessons().reduce((total, lesson) => total + getLessonPrice(lesson), 0);
  };

  const getPurchasedPrice = () => {
    return getAllLessons()
      .filter(lesson => isLessonPurchasedByUser(lesson))
      .reduce((total, lesson) => total + getLessonPrice(lesson), 0);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <section className="relative py-12 lg:py-16 px-4 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-16 h-16 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute top-40 right-20 w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-indigo-200 dark:bg-indigo-800 rounded-full opacity-20 animate-bounce delay-1000"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Course Info */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                    <FaGraduationCap className="text-white text-2xl" />
                  </div>
                  <div className="flex items-center gap-2">
                    <FaStar className="text-yellow-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">دورة تعليمية</span>
                  </div>
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 mb-6">
                  {currentCourseData.title}
                </h1>
                
                <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  {currentCourseData.description}
                </p>

              

                {/* User Wallet Info */}
                {role === 'USER' && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaWallet className="text-green-500 text-2xl" />
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">رصيد المحفظة</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {walletLoading ? '...' : `${balance} نقطة`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">إجمالي التكلفة</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {getTotalPrice()} نقطة
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Course Thumbnail */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  {currentCourseData?.thumbnail?.secure_url || currentCourseData?.previewImage || currentCourseData?.thumbnail ? (
                    <img
                      src={currentCourseData?.thumbnail?.secure_url || currentCourseData?.previewImage || currentCourseData?.thumbnail}
                      alt={currentCourseData?.title || 'Course Image'}
                      className="w-80 h-60 object-cover rounded-2xl shadow-2xl"
                      onError={(e) => {
                        console.log('Image failed to load:', e.target.src);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-80 h-60 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl ${currentCourseData?.thumbnail?.secure_url || currentCourseData?.previewImage || currentCourseData?.thumbnail ? 'hidden' : ''}`}>
                    <FaPlay className="text-6xl text-white" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    <FaCrown className="inline mr-2" />
                    دورة مميزة
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Progress Section */}
            {role === 'USER' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FaTrophy className="text-yellow-500" />
                    تقدمك في الدورة
                  </h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{getProgressPercentage()}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">مكتمل</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{getAllLessons().length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">إجمالي الدروس</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {getAllLessons().filter(lesson => isLessonPurchasedByUser(lesson)).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">الدروس المشتراة</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {getAllLessons().length - getAllLessons().filter(lesson => isLessonPurchasedByUser(lesson)).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">الدروس المتبقية</div>
                  </div>
                </div>
              </div>
            )}

            {/* Course Structure */}
              <div className="space-y-6">
                <div className="text-center mb-8">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
                  <FaBookOpen className="text-blue-500" />
                  محتوى الدورة
                  </h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  استكشف الوحدات والدروس المتنوعة في هذه الدورة التعليمية الشاملة
                  </p>
                </div>

              {/* Unified Structure */}
              {currentCourseData.unifiedStructure && currentCourseData.unifiedStructure.length > 0 && (
                <div className="space-y-4">
                  {currentCourseData.unifiedStructure.map((item, index) => (
                    <div key={item.id || index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                      {item.type === 'unit' ? (
                        /* Unit Card */
                        <div>
                          <div 
                            className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => toggleUnitExpansion(item.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                                  <FaBookOpen className="text-white text-xl" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {item.data.title}
                                  </h3>
                                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    {item.data.description || 'لا يوجد وصف'}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <FaPlay />
                                      {item.data.lessons?.length || 0} درس
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <FaClock />
                                      {item.data.lessons?.reduce((total, lesson) => total + getLessonDuration(lesson), 0) || 0} دقيقة
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="text-sm text-gray-600 dark:text-gray-400">التكلفة الإجمالية</div>
                                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {item.data.lessons?.reduce((total, lesson) => total + getLessonPrice(lesson), 0) || 0} نقطة
                                  </div>
                                </div>
                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                  {expandedUnits.has(item.id) ? (
                                    <FaChevronDown className="text-gray-600 dark:text-gray-400" />
                                  ) : (
                                    <FaChevronRight className="text-gray-600 dark:text-gray-400" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Unit Lessons */}
                          {expandedUnits.has(item.id) && item.data.lessons && (
                            <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                              <div className="p-6 space-y-4">
                                {item.data.lessons.map((lesson, lessonIndex) => (
                                  <div 
                                    key={lesson._id || lesson.id || lessonIndex} 
                                    className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                                    onClick={() => openLessonDetailModal(lesson, item)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${
                                          isLessonPurchasedByUser(lesson) 
                                            ? 'bg-green-100 dark:bg-green-900' 
                                            : 'bg-blue-100 dark:bg-blue-900'
                                        }`}>
                                          {isLessonPurchasedByUser(lesson) ? (
                                            <FaCheck className="text-green-600 dark:text-green-400 text-xl" />
                                          ) : (
                                            <FaPlay className="text-blue-600 dark:text-blue-400 text-xl" />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {getLessonTitle(lesson)}
                                          </h4>
                                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                            {getLessonDescription(lesson)}
                                          </p>
                                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                              <FaClock />
                                              {getLessonDuration(lesson)} دقيقة
                                            </span>
                                            {hasVideo(lesson) && (
                                              <span className="flex items-center gap-1">
                                                <FaVideo />
                                                فيديو
                                              </span>
                                            )}
                                            {hasPdf(lesson) && (
                                              <span className="flex items-center gap-1">
                                                <FaFilePdf />
                                                ملف PDF
                                              </span>
                                            )}
                                            {hasTrainingExam(lesson) && (
                                              <span className="flex items-center gap-1">
                                                <FaClipboardCheck />
                                                اختبار تدريبي
                                              </span>
                                            )}
                                            {hasFinalExam(lesson) && (
                                              <span className="flex items-center gap-1">
                                                <FaClipboardList />
                                                اختبار نهائي
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        {role === 'ADMIN' ? (
                                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                            <FaUnlock className="inline mr-1" />
                                            وصول المدير
                                          </span>
                                        ) : isLessonPurchasedByUser(lesson) ? (
                                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                            <FaCheck className="inline mr-1" />
                                            تم الشراء
                                          </span>
                                        ) : (
                                          <>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriceBadgeColor(getLessonPrice(lesson))}`}>
                                              {formatPrice(getLessonPrice(lesson))}
                                            </span>
                                            {!canAffordLesson(lesson) && (
                                              <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <FaLock />
                                                رصيد غير كافي
                                              </span>
                                            )}
                                          </>
                                        )}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (role === 'ADMIN') {
                                              openLessonDetailModal(lesson, item);
                                            } else if (isLessonPurchasedByUser(lesson)) {
                                              openLessonDetailModal(lesson, item);
                                            } else {
                                              openPurchaseModal(lesson, item);
                                            }
                                          }}
                                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                            role === 'ADMIN' || isLessonPurchasedByUser(lesson)
                                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                                              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                                          }`}
                                        >
                                          {role === 'ADMIN' ? (
                                            <>
                                              <FaPlay />
                                              مشاهدة
                                            </>
                                          ) : isLessonPurchasedByUser(lesson) ? (
                                            <>
                                              <FaPlay />
                                              مشاهدة
                                            </>
                                          ) : (
                                            <>
                                              <FaShoppingCart />
                                              شراء
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Direct Lesson Card */
                        <div 
                          className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-[1.02] transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700 rounded-xl"
                          onClick={() => openLessonDetailModal(item.data)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl ${
                                isLessonPurchasedByUser(item.data) 
                                  ? 'bg-green-100 dark:bg-green-900' 
                                  : 'bg-blue-100 dark:bg-blue-900'
                              }`}>
                                {isLessonPurchasedByUser(item.data) ? (
                                  <FaCheck className="text-green-600 dark:text-green-400 text-xl" />
                                ) : (
                                  <FaPlay className="text-blue-600 dark:text-blue-400 text-xl" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {getLessonTitle(item.data)}
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                  {getLessonDescription(item.data)}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <FaClock />
                                    {getLessonDuration(item.data)} دقيقة
                                  </span>
                                  {hasVideo(item.data) && (
                                    <span className="flex items-center gap-1">
                                      <FaVideo />
                                      فيديو
                                    </span>
                                  )}
                                  {hasPdf(item.data) && (
                                    <span className="flex items-center gap-1">
                                      <FaFilePdf />
                                      ملف PDF
                                    </span>
                                  )}
                                  {hasTrainingExam(item.data) && (
                                    <span className="flex items-center gap-1">
                                      <FaClipboardCheck />
                                      اختبار تدريبي
                                    </span>
                                  )}
                                  {hasFinalExam(item.data) && (
                                    <span className="flex items-center gap-1">
                                      <FaClipboardList />
                                      اختبار نهائي
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {role === 'ADMIN' ? (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                  <FaUnlock className="inline mr-1" />
                                  وصول المدير
                                </span>
                              ) : isLessonPurchasedByUser(item.data) ? (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                  <FaCheck className="inline mr-1" />
                                  تم الشراء
                                </span>
                              ) : (
                                <>
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriceBadgeColor(getLessonPrice(item.data))}`}>
                                    {formatPrice(getLessonPrice(item.data))}
                                  </span>
                                  {!canAffordLesson(item.data) && (
                                    <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                      <FaLock />
                                      رصيد غير كافي
                                    </span>
                                  )}
                                </>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (role === 'ADMIN') {
                                    openLessonDetailModal(item.data);
                                  } else if (isLessonPurchasedByUser(item.data)) {
                                    openLessonDetailModal(item.data);
                                  } else {
                                    openPurchaseModal(item.data);
                                  }
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                  role === 'ADMIN' || isLessonPurchasedByUser(item.data)
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                                }`}
                              >
                                {role === 'ADMIN' ? (
                                  <>
                                    <FaPlay />
                                    مشاهدة
                                  </>
                                ) : isLessonPurchasedByUser(item.data) ? (
                                  <>
                                    <FaPlay />
                                    مشاهدة
                                  </>
                                ) : (
                                  <>
                                    <FaShoppingCart />
                                    شراء
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

                {/* Empty State */}
              {(!currentCourseData.unifiedStructure || currentCourseData.unifiedStructure.length === 0) && (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaBookOpen className="text-4xl text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    لا توجد دروس متاحة حالياً
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    سيتم إضافة الدروس والوحدات التعليمية قريباً. تحقق من هذه الصفحة لاحقاً للحصول على المحتوى الجديد.
                  </p>
                  </div>
                )}
              </div>
          </div>
        </section>

        {/* Modals */}
        {showLessonDetailModal && selectedLesson && (
          <LessonDetailModal
            lesson={selectedLesson}
            unit={selectedUnit}
            isOpen={showLessonDetailModal}
            onClose={closeLessonDetailModal}
            onPurchase={handlePurchaseLesson}
            isPurchased={isLessonPurchasedByUser(selectedLesson)}
            canAfford={canAffordLesson(selectedLesson)}
            purchaseLoading={purchaseLoading}
            role={role}
            balance={balance}
            lessonPrice={getLessonPrice(selectedLesson)}
            courseData={currentCourseData}
            onAddVideo={openAddVideoModal}
            onAddPdf={() => {}} // Placeholder function
            onAddTrainingExam={() => {}} // Placeholder function
            onAddFinalExam={() => {}} // Placeholder function
          />
        )}

        {/* Purchase Modal */}
        {showPurchaseModal && selectedLesson && (
          <PurchaseModal
            isOpen={showPurchaseModal}
            onClose={closePurchaseModal}
            lesson={selectedLesson}
            price={getLessonPrice(selectedLesson)}
            balance={balance}
            onPurchase={handlePurchaseLesson}
            loading={purchaseLoading}
            success={false}
            error={purchaseError}
            role={role}
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
