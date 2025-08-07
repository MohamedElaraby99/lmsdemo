import React, { useEffect, useState } from 'react';
import { FaArrowRight, FaPlay, FaStar, FaUsers, FaGraduationCap, FaAward } from 'react-icons/fa';

const AnimatedHero = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { icon: FaUsers, number: "10K+", label: "Students Enrolled", color: "text-blue-600" },
    { icon: FaGraduationCap, number: "100+", label: "Subjects Available", color: "text-green-600" },
    { icon: FaStar, number: "4.9", label: "Average Rating", color: "text-yellow-600" },
    { icon: FaAward, number: "50+", label: "Expert Instructors", color: "text-purple-600" }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-1/4 animate-float">
        <div className="w-4 h-4 bg-blue-500 rounded-full opacity-60"></div>
      </div>
      <div className="absolute top-1/3 right-1/4 animate-float animation-delay-2000">
        <div className="w-6 h-6 bg-purple-500 rounded-full opacity-60"></div>
      </div>
      <div className="absolute bottom-1/4 left-1/3 animate-float animation-delay-4000">
        <div className="w-3 h-3 bg-green-500 rounded-full opacity-60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Main Content */}
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              Master Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Skills</span>
              <br />
              <span className="text-4xl md:text-6xl">With Expert-Led</span>
              <br />
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Courses</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of learners worldwide and transform your career with our comprehensive online courses designed by industry experts.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button 
                onClick={onGetStarted}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  Start Learning
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
              
              <button 
                onClick={onExploreCourses}
                className="group px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold rounded-full text-lg hover:bg-blue-600 hover:text-white transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <FaPlay className="group-hover:scale-110 transition-transform duration-300" />
                  Explore Courses
                </span>
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${stat.color} bg-white dark:bg-gray-800 rounded-full mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="text-2xl" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnimatedHero; 