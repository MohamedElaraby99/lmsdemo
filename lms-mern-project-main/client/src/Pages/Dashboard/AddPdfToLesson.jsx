import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FaUpload, 
  FaFilePdf, 
  FaTimes, 
  FaCheck, 
  FaSpinner,
  FaArrowLeft,
  FaFolder,
  FaPlay
} from 'react-icons/fa';
import Layout from '../../Layout/Layout';
import { axiosInstance } from '../../Helpers/axiosInstance';

const AddPdfToLesson = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: user, isLoggedIn } = useSelector(state => state.auth);
  const { courses } = useSelector(state => state.course);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfTitle, setPdfTitle] = useState('');
  const [coursesList, setCoursesList] = useState([]);
  const [unitsList, setUnitsList] = useState([]);
  const [lessonsList, setLessonsList] = useState([]);

  // Handle auth loading
  useEffect(() => {
    // If user is logged in and we have user data, stop loading
    if (isLoggedIn && user) {
      setAuthLoading(false);
    } else if (!isLoggedIn) {
      // If not logged in, also stop loading
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size should be less than 10MB');
        return;
      }
      setPdfFile(file);
      // Set default title from filename
      const fileName = file.name.replace('.pdf', '');
      setPdfTitle(fileName);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCourse || !selectedLesson) {
      toast.error('Please select a course and lesson');
      return;
    }

    if (!pdfFile) {
      toast.error('Please select a PDF file');
      return;
    }

    if (!pdfTitle.trim()) {
      toast.error('Please enter a title for the PDF');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('title', pdfTitle);

      const course = coursesList.find(c => c._id === selectedCourse);
      const lesson = lessonsList.find(l => l._id === selectedLesson);
      
      if (!course || !lesson) {
        toast.error('Invalid course or lesson selection');
        return;
      }

      let endpoint;
      if (selectedUnit) {
        // Unit lesson
        endpoint = `/courses/${selectedCourse}/units/${selectedUnit}/lessons/${selectedLesson}/pdf`;
      } else {
        // Direct lesson
        endpoint = `/courses/${selectedCourse}/direct-lessons/${selectedLesson}/pdf`;
      }

      const response = await axiosInstance.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('PDF added successfully!');
      
      // Reset form
      setPdfFile(null);
      setPdfTitle('');
      setSelectedLesson('');
      
      // Refresh courses to get updated data
      fetchCourses();
      
    } catch (error) {
      console.error('Error adding PDF:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to add PDF');
      }
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setPdfFile(null);
    setPdfTitle('');
  };

  const hasPdf = (lesson) => {
    return lesson.pdf && lesson.pdf.secure_url;
  };

  // Show loading while checking auth
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
              Add PDF to Lesson
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Upload study materials and documents to lessons
            </p>
          </div>

          {/* Main Form */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Course Selection */}
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
                          {lesson.title} {hasPdf(lesson) && '(Has PDF)'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* PDF File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    PDF File *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                    {pdfFile ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-3">
                          <FaFilePdf className="text-4xl text-red-500" />
                          <div className="text-left">
                            <p className="font-medium text-gray-900 dark:text-white">{pdfFile.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          PDF files only, max 10MB
                        </p>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                          id="pdf-upload"
                        />
                        <label
                          htmlFor="pdf-upload"
                          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                        >
                          <FaUpload className="mr-2" />
                          Choose PDF File
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* PDF Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    PDF Title *
                  </label>
                  <input
                    type="text"
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                    placeholder="Enter a title for the PDF (e.g., Study Guide, Notes, etc.)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={uploading || !pdfFile || !selectedCourse || !selectedLesson}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FaCheck />
                        Add PDF to Lesson
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
                  <span>Select a course and lesson to add PDF study materials</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span>Upload PDF files up to 10MB in size</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span>Provide a descriptive title for the PDF</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span>Students will be able to download the PDF after purchasing the lesson</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddPdfToLesson; 