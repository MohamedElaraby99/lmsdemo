import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createNewCourse } from "../../Redux/Slices/CourseSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaBook, 
  FaPlay, 
  FaGripVertical,
  FaChevronDown,
  FaChevronRight,
  FaFolder,
  FaFileAlt,
  FaArrowLeft,
  FaArrowRight,
  FaGraduationCap,
  FaTag,
  FaUser,
  FaImage,
  FaSave,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaInfo,
  FaVideo,
  FaClock,
  FaCalendarAlt,
  FaStar,
  FaUsers,
  FaExclamationTriangle,
  FaUpload
} from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Layout from "../../Layout/Layout";
import InputBox from "../../Components/InputBox/InputBox";
import TextArea from "../../Components/InputBox/TextArea";
import { axiosInstance } from "../../Helpers/axiosInstance";

export default function CreateCourse() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: user } = useSelector((state) => state.auth);

  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [currentStage, setCurrentStage] = useState(1); // 1: Basic Info, 2: Course Structure
  const [expandedUnits, setExpandedUnits] = useState(new Set());
  const [editingUnit, setEditingUnit] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    subject: "",
    stage: "1 ابتدائي",
    createdBy: user?.fullName || "Admin",
    thumbnail: null,
    previewImage: "",
    price: 0,
    currency: "EGP",
    isPaid: false,
    structureType: "direct-lessons", // units, direct-lessons, mixed
    units: [],
    directLessons: []
  });

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axiosInstance.get('/subjects');
        if (response.data.success) {
          setSubjects(response.data.subjects);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
        toast.error('فشل في تحميل المواد الدراسية');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Course Info Handlers
  const handleCourseInput = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  function handleImageUpload(e) {
    e.preventDefault();
    const uploadImage = e.target.files[0];
    if (uploadImage) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadImage);
      fileReader.addEventListener("load", function () {
        setCourseData(prev => ({
          ...prev,
          previewImage: this.result,
          thumbnail: uploadImage,
        }));
      });
    }
  }

  // Unit Handlers
  const addUnit = () => {
    const newUnit = {
      id: Date.now(),
      title: "",
      description: "",
      lessons: [],
      order: courseData.units.length
    };
    setCourseData(prev => ({
      ...prev,
      units: [...prev.units, newUnit]
    }));
    setEditingUnit(newUnit.id);
  };

  const updateUnit = (unitId, field, value) => {
    setCourseData(prev => ({
      ...prev,
      units: prev.units.map(unit => 
        unit.id === unitId ? { ...unit, [field]: value } : unit
      )
    }));
  };

  const deleteUnit = (unitId) => {
    if (window.confirm("Are you sure you want to delete this unit?")) {
      setCourseData(prev => ({
        ...prev,
        units: prev.units.filter(unit => unit.id !== unitId)
      }));
      setExpandedUnits(prev => {
        const newSet = new Set(prev);
        newSet.delete(unitId);
        return newSet;
      });
    }
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

  // Lesson Handlers (within units)
  const addLessonToUnit = (unitId) => {
    const newLesson = {
      id: Date.now(),
      title: "",
      description: "",
      lecture: {},
      duration: 0,
      order: courseData.units.find(u => u.id === unitId)?.lessons.length || 0
    };
    
    setCourseData(prev => ({
      ...prev,
      units: prev.units.map(unit => 
        unit.id === unitId 
          ? { ...unit, lessons: [...unit.lessons, newLesson] }
          : unit
      )
    }));
    setEditingLesson(newLesson.id);
  };

  const updateLessonInUnit = (unitId, lessonId, field, value) => {
    setCourseData(prev => ({
      ...prev,
      units: prev.units.map(unit => 
        unit.id === unitId 
          ? {
              ...unit,
              lessons: unit.lessons.map(lesson => 
                lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
              )
            }
          : unit
      )
    }));
  };

  const deleteLessonFromUnit = (unitId, lessonId) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      setCourseData(prev => ({
        ...prev,
        units: prev.units.map(unit => 
          unit.id === unitId 
            ? { ...unit, lessons: unit.lessons.filter(lesson => lesson.id !== lessonId) }
            : unit
        )
      }));
    }
  };

  // Direct Lesson Handlers
  const addDirectLesson = () => {
    const newLesson = {
      id: Date.now(),
      title: "",
      description: "",
      lecture: {},
      duration: 0,
      order: courseData.directLessons.length
    };
    setCourseData(prev => ({
      ...prev,
      directLessons: [...prev.directLessons, newLesson]
    }));
    setEditingLesson(newLesson.id);
  };

  const updateDirectLesson = (lessonId, field, value) => {
    setCourseData(prev => ({
      ...prev,
      directLessons: prev.directLessons.map(lesson => 
        lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
      )
    }));
  };

  const deleteDirectLesson = (lessonId) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      setCourseData(prev => ({
        ...prev,
        directLessons: prev.directLessons.filter(lesson => lesson.id !== lessonId)
      }));
    }
  };

  // Drag and Drop Handlers
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'unit') {
      // Reorder units
      const reorderedUnits = Array.from(courseData.units);
      const [removed] = reorderedUnits.splice(source.index, 1);
      reorderedUnits.splice(destination.index, 0, removed);

      setCourseData(prev => ({
        ...prev,
        units: reorderedUnits.map((unit, index) => ({ ...unit, order: index }))
      }));
    } else if (type === 'lesson') {
      // Reorder lessons within a unit
      const unitId = source.droppableId;
      const unit = courseData.units.find(u => u.id.toString() === unitId);
      
      if (unit) {
        const reorderedLessons = Array.from(unit.lessons);
        const [removed] = reorderedLessons.splice(source.index, 1);
        reorderedLessons.splice(destination.index, 0, removed);

        setCourseData(prev => ({
          ...prev,
          units: prev.units.map(u => 
            u.id.toString() === unitId 
              ? { ...u, lessons: reorderedLessons.map((lesson, index) => ({ ...lesson, order: index })) }
              : u
          )
        }));
      }
    } else if (type === 'directLesson') {
      // Reorder direct lessons
      const reorderedDirectLessons = Array.from(courseData.directLessons);
      const [removed] = reorderedDirectLessons.splice(source.index, 1);
      reorderedDirectLessons.splice(destination.index, 0, removed);

      setCourseData(prev => ({
        ...prev,
        directLessons: reorderedDirectLessons.map((lesson, index) => ({ ...lesson, order: index }))
      }));
    }
  };

  // Navigation functions
  const goToNextStage = () => {
    if (!courseData.title || !courseData.description || !courseData.subject || !courseData.stage) {
      toast.error("Please fill in all required fields!");
      return;
    }
    setCurrentStage(2);
  };

  const goToPreviousStage = () => {
    setCurrentStage(1);
  };

  async function onFormSubmit(e) {
    e.preventDefault();
    
    if (!courseData.title || !courseData.description || !courseData.subject || !courseData.stage) {
      toast.error("Title, description, subject, and stage are required!");
      return;
    }

    // Calculate total lessons
    const totalUnitLessons = courseData.units.reduce((sum, unit) => sum + unit.lessons.length, 0);
    const totalDirectLessons = courseData.directLessons.length;
    const totalLessons = totalUnitLessons + totalDirectLessons;

    if (totalLessons === 0) {
      toast.error("Please add at least one lesson to your course!");
      return;
    }

    setIsCreatingCourse(true);

    const formData = new FormData();
    formData.append("title", courseData.title);
    formData.append("description", courseData.description);
    formData.append("category", courseData.category);
    formData.append("subject", courseData.subject);
    formData.append("stage", courseData.stage);
    formData.append("createdBy", courseData.createdBy);
    if (courseData.thumbnail) {
      formData.append("thumbnail", courseData.thumbnail);
    }
    formData.append("numberOfLectures", totalLessons);
    formData.append("price", courseData.price);
    formData.append("currency", courseData.currency);
    formData.append("isPaid", courseData.isPaid);
    formData.append("structureType", courseData.structureType);

    // Add course structure data
    const courseStructure = {
      units: courseData.units.map(unit => ({
        title: unit.title,
        description: unit.description,
        lessons: unit.lessons.map(lesson => ({
          title: lesson.title,
          description: lesson.description,
          lecture: lesson.lecture,
          duration: lesson.duration,
          order: lesson.order
        })),
        order: unit.order
      })),
      directLessons: courseData.directLessons.map(lesson => ({
        title: lesson.title,
        description: lesson.description,
        lecture: lesson.lecture,
        duration: lesson.duration,
        order: lesson.order
      }))
    };

    formData.append("courseStructure", JSON.stringify(courseStructure));

    const response = await dispatch(createNewCourse(formData));
    if (response?.payload?.success) {
      toast.success("Course created successfully!");
      navigate("/admin/dashboard");
    }
    setIsCreatingCourse(false);
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading course creation...</p>
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
          
          <div className="relative z-10 container mx-auto max-w-6xl">
            {/* Header */}
            <div className="text-center mb-8 lg:mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                  <FaGraduationCap className="text-white text-2xl" />
                </div>
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 mb-4">
                إنشاء دورة جديدة
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                أنشئ دورة رائعة لطلابك مع عملية الإنشاء خطوة بخطوة.
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  currentStage >= 1 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  <span className="font-semibold">1</span>
                </div>
                <div className={`w-16 h-1 ${
                  currentStage >= 2 ? 'bg-blue-500' : 'bg-gray-300'
                }`}></div>
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  currentStage >= 2 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  <span className="font-semibold">2</span>
                </div>
              </div>
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

            {/* Stage 1: Basic Course Information */}
            {currentStage === 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 lg:p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      المعلومات الأساسية للدورة
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      دعنا نبدأ بالتفاصيل الأساسية لدورتك
                    </p>
                  </div>

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
                            label="عنوان الدورة *"
                            name="title"
                            type="text"
                            placeholder="أدخل عنوان الدورة"
                            onChange={handleCourseInput}
                            value={courseData.title}
                            required
                          />
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              وصف الدورة *
                            </label>
                            <TextArea
                              name="description"
                              rows={4}
                              placeholder="أدخل وصف مفصل للدورة..."
                              onChange={handleCourseInput}
                              value={courseData.description}
                              required
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <FaUser className="text-green-500" />
                          معلومات المدرس
                        </h3>
                        
                        <InputBox
                          label="اسم المدرس"
                          name="createdBy"
                          type="text"
                          placeholder="أدخل اسم المدرس"
                          onChange={handleCourseInput}
                          value={courseData.createdBy}
                        />
                      </div>
                    </div>

                    {/* Right Column - Subject & Stage */}
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
                              value={courseData.subject}
                              onChange={handleCourseInput}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              required
                            >
                              <option value="">اختر مادة</option>
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
                              value={courseData.stage}
                              onChange={handleCourseInput}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              required
                            >
                                                      <option value="1 ابتدائي">1 ابتدائي</option>
                        <option value="2 ابتدائي">2 ابتدائي</option>
                        <option value="3 ابتدائي">3 ابتدائي</option>
                        <option value="4 ابتدائي">4 ابتدائي</option>
                        <option value="5 ابتدائي">5 ابتدائي</option>
                        <option value="6 ابتدائي">6 ابتدائي</option>
                        <option value="1 إعدادي">1 إعدادي</option>
                        <option value="2 إعدادي">2 إعدادي</option>
                        <option value="3 إعدادي">3 إعدادي</option>
                        <option value="1 ثانوي">1 ثانوي</option>
                        <option value="2 ثانوي">2 ثانوي</option>
                        <option value="3 ثانوي">3 ثانوي</option>
                        <option value="1 جامعة">1 جامعة</option>
                        <option value="2 جامعة">2 جامعة</option>
                        <option value="3 جامعة">3 جامعة</option>
                        <option value="4 جامعة">4 جامعة</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <FaImage className="text-orange-500" />
                          صورة مصغرة للدورة
                        </h3>
                        
                        <div className="relative">
                          <label htmlFor="image_uploads" className="cursor-pointer block">
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 hover:border-blue-400 dark:hover:border-blue-400 transition-colors duration-200">
                              {courseData.previewImage ? (
                                <div className="relative">
                                  <img
                                    className="w-full h-48 object-cover rounded-lg"
                                    src={courseData.previewImage}
                                    alt="Course thumbnail"
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
                                    انقر لرفع الصورة المصغرة
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                    JPG, PNG up to 5MB
                                  </p>
                                </div>
                              )}
                            </div>
                          </label>
                          
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

                  {/* Form Validation */}
                  <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                      <FaCheck className="text-blue-500" />
                      الحقول المطلوبة
                    </h4>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <li className="flex items-center gap-2">
                        {courseData.title ? (
                          <FaCheck className="text-green-500" />
                        ) : (
                          <FaTimes className="text-red-500" />
                        )}
                        عنوان الدورة
                      </li>
                      <li className="flex items-center gap-2">
                        {courseData.description ? (
                          <FaCheck className="text-green-500" />
                        ) : (
                          <FaTimes className="text-red-500" />
                        )}
                        وصف الدورة
                      </li>
                      <li className="flex items-center gap-2">
                        {courseData.subject ? (
                          <FaCheck className="text-green-500" />
                        ) : (
                          <FaTimes className="text-red-500" />
                        )}
                        المادة
                      </li>
                      <li className="flex items-center gap-2">
                        {courseData.stage ? (
                          <FaCheck className="text-green-500" />
                        ) : (
                          <FaTimes className="text-red-500" />
                        )}
                        المرحلة
                      </li>
                    </ul>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-end">
                      <button
                        onClick={goToNextStage}
                        disabled={!courseData.title || !courseData.description || !courseData.subject || !courseData.stage}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-8 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                      >
                        الخطوة التالية
                        <FaArrowRight />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

                        {/* Stage 2: Course Structure */}
            {currentStage === 2 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 lg:p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      هيكل الدورة
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      نظم محتوى دورتك مع الوحدات والدروس
                    </p>
                  </div>

                  {/* Structure Type Selection */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FaFolder className="text-blue-500" />
                      اختر هيكل الدورة
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <button
                        onClick={() => setCourseData(prev => ({ ...prev, structureType: 'direct-lessons' }))}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          courseData.structureType === 'direct-lessons'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-center">
                          <FaPlay className="text-2xl mx-auto mb-2 text-blue-500" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">دروس مباشرة</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">قائمة بسيطة من الدروس</p>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setCourseData(prev => ({ ...prev, structureType: 'units' }))}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          courseData.structureType === 'units'
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
                        onClick={() => setCourseData(prev => ({ ...prev, structureType: 'mixed' }))}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          courseData.structureType === 'mixed'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-center">
                          <FaBook className="text-2xl mx-auto mb-2 text-purple-500" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">هيكل مختلط</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">كل من الوحدات والدروس المباشرة</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Units Section */}
                  {(courseData.structureType === 'units' || courseData.structureType === 'mixed') && (
                    <div className="space-y-6 mb-8">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <FaFolder className="text-green-500" />
                          وحدات الدورة ({courseData.units.length})
                        </h3>
                        <button
                          onClick={addUnit}
                          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <FaPlus /> إضافة وحدة
                        </button>
                      </div>

              {courseData.units.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                  <FaBook className="text-4xl text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    لم يتم إنشاء وحدات بعد
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    ابدأ بإضافة وحدتك الأولى لتنظيم محتوى دورتك.
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
                        {courseData.units.map((unit, unitIndex) => (
                          <Draggable key={unit.id} draggableId={unit.id.toString()} index={unitIndex}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${
                                  snapshot.isDragging ? 'shadow-2xl rotate-2' : ''
                                }`}
                              >
                                <div className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div
                                        {...provided.dragHandleProps}
                                        className="text-gray-400 hover:text-gray-600 cursor-move"
                                      >
                                        <FaGripVertical />
                                      </div>
                                      <button
                                        onClick={() => toggleUnitExpansion(unit.id)}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                      >
                                        {expandedUnits.has(unit.id) ? <FaChevronDown /> : <FaChevronRight />}
                                      </button>
                                      <FaFolder className="text-blue-500" />
                                      <div className="flex-1">
                                        {editingUnit === unit.id ? (
                                          <div className="space-y-2">
                                            <input
                                              type="text"
                                              value={unit.title}
                                              onChange={(e) => updateUnit(unit.id, 'title', e.target.value)}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                              placeholder="عنوان الوحدة"
                                            />
                                            <textarea
                                              value={unit.description}
                                              onChange={(e) => updateUnit(unit.id, 'description', e.target.value)}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                              placeholder="وصف الوحدة"
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
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                              {unit.title || "Untitled Unit"}
                                            </h3>
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
                                        onClick={() => setEditingUnit(unit.id)}
                                        className="text-blue-500 hover:text-blue-700"
                                      >
                                        <FaEdit />
                                      </button>
                                      <button
                                        onClick={() => deleteUnit(unit.id)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <FaTrash />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Unit Lessons */}
                                  {expandedUnits.has(unit.id) && (
                                    <div className="mt-4 space-y-3">
                                      <div className="flex justify-between items-center">
                                        <h4 className="font-medium text-gray-700 dark:text-gray-300">
                                          Lessons in this unit (Drag to reorder)
                                        </h4>
                                        <button
                                          onClick={() => addLessonToUnit(unit.id)}
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
                                        <Droppable droppableId={unit.id.toString()} type="lesson">
                                          {(provided) => (
                                            <div 
                                              {...provided.droppableProps}
                                              ref={provided.innerRef}
                                              className="space-y-2"
                                            >
                                              {unit.lessons.map((lesson, lessonIndex) => (
                                                <Draggable key={lesson.id} draggableId={lesson.id.toString()} index={lessonIndex}>
                                                  {(provided, snapshot) => (
                                                    <div
                                                      ref={provided.innerRef}
                                                      {...provided.draggableProps}
                                                      className={`flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg ${
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
                                                        {editingLesson === lesson.id ? (
                                                          <div className="space-y-2">
                                                            <input
                                                              type="text"
                                                              value={lesson.title}
                                                              onChange={(e) => updateLessonInUnit(unit.id, lesson.id, 'title', e.target.value)}
                                                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                                                              placeholder="Lesson title"
                                                            />
                                                            <textarea
                                                              value={lesson.description}
                                                              onChange={(e) => updateLessonInUnit(unit.id, lesson.id, 'description', e.target.value)}
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
                                                                إلغاء
                                                              </button>
                                                            </div>
                                                          </div>
                                                        ) : (
                                                          <div>
                                                            <div className="font-medium text-gray-900 dark:text-white">
                                                              {lesson.title || "درس بدون عنوان"}
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
                                                          onClick={() => setEditingLesson(lesson.id)}
                                                          className="text-blue-500 hover:text-blue-700 text-sm"
                                                        >
                                                          <FaEdit />
                                                        </button>
                                                        <button
                                                          onClick={() => deleteLessonFromUnit(unit.id, lesson.id)}
                                                          className="text-red-500 hover:text-red-700 text-sm"
                                                        >
                                                          <FaTrash />
                                                        </button>
                                                      </div>
                                                    </div>
                                                  )}
                                                </Draggable>
                                              ))}
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
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          )}



                  {/* Direct Lessons Section */}
                  {(courseData.structureType === 'direct-lessons' || courseData.structureType === 'mixed') && (
                    <div className="space-y-6 mb-8">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <FaPlay className="text-blue-500" />
                          الدروس المباشرة ({courseData.directLessons.length})
                        </h3>
                        <button
                          onClick={addDirectLesson}
                          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <FaPlus /> إضافة درس مباشر
                        </button>
                      </div>

                      {courseData.directLessons.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <FaPlay className="text-4xl text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            لم يتم إنشاء دروس مباشرة بعد
                          </h4>
                          <p className="text-gray-500 dark:text-gray-400">
                            أضف الدروس التي لا تنتمي إلى وحدة محددة.
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
                                {courseData.directLessons.map((lesson, index) => (
                                  <Draggable key={lesson.id} draggableId={lesson.id.toString()} index={index}>
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
                                            {editingLesson === lesson.id ? (
                                              <div className="space-y-2">
                                                <input
                                                  type="text"
                                                  value={lesson.title}
                                                  onChange={(e) => updateDirectLesson(lesson.id, 'title', e.target.value)}
                                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                  placeholder="Lesson title"
                                                />
                                                <textarea
                                                  value={lesson.description}
                                                  onChange={(e) => updateDirectLesson(lesson.id, 'description', e.target.value)}
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
                                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {lesson.description}
                                                  </p>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => setEditingLesson(lesson.id)}
                                              className="text-blue-500 hover:text-blue-700"
                                            >
                                              <FaEdit />
                                            </button>
                                            <button
                                              onClick={() => deleteDirectLesson(lesson.id)}
                                              className="text-red-500 hover:text-red-700"
                                            >
                                              <FaTrash />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      )}
                    </div>
                  )}

                  {/* Course Summary */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                      <FaInfo className="text-blue-500" />
                      ملخص الدورة
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FaBook className="text-blue-500" />
                        <span className="text-gray-700 dark:text-gray-300">العنوان:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{courseData.title || 'Not set'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaTag className="text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">المادة:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {subjects.find(s => s._id === courseData.subject)?.title || 'Not selected'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaUsers className="text-purple-500" />
                        <span className="text-gray-700 dark:text-gray-300">المرحلة:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{courseData.stage}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaFolder className="text-orange-500" />
                        <span className="text-gray-700 dark:text-gray-300">الوحدات:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{courseData.units.length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPlay className="text-red-500" />
                        <span className="text-gray-700 dark:text-gray-300">الدروس المباشرة:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{courseData.directLessons.length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaStar className="text-yellow-500" />
                        <span className="text-gray-700 dark:text-gray-300">إجمالي الدروس:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {courseData.units.reduce((sum, unit) => sum + unit.lessons.length, 0) + courseData.directLessons.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={goToPreviousStage}
                      className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <FaArrowLeft />
                      الخطوة السابقة
                    </button>
                    
                    <button
                      onClick={onFormSubmit}
                      disabled={isCreatingCourse || (courseData.units.reduce((sum, unit) => sum + unit.lessons.length, 0) + courseData.directLessons.length === 0)}
                      className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-8 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                      {isCreatingCourse ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          جاري إنشاء الدورة...
                        </>
                      ) : (
                        <>
                          <FaSave />
                          إنشاء الدورة
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
