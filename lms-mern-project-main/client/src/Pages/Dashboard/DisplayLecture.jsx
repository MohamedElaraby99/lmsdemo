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
  FaGem,
  FaExchangeAlt,
  FaFilePdf,
  FaClipboardCheck,
  FaGraduationCap as FaExam
} from "react-icons/fa";
import { axiosInstance } from "../../Helpers/axiosInstance";
import { toast } from "react-hot-toast";
import CustomVideoPlayer from "../../Components/CustomVideoPlayer";
import PurchaseModal from "../../Components/PurchaseModal";
import PurchaseSuccess from "../../Components/PurchaseSuccess";
import LessonDetailModal from "../../Components/LessonDetailModal";
import { getWalletBalance } from "../../Redux/Slices/WalletSlice";
import { purchaseLesson, checkLessonPurchase, getUserLessonPurchases, selectIsLessonPurchased, selectPurchaseLoading, selectPurchaseError, clearPurchaseError } from "../../Redux/Slices/LessonPurchaseSlice";

export default function DisplayLecture() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  const { role, data: userData } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.wallet);
  const purchaseLoading = useSelector(selectPurchaseLoading);
  const purchaseError = useSelector(selectPurchaseError);
  const lessonPurchaseState = useSelector((state) => state.lessonPurchase);
  
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
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedLessonForPurchase, setSelectedLessonForPurchase] = useState(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [purchaseSuccessData, setPurchaseSuccessData] = useState(null);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

  // Lesson detail modal state
  const [showLessonDetailModal, setShowLessonDetailModal] = useState(false);
  const [selectedLessonForDetail, setSelectedLessonForDetail] = useState(null);
  const [selectedUnitForDetail, setSelectedUnitForDetail] = useState(null);

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
    
    // Load all user purchases and check lesson purchases for this course
    if (courseData?._id && role !== 'ADMIN') {
      // First, load all user purchases
      dispatch(getUserLessonPurchases());
      
      // Check purchases for unit lessons
      if (courseData.units) {
        courseData.units.forEach(unit => {
          if (unit.lessons) {
            unit.lessons.forEach(lesson => {
              // Check purchase status for all lessons, not just those with videos
              dispatch(checkLessonPurchase({ 
                courseId: courseData._id, 
                lessonId: lesson._id || lesson.id 
              }));
            });
          }
        });
      }
      
      // Check purchases for direct lessons
      if (courseData.directLessons) {
        courseData.directLessons.forEach(lesson => {
          // Check purchase status for all lessons, not just those with videos
          dispatch(checkLessonPurchase({ 
            courseId: courseData._id, 
            lessonId: lesson._id || lesson.id 
          }));
        });
      }
    }

    // Clear any purchase errors on component mount
    dispatch(clearPurchaseError());
  }, [state, navigate, role, dispatch]);

  // Handle purchase errors
  useEffect(() => {
    if (purchaseError) {
      toast.error(purchaseError);
      dispatch(clearPurchaseError());
    }
  }, [purchaseError, dispatch]);

  // Load user purchases on component mount for non-admin users
  useEffect(() => {
    if (role !== 'ADMIN') {
      dispatch(getUserLessonPurchases());
    }
  }, [role, dispatch]);

  // Refresh purchase status when lesson purchase state changes
  useEffect(() => {
    if (lessonPurchaseState.purchases.length > 0 && courseData?._id) {
      console.log('Lesson purchases updated:', lessonPurchaseState.purchases);
    }
  }, [lessonPurchaseState.purchases, courseData?._id]);

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

  const toggleAllUnits = () => {
    if (courseData?.units) {
      const allUnitIds = courseData.units.map(unit => unit._id || unit.id);
      const allExpanded = allUnitIds.every(id => expandedUnits.has(id));
      
      if (allExpanded) {
        // If all are expanded, collapse all
        setExpandedUnits(new Set());
      } else {
        // If any are collapsed, expand all
        setExpandedUnits(new Set(allUnitIds));
      }
    }
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

  const hasPdf = (lesson) => {
    return lesson.pdf && lesson.pdf.secure_url;
  };

  const hasTrainingExam = (lesson) => {
    return lesson.trainingExam && lesson.trainingExam.questions && lesson.trainingExam.questions.length > 0;
  };

  const hasFinalExam = (lesson) => {
    return lesson.finalExam && lesson.finalExam.questions && lesson.finalExam.questions.length > 0;
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

  // Lesson detail modal functions
  const openLessonDetailModal = (lesson, unit = null) => {
    setSelectedLessonForDetail(lesson);
    setSelectedUnitForDetail(unit);
    setShowLessonDetailModal(true);
  };

  const closeLessonDetailModal = () => {
    setShowLessonDetailModal(false);
    setSelectedLessonForDetail(null);
    setSelectedUnitForDetail(null);
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

  const isLessonPurchasedByUser = (lesson) => {
    if (role === 'ADMIN') return true;
    
    const lessonId = lesson._id || lesson.id;
    const isPurchased = lessonPurchaseState.purchases.some(purchase => purchase.lessonId === lessonId);
    
    console.log('isLessonPurchasedByUser Debug:', {
      lessonId,
      lessonTitle: lesson.title,
      purchases: lessonPurchaseState.purchases,
      purchaseIds: lessonPurchaseState.purchases.map(p => p.lessonId),
      isPurchased,
      role,
      totalPurchases: lessonPurchaseState.purchases.length
    });
    
    return isPurchased;
  };



  const handlePurchaseLesson = async (lesson) => {
    // This function is called when the purchase button is clicked in the lesson detail modal
    if (role === 'ADMIN') {
      // For admin, just close the modal - they can access content through the lesson detail modal
      return;
    }

    // Check if already purchased
    if (isLessonPurchasedByUser(lesson)) {
      // For already purchased lessons, just close the modal - they can access content through the lesson detail modal
      return;
    }

    // Prevent duplicate clicks
    if (isProcessingPurchase) {
      return;
    }

    // Show purchase modal
    setSelectedLessonForPurchase(lesson);
    setShowPurchaseModal(true);
  };

  const handlePurchaseConfirm = async () => {
    if (!selectedLessonForPurchase) return;

    // Prevent duplicate purchases
    if (isProcessingPurchase) {
      return;
    }

    // Double-check if already purchased
    if (isLessonPurchasedByUser(selectedLessonForPurchase)) {
      toast.success('You have already purchased this lesson!');
      setShowPurchaseModal(false);
      setSelectedLessonForPurchase(null);
      return;
    }

    const lessonPrice = getLessonPrice(selectedLessonForPurchase);
    
    if (!canAffordLesson(selectedLessonForPurchase)) {
      toast.error(`Insufficient balance. You need ${lessonPrice} EGP but have ${balance} EGP`);
      return;
    }

    setIsProcessingPurchase(true);

    try {
      const purchaseData = {
        courseId: courseData._id,
        lessonId: selectedLessonForPurchase._id || selectedLessonForPurchase.id,
        lessonTitle: selectedLessonForPurchase.title,
        unitId: selectedUnit?._id || selectedUnit?.id || null,
        unitTitle: selectedUnit?.title || null,
        amount: lessonPrice
      };

      const result = await dispatch(purchaseLesson(purchaseData)).unwrap();
      
      if (result.success) {
        // Show success notification
        setPurchaseSuccessData({
          lessonTitle: selectedLessonForPurchase.title,
          amount: lessonPrice,
          remainingBalance: balance - lessonPrice
        });
        setShowSuccessNotification(true);
        
        // Refresh wallet balance
        dispatch(getWalletBalance());
        
        // Close modal after delay
        setTimeout(() => {
          setShowPurchaseModal(false);
          setSelectedLessonForPurchase(null);
          setIsProcessingPurchase(false);
        }, 2000);
      }
    } catch (error) {
      setIsProcessingPurchase(false);
      if (error.includes('already purchased')) {
        toast.success('You have already purchased this lesson!');
        setShowPurchaseModal(false);
        setSelectedLessonForPurchase(null);
      } else {
        toast.error(error || 'Failed to purchase lesson');
      }
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

  // PDF Management
  const handleAddPdf = async (lesson, unit = null) => {
    try {
      const lessonId = lesson._id || lesson.id;
      const courseId = courseData._id;
      const unitId = unit ? (unit._id || unit.id) : null;

      const endpoint = unitId 
        ? `/api/v1/courses/${courseId}/units/${unitId}/lessons/${lessonId}/pdf`
        : `/api/v1/courses/${courseId}/direct-lessons/${lessonId}/pdf`;

      // Create a file input for PDF upload
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('title', lesson.title + ' - Study Material');

        await axiosInstance.post(endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        toast.success('PDF added successfully');
        
        // Refresh course data
        const response = await axiosInstance.get(`/api/v1/courses/${courseId}`);
        setCourseData(response.data.course);
      };
      input.click();
    } catch (error) {
      console.error('Error adding PDF:', error);
      toast.error(error.response?.data?.message || 'Failed to add PDF');
    }
  };

  // Training Exam Management
  const handleAddTrainingExam = async (lesson, unit = null) => {
    try {
      const lessonId = lesson._id || lesson.id;
      const courseId = courseData._id;
      const unitId = unit ? (unit._id || unit.id) : null;

      const endpoint = unitId 
        ? `/api/v1/courses/${courseId}/units/${unitId}/lessons/${lessonId}/training-exam`
        : `/api/v1/courses/${courseId}/direct-lessons/${lessonId}/training-exam`;

      // Sample training exam questions
      const sampleQuestions = [
        {
          question: "What is the main topic of this lesson?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0,
          explanation: "This is the correct answer explanation."
        },
        {
          question: "Which concept is most important in this lesson?",
          options: ["Concept A", "Concept B", "Concept C", "Concept D"],
          correctAnswer: 1,
          explanation: "This concept is fundamental to understanding the lesson."
        }
      ];

      const examData = {
        questions: sampleQuestions,
        passingScore: 70,
        timeLimit: 30
      };

      await axiosInstance.post(endpoint, examData);
      
      toast.success('Training exam added successfully');
      
      // Refresh course data
      const response = await axiosInstance.get(`/api/v1/courses/${courseId}`);
      setCourseData(response.data.course);
    } catch (error) {
      console.error('Error adding training exam:', error);
      toast.error(error.response?.data?.message || 'Failed to add training exam');
    }
  };

  // Final Exam Management
  const handleAddFinalExam = async (lesson, unit = null) => {
    try {
      const lessonId = lesson._id || lesson.id;
      const courseId = courseData._id;
      const unitId = unit ? (unit._id || unit.id) : null;

      const endpoint = unitId 
        ? `/api/v1/courses/${courseId}/units/${unitId}/lessons/${lessonId}/final-exam`
        : `/api/v1/courses/${courseId}/direct-lessons/${lessonId}/final-exam`;

      // Sample final exam questions
      const sampleQuestions = [
        {
          question: "What is the primary learning objective of this lesson?",
          options: ["Objective A", "Objective B", "Objective C", "Objective D"],
          correctAnswer: 0,
          explanation: "This is the main learning objective."
        },
        {
          question: "Which skill is developed through this lesson?",
          options: ["Skill A", "Skill B", "Skill C", "Skill D"],
          correctAnswer: 1,
          explanation: "This skill is essential for mastery of the topic."
        },
        {
          question: "What is the expected outcome after completing this lesson?",
          options: ["Outcome A", "Outcome B", "Outcome C", "Outcome D"],
          correctAnswer: 2,
          explanation: "This outcome demonstrates successful completion."
        }
      ];

      const examData = {
        questions: sampleQuestions,
        passingScore: 80,
        timeLimit: 45
      };

      await axiosInstance.post(endpoint, examData);
      
      toast.success('Final exam added successfully');
      
      // Refresh course data
      const response = await axiosInstance.get(`/api/v1/courses/${courseId}`);
      setCourseData(response.data.course);
    } catch (error) {
      console.error('Error adding final exam:', error);
      toast.error(error.response?.data?.message || 'Failed to add final exam');
    }
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
    <Layout>
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

                    {/* Wallet Recharge Option */}
                    <div className="flex justify-center">
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
                      onClick={toggleAllUnits}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors flex items-center gap-2"
                    >
                      <FaExchangeAlt />
                      Toggle All
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

                {/* Lesson Content Summary */}
                {role === "ADMIN" && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                      <FaBook className="text-blue-500" />
                      Lesson Content Management
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                        <FaVideo className="text-2xl text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Videos</p>
                        <p className="text-lg font-bold text-green-600">
                          {courseData.units?.reduce((sum, unit) => 
                            sum + unit.lessons?.filter(lesson => hasVideo(lesson)).length, 0) + 
                           (courseData.directLessons?.filter(lesson => hasVideo(lesson)).length || 0)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                        <FaFilePdf className="text-2xl text-blue-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">PDFs</p>
                        <p className="text-lg font-bold text-blue-600">
                          {courseData.units?.reduce((sum, unit) => 
                            sum + unit.lessons?.filter(lesson => hasPdf(lesson)).length, 0) + 
                           (courseData.directLessons?.filter(lesson => hasPdf(lesson)).length || 0)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                        <FaClipboardCheck className="text-2xl text-purple-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Training Exams</p>
                        <p className="text-lg font-bold text-purple-600">
                          {courseData.units?.reduce((sum, unit) => 
                            sum + unit.lessons?.filter(lesson => hasTrainingExam(lesson)).length, 0) + 
                           (courseData.directLessons?.filter(lesson => hasTrainingExam(lesson)).length || 0)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                        <FaExam className="text-2xl text-orange-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Final Exams</p>
                        <p className="text-lg font-bold text-orange-600">
                          {courseData.units?.reduce((sum, unit) => 
                            sum + unit.lessons?.filter(lesson => hasFinalExam(lesson)).length, 0) + 
                           (courseData.directLessons?.filter(lesson => hasFinalExam(lesson)).length || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-blue-700 dark:text-blue-300">
                      <p className="flex items-center gap-2">
                        <FaInfo className="text-blue-500" />
                        Click on any lesson to add or manage its content (Video, PDF, Training Exam, Final Exam)
                      </p>
                    </div>
                  </div>
                )}

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
                                      <div 
                                        key={lesson._id || lesson.id || lessonIndex} 
                                        className="bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
                                        onClick={() => openLessonDetailModal(lesson, unit)}
                                      >
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
                                                {hasPdf(lesson) && (
                                                  <span className="flex items-center gap-1 text-blue-600">
                                                    <FaFilePdf />
                                                    PDF Available
                                                  </span>
                                                )}
                                                {hasTrainingExam(lesson) && (
                                                  <span className="flex items-center gap-1 text-purple-600">
                                                    <FaClipboardCheck />
                                                    Training Exam
                                                  </span>
                                                )}
                                                {hasFinalExam(lesson) && (
                                                  <span className="flex items-center gap-1 text-orange-600">
                                                    <FaExam />
                                                    Final Exam
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
                                                      {isLessonPurchasedByUser(lesson) ? (
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                                          <FaCheck className="inline mr-1" />
                                                          Purchased
                                                        </span>
                                                      ) : (
                                                        <>
                                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriceBadgeColor(getLessonPrice(lesson))}`}>
                                                            {formatPrice(getLessonPrice(lesson))}
                                                          </span>
                                                          {!canAffordLesson(lesson) && role === 'USER' && (
                                                            <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                                              <FaLock />
                                                              Insufficient Balance
                                                            </span>
                                                          )}
                                                        </>
                                                      )}
                                                    </div>
                                                    <button
                                                      onClick={() => openLessonDetailModal(lesson, unit)}
                                                      className="px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                                                    >
                                                      <FaPlay />
                                                      Watch
                                                    </button>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
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
                                                {/* PDF Management */}
                                                <button
                                                  onClick={() => handleAddPdf(lesson, unit)}
                                                  className={`p-2 rounded-lg transition-colors ${
                                                    hasPdf(lesson) 
                                                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                                      : 'bg-indigo-500 text-white hover:bg-indigo-600'
                                                  }`}
                                                  title={hasPdf(lesson) ? "Update PDF" : "Add PDF"}
                                                >
                                                  <FaFilePdf className="text-sm" />
                                                </button>
                                                {/* Training Exam Management */}
                                                <button
                                                  onClick={() => handleAddTrainingExam(lesson, unit)}
                                                  className={`p-2 rounded-lg transition-colors ${
                                                    hasTrainingExam(lesson) 
                                                      ? 'bg-purple-500 text-white hover:bg-purple-600' 
                                                      : 'bg-pink-500 text-white hover:bg-pink-600'
                                                  }`}
                                                  title={hasTrainingExam(lesson) ? "Update Training Exam" : "Add Training Exam"}
                                                >
                                                  <FaClipboardCheck className="text-sm" />
                                                </button>
                                                {/* Final Exam Management */}
                                                <button
                                                  onClick={() => handleAddFinalExam(lesson, unit)}
                                                  className={`p-2 rounded-lg transition-colors ${
                                                    hasFinalExam(lesson) 
                                                      ? 'bg-orange-500 text-white hover:bg-orange-600' 
                                                      : 'bg-red-500 text-white hover:bg-red-600'
                                                  }`}
                                                  title={hasFinalExam(lesson) ? "Update Final Exam" : "Add Final Exam"}
                                                >
                                                  <FaExam className="text-sm" />
                                                </button>
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
                          <div 
                            key={lesson._id || lesson.id || index} 
                            className="bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 lg:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                            onClick={() => openLessonDetailModal(lesson)}
                          >
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
                                          {isLessonPurchasedByUser(lesson) ? (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                              <FaCheck className="inline mr-1" />
                                              Purchased
                                            </span>
                                          ) : (
                                            <>
                                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriceBadgeColor(getLessonPrice(lesson))}`}>
                                                {formatPrice(getLessonPrice(lesson))}
                                              </span>
                                              {!canAffordLesson(lesson) && role === 'USER' && (
                                                <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                                  <FaLock />
                                                  Insufficient Balance
                                                </span>
                                              )}
                                            </>
                                          )}
                                        </div>
                                        <button
                                          onClick={() => openLessonDetailModal(lesson)}
                                          className="px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                                        >
                                          <FaPlay />
                                          Watch
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
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
                                    {/* PDF Management */}
                                    <button
                                      onClick={() => handleAddPdf(lesson)}
                                      className={`p-2 rounded-lg transition-colors ${
                                        hasPdf(lesson) 
                                          ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                          : 'bg-indigo-500 text-white hover:bg-indigo-600'
                                      }`}
                                      title={hasPdf(lesson) ? "Update PDF" : "Add PDF"}
                                    >
                                      <FaFilePdf className="text-sm" />
                                    </button>
                                    {/* Training Exam Management */}
                                    <button
                                      onClick={() => handleAddTrainingExam(lesson)}
                                      className={`p-2 rounded-lg transition-colors ${
                                        hasTrainingExam(lesson) 
                                          ? 'bg-purple-500 text-white hover:bg-purple-600' 
                                          : 'bg-pink-500 text-white hover:bg-pink-600'
                                      }`}
                                      title={hasTrainingExam(lesson) ? "Update Training Exam" : "Add Training Exam"}
                                    >
                                      <FaClipboardCheck className="text-sm" />
                                    </button>
                                    {/* Final Exam Management */}
                                    <button
                                      onClick={() => handleAddFinalExam(lesson)}
                                      className={`p-2 rounded-lg transition-colors ${
                                        hasFinalExam(lesson) 
                                          ? 'bg-orange-500 text-white hover:bg-orange-600' 
                                          : 'bg-red-500 text-white hover:bg-red-600'
                                      }`}
                                      title={hasFinalExam(lesson) ? "Update Final Exam" : "Add Final Exam"}
                                    >
                                      <FaExam className="text-sm" />
                                    </button>
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

        {/* Purchase Modal */}
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setSelectedLessonForPurchase(null);
            setIsProcessingPurchase(false);
          }}
          lesson={selectedLessonForPurchase}
          price={selectedLessonForPurchase ? getLessonPrice(selectedLessonForPurchase) : 0}
          balance={balance}
          onPurchase={handlePurchaseConfirm}
          loading={purchaseLoading || isProcessingPurchase}
          success={false}
          error={purchaseError}
        />

        {/* Lesson Detail Modal */}
        <LessonDetailModal
          lesson={selectedLessonForDetail}
          unit={selectedUnitForDetail}
          isOpen={showLessonDetailModal}
          onClose={closeLessonDetailModal}
          onPurchase={handlePurchaseLesson}
          isPurchased={selectedLessonForDetail ? isLessonPurchasedByUser(selectedLessonForDetail) : false}
          canAfford={selectedLessonForDetail ? canAffordLesson(selectedLessonForDetail) : false}
          purchaseLoading={purchaseLoading}
          role={role}
          balance={balance}
          lessonPrice={selectedLessonForDetail ? getLessonPrice(selectedLessonForDetail) : 0}
          courseData={courseData}
        />
        {console.log('DisplayLecture - isPurchased:', selectedLessonForDetail ? isLessonPurchasedByUser(selectedLessonForDetail) : false)}

        {/* Success Notification */}
        <PurchaseSuccess
          isVisible={showSuccessNotification}
          onClose={() => setShowSuccessNotification(false)}
          lessonTitle={purchaseSuccessData?.lessonTitle}
          amount={purchaseSuccessData?.amount}
          remainingBalance={purchaseSuccessData?.remainingBalance}
        />

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
