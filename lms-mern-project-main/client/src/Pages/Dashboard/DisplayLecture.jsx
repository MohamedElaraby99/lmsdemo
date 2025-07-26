import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../Layout/Layout";
import { 
  FaBook, 
  FaPlay, 
  FaChevronDown, 
  FaChevronRight, 
  FaPlus, 
  FaEye,
  FaEdit,
  FaTrash,
  FaClock,
  FaVideo,
  FaFileAlt,
  FaArrowLeft,
  FaGraduationCap,
  FaUsers,
  FaCalendarAlt,
  FaStar,
  FaSpinner,
  FaExclamationTriangle,
  FaInfo,
  FaTag,
  FaFolder,
  FaYoutube,
  FaUpload,
  FaCheck,
  FaTimes,
  FaGraduationCap as FaSubject,
  FaLayerGroup,
  FaWallet,
  FaCreditCard,
  FaLock,
  FaUnlock,
  FaShoppingCart,
  FaCoins,
  FaGift,
  FaCrown,
  FaTrophy,
  FaMedal,
  FaCertificate,
  FaGraduationCap as FaDiploma,
  FaChartLine,
  FaPercent,
  FaFire,
  FaRocket,
  FaGem
} from "react-icons/fa";
import { axiosInstance } from "../../Helpers/axiosInstance";
import { toast } from "react-hot-toast";
import CustomVideoPlayer from "../../Components/CustomVideoPlayer";
import { getWalletBalance } from "../../Redux/Slices/WalletSlice";

export default function DisplayLecture() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  const { role, data: userData } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.wallet);
  
  // Debug: Log the role to see what's being detected
  console.log('Current user role:', role);

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedUnits, setExpandedUnits] = useState(new Set());
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [videoForm, setVideoForm] = useState({
    title: "",
    description: "",
    youtubeUrl: "",
    videoFile: null,
    isScheduled: false,
    scheduledPublishDate: ""
  });
  const [uploading, setUploading] = useState(false);

  // Video modal state
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmTitle, setConfirmTitle] = useState('');

  // Lesson modal state
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedUnitForLesson, setSelectedUnitForLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    isScheduled: false,
    scheduledPublishDate: ''
  });

  // Use the course data passed from state instead of fetching
  useEffect(() => {
    if (!state) {
      navigate(role === 'USER' ? "/courses" : "/admin/dashboard");
      return;
    }

    // Set the course data from state
    setCourseData(state);
    setLoading(false);
    
    // Get wallet balance for users
    if (role === 'USER') {
      dispatch(getWalletBalance());
    }
  }, [state, navigate, role, dispatch]);

  // Suppress browser extension errors
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      const message = args[0];
      if (typeof message === 'string' && 
          (message.includes('runtime.lastError') || 
           message.includes('message channel closed'))) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

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

  const expandAllUnits = () => {
    if (courseData?.units) {
      const allUnitIds = courseData.units.map(unit => unit._id || unit.id);
      setExpandedUnits(new Set(allUnitIds));
    }
  };

  const collapseAllUnits = () => {
    setExpandedUnits(new Set());
  };

  const openAddVideoModal = (lesson, unit = null) => {
    setSelectedLesson(lesson);
    setSelectedUnit(unit);
    setVideoForm({
      title: lesson?.title || "",
      description: lesson?.description || "",
      youtubeUrl: "",
      videoFile: null,
      isScheduled: false,
      scheduledPublishDate: ""
    });
    setShowAddVideoModal(true);
  };

  const closeAddVideoModal = () => {
    setShowAddVideoModal(false);
    setSelectedLesson(null);
    setSelectedUnit(null);
    setVideoForm({
      title: "",
      description: "",
      youtubeUrl: "",
      videoFile: null,
      isScheduled: false,
      scheduledPublishDate: ""
    });
  };

  // Lesson modal functions
  const openAddLessonModal = (unit) => {
    setSelectedUnitForLesson(unit);
    setLessonForm({
      title: '',
      description: '',
      youtubeUrl: '',
      isScheduled: false,
      scheduledPublishDate: ''
    });
    setShowLessonModal(true);
  };

  const closeAddLessonModal = () => {
    setShowLessonModal(false);
    setSelectedUnitForLesson(null);
    setLessonForm({
      title: '',
      description: '',
      youtubeUrl: '',
      isScheduled: false,
      scheduledPublishDate: ''
    });
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    
    if (!courseData._id || !selectedUnitForLesson) {
      toast.error("Course ID or Unit not found");
      return;
    }

    try {
      const response = await axiosInstance.post(`/courses/${courseData._id}/units/${selectedUnitForLesson._id || selectedUnitForLesson.id}/lessons`, {
        title: lessonForm.title,
        description: lessonForm.description,
        lecture: {
          youtubeUrl: lessonForm.youtubeUrl || null,
          isScheduled: lessonForm.isScheduled,
          scheduledPublishDate: lessonForm.isScheduled ? lessonForm.scheduledPublishDate : null
        }
      });

      if (response.data.success) {
        toast.success("Lesson added successfully!");
        
        // Update local state
        setCourseData(prev => ({
          ...prev,
          units: prev.units.map(unit => 
            unit._id === selectedUnitForLesson._id || unit.id === selectedUnitForLesson.id
              ? { ...unit, lessons: [...unit.lessons, response.data.lesson] }
              : unit
          )
        }));
        
        closeAddLessonModal();
      } else {
        toast.error(response.data.message || "Failed to add lesson");
      }
    } catch (error) {
      console.error("Error adding lesson:", error);
      toast.error(error.response?.data?.message || "Failed to add lesson");
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast.error("Video file size must be less than 100MB");
        return;
      }
      setVideoForm(prev => ({ ...prev, videoFile: file }));
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    
    if (!videoForm.title || !videoForm.description) {
      toast.error("Title and description are required");
      return;
    }

    if (!videoForm.youtubeUrl && !videoForm.videoFile) {
      toast.error("Please provide either a YouTube URL or upload a video file");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("title", videoForm.title);
      formData.append("description", videoForm.description);
      
      if (videoForm.youtubeUrl) {
        formData.append("youtubeUrl", videoForm.youtubeUrl);
      }
      
      if (videoForm.videoFile) {
        formData.append("lecture", videoForm.videoFile);
      }

      // Add scheduling data
      formData.append("isScheduled", videoForm.isScheduled);
      if (videoForm.isScheduled && videoForm.scheduledPublishDate) {
        formData.append("scheduledPublishDate", videoForm.scheduledPublishDate);
      }

      if (selectedLesson) {
        formData.append("lessonId", selectedLesson._id || selectedLesson.id);
        if (selectedUnit) {
          formData.append("unitId", selectedUnit._id || selectedUnit.id);
        }
      }

      const response = await axiosInstance.post(`/courses/${courseData._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success("Video added successfully!");
        // Update the course data with the new video
        setCourseData(prev => ({
          ...prev,
          ...response.data.course
        }));
        closeAddVideoModal();
      }
    } catch (error) {
      console.error("Error adding video:", error);
      toast.error(error.response?.data?.message || "Failed to add video");
    } finally {
      setUploading(false);
    }
  };

  const getTotalLessons = () => {
    if (!courseData) return 0;
    const unitLessons = courseData.units?.reduce((sum, unit) => sum + (unit.lessons?.length || 0), 0) || 0;
    const directLessons = courseData.directLessons?.length || 0;
    return unitLessons + directLessons;
  };

  const hasVideo = (lesson) => {
    return lesson.lecture && (lesson.lecture.secure_url || lesson.lecture.youtubeUrl || lesson.isScheduled);
  };

  const isVideoScheduled = (lesson) => {
    return lesson.lecture?.isScheduled && lesson.lecture?.scheduledPublishDate;
  };

  const isVideoPublished = (lesson) => {
    if (!isVideoScheduled(lesson)) return true;
    const now = new Date();
    const publishDate = new Date(lesson.lecture.scheduledPublishDate);
    return publishDate <= now;
  };

  const formatScheduledDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openVideoModal = (lesson) => {
    setSelectedVideo(lesson);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  // Pricing and wallet helper functions
  const getLessonPrice = (lesson) => {
    // Default pricing: each video costs 10 EGP
    return lesson.price || 10;
  };

  const getTotalCoursePrice = () => {
    if (!courseData) return 0;
    
    let totalPrice = 0;
    
    // Calculate price for unit lessons
    if (courseData.units) {
      courseData.units.forEach(unit => {
        if (unit.lessons) {
          unit.lessons.forEach(lesson => {
            if (hasVideo(lesson)) {
              totalPrice += getLessonPrice(lesson);
            }
          });
        }
      });
    }
    
    // Calculate price for direct lessons
    if (courseData.directLessons) {
      courseData.directLessons.forEach(lesson => {
        if (hasVideo(lesson)) {
          totalPrice += getLessonPrice(lesson);
        }
      });
    }
    
    return totalPrice;
  };

  const canAffordLesson = (lesson) => {
    if (role === 'ADMIN') return true;
    return balance >= getLessonPrice(lesson);
  };

  const canAffordCourse = () => {
    if (role === 'ADMIN') return true;
    return balance >= getTotalCoursePrice();
  };

  const handlePurchaseLesson = async (lesson) => {
    if (role === 'ADMIN') {
      openVideoModal(lesson);
      return;
    }

    const lessonPrice = getLessonPrice(lesson);
    
    if (!canAffordLesson(lesson)) {
      toast.error(`Insufficient balance. You need ${lessonPrice} EGP but have ${balance} EGP`);
      return;
    }

    try {
      // Here you would implement the purchase logic
      // For now, just show a success message
      toast.success(`Successfully purchased lesson for ${lessonPrice} EGP!`);
      openVideoModal(lesson);
    } catch (error) {
      toast.error('Failed to purchase lesson');
    }
  };

  const handlePurchaseCourse = async () => {
    if (role === 'ADMIN') {
      toast.success('Admin access - all content unlocked!');
      return;
    }

    const totalPrice = getTotalCoursePrice();
    
    if (!canAffordCourse()) {
      toast.error(`Insufficient balance. You need ${totalPrice} EGP but have ${balance} EGP`);
      return;
    }

    try {
      // Here you would implement the course purchase logic
      toast.success(`Successfully purchased entire course for ${totalPrice} EGP!`);
    } catch (error) {
      toast.error('Failed to purchase course');
    }
  };

  const formatPrice = (price) => {
    return `${price} EGP`;
  };

  const getPriceBadgeColor = (price) => {
    if (price <= 5) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (price <= 15) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    if (price <= 30) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  // Delete functions
  const handleDeleteUnit = async (unit) => {
    if (!courseData._id) {
      toast.error("Course ID not found");
      return;
    }

    setConfirmTitle("Delete Unit");
    setConfirmMessage(
      `Are you sure you want to delete the unit "${unit.title || 'Untitled Unit'}"?\n\nThis will also delete all lessons within this unit. This action cannot be undone.`
    );
    setConfirmAction(() => async () => {
      try {
        const response = await axiosInstance.delete(`/courses/${courseData._id}/units/${unit._id || unit.id}`);
        
        if (response.data.success) {
          toast.success("Unit deleted successfully!");
          // Update local state by removing the unit
          setCourseData(prev => ({
            ...prev,
            units: prev.units.filter(u => u._id !== unit._id && u.id !== unit.id)
          }));
        } else {
          toast.error(response.data.message || "Failed to delete unit");
        }
      } catch (error) {
        console.error("Error deleting unit:", error);
        toast.error(error.response?.data?.message || "Failed to delete unit");
      }
    });
    setShowConfirmModal(true);
  };

  const handleDeleteLesson = async (lesson, unit = null) => {
    if (!courseData._id) {
      toast.error("Course ID not found");
      return;
    }

    const lessonTitle = lesson.title || 'Untitled Lesson';
    setConfirmTitle("Delete Lesson");
    setConfirmMessage(
      `Are you sure you want to delete the lesson "${lessonTitle}"?\n\nThis will permanently remove the lesson and any associated video content. This action cannot be undone.`
    );
    setConfirmAction(() => async () => {
      try {
        let response;
        
        if (unit) {
          // Delete lesson from unit
          response = await axiosInstance.delete(`/courses/${courseData._id}/units/${unit._id || unit.id}/lessons/${lesson._id || lesson.id}`);
        } else {
          // Delete direct lesson
          response = await axiosInstance.delete(`/courses/${courseData._id}/direct-lessons/${lesson._id || lesson.id}`);
        }
        
        if (response.data.success) {
          toast.success("Lesson deleted successfully!");
          
          // Update local state
          setCourseData(prev => {
            if (unit) {
              // Remove lesson from unit
              return {
                ...prev,
                units: prev.units.map(u => 
                  u._id === unit._id || u.id === unit.id
                    ? { ...u, lessons: u.lessons.filter(l => l._id !== lesson._id && l.id !== lesson.id) }
                    : u
                )
              };
            } else {
              // Remove direct lesson
              return {
                ...prev,
                directLessons: prev.directLessons.filter(l => l._id !== lesson._id && l.id !== lesson.id)
              };
            }
          });
        } else {
          toast.error(response.data.message || "Failed to delete lesson");
        }
      } catch (error) {
        console.error("Error deleting lesson:", error);
        toast.error(error.response?.data?.message || "Failed to delete lesson");
      }
    });
    setShowConfirmModal(true);
  };

  const handleDeleteVideo = async (lesson, unit = null) => {
    if (!courseData._id) {
      toast.error("Course ID not found");
      return;
    }

    const lessonTitle = lesson.title || 'Untitled Lesson';
    setConfirmTitle("Remove Video");
    setConfirmMessage(
      `Are you sure you want to remove the video from lesson "${lessonTitle}"?\n\nThis will only remove the video content while keeping the lesson structure. This action cannot be undone.`
    );
    setConfirmAction(() => async () => {
      try {
        let response;
        
        if (unit) {
          // Remove video from unit lesson
          response = await axiosInstance.put(`/courses/${courseData._id}/units/${unit._id || unit.id}/lessons/${lesson._id || lesson.id}`, {
            lecture: { youtubeUrl: null, secure_url: null, public_id: null }
          });
        } else {
          // Remove video from direct lesson
          response = await axiosInstance.put(`/courses/${courseData._id}/direct-lessons/${lesson._id || lesson.id}`, {
            lecture: { youtubeUrl: null, secure_url: null, public_id: null }
          });
        }
        
        if (response.data.success) {
          toast.success("Video removed successfully!");
          
          // Update local state
          setCourseData(prev => {
            if (unit) {
              // Update lesson in unit
              return {
                ...prev,
                units: prev.units.map(u => 
                  u._id === unit._id || u.id === unit.id
                    ? { 
                        ...u, 
                        lessons: u.lessons.map(l => 
                          l._id === lesson._id || l.id === lesson.id
                            ? { ...l, lecture: { youtubeUrl: null, secure_url: null, public_id: null } }
                            : l
                        ) 
                      }
                    : u
                )
              };
            } else {
              // Update direct lesson
              return {
                ...prev,
                directLessons: prev.directLessons.map(l => 
                  l._id === lesson._id || l.id === lesson.id
                    ? { ...l, lecture: { youtubeUrl: null, secure_url: null, public_id: null } }
                    : l
                )
              };
            }
          });
        } else {
          toast.error(response.data.message || "Failed to remove video");
        }
      } catch (error) {
        console.error("Error removing video:", error);
        toast.error(error.response?.data?.message || "Failed to remove video");
      }
    });
    setShowConfirmModal(true);
  };

  if (loading) {
    return (
      <Layout hideFooter={true}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading course content...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!courseData) {
    return (
      <Layout hideFooter={true}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">Course not found</p>
            <button 
              onClick={() => navigate(role === 'USER' ? "/courses" : "/admin/dashboard")}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to {role === 'USER' ? 'Courses' : 'Dashboard'}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooter={true}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <section className="relative py-8 lg:py-12 px-4 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-16 h-16 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute top-40 right-20 w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 animate-pulse"></div>
          
          <div className="relative z-10 container mx-auto max-w-7xl">
            {/* Header */}
            <div className="text-center mb-8 lg:mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                {courseData.thumbnail?.secure_url ? (
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
                    <img 
                      src={courseData.thumbnail.secure_url} 
                      alt={courseData.title || "Course"} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center" style={{display: 'none'}}>
                      <FaGraduationCap className="text-white text-2xl" />
                    </div>
                  </div>
                ) : (
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <FaGraduationCap className="text-white text-2xl" />
                  </div>
                )}
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 mb-4">
                {courseData.title || "Course Content"}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-6">
                {courseData.description || "Explore the course content and lectures"}
              </p>
              
              {/* Course Stats */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <FaBook className="text-blue-500" />
                  <span>Category: {courseData.category || 'General'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaSubject className="text-green-500" />
                  <span>Subject: {courseData.subject?.name || 'General'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaLayerGroup className="text-purple-500" />
                  <span>Stage: {courseData.stage || '1 ابتدائي'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUsers className="text-orange-500" />
                  <span>Instructor: {courseData.createdBy || 'Admin'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaPlay className="text-red-500" />
                  <span>Total Lessons: {getTotalLessons()}</span>
                </div>
              </div>

              {/* Progress and Pricing Section */}
              {role === 'USER' && (
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl border border-blue-200 dark:border-gray-600">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    {/* Wallet Balance */}
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full">
                        <FaWallet className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Your Wallet Balance</h3>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {balance || 0} EGP
                        </p>
                      </div>
                    </div>

                    {/* Course Pricing */}
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
                        <FaCoins className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Course Total Price</h3>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {formatPrice(getTotalCoursePrice())}
                        </p>
                      </div>
                    </div>

                    {/* Progress Tracking */}
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-full">
                        <FaChartLine className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Your Progress</h3>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          0 / {getTotalLessons()}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Lessons completed
                        </p>
                      </div>
                    </div>

                    {/* Purchase Options */}
                    <div className="flex gap-3">
                      <button
                        onClick={handlePurchaseCourse}
                        disabled={!canAffordCourse()}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                          canAffordCourse()
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <FaShoppingCart />
                        Buy Full Course
                      </button>
                      <button
                        onClick={() => navigate('/wallet')}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <FaCreditCard />
                        Recharge Wallet
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => navigate(role === 'USER' ? "/courses" : "/admin/dashboard")}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 font-medium"
              >
                <FaArrowLeft className="text-sm" />
                Back to {role === 'USER' ? 'Courses' : 'Dashboard'}
              </button>
            </div>

            {/* Course Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 lg:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-3">
                    <FaBook className="text-blue-500" />
                    units and lessons
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={expandAllUnits}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <FaChevronDown />
                      Expand All
                    </button>
                    <button
                      onClick={collapseAllUnits}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <FaChevronRight />
                      Collapse All
                    </button>
                    {role === "ADMIN" && (
                      <>
                        <button
                          onClick={() => navigate("/course/edit", { state: { ...courseData } })}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                          <FaEdit />
                          Edit Course
                        </button>
                        <button
                          onClick={() => openAddVideoModal(null, null)}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors flex items-center gap-2"
                        >
                          <FaPlus />
                          Test Add Video
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Units Section */}
                  {courseData.units && courseData.units.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-2">
                        <FaFolder className="text-green-500" />
                        Course Units ({courseData.units.length})
                      </h3>
                      {courseData.units.map((unit, unitIndex) => (
                        <div key={unit._id || unit.id || unitIndex} className="bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200">
                          <div className="p-4 lg:p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => toggleUnitExpansion(unit._id || unit.id)}
                                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                  {expandedUnits.has(unit._id || unit.id) ? <FaChevronDown /> : <FaChevronRight />}
                                </button>
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
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <FaPlay />
                                      {unit.lessons?.length || 0} lessons
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <FaVideo />
                                      {unit.lessons?.filter(lesson => hasVideo(lesson)).length || 0} with videos
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {role === "ADMIN" && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => openAddLessonModal(unit)}
                                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
                                  >
                                    <FaPlus />
                                    Add Lesson
                                  </button>
                                  <button
                                    onClick={() => openAddVideoModal(null, unit)}
                                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
                                  >
                                    <FaVideo />
                                    Add Unit Video
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUnit(unit)}
                                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors flex items-center gap-1"
                                    title="Delete Unit"
                                  >
                                    <FaTrash />
                                    Delete Unit
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Unit Lessons */}
                            {expandedUnits.has(unit._id || unit.id) && (
                              <div className="mt-6 space-y-3">
                                <h5 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                  <FaPlay className="text-blue-500" />
                                  Lessons in this unit
                                </h5>
                                
                                {unit.lessons && unit.lessons.length > 0 ? (
                                  <div className="space-y-3">
                                    {unit.lessons.map((lesson, lessonIndex) => (
                                      <div key={lesson._id || lesson.id || lessonIndex} className="bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 p-4">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                                                                          <div className="relative">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                  <FaFileAlt className="text-white text-sm" />
                                                </div>
                                                {hasVideo(lesson) && (
                                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                                    <FaGem className="text-white text-xs" />
                                                  </div>
                                                )}
                                              </div>
                                            <div className="flex-1">
                                              <h6 className="font-medium text-gray-900 dark:text-white">
                                                {lesson.title || `Lesson ${lessonIndex + 1}`}
                                              </h6>
                                              {lesson.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                  {lesson.description}
                                                </p>
                                              )}
                                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                {lesson.duration && (
                                                  <span className="flex items-center gap-1">
                                                    <FaClock />
                                                    {lesson.duration} min
                                                  </span>
                                                )}
                                                {hasVideo(lesson) && (
                                                  <span className="flex items-center gap-1 text-green-600">
                                                    <FaVideo />
                                                    Video Available
                                                  </span>
                                                )}
                                                {isVideoScheduled(lesson) && (
                                                  <span className={`flex items-center gap-1 ${
                                                    isVideoPublished(lesson) ? 'text-green-600' : 'text-orange-600'
                                                  }`}>
                                                    <FaCalendarAlt />
                                                    {isVideoPublished(lesson) ? 'Published' : 'Scheduled'}
                                                  </span>
                                                )}
                                              </div>
                                              
                                              {/* Pricing and Purchase Section */}
                                              {hasVideo(lesson) && (
                                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriceBadgeColor(getLessonPrice(lesson))}`}>
                                                        {formatPrice(getLessonPrice(lesson))}
                                                      </span>
                                                      {!canAffordLesson(lesson) && role === 'USER' && (
                                                        <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                                          <FaLock />
                                                          Insufficient Balance
                                                        </span>
                                                      )}
                                                    </div>
                                                    <button
                                                      onClick={() => handlePurchaseLesson(lesson)}
                                                      disabled={!canAffordLesson(lesson) && role === 'USER'}
                                                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                                                        canAffordLesson(lesson) || role === 'ADMIN'
                                                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                                                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                      }`}
                                                    >
                                                      {role === 'ADMIN' ? (
                                                        <>
                                                          <FaUnlock />
                                                          Watch
                                                        </>
                                                      ) : (
                                                        <>
                                                          <FaShoppingCart />
                                                          Purchase
                                                        </>
                                                      )}
                                                    </button>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {hasVideo(lesson) && isVideoPublished(lesson) && (
                                              <button
                                                onClick={() => handlePurchaseLesson(lesson)}
                                                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                title={role === 'ADMIN' ? "Watch Video" : "Purchase & Watch Video"}
                                              >
                                                <FaPlay className="text-sm" />
                                              </button>
                                            )}
                                            {hasVideo(lesson) && !isVideoPublished(lesson) && (
                                              <div className="relative group">
                                                <div className="p-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed" title="Video scheduled for later">
                                                  <FaCalendarAlt className="text-sm" />
                                                </div>
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                                  Scheduled for {formatScheduledDate(lesson.lecture.scheduledPublishDate)}
                                                </div>
                                              </div>
                                            )}
                                            {role === "ADMIN" && (
                                              <div className="flex gap-1">
                                                <button
                                                  onClick={() => openAddVideoModal(lesson, unit)}
                                                  className={`p-2 rounded-lg transition-colors ${
                                                    hasVideo(lesson) 
                                                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                                      : 'bg-orange-500 text-white hover:bg-orange-600'
                                                  }`}
                                                  title={hasVideo(lesson) ? "Update Video" : "Add Video"}
                                                >
                                                  {hasVideo(lesson) ? <FaEdit className="text-sm" /> : <FaPlus className="text-sm" />}
                                                </button>
                                                {hasVideo(lesson) && (
                                                  <button
                                                    onClick={() => handleDeleteVideo(lesson, unit)}
                                                    className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                                                    title="Remove Video"
                                                  >
                                                    <FaVideo className="text-sm" />
                                                  </button>
                                                )}
                                                <button
                                                  onClick={() => handleDeleteLesson(lesson, unit)}
                                                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                  title="Delete Lesson"
                                                >
                                                  <FaTrash className="text-sm" />
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-6 bg-gray-50 dark:bg-gray-600 rounded-lg">
                                    <FaFileAlt className="text-3xl text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">No lessons in this unit yet</p>
                                    {role === "ADMIN" && (
                                      <button
                                        onClick={() => navigate("/course/edit", { state: { ...courseData } })}
                                        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                                      >
                                        Add Lessons
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Direct Lessons Section */}
                  {courseData.directLessons && courseData.directLessons.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center gap-2">
                        <FaPlay className="text-blue-500" />
                        Direct Lessons ({courseData.directLessons.length})
                      </h3>
                      <div className="space-y-3">
                        {courseData.directLessons.map((lesson, index) => (
                          <div key={lesson._id || lesson.id || index} className="bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 lg:p-6 hover:shadow-lg transition-all duration-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FaFileAlt className="text-white text-lg" />
                                  </div>
                                  {hasVideo(lesson) && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                      <FaGem className="text-white text-xs" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                                    {lesson.title || `Direct Lesson ${index + 1}`}
                                  </h4>
                                  {lesson.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {lesson.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    {lesson.duration && (
                                      <span className="flex items-center gap-1">
                                        <FaClock />
                                        {lesson.duration} min
                                      </span>
                                    )}
                                    {hasVideo(lesson) && (
                                      <span className="flex items-center gap-1 text-green-600">
                                        <FaVideo />
                                        Video Available
                                      </span>
                                    )}
                                    {isVideoScheduled(lesson) && (
                                      <span className={`flex items-center gap-1 ${
                                        isVideoPublished(lesson) ? 'text-green-600' : 'text-orange-600'
                                      }`}>
                                        <FaCalendarAlt />
                                        {isVideoPublished(lesson) ? 'Published' : 'Scheduled'}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Pricing and Purchase Section for Direct Lessons */}
                                  {hasVideo(lesson) && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriceBadgeColor(getLessonPrice(lesson))}`}>
                                            {formatPrice(getLessonPrice(lesson))}
                                          </span>
                                          {!canAffordLesson(lesson) && role === 'USER' && (
                                            <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                              <FaLock />
                                              Insufficient Balance
                                            </span>
                                          )}
                                        </div>
                                        <button
                                          onClick={() => handlePurchaseLesson(lesson)}
                                          disabled={!canAffordLesson(lesson) && role === 'USER'}
                                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                                            canAffordLesson(lesson) || role === 'ADMIN'
                                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                          }`}
                                        >
                                          {role === 'ADMIN' ? (
                                            <>
                                              <FaUnlock />
                                              Watch
                                            </>
                                          ) : (
                                            <>
                                              <FaShoppingCart />
                                              Purchase
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {hasVideo(lesson) && isVideoPublished(lesson) && (
                                  <button
                                    onClick={() => handlePurchaseLesson(lesson)}
                                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                    title={role === 'ADMIN' ? "Watch Video" : "Purchase & Watch Video"}
                                  >
                                    <FaPlay className="text-sm" />
                                  </button>
                                )}
                                {hasVideo(lesson) && !isVideoPublished(lesson) && (
                                  <div className="relative group">
                                    <div className="p-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed" title="Video scheduled for later">
                                      <FaCalendarAlt className="text-sm" />
                                    </div>
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                      Scheduled for {formatScheduledDate(lesson.lecture.scheduledPublishDate)}
                                    </div>
                                  </div>
                                )}
                                {role === "ADMIN" && (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => openAddVideoModal(lesson)}
                                      className={`p-2 rounded-lg transition-colors ${
                                        hasVideo(lesson) 
                                          ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                          : 'bg-orange-500 text-white hover:bg-orange-600'
                                      }`}
                                      title={hasVideo(lesson) ? "Update Video" : "Add Video"}
                                    >
                                      {hasVideo(lesson) ? <FaEdit className="text-sm" /> : <FaPlus className="text-sm" />}
                                    </button>
                                    {hasVideo(lesson) && (
                                      <button
                                        onClick={() => handleDeleteVideo(lesson)}
                                        className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                                        title="Remove Video"
                                      >
                                        <FaVideo className="text-sm" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteLesson(lesson)}
                                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                      title="Delete Lesson"
                                    >
                                      <FaTrash className="text-sm" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Content Message */}
                  {(!courseData.units || courseData.units.length === 0) && 
                   (!courseData.directLessons || courseData.directLessons.length === 0) && (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <FaBook className="text-6xl text-gray-400 mx-auto mb-6" />
                      <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                        No course content available yet
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        This course doesn't have any units or lessons yet. Start building your course structure to help students learn effectively.
                        </p>
                        {role === "ADMIN" && (
                          <button
                          onClick={() => navigate("/course/edit", { state: { ...courseData } })}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 mx-auto"
                        >
                          <FaPlus />
                          Create Course Structure
                          </button>
                        )}
                    </div>
                  )}

                  {/* Course Information */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                      <FaInfo className="text-blue-500" />
                      Course Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FaBook className="text-blue-500" />
                        <span className="text-gray-700 dark:text-gray-300">Title:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{courseData.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaTag className="text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">Category:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{courseData.category || 'General'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaSubject className="text-purple-500" />
                        <span className="text-gray-700 dark:text-gray-300">Subject:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{courseData.subject?.name || 'General'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaLayerGroup className="text-orange-500" />
                        <span className="text-gray-700 dark:text-gray-300">Stage:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{courseData.stage || '1 ابتدائي'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaUsers className="text-red-500" />
                        <span className="text-gray-700 dark:text-gray-300">Instructor:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{courseData.createdBy || 'Admin'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPlay className="text-yellow-500" />
                        <span className="text-gray-700 dark:text-gray-300">Total Lessons:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{getTotalLessons()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-indigo-500" />
                        <span className="text-gray-700 dark:text-gray-300">Created:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Date(courseData.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaStar className="text-yellow-500" />
                        <span className="text-gray-700 dark:text-gray-300">Status:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">{courseData.status || 'Active'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaVideo className="text-blue-500" />
                        <span className="text-gray-700 dark:text-gray-300">Structure:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{courseData.structureType || 'direct-lessons'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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

                  {/* Video Scheduling Section */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FaCalendarAlt className="text-blue-500" />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        Video Scheduling
                      </h4>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={videoForm.isScheduled}
                          onChange={(e) => setVideoForm(prev => ({ ...prev, isScheduled: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Schedule this video for later publication
                        </span>
                      </label>

                      {videoForm.isScheduled && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Publish Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            value={videoForm.scheduledPublishDate}
                            onChange={(e) => setVideoForm(prev => ({ ...prev, scheduledPublishDate: e.target.value }))}
                            min={new Date().toISOString().slice(0, 16)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required={videoForm.isScheduled}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Select when this video should become available to students
                          </p>
                        </div>
                      )}
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
                      disabled={uploading}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FaCheck />
                          {selectedLesson ? (hasVideo(selectedLesson) ? 'Update Video' : 'Add Video') : 'Add Unit Video'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Custom Video Player Modal */}
        {showVideoModal && selectedVideo && (
          <CustomVideoPlayer
            video={selectedVideo}
            isOpen={showVideoModal}
            onClose={() => setShowVideoModal(false)}
            courseTitle={courseData?.title || "Course"}
            userName={userData?.username || userData?.fullName || "User"}
            courseId={courseData?._id}
            showProgress={true}
          />
        )}

        {/* Add Lesson Modal */}
        {showLessonModal && selectedUnitForLesson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add New Lesson to "{selectedUnitForLesson.title || 'Untitled Unit'}"
                </h3>
                <button
                  onClick={closeAddLessonModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleAddLesson} className="space-y-6">
                {/* Lesson Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter lesson title"
                    required
                  />
                </div>

                {/* Lesson Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lesson Description
                  </label>
                  <textarea
                    value={lessonForm.description}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter lesson description"
                    rows="3"
                  />
                </div>

                {/* YouTube URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    YouTube Video URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={lessonForm.youtubeUrl}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can add a video later by editing the lesson
                  </p>
                </div>

                {/* Video Scheduling Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FaCalendarAlt className="text-blue-500" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      Video Scheduling (Optional)
                    </h4>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={lessonForm.isScheduled}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, isScheduled: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Schedule this video for later publication
                      </span>
                    </label>

                    {lessonForm.isScheduled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Publish Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={lessonForm.scheduledPublishDate}
                          onChange={(e) => setLessonForm(prev => ({ ...prev, scheduledPublishDate: e.target.value }))}
                          min={new Date().toISOString().slice(0, 16)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required={lessonForm.isScheduled}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Select when this video should become available to students
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeAddLessonModal}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <FaPlus />
                    Add Lesson
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="text-red-600 dark:text-red-400 text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {confirmTitle}
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6 whitespace-pre-line">
                {confirmMessage}
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowConfirmModal(false);
                    if (confirmAction) {
                      await confirmAction();
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <FaTrash />
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
