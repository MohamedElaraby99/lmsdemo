import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getInstructorById } from '../Redux/Slices/InstructorSlice';
import Layout from '../Layout/Layout';
import { 
  FaStar, 
  FaUsers, 
  FaGraduationCap, 
  FaLinkedin, 
  FaTwitter, 
  FaGlobe,
  FaArrowLeft,
  FaEnvelope,
  FaCalendarAlt,
  FaBookOpen
} from 'react-icons/fa';

export default function InstructorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { instructor, loading } = useSelector((state) => state.instructor);

  useEffect(() => {
    if (id) {
      dispatch(getInstructorById(id));
    }
  }, [dispatch, id]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`w-5 h-5 ${
            i <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4 py-16">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!instructor) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                المدرس غير موجود
              </h1>
              <button
                onClick={() => navigate('/instructors')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
              >
                العودة لقائمة المدرسين
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/instructors')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-8 transition-colors"
          >
            <FaArrowLeft />
            العودة لقائمة المدرسين
          </button>

          {/* Instructor Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="relative">
              {/* Background Image */}
              <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600"></div>
              
              {/* Profile Image */}
              <div className="absolute -bottom-16 right-8">
                {instructor.profileImage?.secure_url ? (
                  <img
                    src={instructor.profileImage.secure_url}
                    alt={instructor.name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 bg-white/20 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    <FaGraduationCap className="text-white text-4xl" />
                  </div>
                )}
              </div>

              {/* Featured Badge */}
              {instructor.featured && (
                <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-semibold">
                  مميز
                </div>
              )}
            </div>

            {/* Instructor Info */}
            <div className="pt-20 pb-6 px-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 text-right">
                    {instructor.name}
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-4 text-right">
                    {instructor.specialization}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    {renderStars(instructor.rating || 0)}
                    <span className="text-lg font-semibold text-gray-700 dark:text-gray-300 mr-2">
                      ({instructor.rating || 0})
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <FaUsers className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {instructor.totalStudents || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">طالب</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <FaGraduationCap className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {instructor.courses?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">دورة</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <FaCalendarAlt className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {instructor.experience || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">سنة خبرة</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bio */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 text-right">
                  <FaBookOpen className="text-blue-600" />
                  نبذة عن المدرس
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-right">
                  {instructor.bio || 'لا توجد نبذة متاحة لهذا المدرس.'}
                </p>
              </div>

              {/* Education */}
              {instructor.education && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 text-right">
                    <FaGraduationCap className="text-purple-600" />
                    المؤهلات التعليمية
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-right">
                    {instructor.education}
                  </p>
                </div>
              )}

              {/* Experience */}
              {instructor.experience && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <FaCalendarAlt className="text-green-600" />
                    الخبرة
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {instructor.experience} سنة من الخبرة في التدريس
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <FaEnvelope className="text-blue-600" />
                  معلومات التواصل
                </h3>
                
                {instructor.email && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">البريد الإلكتروني</div>
                    <a 
                      href={`mailto:${instructor.email}`}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {instructor.email}
                    </a>
                  </div>
                )}

                {/* Social Links */}
                {(instructor.socialLinks?.linkedin || instructor.socialLinks?.twitter || instructor.socialLinks?.website) && (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400">روابط التواصل الاجتماعي</div>
                    
                    {instructor.socialLinks?.linkedin && (
                      <a
                        href={instructor.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        <FaLinkedin />
                        LinkedIn
                      </a>
                    )}
                    
                    {instructor.socialLinks?.twitter && (
                      <a
                        href={instructor.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200 transition-colors"
                      >
                        <FaTwitter />
                        Twitter
                      </a>
                    )}
                    
                    {instructor.socialLinks?.website && (
                      <a
                        href={instructor.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                      >
                        <FaGlobe />
                        الموقع الشخصي
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">الحالة</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${instructor.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-600 dark:text-gray-300">
                    {instructor.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 