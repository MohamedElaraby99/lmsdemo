import React, { useEffect, useState, useMemo } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { BsCollectionPlayFill, BsTrash, BsPencilSquare } from "react-icons/bs";
import { 
  FaUsers, 
  FaBlog, 
  FaQuestionCircle, 
  FaBook, 
  FaChartLine, 
  FaGraduationCap,
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaSearch,
  FaFilter,
  FaSort,
  FaCog,
  FaRocket,
  FaTrophy,
  FaLightbulb,
  FaShieldAlt,
  FaGlobe,
  FaHeart,
  FaArrowUp,
  FaArrowDown,
  FaDollarSign,
  FaUserGraduate,
  FaPlay,
  FaCalendarAlt,
  FaClock,
  FaStar
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Layout from "../../Layout/Layout";
import { getAllCourses, deleteCourse } from "../../Redux/Slices/CourseSlice";
import { getStatsData } from "../../Redux/Slices/StatSlice";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Title,
  Tooltip
);

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { 
    allUsersCount, 
    subscribedCount, 
    totalCourses, 
    totalLectures, 
    totalPayments, 
    totalRevenue, 
    monthlySalesData 
  } = useSelector((state) => state.stat);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [instructorFilter, setInstructorFilter] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  // Enhanced chart data for course categories
  const courseCategoryData = {
    labels: ["Mathematics", "Science", "Literature", "History", "Technology", "Arts"],
    datasets: [
      {
        label: "Courses by Category",
        data: [totalCourses, totalLectures, allUsersCount, subscribedCount, totalPayments, totalRevenue],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(236, 72, 153, 0.8)"
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(139, 92, 246, 1)",
          "rgba(236, 72, 153, 1)"
        ],
        borderWidth: 2,
      },
    ],
  };

  // Enhanced chart data for platform growth
  const platformGrowthData = {
    labels: ["Users", "Courses", "Lectures", "Revenue (K)", "Payments"],
    datasets: [
      {
        label: "Platform Growth Metrics",
        data: [allUsersCount, totalCourses, totalLectures, totalRevenue / 1000, totalPayments],
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        borderRadius: 8,
      },
    ],
  };

  const myCourses = useSelector((state) => state.course.coursesData);

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = (myCourses || []).map(course => ({ ...course }));

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.createdBy?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(course => course.category === categoryFilter);
    }

    if (instructorFilter !== "all") {
      filtered = filtered.filter(course => course.createdBy === instructorFilter);
    }

    filtered.sort((a, b) => {
      let aValue = a[sortBy] || "";
      let bValue = b[sortBy] || "";
      
      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [myCourses, searchTerm, categoryFilter, instructorFilter, sortBy, sortOrder]);

  const uniqueCategories = useMemo(() => {
    const categories = myCourses?.map(course => course.category).filter(Boolean) || [];
    return [...new Set(categories)];
  }, [myCourses]);

  const uniqueInstructors = useMemo(() => {
    const instructors = myCourses?.map(course => course.createdBy).filter(Boolean) || [];
    return [...new Set(instructors)];
  }, [myCourses]);

  async function onCourseDelete(id) {
    if (window.confirm("Are you sure you want to delete this course?")) {
      const res = await dispatch(deleteCourse(id));
      if (res?.payload?.success) {
        await dispatch(getAllCourses());
      }
    }
  }

  useEffect(() => {
    // Suppress browser extension errors
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.('runtime.lastError') || args[0]?.includes?.('message channel closed')) {
        return; // Suppress these specific errors
      }
      originalError.apply(console, args);
    };

    (async () => {
      await dispatch(getAllCourses());
      await dispatch(getStatsData());
    })();

    // Cleanup
    return () => {
      console.error = originalError;
    };
  }, []);

  // Statistics cards data
  const statsCards = [
    {
      title: "Total Courses",
      value: totalCourses,
      icon: FaBook,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      change: "+12%",
      changeType: "increase"
    },
    {
      title: "Total Users",
      value: allUsersCount,
      icon: FaUsers,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      change: "+8%",
      changeType: "increase"
    },
    {
      title: "Total Revenue",
      value: `EGP ${totalRevenue}`,
      icon: FaDollarSign,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      change: "+15%",
      changeType: "increase"
    },
    {
      title: "Total Lectures",
      value: totalLectures,
      icon: FaPlay,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
      change: "+5%",
      changeType: "increase"
    }
  ];

  return (
    <Layout hideFooter={true}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <section className="relative py-16 px-4 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 animate-pulse"></div>
          
          <div className="relative z-10 container mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 mb-4">
                Admin Dashboard
        </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Welcome back! Here's an overview of your learning platform's performance and key metrics.
              </p>
              </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
              {statsCards.map((card, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl p-4 lg:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <div className={`p-2 lg:p-3 rounded-lg lg:rounded-xl ${card.bgColor}`}>
                      <card.icon className={`text-lg lg:text-2xl ${card.textColor}`} />
                    </div>
                    <div className="flex items-center gap-1 text-xs lg:text-sm">
                      {card.changeType === "increase" ? (
                        <FaArrowUp className="text-green-500" />
                      ) : (
                        <FaArrowDown className="text-red-500" />
                      )}
                      <span className={card.changeType === "increase" ? "text-green-500" : "text-red-500"}>
                        {card.change}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {card.value}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">
                    {card.title}
                  </p>
                </div>
              ))}
                </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12">
              {/* Course Categories Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 lg:p-6">
                <div className="flex items-center gap-3 mb-4 lg:mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FaChartLine className="text-blue-600 dark:text-blue-400 text-lg lg:text-xl" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                    Course Categories
                  </h3>
                </div>
                <div className="h-48 sm:h-56 lg:h-64 w-full">
                  <Pie
                    data={courseCategoryData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
                            font: { 
                              size: window.innerWidth < 768 ? 10 : 12 
                            },
                            padding: window.innerWidth < 768 ? 10 : 20,
                            boxWidth: window.innerWidth < 768 ? 12 : 16,
                            boxHeight: window.innerWidth < 768 ? 8 : 12
                          }
                        }
                      }
                  }}
                />
                </div>
              </div>

              {/* Platform Growth Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 lg:p-6">
                <div className="flex items-center gap-3 mb-4 lg:mb-6">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <FaRocket className="text-green-600 dark:text-green-400 text-lg lg:text-xl" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                    Platform Growth
                  </h3>
                </div>
                <div className="h-48 sm:h-56 lg:h-64 w-full">
                  <Bar
                    data={platformGrowthData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: {
                            color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
                            font: { 
                              size: window.innerWidth < 768 ? 10 : 12 
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          ticks: {
                            color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
                            font: { 
                              size: window.innerWidth < 768 ? 10 : 12 
                            }
                          },
                          grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                          }
                        },
                        x: {
                          ticks: {
                            color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
                            font: { 
                              size: window.innerWidth < 768 ? 10 : 12 
                            },
                            maxRotation: window.innerWidth < 768 ? 45 : 0,
                            minRotation: window.innerWidth < 768 ? 45 : 0
                          },
                          grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                          }
                        }
                      }
                    }}
                  />
              </div>
            </div>
          </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl p-4 lg:p-6 mb-8 lg:mb-12">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-4 lg:mb-6 flex items-center gap-3">
                <FaCog className="text-blue-500" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
                <button
                  onClick={() => navigate("/course/create")}
                  className="group p-3 lg:p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg lg:rounded-xl text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FaPlus className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">Create Course</span>
                </button>
                <button
                  onClick={() => navigate("/course/structure")}
                  className="group p-3 lg:p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg lg:rounded-xl text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FaBook className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">Course Structure</span>
                </button>
                <button
                  onClick={() => navigate("/admin/blog-dashboard")}
                  className="group p-3 lg:p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg lg:rounded-xl text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FaBlog className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">Blog Dashboard</span>
                </button>
                <button
                  onClick={() => navigate("/admin/qa-dashboard")}
                  className="group p-3 lg:p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg lg:rounded-xl text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FaQuestionCircle className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">Q&A Dashboard</span>
                </button>
                <button
                  onClick={() => navigate("/admin/subject-dashboard")}
                  className="group p-3 lg:p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-lg lg:rounded-xl text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FaGraduationCap className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">Subject Dashboard</span>
                </button>
                <button
                  onClick={() => navigate("/admin/users")}
                  className="group p-3 lg:p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg lg:rounded-xl text-white hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FaUsers className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">User Management</span>
                </button>
              </div>
            </div>

            {/* Course Management Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <FaBook className="text-blue-500" />
                  Course Management
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 lg:pl-10 pr-4 py-2 lg:py-3 border border-gray-300 dark:border-gray-600 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm lg:text-base"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 dark:border-gray-600 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm lg:text-base"
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={instructorFilter}
                  onChange={(e) => setInstructorFilter(e.target.value)}
                  className="px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 dark:border-gray-600 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm lg:text-base"
                >
                  <option value="all">All Instructors</option>
                  {uniqueInstructors.map(instructor => (
                    <option key={instructor} value={instructor}>{instructor}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 dark:border-gray-600 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm lg:text-base"
                >
                  <option value="title">Sort by Title</option>
                  <option value="category">Sort by Category</option>
                  <option value="createdBy">Sort by Instructor</option>
                  <option value="numberOfLectures">Sort by Lectures</option>
                </select>
              </div>

              {/* Results Info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-4 lg:mb-6 gap-2">
                <span>
                  Showing {filteredAndSortedCourses.length} of {myCourses?.length || 0} courses
                </span>
                {(searchTerm || categoryFilter !== "all" || instructorFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setCategoryFilter("all");
                      setInstructorFilter("all");
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-left sm:text-right"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {/* Courses Grid/List */}
              {filteredAndSortedCourses.length > 0 ? (
                <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6" : "space-y-4"}>
                  {filteredAndSortedCourses.map((course, idx) => (
                    <div key={course._id} className="bg-white dark:bg-gray-700 rounded-lg lg:rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 p-4 lg:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-start gap-3 lg:gap-4 mb-3 lg:mb-4">
                        <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                          <FaBook className="text-white text-lg lg:text-2xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                            {course?.title}
                          </h4>
                          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {course?.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3 mb-3 lg:mb-4 text-xs lg:text-sm">
                        <div className="flex items-center gap-2">
                          <FaBook className="text-blue-500 text-xs lg:text-sm" />
                          <span className="text-gray-600 dark:text-gray-300">{course?.category || 'General'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaUsers className="text-green-500 text-xs lg:text-sm" />
                          <span className="text-gray-600 dark:text-gray-300">{course?.createdBy || 'Admin'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaPlay className="text-purple-500 text-xs lg:text-sm" />
                          <span className="text-gray-600 dark:text-gray-300">{course?.numberOfLectures || 0} lectures</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaDollarSign className="text-orange-500 text-xs lg:text-sm" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {course?.isPaid ? `${course?.price || 0} EGP` : 'Free'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <button
                          onClick={() => navigate("/course/displaylectures", { state: { ...course } })}
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 text-xs lg:text-sm"
                        >
                          <FaEye className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span className="font-medium">View</span>
                        </button>
                          <button
                          onClick={() => navigate("/course/edit", { state: { ...course } })}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 text-xs lg:text-sm"
                        >
                          <FaEdit className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span className="font-medium">Edit</span>
                          </button>
                          <button
                            onClick={() => onCourseDelete(course?._id)}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-2 text-xs lg:text-sm"
                          >
                          <FaTrashAlt className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span className="font-medium">Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 lg:py-12">
                  <div className="w-16 h-16 lg:w-24 lg:h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <FaBook className="text-gray-400 text-2xl lg:text-3xl" />
                  </div>
                  <h3 className="text-base lg:text-lg font-medium text-gray-900 dark:text-white mb-2">No courses found</h3>
                  <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-4">Get started by creating your first course.</p>
                  <button
                    onClick={() => navigate("/course/create")}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm lg:text-base"
                  >
                    Create Your First Course
                          </button>
                </div>
              )}
            </div>
          </div>
        </section>
        </div>
    </Layout>
  );
}
