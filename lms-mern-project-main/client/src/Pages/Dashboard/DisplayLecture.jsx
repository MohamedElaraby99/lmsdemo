import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../Layout/Layout";
import { FaBook, FaPlay, FaChevronDown, FaChevronRight, FaPlus } from "react-icons/fa";
import { axiosInstance } from "../../Helpers/axiosInstance";

export default function DisplayLecture() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  const { role } = useSelector((state) => state.auth);

  const [courseStructure, setCourseStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedUnits, setExpandedUnits] = useState(new Set());

  // Fetch course structure from API
  useEffect(() => {
    const fetchCourseStructure = async () => {
      if (!state?._id) {
        navigate("/courses");
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get(`/courses/${state._id}/structure`);
        if (response.data.success) {
          setCourseStructure(response.data.course);
        }
      } catch (error) {
        console.error('Error fetching course structure:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseStructure();
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
    if (courseStructure?.units) {
      const allUnitIds = courseStructure.units.map(unit => unit.id || unit._id);
      setExpandedUnits(new Set(allUnitIds));
    }
  };

  const collapseAllUnits = () => {
    setExpandedUnits(new Set());
  };

  if (loading) {
    return (
      <Layout hideFooter={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading course structure...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!courseStructure) {
    return (
      <Layout hideFooter={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Course not found</p>
            <button 
              onClick={() => navigate("/courses")}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooter={true}>
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {courseStructure.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {courseStructure.description}
            </p>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <span>Total Lessons: {courseStructure.totalLessons}</span>
              <span>Units: {courseStructure.units?.length || 0}</span>
              <span>Direct Lessons: {courseStructure.directLessons?.length || 0}</span>
            </div>
          </div>

          {/* Course Structure */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Course Structure
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={expandAllUnits}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAllUnits}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                >
                  Collapse All
                </button>
                {role === "ADMIN" && (
                  <button
                    onClick={() => navigate("/course/addlecture", { state: { ...state } })}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
                  >
                    <FaPlus size={12} />
                    Add Content
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {/* Units */}
              {courseStructure.units && courseStructure.units.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    Course Units
                  </h3>
                  {courseStructure.units.map((unit, unitIndex) => (
                    <div key={unit.id || unit._id || unitIndex} className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleUnitExpansion(unit.id || unit._id || unitIndex)}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            >
                              {expandedUnits.has(unit.id || unit._id || unitIndex) ? <FaChevronDown /> : <FaChevronRight />}
                            </button>
                            <FaBook className="text-blue-500" />
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {unit.title || `Unit ${unitIndex + 1}`}
                              </h4>
                              {unit.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {unit.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {unit.lessons?.length || 0} lessons
                            </span>
                            {unit.order !== undefined && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Order: {unit.order}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Unit Lessons */}
                        {expandedUnits.has(unit.id || unit._id || unitIndex) && unit.lessons && unit.lessons.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {unit.lessons.map((lesson, lessonIndex) => (
                              <div 
                                key={lesson.id || lesson._id || lessonIndex} 
                                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500"
                              >
                                <FaPlay className="text-green-500" />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {lesson.title || `Lesson ${lessonIndex + 1}`}
                                  </p>
                                  {lesson.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {lesson.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {lesson.lecture && (lesson.lecture.secure_url || lesson.lecture.youtubeUrl) && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                      Video
                                    </span>
                                  )}
                                  {lesson.duration && lesson.duration > 0 && (
                                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                      {lesson.duration} min
                                    </span>
                                  )}
                                  {lesson.order !== undefined && (
                                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                      {lesson.order}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Direct Lessons */}
              {courseStructure.directLessons && courseStructure.directLessons.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    Direct Lessons
                  </h3>
                  {courseStructure.directLessons.map((lesson, lessonIndex) => (
                    <div 
                      key={lesson.id || lesson._id || lessonIndex} 
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <FaPlay className="text-green-500" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {lesson.title || `Direct Lesson ${lessonIndex + 1}`}
                        </p>
                        {lesson.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {lesson.lecture && (lesson.lecture.secure_url || lesson.lecture.youtubeUrl) && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Video
                          </span>
                        )}
                        {lesson.duration && lesson.duration > 0 && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {lesson.duration} min
                          </span>
                        )}
                        {lesson.order !== undefined && (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {lesson.order}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No content message */}
              {(!courseStructure.units || courseStructure.units.length === 0) && 
               (!courseStructure.directLessons || courseStructure.directLessons.length === 0) && (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <FaBook className="text-4xl text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No course content yet
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    This course doesn't have any units or lessons yet.
                  </p>
                  {role === "ADMIN" && (
                    <button
                      onClick={() => navigate("/course/addlecture", { state: { ...state } })}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      Add First Content
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
