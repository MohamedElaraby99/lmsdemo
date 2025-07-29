import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { updateCourse } from "../../Redux/Slices/CourseSlice";
import Layout from "../../Layout/Layout";
import toast from "react-hot-toast";
import InputBox from "../../Components/InputBox/InputBox";
import TextArea from "../../Components/InputBox/TextArea";
import { 
  FaEdit, 
  FaBook, 
  FaUser, 
  FaTag, 
  FaImage, 
  FaSave, 
  FaArrowLeft, 
  FaUpload, 
  FaEye,
  FaTrash,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaGraduationCap,
  FaUsers,
  FaStar,
  FaInfo,
  FaPlus,
  FaPlay,
  FaGripVertical,
  FaChevronDown,
  FaChevronRight,
  FaFolder,
  FaFileAlt,
  FaVideo,
  FaClock,
  FaCalendarAlt,
  FaExchangeAlt
} from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { axiosInstance } from "../../Helpers/axiosInstance";

export default function EditCourse() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // Get course ID from URL params
  const courseDataFromState = location.state;

  const [isUpdatingCourse, setIsUpdatingCourse] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic-info");
  const [expandedUnits, setExpandedUnits] = useState(new Set());
  const [editingUnit, setEditingUnit] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [courseData, setCourseData] = useState(courseDataFromState);
  const [unifiedStructure, setUnifiedStructure] = useState([]);
  const [structureMode, setStructureMode] = useState('unified');
  const [currentStage, setCurrentStage] = useState(1);
  const [courseInfo, setCourseInfo] = useState({
    title: "",
    subject: "",
    stage: "",
    createdBy: "",
    description: "",
    thumbnail: null,
    previewImage: "",
  });

  const toggleAllUnits = () => {
    const allUnitIds = courseStructure.units.map(unit => unit.id || unit._id);
    const allExpanded = allUnitIds.every(id => expandedUnits.has(id));
    
    if (allExpanded) {
      // If all are expanded, collapse all
      setExpandedUnits(new Set());
    } else {
      // If any are collapsed, expand all
      setExpandedUnits(new Set(allUnitIds));
    }
  };

  const [userInput, setUserInput] = useState({
    title: "",
    subject: "",
    stage: "",
    createdBy: "",
    description: "",
    thumbnail: null,
    previewImage: "",
  });

  const [courseStructure, setCourseStructure] = useState({
    units: [],
    directLessons: [],
    structureType: "unified"
  });

  // Fetch course data if not provided or not properly populated
  useEffect(() => {
    const fetchCourseData = async () => {
      console.log('EditCourse: Fetching course data for ID:', id);
      console.log('EditCourse: Course data from state:', courseDataFromState);
      
      if (!courseData || !courseData.subject?.title || !courseData.stage?.name) {
        try {
          console.log('EditCourse: Fetching from API...');
          const response = await axiosInstance.get(`/courses/admin/${id}`);
          console.log('EditCourse: API response:', response.data);
          if (response.data.success) {
            setCourseData(response.data.course);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error fetching course data:', error);
          toast.error('فشل في تحميل بيانات الدورة');
          setLoading(false);
          // Navigate back if course not found
          if (error.response?.status === 404) {
            navigate("/admin/dashboard");
          }
        }
      } else {
        console.log('EditCourse: Using course data from state');
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseData();
    } else {
      console.error('EditCourse: No course ID provided');
      toast.error('معرف الدورة مطلوب');
      navigate("/admin/dashboard");
    }
  }, [id, courseData, navigate]);

  // Update userInput when courseData changes
  useEffect(() => {
    if (courseData) {
      console.log('EditCourse: Setting course data:', courseData);
      
      setUserInput({
        title: courseData.title || "",
        subject: courseData.subject?._id || courseData.subject || "",
        stage: courseData.stage?._id || courseData.stage || "",
        createdBy: courseData.createdBy || "",
        description: courseData.description || "",
        thumbnail: null,
        previewImage: courseData.thumbnail?.secure_url || "",
      });

      // Handle unified structure if available
      if (courseData.unifiedStructure && courseData.unifiedStructure.length > 0) {
        console.log('Loading unified structure from course data:', courseData.unifiedStructure);
        setUnifiedStructure(courseData.unifiedStructure);
        setStructureMode('unified');
        setCourseStructure({
          units: [],
          directLessons: [],
          structureType: "unified"
        });
      } else if (courseData.units?.length > 0 || courseData.directLessons?.length > 0) {
        // Convert legacy structure to unified structure
        console.log('Converting legacy structure to unified structure:', {
          units: courseData.units,
          directLessons: courseData.directLessons
        });
        
        const convertedUnifiedStructure = [];
        
        // Convert units to unified structure
        (courseData.units || []).forEach(unit => {
          convertedUnifiedStructure.push({
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
          });
        });
        
        // Convert direct lessons to unified structure
        (courseData.directLessons || []).forEach(lesson => {
          convertedUnifiedStructure.push({
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
        
        console.log('Converted unified structure:', convertedUnifiedStructure);
        setUnifiedStructure(convertedUnifiedStructure);
        setStructureMode('unified');
        setCourseStructure({
          units: courseData.units || [],
          directLessons: courseData.directLessons || [],
          structureType: courseData.structureType || "unified"
        });
      } else {
        // No structure available
        console.log('No structure available in course data');
        setUnifiedStructure([]);
        setStructureMode('unified');
        setCourseStructure({
          units: [],
          directLessons: [],
          structureType: "unified"
        });
      }
    }
  }, [courseData]);

  // Debug unifiedStructure changes
  useEffect(() => {
    console.log('EditCourse: unifiedStructure state updated:', unifiedStructure);
    console.log('EditCourse: unifiedStructure length:', unifiedStructure.length);
  }, [unifiedStructure]);

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch subjects
        const subjectsResponse = await axiosInstance.get('/subjects');
        if (subjectsResponse.data.success) {
          setSubjects(subjectsResponse.data.subjects);
        }

              // Instructors are handled through the subject relationship

        // Fetch stages
        const stagesResponse = await axiosInstance.get('/stages');
        console.log('Stages API Response:', stagesResponse.data);
        if (stagesResponse.data.success) {
          setStages(stagesResponse.data.data.stages);
          console.log('Stages set:', stagesResponse.data.data.stages);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Convert structure when mode changes
  useEffect(() => {
    if (structureMode === 'unified') {
      convertToUnifiedStructure();
    } else {
      convertToSeparateStructure();
    }
  }, [structureMode, courseStructure.units.length, courseStructure.directLessons.length]);

  // Convert structure when course data is loaded
  useEffect(() => {
    if (courseData && (courseData.units?.length > 0 || courseData.directLessons?.length > 0)) {
      if (structureMode === 'unified') {
        convertToUnifiedStructure();
      }
    }
  }, [courseData, structureMode]);

  useEffect(() => {
    if (!courseData) {
      toast.error("لم يتم العثور على بيانات الدورة");
      navigate("/admin/dashboard");
    }
  }, [courseData, navigate]);

  function handleImageUpload(e) {
    e.preventDefault();
    const uploadImage = e.target.files[0];
    if (uploadImage) {
      // Validate file size (max 5MB)
      if (uploadImage.size > 5 * 1024 * 1024) {
        toast.error("يجب أن يكون حجم الصورة أقل من 5 ميجابايت");
        return;
      }

      // Validate file type
      if (!uploadImage.type.startsWith('image/')) {
        toast.error("يرجى اختيار ملف صورة صحيح");
        return;
      }

      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadImage);
      fileReader.addEventListener("load", function () {
        setUserInput({
          ...userInput,
          previewImage: this.result,
          thumbnail: uploadImage,
        });
        toast.success("تم رفع الصورة بنجاح!");
      });
    }
  }

  function handleUserInput(e) {
    const { name, value } = e.target;
    
    setUserInput({
      ...userInput,
      [name]: value,
    });
  }

  function removeImage() {
    setUserInput({
      ...userInput,
      previewImage: "",
      thumbnail: null,
    });
    toast.success("تم إزالة الصورة");
  }

  // Course Structure Management Functions
  const addUnit = (insertAfterIndex = -1) => {
    const newUnit = {
      id: Date.now(),
      title: "",
      description: "",
      lessons: [],
      order: courseStructure.units.length
    };
    
    setCourseStructure(prev => {
      const newUnits = [...prev.units];
      if (insertAfterIndex >= 0 && insertAfterIndex < newUnits.length) {
        // Insert after specific unit
        newUnits.splice(insertAfterIndex + 1, 0, newUnit);
      } else {
        // Add at the end
        newUnits.push(newUnit);
      }
      return {
        ...prev,
        units: newUnits
      };
    });
    setEditingUnit(newUnit.id);
  };

  const addUnitAfter = (unitId) => {
    const unitIndex = courseStructure.units.findIndex(unit => (unit.id || unit._id) === unitId);
    addUnit(unitIndex);
  };

  const updateUnit = (unitId, field, value) => {
    if (!unitId) return;
    setCourseStructure(prev => ({
      ...prev,
      units: prev.units.map(unit => 
        (unit.id || unit._id) === unitId ? { ...unit, [field]: value } : unit
      )
    }));
  };

  const deleteUnit = (unitId) => {
    if (!unitId) return;
    if (window.confirm("Are you sure you want to delete this unit?")) {
      setCourseStructure(prev => ({
        ...prev,
        units: prev.units.filter(unit => (unit.id || unit._id) !== unitId)
      }));
      setExpandedUnits(prev => {
        const newSet = new Set(prev);
        newSet.delete(unitId);
        return newSet;
      });
    }
  };

  const toggleUnitExpansion = (unitId) => {
    if (!unitId) return;
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

  const addLessonToUnit = (unitId, insertAfterIndex = -1) => {
    if (!unitId) return;
    const newLesson = {
      id: Date.now() + Math.random(),
      title: "",
      description: "",
      lecture: {},
      duration: 0,
      order: courseStructure.units.find(u => (u.id || u._id) === unitId)?.lessons.length || 0
    };
    
    setCourseStructure(prev => ({
      ...prev,
      units: prev.units.map(unit => 
        (unit.id || unit._id) === unitId 
          ? {
              ...unit,
              lessons: (() => {
                const lessons = [...unit.lessons];
                if (insertAfterIndex >= 0 && insertAfterIndex < lessons.length) {
                  // Insert after specific lesson
                  lessons.splice(insertAfterIndex + 1, 0, newLesson);
                } else {
                  // Add at the end
                  lessons.push(newLesson);
                }
                return lessons;
              })()
            }
          : unit
      )
    }));
    setEditingLesson(newLesson.id);
  };

  const addLessonAfter = (unitId, lessonId) => {
    const unit = courseStructure.units.find(u => (u.id || u._id) === unitId);
    if (!unit) return;
    const lessonIndex = unit.lessons.findIndex(lesson => (lesson.id || lesson._id) === lessonId);
    addLessonToUnit(unitId, lessonIndex);
  };

  const updateLessonInUnit = (unitId, lessonId, field, value) => {
    if (!unitId || !lessonId) return;
    setCourseStructure(prev => ({
      ...prev,
      units: prev.units.map(unit => 
        (unit.id || unit._id) === unitId 
          ? {
              ...unit,
              lessons: unit.lessons.map(lesson => 
                (lesson.id || lesson._id) === lessonId ? { ...lesson, [field]: value } : lesson
              )
            }
          : unit
      )
    }));
  };

  const deleteLessonFromUnit = (unitId, lessonId) => {
    if (!unitId || !lessonId) return;
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      setCourseStructure(prev => ({
        ...prev,
        units: prev.units.map(unit => 
          (unit.id || unit._id) === unitId 
            ? { ...unit, lessons: unit.lessons.filter(lesson => (lesson.id || lesson._id) !== lessonId) }
            : unit
        )
      }));
    }
  };

  const addDirectLesson = (insertAfterIndex = -1) => {
    const newLesson = {
      id: Date.now(),
      title: "",
      description: "",
      lecture: {},
      duration: 0,
      order: courseStructure.directLessons.length
    };
    
    setCourseStructure(prev => {
      const newDirectLessons = [...prev.directLessons];
      if (insertAfterIndex >= 0 && insertAfterIndex < newDirectLessons.length) {
        // Insert after specific lesson
        newDirectLessons.splice(insertAfterIndex + 1, 0, newLesson);
      } else {
        // Add at the end
        newDirectLessons.push(newLesson);
      }
      return {
        ...prev,
        directLessons: newDirectLessons
      };
    });
    setEditingLesson(newLesson.id);
  };

  const addDirectLessonAfter = (lessonId) => {
    const lessonIndex = courseStructure.directLessons.findIndex(lesson => (lesson.id || lesson._id) === lessonId);
    addDirectLesson(lessonIndex);
  };

  const updateDirectLesson = (lessonId, field, value) => {
    if (!lessonId) return;
    setCourseStructure(prev => ({
      ...prev,
      directLessons: prev.directLessons.map(lesson => 
        (lesson.id || lesson._id) === lessonId ? { ...lesson, [field]: value } : lesson
      )
    }));
  };

  const deleteDirectLesson = (lessonId) => {
    setCourseStructure(prev => ({
      ...prev,
      directLessons: prev.directLessons.filter(lesson => lesson.id !== lessonId)
    }));
  };

  // Convert separate structure to unified structure
  const convertToUnifiedStructure = () => {
    const unified = [];
    
    // Add units
    courseStructure.units.forEach((unit, index) => {
      const unitId = unit.id || unit._id || `unit-${Date.now()}-${index}`;
      unified.push({
        type: 'unit',
        id: unitId,
        data: unit,
        order: unit.order || index
      });
    });
    
    // Add direct lessons
    courseStructure.directLessons.forEach((lesson, index) => {
      const lessonId = lesson.id || lesson._id || `lesson-${Date.now()}-${index}`;
      unified.push({
        type: 'lesson',
        id: lessonId,
        data: lesson,
        order: lesson.order || (courseStructure.units.length + index)
      });
    });
    
    // Sort by order
    unified.sort((a, b) => a.order - b.order);
    console.log('Converted to unified structure:', unified.map(item => ({ id: item.id, type: item.type })));
    setUnifiedStructure(unified);
  };

  // Convert unified structure back to separate structure
  const convertToSeparateStructure = () => {
    const units = [];
    const directLessons = [];
    
    unifiedStructure.forEach((item, index) => {
      if (item.type === 'unit') {
        units.push({
          ...item.data,
          order: index
        });
      } else if (item.type === 'lesson') {
        directLessons.push({
          ...item.data,
          order: index
        });
      }
    });
    
    setCourseStructure(prev => ({
      ...prev,
      units,
      directLessons
    }));
  };

  // Add item to unified structure
  const addToUnifiedStructure = (type, data, insertAfterIndex = -1) => {
    const newItem = {
      type,
      id: data.id || data._id || `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data,
      order: unifiedStructure.length
    };
    
    if (insertAfterIndex === -1) {
      setUnifiedStructure(prev => [...prev, newItem]);
    } else {
      setUnifiedStructure(prev => {
        const newStructure = [...prev];
        newStructure.splice(insertAfterIndex + 1, 0, newItem);
        return newStructure.map((item, index) => ({ ...item, order: index }));
      });
    }
  };

  // Update item in unified structure
  const updateUnifiedItem = (itemId, field, value) => {
    setUnifiedStructure(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, data: { ...item.data, [field]: value } }
          : item
      )
    );
  };

  // Delete item from unified structure
  const deleteUnifiedItem = (itemId) => {
    setUnifiedStructure(prev => prev.filter(item => item.id !== itemId));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'unified') {
      // Handle unified structure drag and drop
      const reorderedItems = Array.from(unifiedStructure);
      const [removed] = reorderedItems.splice(source.index, 1);
      reorderedItems.splice(destination.index, 0, removed);

      setUnifiedStructure(reorderedItems.map((item, index) => ({ ...item, order: index })));
    } else if (type === 'section') {
      const reorderedSections = Array.from(sectionOrder);
      const [removed] = reorderedSections.splice(source.index, 1);
      reorderedSections.splice(destination.index, 0, removed);
      setSectionOrder(reorderedSections);
    } else if (type === 'unit') {
      const reorderedUnits = Array.from(courseStructure.units);
      const [removed] = reorderedUnits.splice(source.index, 1);
      reorderedUnits.splice(destination.index, 0, removed);

      setCourseStructure(prev => ({
        ...prev,
        units: reorderedUnits.map((unit, index) => ({ ...unit, order: index }))
      }));
    } else if (type === 'lesson') {
      const unitId = source.droppableId;
      const unit = courseStructure.units.find(u => (u.id || '').toString() === unitId);
      
      if (unit) {
        const reorderedLessons = Array.from(unit.lessons);
        const [removed] = reorderedLessons.splice(source.index, 1);
        reorderedLessons.splice(destination.index, 0, removed);

        setCourseStructure(prev => ({
          ...prev,
          units: prev.units.map(u => 
            (u.id || '').toString() === unitId 
              ? { ...u, lessons: reorderedLessons.map((lesson, index) => ({ ...lesson, order: index })) }
              : u
          )
        }));
      }
    } else if (type === 'directLesson') {
      const reorderedDirectLessons = Array.from(courseStructure.directLessons);
      const [removed] = reorderedDirectLessons.splice(source.index, 1);
      reorderedDirectLessons.splice(destination.index, 0, removed);

      setCourseStructure(prev => ({
        ...prev,
        directLessons: reorderedDirectLessons.map((lesson, index) => ({ ...lesson, order: index }))
      }));
    }
  };

  // Submit form data
  const submitFormData = async (formData) => {
    try {
      const response = await dispatch(updateCourse({ courseId: id, formData })).unwrap();
      if (response.success) {
        toast.success("Course updated successfully!");
        navigate("/admin");
      }
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error(error.message || "Failed to update course");
    } finally {
      setIsUpdatingCourse(false);
    }
  };

  async function onFormSubmit(e) {
    e.preventDefault();

    if (!userInput.title || !userInput.description || !userInput.subject || !userInput.stage) {
      toast.error("Title, description, subject, and stage are mandatory!");
      return;
    }

    // Save course info and navigate to structure page
    setCourseInfo({
      title: userInput.title,
      description: userInput.description,
      subject: userInput.subject,
      stage: userInput.stage,
      createdBy: userInput.createdBy,
      thumbnail: userInput.thumbnail,
      previewImage: userInput.previewImage,
    });

    // Debug what we're passing
    const courseDataToPass = {
          ...courseData,
          title: userInput.title,
          description: userInput.description,
          subject: userInput.subject,
          stage: userInput.stage,
          createdBy: userInput.createdBy,
          thumbnail: userInput.thumbnail,
          previewImage: userInput.previewImage,
          unifiedStructure: unifiedStructure,
          units: courseStructure.units,
          directLessons: courseStructure.directLessons,
          structureType: structureMode === 'unified' ? 'unified' : 'legacy'
    };
    
    console.log('EditCourse: Passing course data to structure page:', courseDataToPass);
    console.log('EditCourse: unifiedStructure length:', unifiedStructure.length);
    console.log('EditCourse: units length:', courseStructure.units.length);
    console.log('EditCourse: directLessons length:', courseStructure.directLessons.length);
    
    // Navigate to structure page with course data
    navigate(`/course/structure/edit/${id}`, {
      state: {
        courseData: courseDataToPass
      }
    });
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل محرر الدورة...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!courseData && !loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              لم يتم العثور على الدورة
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              يبدو أن الدورة التي تبحث عنها غير موجودة
            </p>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              العودة إلى لوحة التحكم
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <section className="relative py-8 lg:py-12 px-4 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-16 h-16 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute top-40 right-20 w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 animate-pulse"></div>
          
          <div className="relative z-10 container mx-auto max-w-6xl">
            {/* Header */}
            <div className="text-center mb-8 lg:mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                  <FaEdit className="text-white text-2xl" />
                </div>
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 mb-4">
                تعديل الدورة
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                حدث معلومات دورتك واجعلها أفضل لطلابك.
              </p>
            </div>

            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 font-medium"
              >
                <FaArrowLeft className="text-sm" />
                العودة إلى لوحة التحكم
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                onClick={() => setActiveTab("basic-info")}
                className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                  activeTab === "basic-info"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                }`}
              >
                المعلومات الأساسية
              </button>
            </div>

            {/* Main Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Basic Information Tab */}
              <form onSubmit={onFormSubmit} autoComplete="off" noValidate className="p-6 lg:p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FaBook className="text-blue-500" />
                        تفاصيل الدورة
                      </h3>
                      
                      <div className="space-y-4">
                        <InputBox
                          label={"عنوان الدورة *"}
                          name={"title"}
                          type={"text"}
                          placeholder={"أدخل عنوان الدورة"}
                          onChange={handleUserInput}
                          value={userInput.title}
                          required
                        />
                        <div>
                          <TextArea
                            label={"وصف الدورة"}
                            name={"description"}
                            type={"text"}
                            placeholder={"أدخل وصف الدورة"}
                            onChange={handleUserInput}
                            value={userInput.description}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FaUser className="text-blue-500" />
                        معلومات المدرس
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <FaInfo className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                                معلومات المدرس
                              </h4>
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                يتم تحديد المدرس تلقائياً بناءً على المادة المختارة. المدرس مرتبط بالمادة وليس بالدورة مباشرة.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Course Details */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FaTag className="text-blue-500" />
                        تفاصيل الدورة
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            المادة *
                          </label>
                          <select
                            name="subject"
                            value={userInput.subject}
                            onChange={handleUserInput}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            required
                          >
                            <option value="">اختر المادة</option>
                            {subjects.map((subject) => (
                              <option key={subject._id} value={subject._id}>
                                {subject.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            المرحلة *
                          </label>
                          <select
                            name="stage"
                            value={userInput.stage}
                            onChange={handleUserInput}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            required
                          >
                            <option value="">اختر المرحلة</option>
                            {stages.map((stage) => (
                              <option key={stage._id} value={stage._id}>
                                {stage.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FaImage className="text-blue-500" />
                        صورة الدورة
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          {userInput.previewImage ? (
                            <div className="relative">
                              <img
                                src={userInput.previewImage}
                                alt="Course thumbnail"
                                className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                              />
                              <button
                                type="button"
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                              >
                                <FaTimes className="text-xs" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                              <FaImage className="text-gray-400 text-2xl" />
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              صورة الدورة
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              PNG, JPG, JPEG حتى 5MB
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Validation */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                    <FaCheck className="text-blue-500" />
                    الحقول المطلوبة
                  </h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li className="flex items-center gap-2">
                      {userInput.title ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      عنوان الدورة
                    </li>
                    <li className="flex items-center gap-2">
                      {userInput.description ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      وصف الدورة
                    </li>
                    <li className="flex items-center gap-2">
                      {userInput.subject ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      المادة
                    </li>
                    <li className="flex items-center gap-2">
                      {userInput.stage ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      المرحلة
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/dashboard")}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingCourse || !userInput.title || !userInput.description || !userInput.subject || !userInput.stage}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingCourse ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        جاري التحديث...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        التالي - تعديل هيكل الدورة
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
} 