import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
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
  FaCalendarAlt
} from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { axiosInstance } from "../../Helpers/axiosInstance";

export default function EditCourse() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const courseData = location.state;

  const [isUpdatingCourse, setIsUpdatingCourse] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic-info");
  const [expandedUnits, setExpandedUnits] = useState(new Set());
  const [editingUnit, setEditingUnit] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [userInput, setUserInput] = useState({
    title: courseData?.title || "",
    category: courseData?.category || "",
    subject: courseData?.subject || "",
    stage: courseData?.stage || "1 ابتدائي",
    createdBy: courseData?.createdBy || "",
    description: courseData?.description || "",
    thumbnail: null,
    previewImage: courseData?.thumbnail?.secure_url || "",
  });
  const [courseStructure, setCourseStructure] = useState({
    units: (courseData?.units || []).map(unit => ({
      ...unit,
      id: unit.id || unit._id || Date.now() + Math.random(),
      lessons: (unit.lessons || []).map(lesson => ({
        ...lesson,
        id: lesson.id || lesson._id || Date.now() + Math.random()
      }))
    })),
    directLessons: (courseData?.directLessons || []).map(lesson => ({
      ...lesson,
      id: lesson.id || lesson._id || Date.now() + Math.random()
    })),
    structureType: courseData?.structureType || "direct-lessons"
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
        toast.error('Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!courseData) {
      toast.error("No course data found");
      navigate("/admin/dashboard");
    }
  }, [courseData, navigate]);

  function handleImageUpload(e) {
    e.preventDefault();
    const uploadImage = e.target.files[0];
    if (uploadImage) {
      // Validate file size (max 5MB)
      if (uploadImage.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!uploadImage.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
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
        toast.success("Image uploaded successfully!");
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
    toast.success("Image removed");
  }

  // Course Structure Management Functions
  const addUnit = () => {
    const newUnit = {
      id: Date.now(),
      title: "",
      description: "",
      lessons: [],
      order: courseStructure.units.length
    };
    setCourseStructure(prev => ({
      ...prev,
      units: [...prev.units, newUnit]
    }));
    setEditingUnit(newUnit.id);
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

  const addLessonToUnit = (unitId) => {
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
          ? { ...unit, lessons: [...unit.lessons, newLesson] }
          : unit
      )
    }));
    setEditingLesson(newLesson.id);
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

  const addDirectLesson = () => {
    const newLesson = {
      id: Date.now(),
      title: "",
      description: "",
      lecture: {},
      duration: 0,
      order: courseStructure.directLessons.length
    };
    setCourseStructure(prev => ({
      ...prev,
      directLessons: [...prev.directLessons, newLesson]
    }));
    setEditingLesson(newLesson.id);
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

    if (type === 'unit') {
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

    if (!userInput.title || !userInput.description || !userInput.subject || !userInput.stage) {
      toast.error("Title, description, subject, and stage are mandatory!");
      return;
    }

    setIsUpdatingCourse(true);
    const formData = new FormData();
    formData.append("title", userInput.title);
    formData.append("description", userInput.description);
    formData.append("category", userInput.category);
    formData.append("subject", userInput.subject);
    formData.append("stage", userInput.stage);
    formData.append("createdBy", userInput.createdBy);
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
          order: lesson.order
        })),
        order: unit.order
      })),
      directLessons: courseStructure.directLessons.map(lesson => ({
        title: lesson.title,
        description: lesson.description,
        lecture: lesson.lecture,
        duration: lesson.duration,
        order: lesson.order
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
        toast.success("Course updated successfully!");
        navigate("/admin/dashboard");
      }
    } catch (error) {
      toast.error("Failed to update course");
    }
    setIsUpdatingCourse(false);
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading course editor...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!courseData) {
    return null;
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
                Edit Course
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Update your course information and make it even better for your students.
              </p>
            </div>

            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 font-medium"
              >
                <FaArrowLeft className="text-sm" />
                Back to Dashboard
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
                Basic Information
              </button>
              <button
                onClick={() => setActiveTab("course-structure")}
                className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                  activeTab === "course-structure"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                }`}
              >
                Course Structure ({courseStructure.units.length + courseStructure.directLessons.length})
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
                        Course Details
                      </h3>
                      
                      <div className="space-y-4">
                        <InputBox
                          label={"Course Title *"}
                          name={"title"}
                          type={"text"}
                          placeholder={"Enter course title"}
                          onChange={handleUserInput}
                          value={userInput.title}
                          required
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Course Description *
                          </label>
                          <TextArea
                            name={"description"}
                            rows={4}
                            placeholder={"Enter detailed course description..."}
                            onChange={handleUserInput}
                            value={userInput.description}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                          />
                        </div>

                        <InputBox
                          label={"Category"}
                          name={"category"}
                          type={"text"}
                          placeholder={"Enter course category"}
                          onChange={handleUserInput}
                          value={userInput.category}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FaUser className="text-green-500" />
                        Instructor Information
                      </h3>
                      
                      <InputBox
                        label={"Instructor Name"}
                        name={"createdBy"}
                        type={"text"}
                        placeholder={"Enter instructor name"}
                        onChange={handleUserInput}
                        value={userInput.createdBy}
                      />
                    </div>
                  </div>

                  {/* Right Column - Subject, Stage & Image */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FaTag className="text-purple-500" />
                        Subject & Stage
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Subject *
                          </label>
                          <select
                            name="subject"
                            value={userInput.subject}
                            onChange={handleUserInput}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          >
                            <option value="">Select a subject</option>
                            {subjects.map((subject) => (
                              <option key={subject._id} value={subject._id}>
                                {subject.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Stage *
                          </label>
                          <select
                            name="stage"
                            value={userInput.stage}
                            onChange={handleUserInput}
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
                        Course Thumbnail
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
                                  Click to upload thumbnail
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                  JPG, PNG up to 5MB
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
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={removeImage}
                              className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm"
                            >
                              <FaTrash className="text-xs" />
                              Remove
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
                    Course Information Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FaBook className="text-blue-500" />
                      <span className="text-gray-700 dark:text-gray-300">Title:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{userInput.title || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaTag className="text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">Subject:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {subjects.find(s => s._id === userInput.subject)?.title || 'Not selected'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-purple-500" />
                      <span className="text-gray-700 dark:text-gray-300">Stage:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{userInput.stage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUser className="text-orange-500" />
                      <span className="text-gray-700 dark:text-gray-300">Instructor:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{userInput.createdBy || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-500" />
                      <span className="text-gray-700 dark:text-gray-300">Category:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{userInput.category || 'General'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaGraduationCap className="text-red-500" />
                      <span className="text-gray-700 dark:text-gray-300">Status:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">Active</span>
                    </div>
                  </div>
                </div>

                {/* Form Validation */}
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                    <FaCheck className="text-blue-500" />
                    Required Fields
                  </h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li className="flex items-center gap-2">
                      {userInput.title ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      Course Title
                    </li>
                    <li className="flex items-center gap-2">
                      {userInput.description ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      Course Description
                    </li>
                    <li className="flex items-center gap-2">
                      {userInput.subject ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      Subject
                    </li>
                    <li className="flex items-center gap-2">
                      {userInput.stage ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      Stage
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={isUpdatingCourse || !userInput.title || !userInput.description || !userInput.subject || !userInput.stage}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {isUpdatingCourse ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Updating Course...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Update Course
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
                      Course Structure
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Organize your course content with units and lessons
                    </p>
                  </div>

                  {/* Structure Type Selection */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FaFolder className="text-blue-500" />
                      Choose Course Structure
                    </h3>
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
                          <h4 className="font-semibold text-gray-900 dark:text-white">Direct Lessons</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Simple list of lessons</p>
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
                          <h4 className="font-semibold text-gray-900 dark:text-white">Units with Lessons</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Organized into units</p>
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
                          <h4 className="font-semibold text-gray-900 dark:text-white">Mixed Structure</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Both units and direct lessons</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Units Section */}
                  {(courseStructure.structureType === 'units' || courseStructure.structureType === 'mixed') && (
                    <div className="space-y-6 mb-8">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <FaFolder className="text-green-500" />
                          Course Units ({courseStructure.units.length})
                        </h3>
                        <button
                          onClick={addUnit}
                          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <FaPlus /> Add Unit
                        </button>
                      </div>

                      {courseStructure.units.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <FaFolder className="text-4xl text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No units created yet
                          </h4>
                          <p className="text-gray-500 dark:text-gray-400">
                            Start by adding your first unit to organize your course content.
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
                                                                 {courseStructure.units.map((unit, unitIndex) => (
                                   <Draggable key={unit.id || unit._id || unitIndex} draggableId={(unit.id || unit._id || unitIndex).toString()} index={unitIndex}>
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
                                                      {unit.lessons.map((lesson, lessonIndex) => (
                                                        <Draggable key={lesson.id || lesson._id || lessonIndex} draggableId={(lesson.id || lesson._id || lessonIndex).toString()} index={lessonIndex}>
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
                  {(courseStructure.structureType === 'direct-lessons' || courseStructure.structureType === 'mixed') && (
                    <div className="space-y-6 mb-8">
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
                                                                 {courseStructure.directLessons.map((lesson, index) => (
                                   <Draggable key={lesson.id || lesson._id || index} draggableId={(lesson.id || lesson._id || index).toString()} index={index}>
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
                                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {lesson.description}
                                                  </p>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2">
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