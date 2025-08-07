import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Layout from '../../Layout/Layout';
import { axiosInstance } from '../../Helpers/axiosInstance';
import { toast } from 'react-hot-toast';
import { getWalletBalance } from '../../Redux/Slices/WalletSlice';
import { getUserData } from '../../Redux/Slices/AuthSlice';

// Import smaller components
import LectureHeader from '../../Components/Lecture/LectureHeader';
import CourseInfoCard from '../../Components/Lecture/CourseInfoCard';
import LecturesList from '../../Components/Lecture/LecturesList';
import LectureModal from '../../Components/Lecture/LectureModal';
import LoadingState from '../../Components/Lecture/LoadingState';
import ErrorState from '../../Components/Lecture/ErrorState';

export default function DisplayLecture() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.wallet);
  
  const [course, setCourse] = useState(location.state || null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Helper function to flatten course structure into lectures in the correct order
  const flattenCourseStructure = (courseData) => {
    const allLectures = [];
    
    // If unified structure exists, use it as the primary source for order
    if (courseData.unifiedStructure && courseData.unifiedStructure.length > 0) {
      courseData.unifiedStructure.forEach((item, index) => {
        if (item.type === 'lesson') {
          // Add individual lesson
          allLectures.push({
            ...item.data,
            _id: item.data._id || item.id,
            order: item.order || index,
            isUnifiedLesson: true
          });
        } else if (item.type === 'unit') {
          // Add lessons from unit in order
          if (item.data.lessons && item.data.lessons.length > 0) {
            item.data.lessons.forEach((lesson, lessonIndex) => {
              allLectures.push({
                ...lesson,
                _id: lesson._id || lesson.id,
                order: (item.order || index) * 1000 + lessonIndex, // Maintain unit order
                unitTitle: item.data.title,
                isUnifiedUnitLesson: true
              });
            });
          }
        }
      });
    } else {
      // Fallback to legacy structure
      // Add direct lessons first
      if (courseData.directLessons && courseData.directLessons.length > 0) {
        courseData.directLessons.forEach((lesson, index) => {
          allLectures.push({
            ...lesson,
            order: index,
            isDirectLesson: true
          });
        });
      }
      
      // Add lessons from units
      if (courseData.units && courseData.units.length > 0) {
        courseData.units.forEach((unit, unitIndex) => {
          if (unit.lessons && unit.lessons.length > 0) {
            unit.lessons.forEach((lesson, lessonIndex) => {
              allLectures.push({
                ...lesson,
                order: (unitIndex + 1) * 1000 + lessonIndex,
                unitTitle: unit.title,
                isUnitLesson: true
              });
            });
          }
        });
      }
    }
    
    // Sort by order to maintain the creation order
    return allLectures.sort((a, b) => a.order - b.order);
  };

  // Simplify access check
  const hasContentAccess = (contentId) => {
    // Admin users have unlimited access to all content
    if (user?.role === 'admin') {
      return true;
    }
    
    // Check if user has purchased the entire course
    if (user?.hasPurchasedCourse?.some(courseId => courseId.toString() === id)) { 
      return true; 
    }
    // Check if user has purchased this specific content
    if (user?.purchasedContentIds?.some(purchasedId => purchasedId.toString() === contentId)) {
      return true;
    }
    // If lesson is explicitly free (price = 0), allow access
    const lecture = lectures.find(l => l._id === contentId);
    if (lecture && lecture.price === 0) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setLoading(true);
        
        // If we don't have course data from state, redirect back
        if (!course) {
          toast.error('بيانات الدورة غير متوفرة');
          navigate('/courses');
          return;
        }

        // Flatten the course structure to get all lectures
        const allLectures = flattenCourseStructure(course);
        setLectures(allLectures);

        // Fetch wallet balance and user data if logged in
        if (isLoggedIn) {
          try {
            // Fetch wallet balance
            dispatch(getWalletBalance());
            
            // Fetch user progress
            const progressResponse = await axiosInstance.get(`/video-progress/course/${id}`);
            const progressData = {};
            if (progressResponse.data.data && progressResponse.data.data.length > 0) {
              progressResponse.data.data.forEach(progress => {
                // Use videoId as the key, which should match the lecture _id
                progressData[progress.videoId] = progress;
              });
              console.log('Loaded progress data:', progressData);
            } else {
              console.log('No progress records found for this course');
            }
            setUserProgress(progressData);
          } catch (error) {
            console.log('No progress data found or user not enrolled:', error.message);
            // Set empty progress data to avoid errors
            setUserProgress({});
          }
        }
      } catch (error) {
        console.error('Error initializing component:', error);
        toast.error('حدث خطأ في تحميل بيانات الدورة');
      } finally {
        setLoading(false);
      }
    };

    initializeComponent();
  }, [id, course, isLoggedIn, navigate, dispatch]);

  const handleLectureClick = (lecture) => {
    // Always open the modal to show lesson content and purchase options
    setSelectedLecture(lecture);
  };

  const handleCloseModal = () => {
    setSelectedLecture(null);
  };

  const handlePurchaseLesson = async (lecture) => {
    try {
      setIsPurchasing(true);
      const response = await axiosInstance.post('/courses/purchase-lesson', {
        contentId: lecture._id,
        courseId: id
      });
      
      // Check if it's admin access
      if (response.data.data?.adminAccess) {
        toast.success('مدير النظام - وصول غير محدود');
      } else {
        toast.success('تم شراء المحتوى بنجاح!');
      }
      
      // Refresh wallet balance and user data
      dispatch(getWalletBalance());
      dispatch(getUserData());
      
      // Close the modal if it's open
      setSelectedLecture(null);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل في شراء المحتوى');
    } finally {
      setIsPurchasing(false);
    }
  };

  // Check if user has access to paid content
  const hasAccess = user?.hasPurchasedCourse?.includes(id) || !course?.isPaid;

  if (loading) {
    return <LoadingState />;
  }

  if (!course) {
    return <ErrorState />;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <LectureHeader courseTitle={course.title} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-1">
              <CourseInfoCard 
                course={course} 
                lecturesCount={lectures.length} 
              />
            </div>

            {/* Lectures List */}
            <div className="lg:col-span-2">
              <LecturesList
                lectures={lectures}
                isPaid={course.isPaid}
                hasAccess={hasAccess}
                userProgress={userProgress}
                onLectureClick={handleLectureClick}
                hasLessonAccess={hasContentAccess}
              />
            </div>
          </div>
        </div>

        {/* Lecture Modal */}
        <LectureModal
          selectedLecture={selectedLecture}
          course={course}
          onClose={handleCloseModal}
          onPurchaseClick={handlePurchaseLesson}
          isPurchasing={isPurchasing}
          hasLessonAccess={hasContentAccess}
        />
      </div>
    </Layout>
  );
} 