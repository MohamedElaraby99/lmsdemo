import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaEye, 
  FaBook, 
  FaPlay, 
  FaGripVertical,
  FaChevronDown,
  FaChevronRight,
  FaFolder,
  FaFileAlt
} from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Layout from "../../Layout/Layout";
import InputBox from "../../Components/InputBox/InputBox";
import TextArea from "../../Components/InputBox/TextArea";

export default function CourseStructure() {
  const dispatch = useDispatch();
  const { data: user } = useSelector((state) => state.auth);
  
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    createdBy: user?.fullName || "Admin",
    units: [],
    directLessons: []
  });

  const [activeTab, setActiveTab] = useState("course-info");
  const [expandedUnits, setExpandedUnits] = useState(new Set());
  const [editingUnit, setEditingUnit] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);

  // Course Info Handlers
  const handleCourseInput = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!courseData.title || !courseData.description) {
      toast.error("Title and description are required!");
      return;
    }

    // Calculate total lessons
    const totalUnitLessons = courseData.units.reduce((sum, unit) => sum + unit.lessons.length, 0);
    const totalDirectLessons = courseData.directLessons.length;
    const totalLessons = totalUnitLessons + totalDirectLessons;

    const courseToSubmit = {
      ...courseData,
      numberOfLectures: totalLessons,
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

    console.log("Course to submit:", courseToSubmit);
    toast.success("Course structure saved!");
    // Here you would dispatch the action to save the course
  };

  return (
    <Layout>
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            Course Structure Manager
          </h1>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab("course-info")}
              className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                activeTab === "course-info"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              Course Info
            </button>
            <button
              onClick={() => setActiveTab("units")}
              className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                activeTab === "units"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              Units ({courseData.units.length})
            </button>
            <button
              onClick={() => setActiveTab("direct-lessons")}
              className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                activeTab === "direct-lessons"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              Direct Lessons ({courseData.directLessons.length})
            </button>
          </div>

          {/* Course Info Tab */}
          {activeTab === "course-info" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Course Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <InputBox
                  label="Course Title *"
                  name="title"
                  type="text"
                  placeholder="Enter course title"
                  onChange={handleCourseInput}
                  value={courseData.title}
                  required
                />
                <InputBox
                  label="Category"
                  name="category"
                  type="text"
                  placeholder="Enter course category"
                  onChange={handleCourseInput}
                  value={courseData.category}
                />
                <div className="md:col-span-2">
                  <TextArea
                    label="Course Description *"
                    name="description"
                    rows={4}
                    placeholder="Enter course description"
                    onChange={handleCourseInput}
                    value={courseData.description}
                    required
                  />
                </div>
                <InputBox
                  label="Instructor"
                  name="createdBy"
                  type="text"
                  placeholder="Enter instructor name"
                  onChange={handleCourseInput}
                  value={courseData.createdBy}
                />
              </div>
            </div>
          )}

          {/* Units Tab */}
          {activeTab === "units" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Course Units (Drag to reorder)
                </h2>
                <button
                  onClick={addUnit}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <FaPlus /> Add Unit
                </button>
              </div>

              {courseData.units.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                  <FaBook className="text-4xl text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No units created yet
                  </h3>
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

          {/* Direct Lessons Tab */}
          {activeTab === "direct-lessons" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Direct Lessons (Drag to reorder)
                </h2>
                <button
                  onClick={addDirectLesson}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <FaPlus /> Add Direct Lesson
                </button>
              </div>

              {courseData.directLessons.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                  <FaPlay className="text-4xl text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No direct lessons created yet
                  </h3>
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
                        {courseData.directLessons.map((lesson, index) => (
                          <Draggable key={lesson.id} draggableId={lesson.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 ${
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
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                          {lesson.title || "Untitled Lesson"}
                                        </h3>
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

          {/* Submit Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Save Course Structure
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
} 