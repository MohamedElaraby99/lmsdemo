import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFeaturedInstructors } from '../Redux/Slices/InstructorSlice';
import { FaGraduationCap, FaStar, FaUsers, FaBook, FaClock, FaLinkedin, FaTwitter, FaGlobe, FaTimes, FaAward, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const InstructorSection = () => {
  const dispatch = useDispatch();
  const { featuredInstructors, loading } = useSelector((state) => state.instructor);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(getFeaturedInstructors({ limit: 6 }));
  }, [dispatch]);

  const handleInstructorClick = (instructor) => {
    setSelectedInstructor(instructor);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInstructor(null);
  };

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
      <section className="py-20 bg-white dark:bg-gray-900" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-6">
            تعلم من أفضل الخبراء للتعلم
            </h2>
            <div className="w-24 h-1 bg-blue-500 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              مدرسونا لديهم خبرة واسعة ونهج تعليمي متميز لضمان تجربة تعليمية استثنائية
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
                <div className="w-full h-48 bg-gray-300 dark:bg-gray-600 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-20 bg-white dark:bg-gray-900" dir="rtl">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-6">
              تعلم من أفضل الخبراء  
            </h2>
            <div className="w-24 h-1 bg-blue-500 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              مدرسونا لديهم خبرة واسعة ونهج تعليمي متميز لضمان تجربة تعليمية استثنائية
            </p>
          </div>

          {/* Instructors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredInstructors.map((instructor, index) => (
              <div
                key={instructor._id}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer"
                onClick={() => handleInstructorClick(instructor)}
              >
                {/* Large Instructor Photo */}
                <div className="relative w-full h-48 overflow-hidden">
                  {instructor.profileImage?.secure_url ? (
                    <img
                      src={instructor.profileImage.secure_url}
                      alt={instructor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <FaGraduationCap className="text-gray-400 dark:text-gray-500 text-6xl" />
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Instructor Name */}
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {instructor.name}
                  </h3>
                  
                  {/* Role/Specialization */}
                  <p className="text-gray-600 dark:text-gray-400 font-medium mb-3">
                    {instructor.specialization}
                  </p>
                  
                  {/* Brief Description */}
                  <p className="text-gray-500 dark:text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">
                    {instructor.bio || `${instructor.name} هو مدرس محترف مع خبرة واسعة في مجال ${instructor.specialization}. لديه نهج تعليمي متميز ويساعد الطلاب على تحقيق أهدافهم التعليمية.`}
                  </p>

                  {/* Clickable Arrow Icon */}
                  <div className="flex justify-end">
                    <div className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 group-hover:scale-110">
                      <FaArrowRight className="text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Instructors Button */}
          <div className="text-center mt-16">
            <Link
              to="/instructors"
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              عرض جميع المدرسين
              <FaGraduationCap className="mr-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Instructor Profile Modal */}
      {showModal && selectedInstructor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} dir="rtl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">الملف الشخصي للمدرس</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Instructor Header */}
              <div className="text-center mb-8">
                {selectedInstructor.profileImage?.secure_url ? (
                  <img
                    src={selectedInstructor.profileImage.secure_url}
                    alt={selectedInstructor.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-gray-200 dark:border-gray-600 shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-gray-200 dark:border-gray-600 shadow-lg">
                    <FaGraduationCap className="text-gray-400 dark:text-gray-500 text-4xl" />
                  </div>
                )}
                
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  {selectedInstructor.name}
                </h3>
                
                <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full font-semibold mb-4">
                  <FaGraduationCap className="ml-2" />
                  {selectedInstructor.specialization}
                </div>

                {/* Rating */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  {renderStars( 5)}
                  <span className="text-gray-600 dark:text-gray-400 font-semibold">
                    ({ 5})
                  </span>
                </div>
              </div>

              {/* Bio */}
              {selectedInstructor.bio && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">نبذة عن المدرس</h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-right">
                    {selectedInstructor.bio}
                  </p>
                </div>
              )}

              {/* Education */}
              {selectedInstructor.education && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">المؤهل العلمي</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-right">
                    {selectedInstructor.education}
                  </p>
                </div>
              )}

              {/* Social Links */}
              {(selectedInstructor.socialLinks?.linkedin || selectedInstructor.socialLinks?.twitter || selectedInstructor.socialLinks?.website) && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">روابط التواصل</h4>
                  <div className="flex items-center justify-center gap-4">
                    {selectedInstructor.socialLinks?.linkedin && (
                      <a
                        href={selectedInstructor.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <FaLinkedin className="text-sm" />
                      </a>
                    )}
                    {selectedInstructor.socialLinks?.twitter && (
                      <a
                        href={selectedInstructor.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-blue-400 hover:bg-blue-500 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <FaTwitter className="text-sm" />
                      </a>
                    )}
                    {selectedInstructor.socialLinks?.website && (
                      <a
                        href={selectedInstructor.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <FaGlobe className="text-sm" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Featured Badge */}
              {selectedInstructor.featured && (
                <div className="text-center mb-6">
                  <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full font-bold">
                    <FaAward className="ml-2" />
                    مدرس مميز
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstructorSection; 