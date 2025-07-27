import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../Layout/Layout";
import heroPng from "../assets/images/hero.png";
import { getAllBlogs } from "../Redux/Slices/BlogSlice";
import { getFeaturedSubjects } from "../Redux/Slices/SubjectSlice";
import { 
  FaEye, 
  FaHeart, 
  FaCalendar, 
  FaUser, 
  FaArrowRight, 
  FaPlay, 
  FaStar, 
  FaUsers, 
  FaGraduationCap,
  FaRocket,
  FaLightbulb,
  FaShieldAlt,
  FaGlobe,
  FaCode,
  FaPalette,
  FaChartLine,
  FaBookOpen,
  FaAward,
  FaClock,
  FaCheckCircle,
  FaQuestionCircle,
  FaArrowUp
} from "react-icons/fa";
import { placeholderImages } from "../utils/placeholderImages";
import FAQAccordion from "../Components/FAQAccordion";
import SubjectCard from "../Components/SubjectCard";


import NewsletterSection from "../Components/NewsletterSection";

export default function HomePage() {
  const dispatch = useDispatch();
  const { blogs } = useSelector((state) => state.blog);
  const { featuredSubjects } = useSelector((state) => state.subject);
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // Fetch latest blogs for homepage
    dispatch(getAllBlogs({ page: 1, limit: 3 }));
    // Fetch featured subjects for homepage
    dispatch(getFeaturedSubjects());
    
    // Trigger animations
    setIsVisible(true);

    // Add scroll event listener
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setShowScrollTop(scrolled > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stats = [
    { icon: FaUsers, number: "10K+", label: "طالب مسجل", color: "text-blue-600" },
    { icon: FaGraduationCap, number: "500+", label: "دورة متاحة", color: "text-green-600" },
    { icon: FaStar, number: "4.9", label: "متوسط التقييم", color: "text-yellow-600" },
    { icon: FaAward, number: "50+", label: "مدرس خبير", color: "text-purple-600" }
  ];

  const features = [
    {
      icon: FaRocket,
      title: "تعلم بوتيرتك الخاصة",
      description: "جداول تعلم مرنة تناسب نمط حياتك والتزاماتك.",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      icon: FaLightbulb,
      title: "دورات بقيادة الخبراء",
      description: "تعلم من المحترفين في المجال مع سنوات من الخبرة العملية.",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      icon: FaShieldAlt,
      title: "التعلم المعتمد",
      description: "احصل على شهادات معترف بها من أفضل الشركات في العالم.",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      icon: FaGlobe,
      title: "المجتمع العالمي",
      description: "تواصل مع المتعلمين من جميع أنحاء العالم وشارك الخبرات.",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    }
  ];

  const categories = [
    { icon: FaCode, name: "البرمجة", count: "150+ دورة", color: "bg-blue-500" },
    { icon: FaPalette, name: "التصميم", count: "120+ دورة", color: "bg-purple-500" },
    { icon: FaChartLine, name: "الأعمال", count: "200+ دورة", color: "bg-green-500" },
    { icon: FaBookOpen, name: "التسويق", count: "180+ دورة", color: "bg-orange-500" }
  ];

  return (
    <Layout>
      {/* Hero Section with Animation */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
                أتقن
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> مهاراتك</span>
                <br />
                <span className="text-4xl md:text-6xl">مع الدورات بقيادة الخبراء</span>
                <br />
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">الدورات</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                انضم إلى آلاف المتعلمين حول العالم وحول مسيرتك المهنية مع دوراتنا الشاملة عبر الإنترنت المصممة من قبل خبراء الصناعة.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link to="/subjects">
                  <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                    <span className="flex items-center gap-2">
                      ابدأ التعلم
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </button>
                </Link>
                
                <Link to="/courses">
                  <button className="group px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold rounded-full text-lg hover:bg-blue-600 hover:text-white transition-all duration-300">
                    <span className="flex items-center gap-2">
                      <FaPlay className="group-hover:scale-110 transition-transform duration-300" />
                      استكشف الدورات
                    </span>
                  </button>
                </Link>
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

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              لماذا تختار منصتنا؟
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              نقدم لك كل ما تحتاجه للنجاح في رحلة تعلمك
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`${feature.bgColor} p-8 rounded-2xl text-center group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} bg-white dark:bg-gray-700 rounded-full mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              الدورات المميزة
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              اكتشف دوراتنا الأكثر شعبية وأعلى تقييماً
            </p>
          </div>

          {featuredSubjects && featuredSubjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredSubjects.slice(0, 6).map((subject, index) => (
                <div 
                  key={subject._id} 
                  className="transform hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <SubjectCard subject={subject} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-bounce">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                لا توجد دورات مميزة بعد
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                عد قريباً لدورات رائعة!
              </p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/subjects"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <FaArrowRight />
              عرض جميع الدورات
            </Link>
          </div>
        </div>
      </section>

      {/* Course Categories Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              استكشف حسب الفئة
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              ابحث عن الدورة المثالية في مجال اهتمامك
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 ${category.color} text-white rounded-full mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className="text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{category.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{category.count}</p>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/10 group-hover:to-purple-600/10 transition-all duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Blogs Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              أحدث الأخبار من مدونتنا
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              اكتشف الأفكار والنصائح والقصص من مجتمع التعلم لدينا
            </p>
          </div>

          {blogs && blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.slice(0, 3).map((blog, index) => (
                <div 
                  key={blog._id} 
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={blog.image?.secure_url?.startsWith('/uploads/') 
                        ? `http://localhost:5000${blog.image.secure_url}` 
                        : blog.image?.secure_url || placeholderImages.blog}
                      alt={blog.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = placeholderImages.blog;
                      }}
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <FaUser />
                        {blog.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCalendar />
                        {formatDate(blog.createdAt)}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                      {blog.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {blog.excerpt || blog.content.substring(0, 150)}...
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FaEye />
                          {blog.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaHeart />
                          {blog.likes || 0}
                        </span>
                      </div>
                      
                      <Link
                        to={`/blog/${blog._id}`}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1 group"
                      >
                        Read More
                        <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-pulse">📝</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                No blog posts yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Check back soon for amazing content!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                          هل أنت مستعد لبدء رحلة التعلم؟
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of learners who have already transformed their careers with our expert-led courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/signup">
              <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                ابدأ مجاناً
              </button>
            </Link>
            <Link to="/subjects">
              <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full text-lg hover:bg-white hover:text-blue-600 transition-all duration-300">
                تصفح الدورات
              </button>
            </Link>
            <Link to="/qa">
              <button className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
                <FaQuestionCircle className="w-5 h-5" />
                اطرح سؤالاً
              </button>
            </Link>
          </div>
        </div>
      </section>





      {/* Q&A Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              لديك أسئلة؟ احصل على إجابات!
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              انضم إلى مجتمعنا من المتعلمين والخبراء. اطرح الأسئلة، شارك المعرفة، وتعلم معاً.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaQuestionCircle className="text-3xl text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                اطرح الأسئلة
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                احصل على مساعدة من مجتمعنا من الخبراء والمتعلمين
              </p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-3xl text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                دعم المجتمع
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                تواصل مع آلاف المتعلمين حول العالم
              </p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaStar className="text-3xl text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                إجابات الخبراء
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                احصل على إجابات من محترفي الصناعة والمدرسين
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link to="/qa">
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto">
                <FaQuestionCircle className="w-5 h-5" />
                اطرح سؤالاً
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Static FAQ Section */}
      <section className="py-16 px-4 lg:px-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              الأسئلة الشائعة
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              كل ما تحتاج معرفته عن منصتنا
            </p>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="w-5 h-5 group-hover:animate-bounce" />
        </button>
      )}
    </Layout>
  );
}
