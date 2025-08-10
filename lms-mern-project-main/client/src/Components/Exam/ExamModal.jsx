import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaTimes, 
  FaClock, 
  FaCheck, 
  FaTimes as FaX, 
  FaChevronLeft, 
  FaChevronRight,
  FaPlay,
  FaPause,
  FaRedo,
  FaChartBar,
  FaTrophy,
  FaExclamationTriangle
} from 'react-icons/fa';
import { takeTrainingExam, takeFinalExam, clearExamError, clearLastExamResult } from '../../Redux/Slices/ExamSlice';
import { axiosInstance } from '../../Helpers/axiosInstance';

const ExamModal = ({ isOpen, onClose, exam, courseId, lessonId, unitId, examType = 'training' }) => {
  const dispatch = useDispatch();
  const { loading, error, lastExamResult } = useSelector(state => state.exam);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(() => {
    const limit = exam?.timeLimit;
    console.log('ExamModal: Setting initial timeLimit from exam data:', limit);
    return (limit && !isNaN(limit)) ? limit * 60 : 1800; // Default to 30 minutes (1800 seconds)
  });
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const questions = exam?.questions || [];
  const totalQuestions = questions.length;

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, timeLeft]);

  // Reset state when exam changes
  useEffect(() => {
    if (exam && !examStarted) {
      const limit = exam.timeLimit;
      console.log('ExamModal: Resetting timeLimit from exam data:', limit);
      const validLimit = (limit && !isNaN(limit)) ? limit * 60 : 1800; // Default to 30 minutes
      setTimeLeft(validLimit);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setExamCompleted(false);
      setShowResults(false);
      setTimeTaken(0);
    }
  }, [exam]);

  // Handle exam result
  useEffect(() => {
    if (lastExamResult && !showResults) {
      setShowResults(true);
      setExamCompleted(true);
      setIsTimerRunning(false);
    }
  }, [lastExamResult]);

  const formatTime = (seconds) => {
    // Ensure seconds is a valid number
    if (isNaN(seconds) || seconds < 0) {
      return "00:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExam = () => {
    setExamStarted(true);
    setIsTimerRunning(true);
    startTimeRef.current = Date.now();
  };

  const handleAnswerSelect = (questionIndex, selectedAnswer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedAnswer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitExam = () => {
    if (loading) return;

    const timeTakenMinutes = Math.round((Date.now() - startTimeRef.current) / 60000);
    setTimeTaken(timeTakenMinutes);
    setIsTimerRunning(false);

    const examData = {
      courseId,
      lessonId,
      unitId,
      examId: exam._id,
      answers: Object.keys(answers).map(key => ({
        questionIndex: parseInt(key),
        selectedAnswer: answers[key]
      })),
      startTime: new Date(startTimeRef.current).toISOString(), // Send start time to backend
      timeTaken: timeTakenMinutes // Keep for backwards compatibility
    };

    console.log('=== EXAM SUBMISSION DEBUG ===');
    console.log('Exam Type:', examType);
    console.log('Exam Object:', exam);
    console.log('Exam ID:', exam._id);
    console.log('Course ID:', courseId);
    console.log('Lesson ID:', lessonId);
    console.log('Unit ID:', unitId);
    console.log('Exam Data:', examData);
    console.log('Total Questions:', totalQuestions);
    console.log('Answers:', answers);

    if (examType === 'training') {
      dispatch(takeTrainingExam(examData));
    } else {
      dispatch(takeFinalExam(examData));
    }
  };

  const handleClose = () => {
    if (examStarted && !examCompleted) {
      if (window.confirm('هل أنت متأكد من إغلاق الامتحان؟ سيتم فقدان تقدمك.')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const getQuestionStatus = (index) => {
    if (answers[index] !== undefined) return 'answered';
    return 'unanswered';
  };

  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    if (!question) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              السؤال {currentQuestionIndex + 1} من {totalQuestions}
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <FaClock className="text-red-500" />
              <span className={timeLeft < 300 ? 'text-red-600 font-bold' : ''}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
            {question.question}
          </h3>

          {/* Question Image */}
          {question.image && (
            <div className="mb-4">
              <img 
                src={question.image.startsWith('http') ? question.image : `${axiosInstance.defaults.baseURL}${question.image}`}
                alt="صورة السؤال" 
                className="max-w-full h-auto rounded-lg shadow-md"
                onError={(e) => {
                  console.error('Failed to load image:', question.image);
                  console.error('Attempted URL:', e.target.src);
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          {question.options.map((option, optionIndex) => (
            <label
              key={optionIndex}
              className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                answers[currentQuestionIndex] === optionIndex
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestionIndex}`}
                value={optionIndex}
                checked={answers[currentQuestionIndex] === optionIndex}
                onChange={() => handleAnswerSelect(currentQuestionIndex, optionIndex)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                answers[currentQuestionIndex] === optionIndex
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300 dark:border-gray-500'
              }`}>
                {answers[currentQuestionIndex] === optionIndex && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <span className="text-gray-700 dark:text-gray-300">{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderQuestionNavigation = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">أسئلة الامتحان</h4>
        <div className="text-sm text-gray-500">
          {Object.keys(answers).length} من {totalQuestions} تمت الإجابة
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestionIndex(index)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
              index === currentQuestionIndex
                ? 'bg-blue-600 text-white'
                : getQuestionStatus(index) === 'answered'
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-2 border-green-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );

  const renderResults = () => {
    if (!lastExamResult) return null;

    const { score, totalQuestions, correctAnswers, wrongAnswers } = lastExamResult;
    const percentage = Math.round((score / totalQuestions) * 100);
    
    // Calculate if passed based on percentage (you can adjust the passing threshold)
    const passingThreshold = 50; // 50% to pass
    const passed = percentage >= passingThreshold;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="text-center mb-6">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
            passed ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
          }`}>
            {passed ? (
              <FaTrophy className="text-3xl text-green-600 dark:text-green-400" />
            ) : (
              <FaExclamationTriangle className="text-3xl text-red-600 dark:text-red-400" />
            )}
          </div>
          
          <h3 className={`text-2xl font-bold mb-2 ${
            passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {passed ? 
              (percentage === 100 ? 'ممتاز! درجة كاملة!' : 
               percentage >= 90 ? 'مبروك! أداء ممتاز' : 
               percentage >= 80 ? 'مبروك! أداء جيد جداً' : 
               percentage >= 70 ? 'مبروك! أداء جيد' : 
               'مبروك! لقد نجحت في الامتحان') 
              : 'حاول مرة أخرى'}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300">
            {passed ? 
              (percentage === 100 ? 'أداء مثالي! تهانينا على الدرجة الكاملة' :
               percentage >= 90 ? 'أداء ممتاز! استمر في التفوق' :
               percentage >= 80 ? 'أداء رائع! واصل التقدم' :
               percentage >= 70 ? 'أداء جيد! يمكنك تحسينه أكثر' :
               'لقد نجحت! استمر في التعلم') 
              : 'لا تستسلم، راجع المادة وحاول مرة أخرى'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{percentage}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">النسبة المئوية</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{score}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">الدرجة</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">الإجابات الصحيحة</span>
            <span className="font-semibold text-green-600 dark:text-green-400">{correctAnswers}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">الإجابات الخاطئة</span>
            <span className="font-semibold text-red-600 dark:text-red-400">{wrongAnswers}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">الوقت المستغرق</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">{timeTaken} دقيقة</span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            إغلاق
          </button>
          <button
            onClick={() => {
              setExamStarted(false);
              setShowResults(false);
              dispatch(clearLastExamResult());
            }}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            إعادة الامتحان
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen || !exam) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{exam.title}</h2>
              <p className="text-blue-100 mt-1">{exam.description}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-red-200 text-2xl transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          {error && (
            <div className="mb-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {!examStarted ? (
            // Exam Start Screen
            <div className="text-center py-12">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg max-w-md mx-auto">
                <div className="text-6xl mb-6">📝</div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  {exam.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {exam.description}
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">عدد الأسئلة</span>
                    <span className="font-semibold">{totalQuestions}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">الوقت المحدد</span>
                    <span className="font-semibold">
                      {exam.timeLimit && !isNaN(exam.timeLimit) ? exam.timeLimit : 30} دقيقة
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleStartExam}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium text-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'جاري التحميل...' : 'ابدأ الامتحان'}
                </button>
              </div>
            </div>
          ) : showResults ? (
            // Results Screen
            renderResults()
          ) : (
            // Exam Interface
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                {renderQuestion()}
                
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <FaChevronLeft />
                    السابق
                  </button>
                  
                  <button
                    onClick={handleSubmitExam}
                    disabled={loading || Object.keys(answers).length === 0}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? 'جاري الإرسال...' : 'إنهاء الامتحان'}
                    <FaCheck />
                  </button>
                  
                  <button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === totalQuestions - 1}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    التالي
                    <FaChevronRight />
                  </button>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                {renderQuestionNavigation()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamModal;
