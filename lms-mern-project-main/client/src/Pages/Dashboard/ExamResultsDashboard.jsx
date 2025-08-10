import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../../Helpers/axiosInstance';
import Layout from '../../Layout/Layout';
import { 
  FaUsers, 
  FaClipboardCheck, 
  FaChartBar, 
  FaClock, 
  FaSearch, 
  FaFilter,
  FaEye,
  FaDownload,
  FaTrophy,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaChartLine,
  FaGraduationCap,
  FaBookOpen,
  FaUserGraduate
} from 'react-icons/fa';

const ExamResultsDashboard = () => {
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    courseId: '',
    examType: '',
    passed: '',
    sortBy: 'completedAt',
    sortOrder: 'desc'
  });
  const [courses, setCourses] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch courses for filter dropdown
  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get('/courses');
      if (response.data.success) {
        setCourses(response.data.data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Fetch exam results data
  const fetchExamResults = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          queryParams.append(key, value);
        }
      });

      const response = await axiosInstance.get(`/exam-results?${queryParams}`);
      
      if (response.data.success) {
        setExamResults(response.data.data || []);
        setSummary(response.data.summary || {});
        setPagination(response.data.pagination || {});
      }
    } catch (error) {
      console.error('Error fetching exam results:', error);
      toast.error('فشل في تحميل نتائج الامتحانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamResults();
    fetchCourses();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleSort = (column) => {
    const newOrder = filters.sortBy === column && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: newOrder
    }));
  };

  const openDetailsModal = (result) => {
    setSelectedResult(result);
    setShowDetailsModal(true);
  };

  const exportResults = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && key !== 'page' && key !== 'limit') {
          queryParams.append(key, value);
        }
      });

      const response = await axiosInstance.get(`/exam-results/export?${queryParams}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `exam-results-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('تم تصدير النتائج بنجاح');
    } catch (error) {
      console.error('Error exporting results:', error);
      toast.error('فشل في تصدير النتائج');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}س ${mins}د`;
    }
    return `${mins}د`;
  };

  return (
    <Layout>
      <section className="min-h-screen py-8 px-4 lg:px-20 bg-gray-50 dark:bg-gray-900" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <FaClipboardCheck className="text-blue-600" />
                نتائج الامتحانات
              </h1>
              <button
                onClick={exportResults}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <FaDownload />
                تصدير النتائج
              </button>
            </div>

            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaUsers className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="mr-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          إجمالي المحاولات
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {summary.totalAttempts || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaChartBar className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="mr-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          متوسط النتيجة
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {Math.round(summary.averageScore || 0)}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaCheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="mr-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          معدل النجاح
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {summary.totalAttempts ? Math.round((summary.passedCount / summary.totalAttempts) * 100) : 0}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaClock className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="mr-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          متوسط الوقت
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {formatDuration(Math.round(summary.averageTimeTaken || 0))}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  البحث
                </label>
                <div className="relative">
                  <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="اسم الطالب أو البريد الإلكتروني..."
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Course Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الدورة
                </label>
                <select
                  value={filters.courseId}
                  onChange={(e) => handleFilterChange('courseId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">جميع الدورات</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exam Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  نوع الامتحان
                </label>
                <select
                  value={filters.examType}
                  onChange={(e) => handleFilterChange('examType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">جميع الأنواع</option>
                  <option value="training">تدريب</option>
                  <option value="final">امتحان نهائي</option>
                </select>
              </div>

              {/* Pass/Fail Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  النتيجة
                </label>
                <select
                  value={filters.passed}
                  onChange={(e) => handleFilterChange('passed', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">جميع النتائج</option>
                  <option value="true">ناجح</option>
                  <option value="false">راسب</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <FaSpinner className="animate-spin text-4xl text-blue-600" />
                <span className="mr-3 text-lg text-gray-600 dark:text-gray-300">جاري التحميل...</span>
              </div>
            ) : examResults.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th 
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                          onClick={() => handleSort('user.fullName')}
                        >
                          الطالب
                        </th>
                        <th 
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                          onClick={() => handleSort('course.title')}
                        >
                          الدورة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          الدرس
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          نوع الامتحان
                        </th>
                        <th 
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                          onClick={() => handleSort('score')}
                        >
                          النتيجة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          الوقت المستغرق
                        </th>
                        <th 
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                          onClick={() => handleSort('completedAt')}
                        >
                          تاريخ الامتحان
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {examResults.map((result) => (
                        <tr key={result._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                  {result.user?.fullName?.charAt(0) || 'U'}
                                </div>
                              </div>
                              <div className="mr-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {result.user?.fullName || 'مستخدم غير معروف'}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {result.user?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {result.course?.title || 'غير محدد'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div>
                              <div className="font-medium">{result.lessonTitle}</div>
                              {result.unitTitle && (
                                <div className="text-gray-500 dark:text-gray-400 text-xs">
                                  الوحدة: {result.unitTitle}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              result.examType === 'final' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {result.examType === 'final' ? 'امتحان نهائي' : 'تدريب'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getScoreColor(result.score)}`}>
                                {result.score}%
                              </span>
                              <div className="mr-2">
                                {result.passed ? (
                                  <FaCheckCircle className="text-green-500" />
                                ) : (
                                  <FaTimesCircle className="text-red-500" />
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatDuration(result.timeTaken)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(result.completedAt).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => openDetailsModal(result)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                            >
                              <FaEye />
                              عرض التفاصيل
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={pagination.currentPage <= 1}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                          السابق
                        </button>
                        <button
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={pagination.currentPage >= pagination.totalPages}
                          className="mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                          التالي
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            عرض{' '}
                            <span className="font-medium">
                              {((pagination.currentPage - 1) * filters.limit) + 1}
                            </span>{' '}
                            إلى{' '}
                            <span className="font-medium">
                              {Math.min(pagination.currentPage * filters.limit, pagination.totalResults)}
                            </span>{' '}
                            من{' '}
                            <span className="font-medium">{pagination.totalResults}</span>{' '}
                            نتيجة
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  page === pagination.currentPage
                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </nav>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <FaClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">لا توجد نتائج</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  لم يتم العثور على نتائج امتحانات تطابق الفلاتر المحددة.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedResult && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    تفاصيل نتيجة الامتحان
                  </h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الطالب</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedResult.user?.fullName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">البريد الإلكتروني</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedResult.user?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الدورة</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedResult.course?.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الدرس</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedResult.lessonTitle}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">نوع الامتحان</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedResult.examType === 'final' ? 'امتحان نهائي' : 'تدريب'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">النتيجة</label>
                      <p className={`text-sm font-semibold ${selectedResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedResult.score}% ({selectedResult.passed ? 'ناجح' : 'راسب'})
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الإجابات الصحيحة</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedResult.correctAnswers} من {selectedResult.totalQuestions}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الوقت المستغرق</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDuration(selectedResult.timeTaken)} من {formatDuration(selectedResult.timeLimit)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">تاريخ الامتحان</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedResult.completedAt).toLocaleString('ar-EG')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">النتيجة المطلوبة للنجاح</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedResult.passingScore}%</p>
                    </div>
                  </div>

                  {/* Detailed Answers */}
                  {selectedResult.answers && selectedResult.answers.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">تفاصيل الإجابات</h4>
                      <div className="max-h-60 overflow-y-auto">
                        <div className="space-y-2">
                          {selectedResult.answers.map((answer, index) => (
                            <div 
                              key={index}
                              className={`p-3 rounded-lg border ${
                                answer.isCorrect 
                                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700' 
                                  : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  السؤال {answer.questionIndex + 1}
                                </span>
                                <div className="flex items-center gap-2">
                                  {answer.isCorrect ? (
                                    <FaCheckCircle className="text-green-500" />
                                  ) : (
                                    <FaTimesCircle className="text-red-500" />
                                  )}
                                  <span className={`text-sm ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                    {answer.isCorrect ? 'صحيح' : 'خطأ'}
                                  </span>
                                </div>
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                الإجابة المختارة: {answer.selectedAnswer + 1} | الإجابة الصحيحة: {answer.correctAnswer + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default ExamResultsDashboard;
