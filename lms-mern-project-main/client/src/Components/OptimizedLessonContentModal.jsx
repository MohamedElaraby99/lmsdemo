import React, { useState, useEffect, useRef } from "react";
import { useSelector } from 'react-redux';
import { FaTimes, FaFilePdf, FaVideo, FaClipboardList, FaDumbbell, FaPlay, FaEye, FaSpinner, FaCheckCircle, FaTrophy } from 'react-icons/fa';
import CustomVideoPlayer from './CustomVideoPlayer';
import PDFViewer from './PDFViewer';
import ExamModal from './Exam/ExamModal';
import useLessonData from '../Helpers/useLessonData';
import { generateFileUrl } from "../utils/fileUtils";

const OptimizedLessonContentModal = ({ isOpen, onClose, courseId, lessonId, unitId = null, lessonTitle = "درس" }) => {
  const { data: userData } = useSelector((state) => state.auth);
  const { lesson, courseInfo, loading, error, refetch } = useLessonData(courseId, lessonId, unitId);
  
  const [selectedTab, setSelectedTab] = useState('video');
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [currentExamType, setCurrentExamType] = useState('exam');
  
  // CustomVideoPlayer state
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  
  // PDFViewer state
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdf, setCurrentPdf] = useState(null);

  // Reset tab when lesson changes
  useEffect(() => {
    if (lesson) {
      // Auto-select first available content type
      if (lesson.videos?.length > 0) setSelectedTab('video');
      else if (lesson.pdfs?.length > 0) setSelectedTab('pdf');
      else if (lesson.exams?.length > 0) setSelectedTab('exam');
      else if (lesson.trainings?.length > 0) setSelectedTab('training');
    }
  }, [lesson]);

  const getContentIcon = (type) => {
    switch (type) {
      case 'video': return <FaVideo className="text-blue-500" />;
      case 'pdf': return <FaFilePdf className="text-red-500" />;
      case 'exam': return <FaClipboardList className="text-purple-500" />;
      case 'training': return <FaDumbbell className="text-green-500" />;
      default: return null;
    }
  };

  const getContentTypeText = (type) => {
    switch (type) {
      case 'video': return 'الفيديوهات';
      case 'pdf': return 'الملفات';
      case 'exam': return 'الامتحانات';
      case 'training': return 'التدريبات';
      default: return '';
    }
  };

  const handleStartExam = (examOrTraining, type = 'exam') => {
    setSelectedExam(examOrTraining);
    setCurrentExamType(type);
    setExamModalOpen(true);
  };

  const handleCloseExam = () => {
    setExamModalOpen(false);
    setSelectedExam(null);
    // Refetch lesson data to get updated exam results
    refetch();
  };

  // Extract YouTube video ID from URL
  const extractYouTubeVideoId = (url) => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /youtu\.be\/([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/live\/([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+).*&si=/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
      /youtube\.com\/live\/([^&\n?#]+)\?si=/
    ];
    
    for (let i = 0; i < patterns.length; i++) {
      const match = url.match(patterns[i]);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  };

  // Get YouTube thumbnail URL
  const getYouTubeThumbnail = (videoId) => {
    if (!videoId) return '';
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const convertUrl = (url) => {
    if (!url) return null;
    
    // If it's already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a local file path, generate the proper API URL
    if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
      return generateFileUrl(url);
    }
    
    // If it's just a filename, assume it's in the pdfs folder
    return generateFileUrl(url, 'pdfs');
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setInputUrl(url);
    
    // Convert the URL immediately
    const convertedUrl = convertUrl(url);
    setConvertedUrl(convertedUrl);
    
    console.log('URL Conversion:', {
      input: url,
      converted: convertedUrl
    });
  };

  const renderVideoContent = () => (
    <div className="space-y-4">
      {lesson.videos?.map((video, index) => (
        <div key={video._id} className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl border border-blue-200 dark:border-gray-700">
          <div className="mb-4 text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{video.description}</div>
          {video.url ? (
            <div className="relative bg-black rounded-lg overflow-hidden shadow-lg aspect-video cursor-pointer group">
              {/* YouTube Thumbnail Background */}
              {(() => {
                const videoId = extractYouTubeVideoId(video.url);
                const thumbnailUrl = videoId ? getYouTubeThumbnail(videoId) : '';
                return thumbnailUrl ? (
                  <img 
                    src={thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Thumbnail failed to load, using fallback');
                      e.target.style.display = 'none';
                      e.target.parentElement.style.background = 'linear-gradient(to bottom right, #1f2937, #111827)';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900"></div>
                );
              })()}
              
              {/* Play Button Overlay */}
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-30 transition-all duration-200"
                onClick={() => {
                  setCurrentVideo(video);
                  setVideoPlayerOpen(true);
                }}
              >
                <div className="text-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 mb-4 group-hover:bg-white/30 transition-all duration-200 transform group-hover:scale-110">
                    <FaPlay className="text-white text-4xl ml-2" />
                  </div>
                  <h3 className="text-white text-lg font-semibold mb-2">{video.title}</h3>
                  <p className="text-gray-300 text-sm">انقر لمشاهدة الفيديو</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-8 text-center">
              <FaPlay className="text-4xl text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">لا يوجد رابط للفيديو</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderPdfContent = () => (
    <div className="space-y-4">
      {lesson.pdfs?.map((pdf, index) => (
        <div key={pdf._id} className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl border border-red-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <FaFilePdf className="text-red-600 dark:text-red-400 text-lg sm:text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-lg sm:text-xl text-gray-800 dark:text-gray-200 break-words">{pdf.title || pdf.fileName}</div>
              <div className="text-sm text-red-600 dark:text-red-400 font-medium">ملف PDF</div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FaFilePdf className="text-red-500 text-xl sm:text-2xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm sm:text-base break-words">{pdf.title || pdf.fileName}</div>
                  <div className="text-xs sm:text-sm text-gray-500">مستند PDF قابل للعرض</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setCurrentPdf(pdf);
                  setPdfViewerOpen(true);
                }}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <FaEye />
                عرض المستند
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderExamContent = () => (
    <div className="space-y-4">
      {lesson.exams?.map((exam, index) => (
        <div key={exam._id} className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl border border-purple-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <FaClipboardList className="text-purple-600 dark:text-purple-400 text-lg sm:text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-lg sm:text-xl text-gray-800 dark:text-gray-200 break-words">{exam.title}</div>
              <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">امتحان </div>
            </div>
            {exam.userResult?.hasTaken && (
              <div className="text-right">
                <div className="text-sm text-gray-500">النتيجة السابقة</div>
                <div className="text-lg font-bold text-green-600">{exam.userResult.percentage}%</div>
              </div>
            )}
          </div>
          
          <div className="mb-4 text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{exam.description}</div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-300">عدد الأسئلة</div>
                <div className="text-lg font-semibold">{exam.questionsCount}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-300">المدة المحددة</div>
                <div className="text-lg font-semibold">{exam.timeLimit} دقيقة</div>
              </div>
            </div>
            
            <div className="text-center">
              {exam.userResult?.hasTaken ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <FaCheckCircle />
                    <span>تم إنجاز الامتحان</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    النتيجة: {exam.userResult.score}/{exam.userResult.totalQuestions} ({exam.userResult.percentage}%)
                  </div>
                  <div className="text-xs text-gray-500">
                    تاريخ الامتحان: {new Date(exam.userResult.takenAt).toLocaleDateString('ar')}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => handleStartExam(exam, 'exam')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-200 hover:shadow-lg font-medium text-sm sm:text-base w-full sm:w-auto"
                >
                  بدء الامتحان
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTrainingContent = () => (
    <div className="space-y-4">
      {lesson.trainings?.map((training, index) => (
        <div key={training._id} className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-xl border border-green-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <FaDumbbell className="text-green-600 dark:text-green-400 text-lg sm:text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-lg sm:text-xl text-gray-800 dark:text-gray-200 break-words">{training.title}</div>
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">تدريب </div>
            </div>
            {training.attemptCount > 0 && (
              <div className="text-right">
                <div className="text-sm text-gray-500">عدد المحاولات</div>
                <div className="text-lg font-bold text-green-600">{training.attemptCount}</div>
              </div>
            )}
          </div>
          
          <div className="mb-4 text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{training.description}</div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-300">عدد الأسئلة</div>
                <div className="text-lg font-semibold">{training.questionsCount}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-300">المدة المحددة</div>
                <div className="text-lg font-semibold">{training.timeLimit} دقيقة</div>
              </div>
            </div>
            
            {training.userResults.length > 0 && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">أفضل نتيجة:</div>
                <div className="text-lg font-bold text-green-600">
                  {Math.max(...training.userResults.map(r => r.percentage))}%
                </div>
              </div>
            )}
            
            <div className="text-center">
              <button 
                onClick={() => handleStartExam(training, 'training')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-200 hover:shadow-lg font-medium text-sm sm:text-base w-full sm:w-auto"
              >
                {training.attemptCount > 0 ? 'إعادة التدريب' : 'بدء التدريب'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">جاري تحميل محتوى الدرس...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">خطأ في التحميل</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <div className="flex gap-2">
            <button onClick={refetch} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg">إعادة المحاولة</button>
            <button onClick={onClose} className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg">إغلاق</button>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 rounded-t-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight break-words">{lesson.title}</h2>
              <p className="text-blue-100 mt-1 text-sm sm:text-base leading-relaxed break-words">{lesson.description}</p>
              {courseInfo && (
                <p className="text-blue-200 mt-1 text-xs sm:text-sm">{courseInfo.title}</p>
              )}
            </div>
            <button
              className="text-white hover:text-red-200 text-xl sm:text-2xl transition-colors duration-200 flex-shrink-0 p-1"
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-6">
          {/* Navigation Tabs */}
          <div className="flex items-center justify-center mb-6 bg-gray-50 dark:bg-gray-800 rounded-xl p-2 overflow-x-auto">
            {[
              { key: 'video', label: 'الفيديوهات', icon: <FaVideo className="text-blue-500" />, count: lesson.videos?.length || 0 },
              { key: 'pdf', label: 'الملفات', icon: <FaFilePdf className="text-red-500" />, count: lesson.pdfs?.length || 0 },
              { key: 'exam', label: 'الامتحانات', icon: <FaClipboardList className="text-purple-500" />, count: lesson.exams?.length || 0 },
              { key: 'training', label: 'التدريبات', icon: <FaDumbbell className="text-green-500" />, count: lesson.trainings?.length || 0 }
            ].filter(tab => tab.count > 0).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 mx-1 flex-shrink-0 ${
                  selectedTab === tab.key
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                }`}
              >
                {tab.icon}
                <span className="font-medium text-xs sm:text-sm">{tab.label}</span>
                <span className="text-xs bg-gray-200 dark:bg-gray-600 px-1 sm:px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Content Display */}
          <div className="max-h-[60vh] overflow-y-auto">
            {selectedTab === 'video' && renderVideoContent()}
            {selectedTab === 'pdf' && renderPdfContent()}
            {selectedTab === 'exam' && renderExamContent()}
            {selectedTab === 'training' && renderTrainingContent()}
          </div>

          {/* Empty State */}
          {(!lesson.videos?.length && !lesson.pdfs?.length && !lesson.exams?.length && !lesson.trainings?.length) && (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 text-4xl sm:text-6xl mb-4">📚</div>
              <div className="text-lg sm:text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
                لا يوجد محتوى متاح
              </div>
              <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                لم يتم إضافة أي محتوى لهذا الدرس بعد
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Video Player */}
      {videoPlayerOpen && currentVideo && (() => {
        const userName = userData?.name || userData?.username || "User";
        return (
          <CustomVideoPlayer
            video={currentVideo}
            isOpen={videoPlayerOpen}
            onClose={() => {
              setVideoPlayerOpen(false);
              setCurrentVideo(null);
            }}
            onNext={() => {
              const currentIndex = lesson.videos.findIndex(v => v._id === currentVideo._id);
              if (currentIndex < lesson.videos.length - 1) {
                setCurrentVideo(lesson.videos[currentIndex + 1]);
              }
            }}
            onPrevious={() => {
              const currentIndex = lesson.videos.findIndex(v => v._id === currentVideo._id);
              if (currentIndex > 0) {
                setCurrentVideo(lesson.videos[currentIndex - 1]);
              }
            }}
            hasNext={lesson.videos.findIndex(v => v._id === currentVideo._id) < lesson.videos.length - 1}
            hasPrevious={lesson.videos.findIndex(v => v._id === currentVideo._id) > 0}
            courseTitle={lesson?.title || "Course Video"}
            userName={userName}
            courseId={courseId}
            showProgress={true}
            savedProgress={null}
          />
        );
      })()}

      {/* PDF Viewer */}
      {pdfViewerOpen && currentPdf && (() => {
        const pdfUrl = convertUrl(currentPdf.url);
        console.log('🔍 PDF Debug Info:');
        console.log('Current PDF data:', currentPdf);
        console.log('Original URL:', currentPdf.url);
        console.log('Processed URL:', pdfUrl);
        return (
          <PDFViewer
            pdfUrl={pdfUrl}
            title={currentPdf.title || currentPdf.fileName || "PDF Document"}
            isOpen={pdfViewerOpen}
            onClose={() => {
              setPdfViewerOpen(false);
              setCurrentPdf(null);
            }}
          />
        );
      })()}

      {/* Exam Modal */}
      {examModalOpen && selectedExam && (
        <ExamModal
          isOpen={examModalOpen}
          onClose={handleCloseExam}
          exam={selectedExam}
          courseId={courseId}
          lessonId={lessonId}
          unitId={unitId}
          examType={currentExamType}
        />
      )}
    </div>
  );
};

export default OptimizedLessonContentModal;
