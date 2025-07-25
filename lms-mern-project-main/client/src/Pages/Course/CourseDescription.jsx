import React, { useEffect, useState } from "react";
import Layout from "../../Layout/Layout";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { placeholderImages } from "../../utils/placeholderImages";
import { 
  FaPlay, 
  FaUser, 
  FaBook, 
  FaClock, 
  FaStar, 
  FaGraduationCap, 
  FaCheckCircle, 
  FaArrowLeft,
  FaCalendarAlt,
  FaUsers,
  FaCertificate,
  FaGlobe
} from "react-icons/fa";

export default function CourseDescription() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { role, data } = useSelector((state) => state.auth);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    if(!state) {
      navigate("/courses");
    }
  }, []);

  if (!state) return null;

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = (e) => {
    e.target.src = placeholderImages.course;
    setIsImageLoading(false);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <section className="relative py-16 px-4 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          <div className="relative z-10 container mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate("/courses")}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors duration-200"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span>Back to Courses</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Course Header */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                  <div className="flex items-start gap-6">
                    {/* Course Image */}
                    <div className="relative flex-shrink-0">
                      <div className="relative w-32 h-32 rounded-xl overflow-hidden">
                        {isImageLoading && (
                          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl"></div>
                        )}
                        <img
                          className={`w-full h-full object-cover transition-opacity duration-300 ${
                            isImageLoading ? 'opacity-0' : 'opacity-100'
                          }`}
                          alt="Course thumbnail"
                          src={state?.thumbnail?.secure_url || placeholderImages.course}
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs px-3 py-1 rounded-full font-medium">
                          {state?.category || "Course"}
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar 
                              key={star} 
                              className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                            />
                          ))}
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">(4.5)</span>
                        </div>
                      </div>
                      
                      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                        {state?.title}
                      </h1>
                      
                      <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                        {state?.description}
                      </p>

                      {/* Course Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FaBook className="text-blue-500" />
                          <span>{state?.numberOfLectures || 0} lectures</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FaClock className="text-purple-500" />
                          <span>Self-paced</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FaUsers className="text-green-500" />
                          <span>1.2k students</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FaGlobe className="text-orange-500" />
                          <span>English</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Details */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <FaGraduationCap className="text-blue-500" />
                    What you'll learn
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      "Master the fundamentals of the subject",
                      "Build real-world projects and applications",
                      "Learn from industry experts and professionals",
                      "Get hands-on experience with practical exercises",
                      "Understand best practices and modern techniques",
                      "Earn a certificate upon completion"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Course Requirements */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <FaBook className="text-purple-500" />
                    Requirements
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">No prior experience required - we'll teach you everything you need to know</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">A computer with internet connection</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Willingness to learn and practice</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Course Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-6">
                  <div className="relative mb-6">
                    <img
                      className="w-full h-48 object-cover rounded-xl"
                      alt="Course preview"
                      src={state?.thumbnail?.secure_url || placeholderImages.course}
                      onError={(e) => {
                        e.target.src = placeholderImages.course;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                      <div className="bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
                        <FaPlay className="text-blue-600 dark:text-blue-400 text-xl" />
                      </div>
                    </div>
                  </div>

                  {/* Price and Action */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        Free
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Lifetime access
                      </div>
                    </div>

                    {role === "ADMIN" || data?.subscription?.status === "active" ? (
                      <button
                        onClick={() => navigate("/course/displaylectures", { state: { ...state } })}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <FaPlay className="w-4 h-4" />
                        Watch Lectures
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate("/checkout")}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <FaGraduationCap className="w-4 h-4" />
                        Enroll Now
                      </button>
                    )}

                    {/* Course Includes */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">This course includes:</h3>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <FaBook className="text-blue-500" />
                          <span>{state?.numberOfLectures || 0} hours on-demand video</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaCertificate className="text-green-500" />
                          <span>Certificate of completion</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaGlobe className="text-purple-500" />
                          <span>Full lifetime access</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaUsers className="text-orange-500" />
                          <span>Access on mobile and TV</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructor Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FaUser className="text-blue-500" />
                    Instructor
                  </h3>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {state?.createdBy?.charAt(0)?.toUpperCase() || "I"}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {state?.createdBy || "Instructor"}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Industry Expert
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Experienced professional with years of industry knowledge and a passion for teaching.
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      <span className="text-gray-600 dark:text-gray-400">4.8</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaUsers className="text-blue-500" />
                      <span className="text-gray-600 dark:text-gray-400">2.5k students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaBook className="text-purple-500" />
                      <span className="text-gray-600 dark:text-gray-400">5 courses</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
