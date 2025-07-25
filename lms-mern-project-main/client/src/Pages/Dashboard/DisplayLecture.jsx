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
  FaTag
} from "react-icons/fa";
import { axiosInstance } from "../../Helpers/axiosInstance";

export default function DisplayLecture() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  const { role } = useSelector((state) => state.auth);

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedUnits, setExpandedUnits] = useState(new Set());

  // Use the course data passed from state instead of fetching
  useEffect(() => {
    if (!state) {
      navigate("/admin/dashboard");
      return;
    }

    // Set the course data from state
    setCourseData(state);
    setLoading(false);
  }, [state, navigate]);

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
    if (courseData?.lectures) {
      const allUnitIds = courseData.lectures.map((_, index) => index);
      setExpandedUnits(new Set(allUnitIds));
    }
  };

  const collapseAllUnits = () => {
    setExpandedUnits(new Set());
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
              onClick={() => navigate("/admin/dashboard")}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to Dashboard
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
          
          <div className="relative z-10 container mx-auto max-w-6xl">
            {/* Header */}
            <div className="text-center mb-8 lg:mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                  <FaGraduationCap className="text-white text-2xl" />
                </div>
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 mb-4">
                {courseData.title || "Course Content"}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6">
                {courseData.description || "Explore the course content and lectures"}
              </p>
              
              {/* Course Stats */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <FaBook className="text-blue-500" />
                  <span>Category: {courseData.category || 'General'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUsers className="text-green-500" />
                  <span>Instructor: {courseData.createdBy || 'Admin'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaPlay className="text-purple-500" />
                  <span>Lectures: {courseData.lectures?.length || courseData.numberOfLectures || 0}</span>
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
                Back to Dashboard
              </button>
            </div>

            {/* Course Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 lg:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-3">
                    <FaBook className="text-blue-500" />
                    Course Content
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
                      <button
                        onClick={() => navigate("/course/addlecture", { state: { ...courseData } })}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <FaPlus />
                        Add Content
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Lectures Section */}
                  {courseData.lectures && courseData.lectures.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
                        <FaVideo className="text-green-500" />
                        Course Lectures ({courseData.lectures.length})
                      </h3>
                      {courseData.lectures.map((lecture, index) => (
                        <div key={lecture._id || index} className="bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200">
                          <div className="p-4 lg:p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <FaPlay className="text-white text-lg" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                                    {lecture.title || `Lecture ${index + 1}`}
                                  </h4>
                                  {lecture.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {lecture.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <FaClock />
                                      {lecture.duration || 'N/A'} min
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <FaCalendarAlt />
                                      {new Date(lecture.createdAt || Date.now()).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {lecture.lecture && (lecture.lecture.secure_url || lecture.lecture.youtubeUrl) && (
                                  <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                                    Video Available
                                  </span>
                                )}
                                {role === "ADMIN" && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => navigate("/course/editlecture", { state: { lecture, courseData } })}
                                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                      title="Edit Lecture"
                                    >
                                      <FaEdit className="text-sm" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (window.confirm("Are you sure you want to delete this lecture?")) {
                                          // Handle lecture deletion
                                          console.log("Delete lecture:", lecture._id);
                                        }
                                      }}
                                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                      title="Delete Lecture"
                                    >
                                      <FaTrash className="text-sm" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* No lectures message */
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <FaBook className="text-6xl text-gray-400 mx-auto mb-6" />
                      <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                        No lectures available yet
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        This course doesn't have any lectures yet. Start building your course content to help students learn effectively.
                      </p>
                      {role === "ADMIN" && (
                        <button
                          onClick={() => navigate("/course/addlecture", { state: { ...courseData } })}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 mx-auto"
                        >
                          <FaPlus />
                          Add First Lecture
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
                        <FaUsers className="text-purple-500" />
                        <span className="text-gray-700 dark:text-gray-300">Instructor:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{courseData.createdBy || 'Admin'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPlay className="text-orange-500" />
                        <span className="text-gray-700 dark:text-gray-300">Total Lectures:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{courseData.lectures?.length || courseData.numberOfLectures || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-red-500" />
                        <span className="text-gray-700 dark:text-gray-300">Created:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Date(courseData.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaStar className="text-yellow-500" />
                        <span className="text-gray-700 dark:text-gray-300">Status:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
