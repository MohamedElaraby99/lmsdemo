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
  const [instructors, setInstructors] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic-info");
  const [expandedUnits, setExpandedUnits] = useState(new Set());
  const [editingUnit, setEditingUnit] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [sectionOrder, setSectionOrder] = useState(['units', 'direct-lessons']);
  const [courseData, setCourseData] = useState(courseDataFromState);

  const swapSectionOrder = () => {
    setSectionOrder(prev => prev[0] === 'units' ? ['direct-lessons', 'units'] : ['units', 'direct-lessons']);
  };

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
    instructor: "",
    description: "",
    thumbnail: null,
    previewImage: "",
  });

  const [courseStructure, setCourseStructure] = useState({
    units: [],
    directLessons: [],
    structureType: "direct-lessons"
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
      setUserInput({
        title: courseData.title || "",
        subject: courseData.subject?._id || courseData.subject || "",
        stage: courseData.stage?._id || courseData.stage || "",
        createdBy: courseData.createdBy || "",
        instructor: courseData.instructor || "",
        description: courseData.description || "",
        thumbnail: null,
        previewImage: courseData.thumbnail?.secure_url || "",
      });

      setCourseStructure({
        units: (courseData.units || []).map(unit => ({
          ...unit,
          id: unit.id || unit._id || Date.now() + Math.random(),
          lessons: (unit.lessons || []).map(lesson => ({
            ...lesson,
            id: lesson.id || lesson._id || Date.now() + Math.random()
          }))
        })),
        directLessons: (courseData.directLessons || []).map(lesson => ({
          ...lesson,
          id: lesson.id || lesson._id || Date.now() + Math.random()
        })),
        structureType: courseData.structureType || "direct-lessons"
      });
    }
  }, [courseData]);

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch subjects
        const subjectsResponse = await axiosInstance.get('/subjects');
        if (subjectsResponse.data.success) {
          setSubjects(subjectsResponse.data.subjects);
        }

        // Fetch instructors
        const instructorsResponse = await axiosInstance.get('/instructors');
        if (instructorsResponse.data.success) {
          setInstructors(instructorsResponse.data.data.instructors);
        }

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
    
    // Auto-fill display name when instructor is selected
    if (name === 'instructor' && value && instructors) {
      const selectedInstructor = instructors.find(i => i._id === value);
      if (selectedInstructor && !userInput.createdBy) {
        setUserInput(prev => ({
          ...prev,
          [name]: value,
          createdBy: selectedInstructor.name
        }));
        return;
      }
    }
    
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
    if (!lessonId) return;
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      setCourseStructure(prev => ({
        ...prev,
        directLessons: prev.directLessons.filter(lesson => (lesson.id || lesson._id) !== lessonId)
      }));
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'section') {
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

  async function onFormSubmit(e) {
    e.preventDefault();

    if (!userInput.title || !userInput.description || !userInput.subject || !userInput.stage || !userInput.instructor) {
      toast.error("Title, description, subject, stage, and instructor are mandatory!");
      return;
    }

    setIsUpdatingCourse(true);
    const formData = new FormData();
    formData.append("title", userInput.title);
    formData.append("description", userInput.description);
    formData.append("subject", userInput.subject);
    formData.append("stage", userInput.stage);
    formData.append("createdBy", userInput.createdBy);
    formData.append("instructor", userInput.instructor);
    formData.append("structureType", courseStructure.structureType);
    
    // Calculate total lessons
    const totalUnitLessons = courseStructure.units.reduce((sum, unit) => sum + unit.lessons.length, 0);
    const totalDirectLessons = courseStructure.directLessons.length;
    const totalLessons = totalUnitLessons + totalDirectLessons;
    formData.append("numberOfLectures", totalLessons);
    
    // Add course structure data
    const structureData = {
      units: courseStructure.units.map(unit => ({
        title: unit.title,
        description: unit.description,
        lessons: unit.lessons.map(lesson => ({
          title: lesson.title,
          description: lesson.description,
          lecture: lesson.lecture,
          duration: lesson.duration,
          order: lesson.order,
          price: lesson.price || 10
        })),
        order: unit.order
      })),
      directLessons: courseStructure.directLessons.map(lesson => ({
        title: lesson.title,
        description: lesson.description,
        lecture: lesson.lecture,
        duration: lesson.duration,
        order: lesson.order,
        price: lesson.price || 10
      }))
    };
    formData.append("courseStructure", JSON.stringify(structureData));
    
    // Only append thumbnail if a new one is selected
    if (userInput.thumbnail) {
      formData.append("thumbnail", userInput.thumbnail);
    }

    try {
      const response = await dispatch(updateCourse({ id: courseData._id, formData }));
      if (response?.payload?.success) {
        toast.success("تم تحديث الدورة بنجاح!");
        navigate("/admin/dashboard");
      }
    } catch (error) {
      toast.error("فشل في تحديث الدورة");
    }
    setIsUpdatingCourse(false);
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
              <button
                onClick={() => setActiveTab("course-structure")}
                className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                  activeTab === "course-structure"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                }`}
              >
                هيكل الدورة ({courseStructure.units.length + courseStructure.directLessons.length})
              </button>
            </div>

            {/* Main Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Basic Information Tab */}
              {activeTab === "basic-info" && (
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
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            المدرس *
                          </label>
                          <select
                            name="instructor"
                            value={userInput.instructor}
                            onChange={handleUserInput}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          >
                            <option value="">اختر المدرس</option>
                            {instructors?.map((instructor) => (
                              <option key={instructor._id} value={instructor._id}>
                                {instructor.name} - {instructor.specialization}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            اسم المدرس (للعرض)
                          </label>
                          <input
                            type="text"
                            name="createdBy"
                            placeholder="أدخل اسم المدرس للعرض"
                        onChange={handleUserInput}
                        value={userInput.createdBy}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Subject, Stage & Image */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FaTag className="text-purple-500" />
                        المادة والمرحلة
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
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          >
                            <option value="">اختر مادة دراسية</option>
                            {subjects?.map((subject) => (
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
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          >
                            <option value="">اختر المرحلة</option>
                            {stages?.map((stage) => (
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
                        <FaImage className="text-orange-500" />
                        صورة مصغرة للدورة
                      </h3>
                      
                      {/* Image Upload Area */}
                      <div className="relative">
                        <label htmlFor="image_uploads" className="cursor-pointer block">
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 hover:border-blue-400 dark:hover:border-blue-400 transition-colors duration-200">
                            {userInput.previewImage ? (
                              <div className="relative">
                                <img
                                  className="w-full h-48 lg:h-56 object-cover rounded-lg"
                                  src={userInput.previewImage}
                                  alt="course thumbnail"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                  <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                                    <FaUpload className="text-white text-2xl" />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <FaImage className="text-gray-400 text-4xl mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400 font-medium">
                                  انقر لرفع صورة مصغرة
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                  JPG، PNG حتى 5 ميجابايت
                                </p>
                              </div>
                            )}
                          </div>
                        </label>
                        
                        {/* Image Actions */}
                        {userInput.previewImage && (
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              type="button"
                              onClick={() => document.getElementById('image_uploads').click()}
                              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm"
                            >
                              <FaEdit className="text-xs" />
                              تغيير
                            </button>
                            <button
                              type="button"
                              onClick={removeImage}
                              className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm"
                            >
                              <FaTrash className="text-xs" />
                              إزالة
                            </button>
                          </div>
                        )}
                        
                        <input
                          className="hidden"
                          type="file"
                          id="image_uploads"
                          accept=".jpg, .jpeg, .png"
                          name="thumbnail"
                          onChange={handleImageUpload}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Information Summary */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                    <FaInfo className="text-blue-500" />
                    ملخص معلومات الدورة
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FaBook className="text-blue-500" />
                      <span className="text-gray-700 dark:text-gray-300">العنوان:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{userInput.title || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaTag className="text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">المادة:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {subjects.find(s => s._id === userInput.subject)?.title || 'Not selected'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-purple-500" />
                      <span className="text-gray-700 dark:text-gray-300">المرحلة:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {userInput.stage ? 
                          (() => {
                            const selectedStage = stages?.find(s => s._id === userInput.stage);
                            return selectedStage ? selectedStage.name : 'Not selected';
                          })() 
                          : 'Not selected'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUser className="text-orange-500" />
                      <span className="text-gray-700 dark:text-gray-300">المدرس:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {userInput.instructor ? 
                          (() => {
                            const selectedInstructor = instructors?.find(i => i._id === userInput.instructor);
                            return selectedInstructor ? `${selectedInstructor.name} - ${selectedInstructor.specialization}` : 'Not selected';
                          })() 
                          : 'Not selected'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUser className="text-blue-500" />
                      <span className="text-gray-700 dark:text-gray-300">اسم العرض:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{userInput.createdBy || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaGraduationCap className="text-red-500" />
                      <span className="text-gray-700 dark:text-gray-300">الحالة:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">Active</span>
                    </div>
                  </div>
                </div>

                {/* Form Validation */}
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
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
                    <li className="flex items-center gap-2">
                      {userInput.instructor ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      المدرس
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={isUpdatingCourse || !userInput.title || !userInput.description || !userInput.subject || !userInput.stage || !userInput.instructor}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {isUpdatingCourse ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        جاري تحديث الدورة...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        تحديث الدورة
                      </>
                    )}
                  </button>
                </div>
              </form>
              )}

              {/* Course Structure Tab */}
              {activeTab === "course-structure" && (
                <div className="p-6 lg:p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      هيكل الدورة
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                                              نظم محتوى دورتك بالوحدات والدروس
                    </p>
                  </div>

                  {/* Structure Type Selection */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <FaFolder className="text-blue-500" />
                        اختر هيكل الدورة
                      </h3>
                      {(courseStructure.structureType === 'mixed') && (
                        <button
                          onClick={swapSectionOrder}
                          className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                          title="تبديل ترتيب الأقسام"
                        >
                          <FaExchangeAlt /> تبديل ترتيب الأقسام
                        </button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <button
                        onClick={() => setCourseStructure(prev => ({ ...prev, structureType: 'direct-lessons' }))}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          courseStructure.structureType === 'direct-lessons'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-center">
                          <FaPlay className="text-2xl mx-auto mb-2 text-blue-500" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">الدروس المباشرة</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">قائمة بسيطة من الدروس</p>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setCourseStructure(prev => ({ ...prev, structureType: 'units' }))}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          courseStructure.structureType === 'units'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-center">
                          <FaFolder className="text-2xl mx-auto mb-2 text-green-500" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">وحدات مع دروس</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">منظم في وحدات</p>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setCourseStructure(prev => ({ ...prev, structureType: 'mixed' }))}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          courseStructure.structureType === 'mixed'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-center">
                          <FaBook className="text-2xl mx-auto mb-2 text-purple-500" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">هيكل مختلط</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">وحدات ودروس مباشرة</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Course Sections - Ordered */}
                  {sectionOrder.map((sectionType, index) => {
                    if (sectionType === 'units' && (courseStructure.structureType === 'units' || courseStructure.structureType === 'mixed')) {
                      return (
                        <div key="units-section" className="space-y-6 mb-8">
                                              <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <FaFolder className="text-green-500" />
                            وحدات الدورة ({courseStructure.units.length})
                          </h3>
                          <div className="flex items-center gap-2">
                            {courseStructure.units.length > 0 && (
                              <button
                                onClick={toggleAllUnits}
                                className="flex items-center gap-2 bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm"
                                title="تبديل جميع الوحدات"
                              >
                                                                  <FaExchangeAlt /> تبديل الكل
                              </button>
                            )}
                            <button
                              onClick={addUnit}
                              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                              <FaPlus /> إضافة وحدة
                            </button>
                          </div>
                        </div>

                      {courseStructure.units.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <FaFolder className="text-4xl text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            لم يتم إنشاء وحدات بعد
                          </h4>
                          <p className="text-gray-500 dark:text-gray-400">
                            ابدأ بإضافة أول وحدة لتنظيم محتوى دورتك.
                          </p>
                        </div>
                      ) : (
                        <DragDropContext onDragEnd={handleDragEnd}>
                          <Droppable droppableId="units" type="unit">
                            {(provided) => (
                              <div 
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-4"
                              >
                                                                 {courseStructure.units.map((unit, unitIndex) => {
                                   const unitId = unit.id || unit._id || `unit-${unitIndex}`;
                                   return (
                                   <Draggable key={unitId} draggableId={unitId.toString()} index={unitIndex}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200 ${
                                          snapshot.isDragging ? 'shadow-2xl rotate-2' : ''
                                        }`}
                                      >
                                        <div className="p-4 lg:p-6">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                              <div
                                                {...provided.dragHandleProps}
                                                className="text-gray-400 hover:text-gray-600 cursor-move"
                                              >
                                                <FaGripVertical />
                                              </div>
                                              <button
                                                onClick={() => toggleUnitExpansion(unit.id || unit._id)}
                                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                              >
                                                {expandedUnits.has(unit.id || unit._id) ? <FaChevronDown /> : <FaChevronRight />}
                                              </button>
                                              <FaFolder className="text-blue-500" />
                                              <div className="flex-1">
                                                {editingUnit === (unit.id || unit._id) ? (
                                                  <div className="space-y-2">
                                                    <input
                                                      type="text"
                                                      value={unit.title}
                                                      onChange={(e) => updateUnit(unit.id || unit._id, 'title', e.target.value)}
                                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                      placeholder="Unit title"
                                                    />
                                                    <textarea
                                                      value={unit.description}
                                                      onChange={(e) => updateUnit(unit.id || unit._id, 'description', e.target.value)}
                                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                      placeholder="Unit description"
                                                      rows={2}
                                                    />
                                                    <div className="flex gap-2">
                                                      <button
                                                        onClick={() => setEditingUnit(null)}
                                                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                                      >
                                                        Save
                                                      </button>
                                                      <button
                                                        onClick={() => setEditingUnit(null)}
                                                        className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                                      >
                                                        Cancel
                                                      </button>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                                      {unit.title || "Untitled Unit"}
                                                    </h4>
                                                    {unit.description && (
                                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {unit.description}
                                                      </p>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {unit.lessons.length} lessons
                                              </span>
                                              <button
                                                onClick={() => addUnitAfter(unit.id || unit._id)}
                                                className="text-green-500 hover:text-green-700"
                                                title="Add Unit After This"
                                              >
                                                <FaPlus />
                                              </button>
                                              <button
                                                onClick={() => setEditingUnit(unit.id || unit._id)}
                                                className="text-blue-500 hover:text-blue-700"
                                              >
                                                <FaEdit />
                                              </button>
                                              <button
                                                onClick={() => deleteUnit(unit.id || unit._id)}
                                                className="text-red-500 hover:text-red-700"
                                              >
                                                <FaTrash />
                                              </button>
                                            </div>
                                          </div>

                                          {/* Unit Lessons */}
                                          {expandedUnits.has(unit.id || unit._id) && (
                                            <div className="mt-4 space-y-3">
                                              <div className="flex justify-between items-center">
                                                <h5 className="font-medium text-gray-700 dark:text-gray-300">
                                                  Lessons in this unit
                                                </h5>
                                                <button
                                                  onClick={() => addLessonToUnit(unit.id || unit._id)}
                                                  className="flex items-center gap-1 text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                                >
                                                  <FaPlus /> Add Lesson
                                                </button>
                                              </div>
                                              
                                              {unit.lessons.length === 0 ? (
                                                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                                  No lessons in this unit yet
                                                </div>
                                              ) : (
                                                <Droppable droppableId={(unit.id || unit._id || unitIndex).toString()} type="lesson">
                                                  {(provided) => (
                                                    <div 
                                                      {...provided.droppableProps}
                                                      ref={provided.innerRef}
                                                      className="space-y-2"
                                                    >
                                                      {unit.lessons.map((lesson, lessonIndex) => {
                                                        const lessonId = lesson.id || lesson._id || `lesson-${unitId}-${lessonIndex}`;
                                                        return (
                                                          <Draggable key={lessonId} draggableId={lessonId.toString()} index={lessonIndex}>
                                                            {(provided, snapshot) => (
                                                              <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 ${
                                                                  snapshot.isDragging ? 'shadow-lg rotate-1' : ''
                                                                }`}
                                                              >
                                                                <div
                                                                  {...provided.dragHandleProps}
                                                                  className="text-gray-400 cursor-move"
                                                                >
                                                                  <FaGripVertical />
                                                                </div>
                                                                <FaFileAlt className="text-green-500" />
                                                                <div className="flex-1">
                                                                  {editingLesson === (lesson.id || lesson._id) ? (
                                                                    <div className="space-y-2">
                                                                      <input
                                                                        type="text"
                                                                        value={lesson.title}
                                                                        onChange={(e) => updateLessonInUnit(unit.id || unit._id, lesson.id || lesson._id, 'title', e.target.value)}
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                                                                        placeholder="Lesson title"
                                                                      />
                                                                      <textarea
                                                                        value={lesson.description}
                                                                        onChange={(e) => updateLessonInUnit(unit.id || unit._id, lesson.id || lesson._id, 'description', e.target.value)}
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                                                                        placeholder="Lesson description"
                                                                        rows={2}
                                                                      />
                                                                      <div className="flex gap-2">
                                                                        <button
                                                                          onClick={() => setEditingLesson(null)}
                                                                          className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                                                        >
                                                                          Save
                                                                        </button>
                                                                        <button
                                                                          onClick={() => setEditingLesson(null)}
                                                                          className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                                                                        >
                                                                          Cancel
                                                                        </button>
                                                                      </div>
                                                                    </div>
                                                                  ) : (
                                                                    <div>
                                                                      <div className="font-medium text-gray-900 dark:text-white">
                                                                        {lesson.title || "Untitled Lesson"}
                                                                      </div>
                                                                      {lesson.description && (
                                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                          {lesson.description}
                                                                        </div>
                                                                      )}
                                                                    </div>
                                                                  )}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                  <button
                                                                    onClick={() => addLessonAfter(unit.id || unit._id, lesson.id || lesson._id)}
                                                                    className="text-green-500 hover:text-green-700 text-sm"
                                                                    title="Add Lesson After This"
                                                                  >
                                                                    <FaPlus />
                                                                  </button>
                                                                  <button
                                                                    onClick={() => setEditingLesson(lesson.id || lesson._id)}
                                                                    className="text-blue-500 hover:text-blue-700 text-sm"
                                                                  >
                                                                    <FaEdit />
                                                                  </button>
                                                                  <button
                                                                    onClick={() => deleteLessonFromUnit(unit.id || unit._id, lesson.id || lesson._id)}
                                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                                  >
                                                                    <FaTrash />
                                                                  </button>
                                                                </div>
                                                              </div>
                                                            )}
                                                          </Draggable>
                                                        );
                                                      })}
                                                      {provided.placeholder}
                                                    </div>
                                                  )}
                                                </Droppable>
                                              )}
                                            </div>
                                          )}
                                        </div>
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
                      );
                    } else if (sectionType === 'direct-lessons' && (courseStructure.structureType === 'direct-lessons' || courseStructure.structureType === 'mixed')) {
                      return (
                        <div key="direct-lessons-section" className="space-y-6 mb-8">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <FaPlay className="text-blue-500" />
                          Direct Lessons ({courseStructure.directLessons.length})
                        </h3>
                        <button
                          onClick={addDirectLesson}
                          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <FaPlus /> Add Direct Lesson
                        </button>
                      </div>

                      {courseStructure.directLessons.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <FaPlay className="text-4xl text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No direct lessons created yet
                          </h4>
                          <p className="text-gray-500 dark:text-gray-400">
                            Add lessons that don't belong to any specific unit.
                          </p>
                        </div>
                      ) : (
                        <DragDropContext onDragEnd={handleDragEnd}>
                          <Droppable droppableId="directLessons" type="directLesson">
                            {(provided) => (
                              <div 
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-4"
                              >
                                                                 {courseStructure.directLessons.map((lesson, index) => {
                                   const directLessonId = lesson.id || lesson._id || `direct-lesson-${index}`;
                                   return (
                                   <Draggable key={directLessonId} draggableId={directLessonId.toString()} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 hover:shadow-lg transition-all duration-200 ${
                                          snapshot.isDragging ? 'shadow-2xl rotate-2' : ''
                                        }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div
                                            {...provided.dragHandleProps}
                                            className="text-gray-400 cursor-move"
                                          >
                                            <FaGripVertical />
                                          </div>
                                          <FaFileAlt className="text-green-500" />
                                          <div className="flex-1">
                                            {editingLesson === (lesson.id || lesson._id) ? (
                                              <div className="space-y-2">
                                                <input
                                                  type="text"
                                                  value={lesson.title}
                                                  onChange={(e) => updateDirectLesson(lesson.id || lesson._id, 'title', e.target.value)}
                                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                  placeholder="Lesson title"
                                                />
                                                <textarea
                                                  value={lesson.description}
                                                  onChange={(e) => updateDirectLesson(lesson.id || lesson._id, 'description', e.target.value)}
                                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                  placeholder="Lesson description"
                                                  rows={2}
                                                />
                                                <div className="flex gap-2">
                                                  <button
                                                    onClick={() => setEditingLesson(null)}
                                                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                                  >
                                                    Save
                                                  </button>
                                                  <button
                                                    onClick={() => setEditingLesson(null)}
                                                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                                  >
                                                    Cancel
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                  {lesson.title || "Untitled Lesson"}
                                                </h4>
                                                {lesson.description && (
                                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {lesson.description}
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => addDirectLessonAfter(lesson.id || lesson._id)}
                                              className="text-green-500 hover:text-green-700"
                                              title="Add Lesson After This"
                                            >
                                              <FaPlus />
                                            </button>
                                            <button
                                              onClick={() => setEditingLesson(lesson.id || lesson._id)}
                                              className="text-blue-500 hover:text-blue-700"
                                            >
                                              <FaEdit />
                                            </button>
                                            <button
                                              onClick={() => deleteDirectLesson(lesson.id || lesson._id)}
                                              className="text-red-500 hover:text-red-700"
                                            >
                                              <FaTrash />
                                            </button>
                                          </div>
                                        </div>
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
                      );
                    }
                    return null;
                  })}

                  {/* Course Summary */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                      <FaInfo className="text-blue-500" />
                      Course Structure Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FaFolder className="text-orange-500" />
                        <span className="text-gray-700 dark:text-gray-300">Units:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{courseStructure.units.length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPlay className="text-red-500" />
                        <span className="text-gray-700 dark:text-gray-300">Direct Lessons:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{courseStructure.directLessons.length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaStar className="text-yellow-500" />
                        <span className="text-gray-700 dark:text-gray-300">Total Lessons:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {courseStructure.units.reduce((sum, unit) => sum + unit.lessons.length, 0) + courseStructure.directLessons.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={onFormSubmit}
                      disabled={isUpdatingCourse}
                      className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-8 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                      {isUpdatingCourse ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Updating Course...
                        </>
                      ) : (
                        <>
                          <FaSave />
                          Save Course Structure
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
} 