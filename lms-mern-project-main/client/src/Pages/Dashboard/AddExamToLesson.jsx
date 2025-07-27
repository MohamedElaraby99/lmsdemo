import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FaPlus, 
  FaTrash, 
  FaClipboardCheck, 
  FaGraduationCap,
  FaTimes, 
  FaCheck, 
  FaSpinner,
  FaArrowLeft,
  FaClock,
  FaStar,
  FaSave
} from 'react-icons/fa';
import Layout from '../../Layout/Layout';
import { axiosInstance } from '../../Helpers/axiosInstance';

const AddExamToLesson = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: user, isLoggedIn } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [examType, setExamType] = useState('training'); // 'training' or 'final'
  const [coursesList, setCoursesList] = useState([]);
  const [unitsList, setUnitsList] = useState([]);
  const [lessonsList, setLessonsList] = useState([]);

  // Exam form state
  const [examData, setExamData] = useState({
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      }
    ],
    passingScore: 70,
    timeLimit: 30
  });

  // Handle auth loading
  useEffect(() => {
    if (isLoggedIn && user) {
      setAuthLoading(false);
    } else if (!isLoggedIn) {
      setAuthLoading(false);
    }

    // Timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setAuthLoading(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [user, isLoggedIn]);

  // Fetch courses on component mount
  useEffect(() => {
    if (!authLoading && user?.role === 'ADMIN') {
      fetchCourses();
    }
  }, [authLoading, user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/courses');
      setCoursesList(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  // Update units when course changes
  useEffect(() => {
    if (selectedCourse) {
      const course = coursesList.find(c => c._id === selectedCourse);
      if (course && course.units) {
        setUnitsList(course.units);
      } else {
        setUnitsList([]);
      }
      setSelectedUnit('');
      setSelectedLesson('');
      setLessonsList([]);
    }
  }, [selectedCourse, coursesList]);

  // Update lessons when unit changes
  useEffect(() => {
    if (selectedUnit) {
      const course = coursesList.find(c => c._id === selectedCourse);
      if (course) {
        const unit = course.units.find(u => u._id === selectedUnit);
        if (unit && unit.lessons) {
          setLessonsList(unit.lessons);
        } else {
          setLessonsList([]);
        }
      }
      setSelectedLesson('');
    } else {
      // If no unit selected, show direct lessons
      const course = coursesList.find(c => c._id === selectedCourse);
      if (course && course.directLessons) {
        setLessonsList(course.directLessons);
      } else {
        setLessonsList([]);
      }
      setSelectedLesson('');
    }
  }, [selectedUnit, selectedCourse, coursesList]);

  const addQuestion = () => {
    setExamData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: ''
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    if (examData.questions.length > 1) {
      setExamData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const updateQuestion = (index, field, value) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { 
              ...q, 
              options: q.options.map((opt, j) => 
                j === optionIndex ? value : opt
              )
            }
          : q
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCourse || !selectedLesson) {
      toast.error('Please select a course and lesson');
      return;
    }

    // Validate exam data
    if (examData.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    for (let i = 0; i < examData.questions.length; i++) {
      const question = examData.questions[i];
      if (!question.question.trim()) {
        toast.error(`Question ${i + 1} is required`);
        return;
      }
      if (question.options.some(opt => !opt.trim())) {
        toast.error(`Question ${i + 1} must have 4 options`);
        return;
      }
    }

    try {
      setSaving(true);
      
      const course = coursesList.find(c => c._id === selectedCourse);
      const lesson = lessonsList.find(l => l._id === selectedLesson);
      
      if (!course || !lesson) {
        toast.error('Invalid course or lesson selection');
        return;
      }

      let endpoint;
      if (selectedUnit) {
        // Unit lesson
        endpoint = `/courses/${selectedCourse}/units/${selectedUnit}/lessons/${selectedLesson}/${examType}-exam`;
      } else {
        // Direct lesson
        endpoint = `/courses/${selectedCourse}/direct-lessons/${selectedLesson}/${examType}-exam`;
      }

      const response = await axiosInstance.post(endpoint, {
        questions: examData.questions,
        passingScore: examData.passingScore,
        timeLimit: examData.timeLimit
      });

      toast.success(`${examType === 'training' ? 'Training' : 'Final'} exam added successfully!`);
      
      // Reset form
      setExamData({
        questions: [
          {
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            explanation: ''
          }
        ],
        passingScore: 70,
        timeLimit: 30
      });
      setSelectedLesson('');
      
      // Refresh courses to get updated data
      fetchCourses();
      
    } catch (error) {
      console.error('Error adding exam:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to add exam');
      }
    } finally {
      setSaving(false);
    }
  };

  const hasTrainingExam = (lesson) => {
    return lesson.trainingExam && lesson.trainingExam.questions && lesson.trainingExam.questions.length > 0;
  };

  const hasFinalExam = (lesson) => {
    return lesson.finalExam && lesson.finalExam.questions && lesson.finalExam.questions.length > 0;
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Check if user is admin
  if (!user || user.role !== 'ADMIN') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 flex items-center justify-center">
          <div className="text-center">
            <FaTimes className="text-6xl text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this page.</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">User role: {user?.role || 'Not logged in'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
            >
              <FaArrowLeft />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Add Exam to Lesson
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create training and final exams for lessons
            </p>
          </div>

          {/* Main Form */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Course Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Course *
                    </label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    >
                      <option value="">Choose a course...</option>
                      {coursesList.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Unit Selection (Optional) */}
                  {selectedCourse && unitsList.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Unit (Optional)
                      </label>
                      <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">Choose a unit (or skip for direct lessons)...</option>
                        {unitsList.map((unit) => (
                          <option key={unit._id} value={unit._id}>
                            {unit.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Lesson Selection */}
                  {selectedCourse && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Lesson *
                      </label>
                      <select
                        value={selectedLesson}
                        onChange={(e) => setSelectedLesson(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      >
                        <option value="">Choose a lesson...</option>
                        {lessonsList.map((lesson) => (
                          <option key={lesson._id} value={lesson._id}>
                            {lesson.title} 
                            {hasTrainingExam(lesson) && ' (Has Training Exam)'}
                            {hasFinalExam(lesson) && ' (Has Final Exam)'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Exam Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exam Type *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="examType"
                        value="training"
                        checked={examType === 'training'}
                        onChange={(e) => setExamType(e.target.value)}
                        className="mr-2"
                      />
                      <div className="flex items-center gap-2">
                        <FaClipboardCheck className="text-purple-500" />
                        <span>Training Exam</span>
                      </div>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="examType"
                        value="final"
                        checked={examType === 'final'}
                        onChange={(e) => setExamType(e.target.value)}
                        className="mr-2"
                      />
                      <div className="flex items-center gap-2">
                        <FaGraduationCap className="text-red-500" />
                        <span>Final Exam</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Exam Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Passing Score (%) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={examData.passingScore}
                      onChange={(e) => setExamData(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time Limit (minutes) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={examData.timeLimit}
                      onChange={(e) => setExamData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* Questions Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Questions ({examData.questions.length})
                    </h3>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <FaPlus />
                      Add Question
                    </button>
                  </div>

                  <div className="space-y-6">
                    {examData.questions.map((question, questionIndex) => (
                      <div key={questionIndex} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-medium text-gray-900 dark:text-white">
                            Question {questionIndex + 1}
                          </h4>
                          {examData.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestion(questionIndex)}
                              className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>

                        {/* Question Text */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Question Text *
                          </label>
                          <textarea
                            value={question.question}
                            onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                            placeholder="Enter the question..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            rows="3"
                            required
                          />
                        </div>

                        {/* Options */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Options *
                          </label>
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name={`correct-${questionIndex}`}
                                  checked={question.correctAnswer === optionIndex}
                                  onChange={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                                  className="mr-2"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                                  placeholder={`Option ${optionIndex + 1}`}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  required
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Explanation */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Explanation (Optional)
                          </label>
                          <textarea
                            value={question.explanation}
                            onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                            placeholder="Explain why this answer is correct..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            rows="2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving || !selectedCourse || !selectedLesson || examData.questions.length === 0}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Add {examType === 'training' ? 'Training' : 'Final'} Exam
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Instructions */}
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Instructions
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span>Select a course and lesson to add exams</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span>Choose between Training Exam (practice) or Final Exam (assessment)</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span>Set passing score and time limit for the exam</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span>Add multiple choice questions with 4 options each</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span>Mark the correct answer for each question</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span>Students can take exams after purchasing the lesson</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddExamToLesson; 