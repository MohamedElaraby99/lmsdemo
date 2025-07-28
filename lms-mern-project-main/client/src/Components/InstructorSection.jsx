import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFeaturedInstructors } from '../Redux/Slices/InstructorSlice';
import { FaStar, FaUsers, FaGraduationCap, FaLinkedin, FaTwitter, FaGlobe } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const InstructorSection = () => {
  const dispatch = useDispatch();
  const { featuredInstructors, loading } = useSelector((state) => state.instructor);

  useEffect(() => {
    dispatch(getFeaturedInstructors({ limit: 6 }));
  }, [dispatch]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`text-sm ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              مدرسونا المتميزون
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              تعلم من أفضل الخبراء في مجالاتهم
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            مدرسونا المتميزون
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            تعلم من أفضل الخبراء في مجالاتهم. مدرسونا لديهم خبرة واسعة ونهج تعليمي متميز
          </p>
        </div>

        {/* Instructors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredInstructors.map((instructor) => (
            <div
              key={instructor._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Instructor Image */}
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-xl flex items-center justify-center">
                  {instructor.profileImage?.secure_url ? (
                    <img
                      src={instructor.profileImage.secure_url}
                      alt={instructor.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                      <FaGraduationCap className="text-white text-3xl" />
                    </div>
                  )}
                </div>
                {instructor.featured && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold">
                    مميز
                  </div>
                )}
              </div>

              {/* Instructor Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    {instructor.name}
                  </h3>
                  <div className="flex items-center">
                    {renderStars(instructor.rating)}
                    <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                      ({instructor.rating})
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {instructor.specialization}
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-3">
                  {instructor.bio}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <FaUsers className="mr-1" />
                    <span>{instructor.totalStudents} طالب</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <FaGraduationCap className="mr-1" />
                    <span>{instructor.courses?.length || 0} دورة</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {instructor.experience} سنة خبرة
                  </div>
                </div>

                {/* Social Links */}
                {(instructor.socialLinks?.linkedin || instructor.socialLinks?.twitter || instructor.socialLinks?.website) && (
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    {instructor.socialLinks?.linkedin && (
                      <a
                        href={instructor.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <FaLinkedin className="text-lg" />
                      </a>
                    )}
                    {instructor.socialLinks?.twitter && (
                      <a
                        href={instructor.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-500 transition-colors"
                      >
                        <FaTwitter className="text-lg" />
                      </a>
                    )}
                    {instructor.socialLinks?.website && (
                      <a
                        href={instructor.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-700 transition-colors"
                      >
                        <FaGlobe className="text-lg" />
                      </a>
                    )}
                  </div>
                )}

                {/* View Profile Button */}
                <Link
                  to={`/instructors/${instructor._id}`}
                  className="block w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  عرض الملف الشخصي
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Instructors Button */}
        <div className="text-center mt-12">
          <Link
            to="/instructors"
            className="inline-flex items-center px-8 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-2 border-blue-500 rounded-lg font-semibold hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-105"
          >
            عرض جميع المدرسين
            <FaGraduationCap className="mr-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default InstructorSection; 