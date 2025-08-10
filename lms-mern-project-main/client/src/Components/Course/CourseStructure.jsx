import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  addUnitToCourse, 
  addLessonToUnit, 
  addDirectLessonToCourse, 
  updateLesson, 
  deleteLesson, 
  reorderLessons 
} from '../../Redux/Slices/CourseSlice';
import { FaPlus, FaEdit, FaTrash, FaGripVertical, FaPlay, FaFilePdf, FaFileAlt, FaClipboardCheck, FaTasks } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const CourseStructure = ({ course, onUpdate }) => {
  const dispatch = useDispatch();
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState({ unitIndex: null, show: false });
  const [showAddDirectLesson, setShowAddDirectLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [newUnit, setNewUnit] = useState({ title: '', description: '' });
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: 0,
    price: 0,
    isFree: false,
    content: '',
    lessonType: 'video',
    // Content-specific fields
    videoContent: {
      videoFile: null,
      videoUrl: '',
      videoProvider: 'local',
      subtitles: ''
    },
    pdfContent: {
      pdfFile: null,
      pdfUrl: '',
      pageCount: 0,
      downloadable: true
    },
    examContent: {
      questions: [],
      timeLimit: 60,
      passingScore: 70,
      maxAttempts: 3,
      shuffleQuestions: true
    },
    assignmentContent: {
      instructions: '',
      attachments: [],
      dueDate: '',
      maxPoints: 100,
      submissionType: 'file',
      allowLateSubmission: false
    }
  });

  const handleAddUnit = async () => {
    if (!newUnit.title.trim()) {
      toast.error('Unit title is required');
      return;
    }

    try {
      await dispatch(addUnitToCourse({ 
        courseId: course._id, 
        unitData: newUnit 
      })).unwrap();
      toast.success('Unit added successfully');
      setShowAddUnit(false);
      setNewUnit({ title: '', description: '' });
      onUpdate();
    } catch (error) {
      console.error('Error adding unit:', error);
      toast.error(error.response?.data?.message || 'Failed to add unit');
    }
  };

  const handleAddLesson = async (unitIndex = null) => {
    if (!newLesson.title.trim()) {
      toast.error('Lesson title is required');
      return;
    }

    try {
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('title', newLesson.title);
      formData.append('description', newLesson.description);
      formData.append('duration', newLesson.duration);
      formData.append('price', newLesson.price);
      formData.append('isFree', newLesson.isFree);
      formData.append('lessonType', newLesson.lessonType);

      // Add content-specific data
      if (newLesson.lessonType === 'video') {
        formData.append('videoContent', JSON.stringify(newLesson.videoContent));
        if (newLesson.videoContent.videoFile) {
          formData.append('videoFile', newLesson.videoContent.videoFile);
        }
      } else if (newLesson.lessonType === 'pdf') {
        formData.append('pdfContent', JSON.stringify(newLesson.pdfContent));
        if (newLesson.pdfContent.pdfFile) {
          formData.append('pdfFile', newLesson.pdfContent.pdfFile);
        }
      } else if (newLesson.lessonType === 'exam') {
        formData.append('examContent', JSON.stringify(newLesson.examContent));
      } else if (newLesson.lessonType === 'assignment') {
        formData.append('assignmentContent', JSON.stringify(newLesson.assignmentContent));
      }

      if (unitIndex !== null) {
        await dispatch(addLessonToUnit({ 
          courseId: course._id, 
          unitIndex, 
          lessonData: formData 
        })).unwrap();
      } else {
        await dispatch(addDirectLessonToCourse({ 
          courseId: course._id, 
          lessonData: formData 
        })).unwrap();
      }
      
      toast.success('Lesson added successfully');
      setShowAddLesson({ unitIndex: null, show: false });
      setShowAddDirectLesson(false);
      resetLessonForm();
      onUpdate();
    } catch (error) {
      console.error('Error adding lesson:', error);
      toast.error(error.response?.data?.message || 'Failed to add lesson');
    }
  };

  const resetLessonForm = () => {
    setNewLesson({
      title: '',
      description: '',
      videoUrl: '',
      duration: 0,
      price: 0,
      isFree: false,
      content: '',
      lessonType: 'video',
      videoContent: {
        videoFile: null,
        videoUrl: '',
        videoProvider: 'local',
        subtitles: ''
      },
      pdfContent: {
        pdfFile: null,
        pdfUrl: '',
        pageCount: 0,
        downloadable: true
      },
      examContent: {
        questions: [],
        timeLimit: 60,
        passingScore: 70,
        maxAttempts: 3,
        shuffleQuestions: true
      },
      assignmentContent: {
        instructions: '',
        attachments: [],
        dueDate: '',
        maxPoints: 100,
        submissionType: 'file',
        allowLateSubmission: false
      }
    });
  };

  const handleEditLesson = (lesson, unitIndex, lessonIndex) => {
    setEditingLesson({ lesson, unitIndex, lessonIndex });
  };

  const handleDeleteLesson = async (unitIndex, lessonIndex) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await dispatch(deleteLesson({ 
          courseId: course._id, 
          unitIndex, 
          lessonIndex 
        })).unwrap();
        toast.success('Lesson deleted successfully');
        onUpdate();
      } catch (error) {
        console.error('Error deleting lesson:', error);
        toast.error(error.response?.data?.message || 'Failed to delete lesson');
      }
    }
  };

  const getLessonIcon = (lessonType) => {
    switch (lessonType) {
      case 'video':
        return <FaPlay className="text-blue-500" />;
      case 'pdf':
        return <FaFilePdf className="text-red-500" />;
      case 'text':
        return <FaFileAlt className="text-green-500" />;
      case 'exam':
        return <FaClipboardCheck className="text-purple-500" />;
      case 'assignment':
        return <FaTasks className="text-orange-500" />;
      default:
        return <FaFileAlt className="text-gray-500" />;
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0 دقيقة';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours} ساعة ${mins} دقيقة` : `${mins} دقيقة`;
  };

  const getArabicLessonType = (lessonType) => {
    switch (lessonType) {
      case 'video':
        return 'فيديو';
      case 'pdf':
        return 'ملف PDF';
      case 'text':
        return 'نص';
      case 'exam':
        return 'امتحان';
      case 'assignment':
        return 'مهمة';
      default:
        return 'غير محدد';
    }
  };

  const handleFileChange = (field, file) => {
    if (field === 'videoFile') {
      setNewLesson(prev => ({
        ...prev,
        videoContent: {
          ...prev.videoContent,
          videoFile: file
        }
      }));
    } else if (field === 'pdfFile') {
      setNewLesson(prev => ({
        ...prev,
        pdfContent: {
          ...prev.pdfContent,
          pdfFile: file
        }
      }));
    }
  };

  const addExamQuestion = () => {
    setNewLesson(prev => ({
      ...prev,
      examContent: {
        ...prev.examContent,
        questions: [
          ...prev.examContent.questions,
          {
            question: '',
            type: 'multiple_choice',
            options: ['', '', '', ''],
            correctAnswer: 0,
            points: 1,
            explanation: ''
          }
        ]
      }
    }));
  };

  const updateExamQuestion = (index, field, value) => {
    setNewLesson(prev => ({
      ...prev,
      examContent: {
        ...prev.examContent,
        questions: prev.examContent.questions.map((q, i) => 
          i === index ? { ...q, [field]: value } : q
        )
      }
    }));
  };

  const removeExamQuestion = (index) => {
    setNewLesson(prev => ({
      ...prev,
      examContent: {
        ...prev.examContent,
        questions: prev.examContent.questions.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          هيكل الدورة
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddUnit(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaPlus className="text-sm" />
            إضافة وحدة
          </button>
          <button
            onClick={() => setShowAddDirectLesson(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <FaPlus className="text-sm" />
            إضافة درس مباشر
          </button>
        </div>
      </div>

      {/* Units */}
      <div className="space-y-4">
        {course?.units?.map((unit, unitIndex) => (
          <div key={unitIndex} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Unit Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    الوحدة {unitIndex + 1}: {unit.title}
                  </h4>
                  {unit.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      {unit.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowAddLesson({ unitIndex, show: true })}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm"
                >
                  <FaPlus className="text-xs" />
                  إضافة درس
                </button>
              </div>
            </div>

            {/* Lessons in Unit */}
            <div className="p-4">
              {unit.lessons?.length > 0 ? (
                <div className="space-y-2">
                  {unit.lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lessonIndex}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <FaGripVertical className="text-gray-400 cursor-move" />
                        {getLessonIcon(lesson.lessonType)}
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {lesson.title}
                          </h5>
                          {lesson.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              {lesson.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>{formatDuration(lesson.duration)}</span>
                            <span>{lesson.isFree ? 'مجاني' : `$${lesson.price}`}</span>
                            <span className="capitalize">{getArabicLessonType(lesson.lessonType)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditLesson(lesson, unitIndex, lessonIndex)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(unitIndex, lessonIndex)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  لا توجد دروس في هذه الوحدة بعد
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Direct Lessons */}
      {course?.directLessons?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              الدروس المباشرة (غير مرتبطة بوحدات)
            </h4>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {course.directLessons.map((lesson, lessonIndex) => (
                <div
                  key={lessonIndex}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FaGripVertical className="text-gray-400 cursor-move" />
                    {getLessonIcon(lesson.lessonType)}
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {lesson.title}
                      </h5>
                      {lesson.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {lesson.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{formatDuration(lesson.duration)}</span>
                        <span>{lesson.isFree ? 'مجاني' : `$${lesson.price}`}</span>
                        <span className="capitalize">{getArabicLessonType(lesson.lessonType)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditLesson(lesson, null, lessonIndex)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(null, lessonIndex)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Unit Modal */}
      {showAddUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md" dir="rtl">
            <h3 className="text-lg font-semibold mb-4">إضافة وحدة جديدة</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">العنوان *</label>
                <input
                  type="text"
                  value={newUnit.title}
                  onChange={(e) => setNewUnit({ ...newUnit, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="أدخل عنوان الوحدة"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الوصف</label>
                <textarea
                  value={newUnit.description}
                  onChange={(e) => setNewUnit({ ...newUnit, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="أدخل وصف الوحدة"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddUnit}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                إضافة الوحدة
              </button>
              <button
                onClick={() => setShowAddUnit(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lesson Modal */}
      {(showAddLesson.show || showAddDirectLesson) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {showAddDirectLesson ? 'Add Direct Lesson' : 'Add Lesson to Unit'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter lesson title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newLesson.description}
                  onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="2"
                  placeholder="Enter lesson description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={newLesson.duration}
                    onChange={(e) => setNewLesson({ ...newLesson, duration: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    type="number"
                    value={newLesson.price}
                    onChange={(e) => setNewLesson({ ...newLesson, price: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lesson Type</label>
                <select
                  value={newLesson.lessonType}
                  onChange={(e) => setNewLesson({ ...newLesson, lessonType: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="text">Text</option>
                  <option value="exam">Exam</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>
              {newLesson.lessonType === 'video' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Video URL</label>
                  <input
                    type="url"
                    value={newLesson.videoUrl}
                    onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter video URL"
                  />
                </div>
              )}
              {newLesson.lessonType === 'text' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <textarea
                    value={newLesson.content}
                    onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows="4"
                    placeholder="Enter lesson content"
                  />
                </div>
              )}
              {newLesson.lessonType === 'exam' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Exam Details</h4>
                  <div>
                    <label className="block text-sm font-medium mb-1">Time Limit (minutes)</label>
                    <input
                      type="number"
                      value={newLesson.examContent.timeLimit}
                      onChange={(e) => setNewLesson({ ...newLesson, examContent: { ...newLesson.examContent, timeLimit: parseInt(e.target.value) || 0 } })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
                    <input
                      type="number"
                      value={newLesson.examContent.passingScore}
                      onChange={(e) => setNewLesson({ ...newLesson, examContent: { ...newLesson.examContent, passingScore: parseInt(e.target.value) || 0 } })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Attempts</label>
                    <input
                      type="number"
                      value={newLesson.examContent.maxAttempts}
                      onChange={(e) => setNewLesson({ ...newLesson, examContent: { ...newLesson.examContent, maxAttempts: parseInt(e.target.value) || 0 } })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Shuffle Questions</label>
                    <input
                      type="checkbox"
                      checked={newLesson.examContent.shuffleQuestions}
                      onChange={(e) => setNewLesson({ ...newLesson, examContent: { ...newLesson.examContent, shuffleQuestions: e.target.checked } })}
                      className="rounded"
                    />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mt-4">Questions</h4>
                  {newLesson.examContent.questions.map((question, qIndex) => (
                    <div key={qIndex} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium text-gray-900 dark:text-white">Question {qIndex + 1}</h5>
                        <button
                          onClick={() => removeExamQuestion(qIndex)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Question Text</label>
                        <textarea
                          value={question.question}
                          onChange={(e) => updateExamQuestion(qIndex, 'question', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          rows="2"
                          placeholder="Enter question text"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Question Type</label>
                        <select
                          value={question.type}
                          onChange={(e) => updateExamQuestion(qIndex, 'type', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="true_false">True/False</option>
                          <option value="short_answer">Short Answer</option>
                          <option value="essay">Essay</option>
                        </select>
                      </div>
                      {question.type === 'multiple_choice' && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium mb-1">Options</label>
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateExamQuestion(qIndex, 'options', question.options.map((opt, i) => i === oIndex ? e.target.value : opt))}
                                className="flex-1 p-2 border border-gray-300 rounded-md"
                                placeholder={`Option ${oIndex + 1}`}
                              />
                              <input
                                type="checkbox"
                                checked={question.correctAnswer === oIndex}
                                onChange={() => updateExamQuestion(qIndex, 'correctAnswer', oIndex)}
                                className="rounded"
                              />
                            </div>
                          ))}
                          <button
                            onClick={() => updateExamQuestion(qIndex, 'options', [...question.options, ''])}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <FaPlus /> Add Option
                          </button>
                        </div>
                      )}
                      {question.type === 'true_false' && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium mb-1">Correct Answer</label>
                          <select
                            value={question.correctAnswer}
                            onChange={(e) => updateExamQuestion(qIndex, 'correctAnswer', parseInt(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="0">True</option>
                            <option value="1">False</option>
                          </select>
                        </div>
                      )}
                      {question.type === 'short_answer' && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Correct Answer</label>
                          <input
                            type="text"
                            value={question.correctAnswer}
                            onChange={(e) => updateExamQuestion(qIndex, 'correctAnswer', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Enter correct answer"
                          />
                        </div>
                      )}
                      {question.type === 'essay' && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Correct Answer</label>
                          <textarea
                            value={question.correctAnswer}
                            onChange={(e) => updateExamQuestion(qIndex, 'correctAnswer', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            rows="3"
                            placeholder="Enter correct answer"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium mb-1">Points</label>
                        <input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateExamQuestion(qIndex, 'points', parseInt(e.target.value) || 0)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Explanation</label>
                        <textarea
                          value={question.explanation}
                          onChange={(e) => updateExamQuestion(qIndex, 'explanation', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          rows="2"
                          placeholder="Enter explanation"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addExamQuestion}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <FaPlus /> Add Question
                  </button>
                </div>
              )}
              {newLesson.lessonType === 'assignment' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Assignment Details</h4>
                  <div>
                    <label className="block text-sm font-medium mb-1">Instructions</label>
                    <textarea
                      value={newLesson.assignmentContent.instructions}
                      onChange={(e) => setNewLesson({ ...newLesson, assignmentContent: { ...newLesson.assignmentContent, instructions: e.target.value } })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows="3"
                      placeholder="Enter assignment instructions"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Due Date</label>
                    <input
                      type="date"
                      value={newLesson.assignmentContent.dueDate}
                      onChange={(e) => setNewLesson({ ...newLesson, assignmentContent: { ...newLesson.assignmentContent, dueDate: e.target.value } })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Points</label>
                    <input
                      type="number"
                      value={newLesson.assignmentContent.maxPoints}
                      onChange={(e) => setNewLesson({ ...newLesson, assignmentContent: { ...newLesson.assignmentContent, maxPoints: parseInt(e.target.value) || 0 } })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Submission Type</label>
                    <select
                      value={newLesson.assignmentContent.submissionType}
                      onChange={(e) => setNewLesson({ ...newLesson, assignmentContent: { ...newLesson.assignmentContent, submissionType: e.target.value } })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="file">File Upload</option>
                      <option value="url">URL Submission</option>
                      <option value="text">Text Submission</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Allow Late Submission</label>
                    <input
                      type="checkbox"
                      checked={newLesson.assignmentContent.allowLateSubmission}
                      onChange={(e) => setNewLesson({ ...newLesson, assignmentContent: { ...newLesson.assignmentContent, allowLateSubmission: e.target.checked } })}
                      className="rounded"
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={newLesson.isFree}
                  onChange={(e) => setNewLesson({ ...newLesson, isFree: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isFree" className="text-sm font-medium">
                 هذا الدرس مجاني
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => showAddDirectLesson ? handleAddLesson() : handleAddLesson(showAddLesson.unitIndex)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                اضافة درس
              </button>
              <button
                onClick={() => {
                  setShowAddLesson({ unitIndex: null, show: false });
                  setShowAddDirectLesson(false);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseStructure;
