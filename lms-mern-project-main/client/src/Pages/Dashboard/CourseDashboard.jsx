import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllCourses, getAdminCourses, getCourseStats } from '../../Redux/Slices/CourseSlice';
import Layout from '../../Layout/Layout';
import CourseStats from '../../Components/Course/CourseStats';
import CourseFilters from '../../Components/Course/CourseFilters';
import CourseList from '../../Components/Course/CourseList';
import CourseModal from '../../Components/Course/CourseModal';
import { FaPlus, FaBook, FaChartBar, FaFilter } from 'react-icons/fa';

export default function CourseDashboard() {
  const dispatch = useDispatch();
  const { courses, courseStats, loading, pagination, createLoading, updateLoading } = useSelector((state) => state.course);
  const { role } = useSelector((state) => state.auth);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    instructor: '',
    subject: '',
    grade: '',
    stage: '',
    featured: '',
    isPublished: '',
    level: '',
    language: ''
  });

  useEffect(() => {
    dispatch(getAdminCourses());
    dispatch(getCourseStats());
  }, [dispatch]);

  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setShowCreateModal(true);
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setSelectedCourse(null);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Admin dashboard uses full course data without filters for now
    dispatch(getAdminCourses());
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <FaBook className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              إدارة الدورات
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              إدارة الدورات التعليمية وإضافة محتوى جديد
            </p>
          </div>

          {/* Statistics Cards */}
          <CourseStats stats={courseStats} loading={loading} />

          {/* Filters and Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <FaFilter className="text-blue-500 text-xl" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  تصفية وبحث
                </h2>
              </div>
              
              {role === 'ADMIN' && (
                <button
                  onClick={handleCreateCourse}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaPlus className="text-sm" />
                  إضافة دورة جديدة
                </button>
              )}
            </div>
            
            <CourseFilters 
              filters={filters} 
              onFilterChange={handleFilterChange} 
            />
          </div>

          {/* Course List */}
          <CourseList 
            courses={courses}
            loading={loading}
            pagination={pagination}
            onEditCourse={handleEditCourse}
            role={role}
          />

          {/* Create/Edit Modal */}
          {showCreateModal && (
            <CourseModal
              course={selectedCourse}
              onClose={handleCloseModal}
              isOpen={showCreateModal}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
