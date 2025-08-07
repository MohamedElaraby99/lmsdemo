import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCourseLecture } from "../../Redux/Slices/LectureSlice";
import { useLocation, useNavigate } from "react-router-dom";
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
  FaUpload
} from "react-icons/fa";
import Layout from "../../Layout/Layout";
import InputBox from "../../Components/InputBox/InputBox";
import TextArea from "../../Components/InputBox/TextArea";
import { AiOutlineArrowLeft } from "react-icons/ai";

export default function AddLecture() {
  const courseDetails = useLocation().state;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: user } = useSelector((state) => state.auth);

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("course-structure");
  const [expandedUnits, setExpandedUnits] = useState(new Set());
  const [editingUnit, setEditingUnit] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const [courseData, setCourseData] = useState({
    id: courseDetails?._id,
    title: courseDetails?.title || "",
    units: courseDetails?.units || [],
    directLessons: courseDetails?.directLessons || []
  });

  const [lectureData, setLectureData] = useState({
    title: "",
    description: "",
    lecture: undefined,
    videoSrc: "",
    youtubeUrl: "",
    duration: 0
  });

  // Course Structure Handlers
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

  const updateUnit = async (unitId, field, value) => {
    try {
      // Update locally first for immediate UI feedback
      setCourseData(prev => ({
        ...prev,
        units: prev.units.map(unit => 
          unit.id === unitId ? { ...unit, [field]: value } : unit
        )
      }));

      // Send update to backend
      const response = await axiosInstance.put(`/courses/${courseData.id}/units/${unitId}`, {
        [field]: value
      });

      if (response.data.success) {
        console.log('Unit updated successfully');
      }
    } catch (error) {
      console.error('Error updating unit:', error);
      // Revert local changes if backend update fails
      setCourseData(prev => ({
        ...prev,
        units: prev.units.map(unit => 
          unit.id === unitId ? { ...unit, [field]: unit[field] } : unit
        )
      }));
    }
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

  const updateLessonInUnit = async (unitId, lessonId, field, value) => {
    try {
      // Update locally first for immediate UI feedback
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

      // Send update to backend
      const response = await axiosInstance.put(`/courses/${courseData.id}/units/${unitId}/lessons/${lessonId}`, {
        [field]: value
      });

      if (response.data.success) {
        console.log('Lesson updated successfully');
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
      // Revert local changes if backend update fails
      setCourseData(prev => ({
        ...prev,
        units: prev.units.map(unit => 
          unit.id === unitId 
            ? {
                ...unit,
                lessons: unit.lessons.map(lesson => 
                  lesson.id === lessonId ? { ...lesson, [field]: lesson[field] } : lesson
                )
              }
            : unit
        )
      }));
    }
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

  const updateDirectLesson = async (lessonId, field, value) => {
    try {
      // Update locally first for immediate UI feedback
      setCourseData(prev => ({
        ...prev,
        directLessons: prev.directLessons.map(lesson => 
          lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
        )
      }));

      // Send update to backend
      const response = await axiosInstance.put(`/courses/${courseData.id}/direct-lessons/${lessonId}`, {
        [field]: value
      });

      if (response.data.success) {
        console.log('Direct lesson updated successfully');
      }
    } catch (error) {
      console.error('Error updating direct lesson:', error);
      // Revert local changes if backend update fails
      setCourseData(prev => ({
        ...prev,
        directLessons: prev.directLessons.map(lesson => 
          lesson.id === lessonId ? { ...lesson, [field]: lesson[field] } : lesson
        )
      }));
    }
  };

  const deleteDirectLesson = (lessonId) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      setCourseData(prev => ({
        ...prev,
        directLessons: prev.directLessons.filter(lesson => lesson.id !== lessonId)
      }));
    }
  };

  // Lecture Upload Handlers
  function handleInputChange(e) {
    const { name, value } = e.target;
    setLectureData({
      ...lectureData,
      [name]: value,
    });
  }

  function handleVideo(e) {
    const video = e.target.files[0];
    const source = window.URL.createObjectURL(video);
    setLectureData({
      ...lectureData,
      lecture: video,
      videoSrc: source,
    });
  }

  const selectLessonForLecture = (unitId, lessonId) => {
    setSelectedUnit(unitId);
    setSelectedLesson(lessonId);
    setActiveTab("upload-lecture");
  };

  const selectDirectLessonForLecture = (lessonId) => {
    setSelectedUnit(null);
    setSelectedLesson(lessonId);
    setActiveTab("upload-lecture");
  };

  async function onFormSubmit(e) {
    e.preventDefault();
    
    if (!lectureData.title || !lectureData.description) {
      toast.error("Title and description are mandatory");
      return;
    }

    if (!lectureData.lecture && !lectureData.youtubeUrl) {
      toast.error("Please provide either a video file or YouTube URL");
      return;
    }

    if (!selectedLesson) {
      toast.error("Please select a lesson to add the lecture to");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    if (lectureData.lecture) {
      formData.append("lecture", lectureData.lecture);
    }
    formData.append("title", lectureData.title);
    formData.append("description", lectureData.description);
    if (lectureData.youtubeUrl) {
      formData.append("youtubeUrl", lectureData.youtubeUrl);
    }
    formData.append("lessonId", selectedLesson);
    formData.append("unitId", selectedUnit);

    const data = { formData, id: courseData.id };

    const response = await dispatch(addCourseLecture(data));
    if (response?.payload?.success) {
      toast.success("Lecture added successfully!");
      navigate(-1);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (!courseDetails) navigate("/courses");
  }, []);

  return (
    <Layout>
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <header className="flex items-center justify-center relative mb-8">
            <button
              className="absolute left-2 text-xl text-green-500"
              onClick={() => navigate(-1)}
            >
              <AiOutlineArrowLeft />
            </button>
            <h1 className="text-center dark:text-purple-500 text-4xl font-bold font-inter">
              Add Lecture to Course
            </h1>
          </header>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab("course-structure")}
              className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                activeTab === "course-structure"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              Course Structure
            </button>
            <button
              onClick={() => setActiveTab("upload-lecture")}
              className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                activeTab === "upload-lecture"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              Upload Lecture
            </button>
          </div>

          {/* Course Structure Tab */}
          {activeTab === "course-structure" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  Course: {courseData.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Select a lesson to add your lecture to, or create new units and lessons.
                </p>

                {/* Units Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Course Units
                    </h3>
                    <button
                      onClick={addUnit}
                      className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <FaPlus /> Add Unit
                    </button>
                  </div>

                  {courseData.units.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <FaBook className="text-3xl text-gray-400 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No units created yet
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400">
                        Start by adding your first unit to organize your course content.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {courseData.units.map((unit, unitIndex) => (
                        <div key={unit.id || unit._id || unitIndex} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => toggleUnitExpansion(unit.id)}
                                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                  {expandedUnits.has(unit.id) ? <FaChevronDown /> : <FaChevronRight />}
                                </button>
                                <FaBook className="text-blue-500" />
                                <div className="flex-1">
                                  {editingUnit === unit.id ? (
                                    <div className="space-y-2">
                                      <input
                                        type="text"
                                        value={unit.title}
                                        onChange={(e) => updateUnit(unit.id, 'title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Unit title"
                                      />
                                      <textarea
                                        value={unit.description}
                                        onChange={(e) => updateUnit(unit.id, 'description', e.target.value)}
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
                                  <h5 className="font-medium text-gray-700 dark:text-gray-300">
                                    Lessons in this unit
                                  </h5>
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
                                  <div className="space-y-2">
                                    {unit.lessons.map((lesson, lessonIndex) => (
                                      <div key={lesson.id || lesson._id || lessonIndex} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <FaGripVertical className="text-gray-400 cursor-move" />
                                        <FaPlay className="text-green-500" />
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
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => selectLessonForLecture(unit.id, lesson.id)}
                                            className="text-green-500 hover:text-green-700 text-sm"
                                            title="Add lecture to this lesson"
                                          >
                                            <FaUpload />
                                          </button>
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
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Direct Lessons Section */}
                <div className="mt-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Direct Lessons
                    </h3>
                    <button
                      onClick={addDirectLesson}
                      className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <FaPlus /> Add Direct Lesson
                    </button>
                  </div>

                  {courseData.directLessons.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <FaPlay className="text-3xl text-gray-400 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No direct lessons created yet
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400">
                        Add lessons that don't belong to any specific unit.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {courseData.directLessons.map((lesson, index) => (
                        <div key={lesson.id || lesson._id || index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                          <div className="flex items-center gap-3">
                            <FaGripVertical className="text-gray-400 cursor-move" />
                            <FaPlay className="text-green-500" />
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
                                onClick={() => selectDirectLessonForLecture(lesson.id)}
                                className="text-green-500 hover:text-green-700"
                                title="Add lecture to this lesson"
                              >
                                <FaUpload />
                              </button>
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
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Upload Lecture Tab */}
          {activeTab === "upload-lecture" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Upload Lecture
              </h2>
              
              {selectedLesson ? (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-200">
                    Adding lecture to: <strong>{selectedUnit ? 'Unit Lesson' : 'Direct Lesson'}</strong>
                  </p>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-200">
                    Please select a lesson from the Course Structure tab first.
                  </p>
                </div>
              )}

              <form onSubmit={onFormSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {/* Video Upload */}
                    <div className="border border-gray-300 h-[200px] flex justify-center cursor-pointer rounded-lg">
                      {lectureData.videoSrc && (
                  <video
                    muted
                          src={lectureData.videoSrc}
                    controls
                    controlsList="nodownload nofullscreen"
                    disablePictureInPicture
                          className="object-fill w-full rounded-lg"
                    onClick={(e) => {
                      e.preventDefault();
                            document.getElementById('lecture').click();
                    }}
                  ></video>
                )}
                      {!lectureData.videoSrc && (
                  <label
                          className="font-[500] text-xl h-full w-full flex justify-center items-center cursor-pointer font-lato rounded-lg"
                    htmlFor="lecture"
                  >
                    Choose Your Video
                  </label>
                )}
                <input
                  type="file"
                  className="hidden"
                  id="lecture"
                  name="lecture"
                  onChange={handleVideo}
                  accept="video/mp4, video/x-mp4, video/*"
                />
              </div>
              
              {/* YouTube URL Input */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-700 dark:text-white">
                  Or Enter YouTube URL
                </label>
                <input
                  type="url"
                  name="youtubeUrl"
                  placeholder="https://www.youtube.com/watch?v=..."
                        value={lectureData.youtubeUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500">
                  Enter a YouTube video URL instead of uploading a file
                </p>
              </div>
            </div>
                  <div className="space-y-4">
                    {/* Title */}
              <InputBox
                      label="Lecture Title"
                      name="title"
                      type="text"
                      placeholder="Enter Lecture Title"
                onChange={handleInputChange}
                      value={lectureData.title}
              />
                    {/* Description */}
              <TextArea
                      label="Lecture Description"
                      name="description"
                rows={5}
                      type="text"
                      placeholder="Enter Lecture Description"
                onChange={handleInputChange}
                      value={lectureData.description}
              />
            </div>
          </div>

                {/* Submit Button */}
                <div className="flex justify-center">
          <button
            type="submit"
                    disabled={isLoading || !selectedLesson}
                    className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
                    {isLoading ? "Adding Lecture..." : "Add Lecture"}
          </button>
                </div>
        </form>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
