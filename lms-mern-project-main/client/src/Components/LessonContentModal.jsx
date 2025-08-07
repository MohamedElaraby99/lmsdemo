import React from 'react';
import { FaTimes, FaFilePdf, FaVideo, FaClipboardList, FaDumbbell } from 'react-icons/fa';

const LessonContentModal = ({ isOpen, onClose, lesson }) => {
  if (!isOpen || !lesson) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6">
        <button
          className="absolute top-4 left-4 text-gray-500 hover:text-red-600 text-2xl"
          onClick={onClose}
        >
          <FaTimes />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-700 dark:text-blue-300">
          {lesson.title}
        </h2>
        <p className="mb-4 text-gray-700 dark:text-gray-200 text-center">{lesson.description}</p>

        {/* Videos */}
        {lesson.videos && lesson.videos.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><FaVideo /> الفيديوهات</h3>
            <div className="space-y-4">
              {lesson.videos.map((video, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="font-medium mb-1">{video.title}</div>
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">{video.description}</div>
                  {/* Assume video.url is a YouTube link or direct video link */}
                  {video.url && video.url.includes('youtube') ? (
                    <iframe
                      className="w-full aspect-video rounded"
                      src={video.url.replace('watch?v=', 'embed/')}
                      title={video.title}
                      allowFullScreen
                    />
                  ) : video.url ? (
                    <video controls className="w-full rounded">
                      <source src={video.url} type="video/mp4" />
                      متصفحك لا يدعم تشغيل الفيديو.
                    </video>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDFs */}
        {lesson.pdfs && lesson.pdfs.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><FaFilePdf /> ملفات PDF</h3>
            <ul className="space-y-2">
              {lesson.pdfs.map((pdf, idx) => (
                <li key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <FaFilePdf className="text-red-600" />
                  <span className="font-medium">{pdf.title || pdf.fileName}</span>
                  <a
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-blue-600 hover:underline"
                  >
                    عرض / تحميل
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Exams */}
        {lesson.exams && lesson.exams.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><FaClipboardList /> الامتحانات</h3>
            <ul className="space-y-2">
              {lesson.exams.map((exam, idx) => (
                <li key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="font-medium">{exam.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">{exam.description}</div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mt-2">بدء الامتحان</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Trainings */}
        {lesson.trainings && lesson.trainings.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><FaDumbbell /> التدريبات</h3>
            <ul className="space-y-2">
              {lesson.trainings.map((training, idx) => (
                <li key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="font-medium">{training.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">{training.description}</div>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mt-2">بدء التدريب</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonContentModal;
