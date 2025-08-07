import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { createNewCourse, updateCourse } from '../../Redux/Slices/CourseSlice';
import Layout from '../../Layout/Layout';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../../Helpers/axiosInstance';
import { 
  FaBook, 
  FaPlay, 
  FaPlus, 
  FaSave, 
  FaArrowLeft, 
  FaGripVertical,
  FaFolder,
  FaTrash,
  FaEdit,
  FaSpinner,
  FaInfo
} from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function CourseStructure() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // Get course ID from URL params for edit mode
  const { isLoggedIn, role } = useSelector((state) => state.auth);
  
  const isEditMode = !!id;
  const courseDataFromState = location.state?.courseData;
  
  console.log('CourseStructure Component Loaded');
  console.log('isEditMode:', isEditMode);
  console.log('id:', id);
  console.log('courseDataFromState:', courseDataFromState);
  
  const [unifiedStructure, setUnifiedStructure] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debug unifiedStructure changes
  useEffect(() => {
    console.log('CourseStructure: unifiedStructure state updated:', unifiedStructure);
  }, [unifiedStructure]);

  useEffect(() => {
    const loadCourseData = async () => {
      console.log('CourseStructure: Loading course data...');
      console.log('CourseStructure: courseDataFromState:', courseDataFromState);
      console.log('CourseStructure: isEditMode:', isEditMode);
      console.log('CourseStructure: id:', id);
      
      // If we have course data from state, use it
      console.log('CourseStructure: Checking courseDataFromState:', courseDataFromState);
      console.log('CourseStructure: unifiedStructure in state:', courseDataFromState?.unifiedStructure);
      console.log('CourseStructure: units in state:', courseDataFromState?.units);
      console.log('CourseStructure: directLessons in state:', courseDataFromState?.directLessons);
      
      if (courseDataFromState?.unifiedStructure && courseDataFromState.unifiedStructure.length > 0) {
        console.log('CourseStructure: Using unified structure from state:', courseDataFromState.unifiedStructure);
      setUnifiedStructure(courseDataFromState.unifiedStructure);
      } else if (courseDataFromState?.units && courseDataFromState.units.length > 0) {
        // Convert units from state to unified structure
        console.log('CourseStructure: Converting units from state to unified structure');
        const convertedStructure = [];
        
        courseDataFromState.units.forEach(unit => {
          convertedStructure.push({
            id: unit._id || unit.id || `unit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            type: 'unit',
            data: {
              title: unit.title,
              description: unit.description,
              lessons: (unit.lessons || []).map(lesson => ({
                ...lesson,
                // Remove _id if it's a string to avoid MongoDB casting issues
                _id: undefined,
                id: lesson._id || lesson.id || `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
              }))
            }
          });
        });
        
        // Add direct lessons if any
        if (courseDataFromState.directLessons && courseDataFromState.directLessons.length > 0) {
          courseDataFromState.directLessons.forEach(lesson => {
            convertedStructure.push({
              id: lesson._id || lesson.id || `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              type: 'lesson',
              data: {
                title: lesson.title,
                description: lesson.description,
                lecture: lesson.lecture || {},
                duration: lesson.duration || 0,
                price: lesson.price || 10
              }
            });
          });
        }
        
        console.log('CourseStructure: Converted structure from state:', convertedStructure);
        setUnifiedStructure(convertedStructure);
      } else if (isEditMode && id) {
        // Check if user is authenticated and is admin
        if (!isLoggedIn || role !== 'ADMIN') {
          console.log('User not authenticated or not admin');
          toast.error('يرجى تسجيل الدخول كمدير');
          navigate('/login');
          return;
        }
        
        // If we're in edit mode but don't have course data, fetch it from backend
        try {
          setLoading(true);
          console.log('Fetching course data from backend for ID:', id);
          const response = await axiosInstance.get(`/courses/admin/${id}`);
          const data = response.data;
          
          if (data.success && data.course) {
            console.log('Course data from backend:', data.course);
            // Load unified structure if available
            if (data.course.unifiedStructure && data.course.unifiedStructure.length > 0) {
              console.log('CourseStructure: Using unified structure from backend:', data.course.unifiedStructure);
              setUnifiedStructure(data.course.unifiedStructure);
            } else if ((data.course.units && data.course.units.length > 0) || (data.course.directLessons && data.course.directLessons.length > 0)) {
              // Convert legacy structure to unified structure
              console.log('CourseStructure: Converting legacy structure to unified structure');
              const convertedStructure = [];
              
              // Convert units to unified structure
              (data.course.units || []).forEach(unit => {
                const convertedUnit = {
                  id: unit._id || `unit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  type: 'unit',
                  data: {
                    title: unit.title,
                    description: unit.description,
                    lessons: (unit.lessons || []).map(lesson => ({
                      ...lesson,
                      // Remove _id if it's a string to avoid MongoDB casting issues
                      _id: undefined,
                      id: lesson._id || lesson.id || `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
                    }))
                  }
                };
                convertedStructure.push(convertedUnit);
              });
              
              // Convert direct lessons to unified structure
              (data.course.directLessons || []).forEach(lesson => {
                convertedStructure.push({
                  id: lesson._id || `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  type: 'lesson',
                  data: {
                    title: lesson.title,
                    description: lesson.description,
                    lecture: lesson.lecture || {},
                    duration: lesson.duration || 0,
                    price: lesson.price || 10
                  }
                });
              });
              
              console.log('CourseStructure: Converted structure:', convertedStructure);
              setUnifiedStructure(convertedStructure);
            } else {
              console.log('CourseStructure: No structure found in course data');
            }
          }
        } catch (error) {
          console.error('Error fetching course data:', error);
          if (error.response?.status === 401) {
            toast.error('يرجى تسجيل الدخول مرة أخرى');
            // Redirect to login
            navigate('/login');
          } else {
            toast.error('فشل في تحميل بيانات الدورة');
          }
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadCourseData();
    
    // Fetch stages for display
    const fetchStages = async () => {
      try {
        const response = await axiosInstance.get('/stages');
        if (response.data.success) {
          setStages(response.data.data.stages);
        }
      } catch (error) {
        console.error('Error fetching stages:', error);
      }
    };
    
    fetchStages();
  }, [courseDataFromState, isEditMode, id]);

  const addToUnifiedStructure = (type, data, insertAfterIndex = -1) => {
    const newItem = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      data: {
        title: data.title || `New ${type === 'unit' ? 'Unit' : 'Lesson'}`,
        description: data.description || '',
        lessons: type === 'unit' ? [] : undefined, // Initialize lessons array for units
        ...data
      }
    };

    if (insertAfterIndex === -1) {
      setUnifiedStructure(prev => [...prev, newItem]);
    } else {
      setUnifiedStructure(prev => {
        const newStructure = [...prev];
        newStructure.splice(insertAfterIndex + 1, 0, newItem);
        return newStructure;
      });
    }
  };

  // Add lesson to a specific unit
  const addLessonToUnit = (unitId) => {
    setUnifiedStructure(prev => 
      prev.map(item => {
        if (item.id === unitId && item.type === 'unit') {
          const newLesson = {
            id: `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            title: 'New Lesson',
            description: '',
            lecture: {},
            duration: 0,
            price: 10
          };
          return {
            ...item,
            data: {
              ...item.data,
              lessons: [...(item.data.lessons || []), newLesson]
            }
          };
        }
        return item;
      })
    );
  };

  // Update lesson in unit
  const updateLessonInUnit = (unitId, lessonIndex, field, value) => {
    setUnifiedStructure(prev => 
      prev.map(item => {
        if (item.id === unitId && item.type === 'unit') {
          const updatedLessons = [...(item.data.lessons || [])];
          updatedLessons[lessonIndex] = {
            ...updatedLessons[lessonIndex],
            [field]: value
          };
          return {
            ...item,
            data: {
              ...item.data,
              lessons: updatedLessons
            }
          };
        }
        return item;
      })
    );
  };

  // Delete lesson from unit
  const deleteLessonFromUnit = (unitId, lessonIndex) => {
    setUnifiedStructure(prev => 
      prev.map(item => {
        if (item.id === unitId && item.type === 'unit') {
          const updatedLessons = [...(item.data.lessons || [])];
          updatedLessons.splice(lessonIndex, 1);
          return {
            ...item,
            data: {
              ...item.data,
              lessons: updatedLessons
            }
          };
        }
        return item;
      })
    );
  };

  const updateUnifiedItem = (itemId, field, value) => {
    setUnifiedStructure(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, data: { ...item.data, [field]: value } }
          : item
      )
    );
  };

  const deleteUnifiedItem = (itemId) => {
    setUnifiedStructure(prev => prev.filter(item => item.id !== itemId));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(unifiedStructure);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setUnifiedStructure(items);
  };

  const saveCourseStructure = async () => {
    if (unifiedStructure.length === 0) {
      toast.error('يجب إضافة وحدات أو دروس على الأقل');
      return;
    }

    setIsSaving(true);

    try {
      // Convert unified structure back to units and directLessons
      const units = [];
      const directLessons = [];
      
      unifiedStructure.forEach(item => {
        if (item.type === 'unit') {
          units.push({
            title: item.data.title,
            description: item.data.description,
            lessons: (item.data.lessons || []).map(lesson => ({
              title: lesson.title,
              description: lesson.description,
              lecture: lesson.lecture || {},
              duration: lesson.duration || 0,
              price: lesson.price || 10,
              // Remove any problematic ID fields
              _id: undefined,
              id: undefined
            }))
          });
        } else if (item.type === 'lesson') {
          directLessons.push({
            title: item.data.title,
            description: item.data.description,
            lecture: item.data.lecture || {},
            duration: item.data.duration || 0,
            price: item.data.price || 10
          });
        }
      });

      const formData = new FormData();
      
      if (isEditMode) {
        // Update existing course
        formData.append("title", courseDataFromState.title);
        formData.append("description", courseDataFromState.description);
        formData.append("subject", courseDataFromState.subject);
        formData.append("stage", courseDataFromState.stage);
        formData.append("createdBy", courseDataFromState.createdBy);
        formData.append("instructor", courseDataFromState.instructor);
        formData.append("structureType", "unified");
        formData.append("numberOfLectures", unifiedStructure.filter(item => item.type === 'lesson').length);
        
        const structureData = {
          structureType: "unified",
          unifiedStructure: unifiedStructure.map((item, index) => ({
            id: item.id,
            type: item.type,
            data: {
              ...item.data,
              // Clean up lessons to remove problematic IDs
              lessons: item.data.lessons ? item.data.lessons.map(lesson => ({
                title: lesson.title,
                description: lesson.description,
                lecture: lesson.lecture || {},
                duration: lesson.duration || 0,
                price: lesson.price || 10
              })) : []
            },
            order: index
          }))
        };
        formData.append("courseStructure", JSON.stringify(structureData));
        
        if (courseDataFromState.thumbnail) {
          formData.append("thumbnail", courseDataFromState.thumbnail);
        }

        const response = await dispatch(updateCourse({ id, formData }));
        if (response?.payload?.success) {
          toast.success('تم تحديث الدورة بنجاح!');
          navigate('/admin/dashboard');
        }
      } else {
        // Create new course
        formData.append("title", courseDataFromState.title);
        formData.append("description", courseDataFromState.description);
        formData.append("subject", courseDataFromState.subject);
        formData.append("stage", courseDataFromState.stage);
        formData.append("createdBy", courseDataFromState.createdBy);
        formData.append("instructor", courseDataFromState.instructor);
        formData.append("structureType", "unified");
        formData.append("numberOfLectures", unifiedStructure.filter(item => item.type === 'lesson').length);
        
        const structureData = {
          structureType: "unified",
          unifiedStructure: unifiedStructure.map((item, index) => ({
            id: item.id,
            type: item.type,
            data: {
              ...item.data,
              // Clean up lessons to remove problematic IDs
              lessons: item.data.lessons ? item.data.lessons.map(lesson => ({
                title: lesson.title,
                description: lesson.description,
                lecture: lesson.lecture || {},
                duration: lesson.duration || 0,
                price: lesson.price || 10
              })) : []
            },
            order: index
          }))
        };
        formData.append("courseStructure", JSON.stringify(structureData));
        
        if (courseDataFromState.thumbnail) {
          formData.append("thumbnail", courseDataFromState.thumbnail);
        }

        const response = await dispatch(createNewCourse(formData));
        if (response?.payload?.success) {
          toast.success('تم إنشاء الدورة بنجاح!');
          navigate('/admin/dashboard');
        }
      }
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('فشل في حفظ الدورة');
    } finally {
      setIsSaving(false);
    }
  };

  const getStageName = (stageId) => {
    const stage = stages.find(s => s._id === stageId);
    return stage ? stage.name : 'Unknown Stage';
  };

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل هيكل الدورة...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <section className="relative py-8 lg:py-12 px-4 overflow-hidden">
          <div className="relative z-10 container mx-auto max-w-7xl">
            {/* Header */}
            <div className="text-center mb-8 lg:mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full">
                  <FaGripVertical className="text-white text-2xl" />
                </div>
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 mb-4">
                {isEditMode ? 'تعديل هيكل الدورة' : 'هيكل الدورة'}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-6">
                {isEditMode ? 'عدّل هيكل دورتك بالوحدات والدروس' : 'أنشئ هيكل دورتك بالوحدات والدروس'}
              </p>
            </div>

            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => navigate(isEditMode ? `/course/edit/${id}` : '/course/create')}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 font-medium"
              >
                <FaArrowLeft className="text-sm" />
                العودة إلى {isEditMode ? 'تعديل الدورة' : 'إنشاء الدورة'}
              </button>
            </div>

            {/* Course Info Display */}
            {courseDataFromState && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  معلومات الدورة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">العنوان</p>
                    <p className="font-medium text-gray-900 dark:text-white">{courseDataFromState.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">المرحلة</p>
                    <p className="font-medium text-gray-900 dark:text-white">{getStageName(courseDataFromState.stage)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">عدد العناصر</p>
                    <p className="font-medium text-gray-900 dark:text-white">{unifiedStructure.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">الحالة</p>
                    <p className="font-medium text-green-600 dark:text-green-400">جاري التعديل</p>
                  </div>
                </div>
              </div>
            )}

            {/* Structure Type Selection */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaGripVertical className="text-orange-500" />
                  هيكل الدورة - ترتيب حر للوحدات والدروس
                </h3>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-purple-50 dark:from-orange-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-orange-200 dark:border-orange-700">
                <div className="text-center">
                  <FaGripVertical className="text-3xl text-orange-500 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">هيكل موحد</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    ترتيب حر للوحدات والدروس - يمكنك خلط الوحدات والدروس بأي ترتيب تريده
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <FaFolder className="text-green-500" />
                      <span>وحدات</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaPlay className="text-blue-500" />
                      <span>دروس</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaGripVertical className="text-orange-500" />
                      <span>ترتيب حر</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Sections - Only Unified Structure */}
            <div className="space-y-6 mb-8">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaGripVertical className="text-orange-500" />
                  هيكل موحد - ترتيب حر للوحدات والدروس ({unifiedStructure.length})
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => addToUnifiedStructure('unit', { title: 'New Unit', description: '', lessons: [] })}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <FaPlus /> إضافة وحدة
                  </button>
                  <button
                    onClick={() => addToUnifiedStructure('lesson', { title: 'New Lesson', description: '', lecture: {}, duration: 0, price: 10 })}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <FaPlus /> إضافة درس
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FaInfo className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      كيفية إنشاء هيكل الدورة
                    </h4>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• <strong>الوحدات:</strong> أضف وحدات لتنظيم الدروس (اختياري)</li>
                      <li>• <strong>الدروس:</strong> أضف دروس مباشرة أو داخل الوحدات</li>
                      <li>• <strong>إضافة درس للوحدة:</strong> اضغط على زر + داخل الوحدة</li>
                      <li>• <strong>ترتيب العناصر:</strong> اسحب وأفلت لإعادة الترتيب</li>
                      <li>• <strong>تعديل المحتوى:</strong> انقر على النصوص لتعديلها</li>
                    </ul>
                  </div>
                </div>
              </div>

              {unifiedStructure.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <FaGripVertical className="text-4xl text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    لم يتم إنشاء أي عناصر بعد
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    ابدأ بإضافة وحدات أو دروس لإنشاء هيكل الدورة.
                  </p>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="unified" type="unified">
                    {(provided) => (
                      <div 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {unifiedStructure.map((item, index) => {
                          const itemId = item.id || `unified-${item.type}-${index}-${Date.now()}`;
                          return (
                            <Draggable key={itemId} draggableId={itemId.toString()} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white dark:bg-gray-700 rounded-lg border-2 p-4 transition-all duration-200 ${
                                    snapshot.isDragging
                                      ? "border-orange-400 shadow-lg transform rotate-2"
                                      : "border-gray-200 dark:border-gray-600 hover:border-orange-300"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      {item.type === 'unit' ? (
                                        <>
                                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                            <FaFolder className="text-white" />
                                          </div>
                                          <div className="flex-1">
                                            <input
                                              type="text"
                                              value={item.data.title || ''}
                                              onChange={(e) => updateUnifiedItem(item.id, 'title', e.target.value)}
                                              className="text-lg font-semibold text-gray-900 dark:text-white bg-transparent border-none outline-none w-full"
                                              placeholder="عنوان الوحدة"
                                            />
                                            <input
                                              type="text"
                                              value={item.data.description || ''}
                                              onChange={(e) => updateUnifiedItem(item.id, 'description', e.target.value)}
                                              className="text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none outline-none w-full mt-1"
                                              placeholder="وصف الوحدة"
                                            />
                                            
                                            {/* Lessons count */}
                                            <div className="flex items-center gap-2 mt-2">
                                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {item.data.lessons?.length || 0} درس
                                              </span>
                                            </div>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                            <FaPlay className="text-white" />
                                          </div>
                                          <div className="flex-1">
                                            <input
                                              type="text"
                                              value={item.data.title || ''}
                                              onChange={(e) => updateUnifiedItem(item.id, 'title', e.target.value)}
                                              className="text-lg font-semibold text-gray-900 dark:text-white bg-transparent border-none outline-none w-full"
                                              placeholder="عنوان الدرس"
                                            />
                                            <input
                                              type="text"
                                              value={item.data.description || ''}
                                              onChange={(e) => updateUnifiedItem(item.id, 'description', e.target.value)}
                                              className="text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none outline-none w-full mt-1"
                                              placeholder="وصف الدرس"
                                            />
                                          </div>
                                        </>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {item.type === 'unit' && (
                                        <button
                                          onClick={() => addLessonToUnit(item.id)}
                                          className="text-blue-500 hover:text-blue-700 p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900"
                                          title="إضافة درس للوحدة"
                                        >
                                          <FaPlus />
                                        </button>
                                      )}
                                    <button
                                      onClick={() => deleteUnifiedItem(item.id)}
                                      className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-100 dark:hover:bg-red-900"
                                        title="حذف العنصر"
                                    >
                                      <FaTrash />
                                    </button>
                                    </div>
                                  </div>
                                  
                                  {/* Show lessons inside unit */}
                                  {item.type === 'unit' && item.data.lessons && item.data.lessons.length > 0 && (
                                    <div className="mt-4 pl-8 border-l-2 border-green-200 dark:border-green-700">
                                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        دروس الوحدة:
                                      </h5>
                                      <div className="space-y-2">
                                        {item.data.lessons.map((lesson, lessonIndex) => (
                                          <div key={lesson.id || lessonIndex} className="flex items-center justify-between bg-gray-50 dark:bg-gray-600 rounded-lg p-3">
                                            <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                                <FaPlay className="text-white text-sm" />
                                              </div>
                                              <div className="flex-1">
                                                <input
                                                  type="text"
                                                  value={lesson.title || ''}
                                                  onChange={(e) => updateLessonInUnit(item.id, lessonIndex, 'title', e.target.value)}
                                                  className="text-sm font-medium text-gray-900 dark:text-white bg-transparent border-none outline-none w-full"
                                                  placeholder="عنوان الدرس"
                                                />
                                                <input
                                                  type="text"
                                                  value={lesson.description || ''}
                                                  onChange={(e) => updateLessonInUnit(item.id, lessonIndex, 'description', e.target.value)}
                                                  className="text-xs text-gray-600 dark:text-gray-400 bg-transparent border-none outline-none w-full mt-1"
                                                  placeholder="وصف الدرس"
                                                />
                                              </div>
                                            </div>
                                            <button
                                              onClick={() => deleteLessonFromUnit(item.id, lessonIndex)}
                                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                                              title="حذف الدرس"
                                            >
                                              <FaTrash className="text-xs" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => navigate(isEditMode ? `/course/edit/${id}` : '/course/create')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={saveCourseStructure}
                disabled={isSaving || unifiedStructure.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <FaSave />
                    {isEditMode ? 'تحديث الدورة' : 'إنشاء الدورة'}
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
} 