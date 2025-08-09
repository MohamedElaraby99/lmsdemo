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
  FaStar,
  FaFilePdf,
  FaClipboardCheck
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../Helpers/axiosInstance";
import { toast } from "react-hot-toast";

import Layout from "../../Layout/Layout";

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
    totalLectures, 
    totalPayments, 
    totalRevenue, 
    monthlySalesData 
  } = useSelector((state) => state.stat);

  // Add state for stages data
  const [stages, setStages] = useState([]);
  const [stagesLoading, setStagesLoading] = useState(true);

  // Function to fetch stages data
  const fetchStagesData = async () => {
    try {
      setStagesLoading(true);
      const response = await axiosInstance.get('/stages/stats');
      if (response.data.success) {
        setStages(response.data.data.stages);
      }
    } catch (error) {
      console.error('Error fetching stages data:', error);
      toast.error('فشل في تحميل بيانات المراحل');
    } finally {
      setStagesLoading(false);
    }
  };

  // Enhanced chart data for stages - now using real data
  const stagesChartData = {
    labels: stages.length > 0 ? stages.map(stage => stage.name) : ["لا توجد مراحل"],
    datasets: [
      {
        label: "الطلاب حسب المرحلة",
        data: stages.length > 0 ? stages.map(stage => stage.studentsCount || 0) : [0],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(99, 102, 241, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(245, 101, 101, 0.8)",
          "rgba(52, 211, 153, 0.8)"
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(139, 92, 246, 1)",
          "rgba(236, 72, 153, 1)",
          "rgba(99, 102, 241, 1)",
          "rgba(236, 72, 153, 1)",
          "rgba(245, 101, 101, 1)",
          "rgba(52, 211, 153, 1)"
        ],
        borderWidth: 2,
      },
    ],
  };

  // Enhanced chart data for platform growth
  const platformGrowthData = {
    labels: ["المستخدمين", "الدورات", "المحاضرات", "الإيرادات (ألف)", "المدفوعات"],
    datasets: [
      {
        label: "مقاييس نمو المنصة",
        data: [allUsersCount, totalLectures, totalPayments, totalRevenue / 1000, totalPayments],
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        borderRadius: 8,
      },
    ],
  };







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
      await dispatch(getStatsData());
      await fetchStagesData(); // Fetch stages data
    })();

    // Cleanup
    return () => {
      console.error = originalError;
    };
  }, []);

  // Statistics cards data
  const statsCards = [
    {
      title: "إجمالي المستخدمين",
      value: allUsersCount,
      icon: FaUsers,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      change: "+12%",
      changeType: "increase"
    },
    {
      title: "إجمالي المشتركين",
      value: subscribedCount,
      icon: FaUserGraduate,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      change: "+8%",
      changeType: "increase"
    },
    {
      title: "إجمالي الإيرادات",
      value: `EGP ${totalRevenue}`,
      icon: FaDollarSign,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      change: "+15%",
      changeType: "increase"
    },
   
  ];

  // Add state for content access management
  const [selectedUser, setSelectedUser] = useState('');
  const [contentIds, setContentIds] = useState('');
  const [grantingAccess, setGrantingAccess] = useState(false);

  // Add function to grant content access
  const handleGrantContentAccess = async () => {
    if (!selectedUser || !contentIds.trim()) {
      toast.error('يرجى اختيار المستخدم وإدخال معرفات المحتوى');
      return;
    }

    const idsArray = contentIds.split(',').map(id => id.trim()).filter(id => id);
    
    setGrantingAccess(true);
    try {
      const response = await axiosInstance.post('/courses/grant-access', {
        userId: selectedUser,
        contentIds: idsArray
      });

      if (response.data.success) {
        toast.success('تم منح الوصول للمحتوى بنجاح');
        setSelectedUser('');
        setContentIds('');
      }
    } catch (error) {
      console.error('Error granting access:', error);
      toast.error(error.response?.data?.message || 'فشل في منح الوصول');
    } finally {
      setGrantingAccess(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" dir="rtl">
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
                لوحة تحكم الإدارة
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                مرحباً بعودتك! إليك نظرة عامة على أداء منصة التعلم والمقاييس الرئيسية.
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
                  <h3 className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white mb-1 text-right">
                    {card.value}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm text-right">
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
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white text-right">
                    المراحل الدراسية
                  </h3>
                </div>
                <div className="h-48 sm:h-56 lg:h-64 w-full">
                  {stagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="mr-2 text-gray-600 dark:text-gray-300">جاري تحميل بيانات المراحل...</span>
                    </div>
                  ) : (
                    <Pie
                      data={stagesChartData}
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
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const stage = stages[context.dataIndex];
                                return [
                                  `${context.label}: ${context.parsed} طالب`,
                                  `المواد: ${stage?.subjectsCount || 0}`
                                ];
                              }
                            }
                          }
                        }
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Platform Growth Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 lg:p-6">
                <div className="flex items-center gap-3 mb-4 lg:mb-6">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <FaRocket className="text-green-600 dark:text-green-400 text-lg lg:text-xl" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white text-right">
                    نمو المنصة
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
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-4 lg:mb-6 flex items-center gap-3 text-right">
                <FaCog className="text-blue-500" />
                الإجراءات السريعة
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">

                <button
                  onClick={() => navigate("/admin/blog-dashboard")}
                  className="group p-3 lg:p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg lg:rounded-xl text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FaBlog className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">لوحة المدونة</span>
                </button>
                <button
                  onClick={() => navigate("/admin/qa-dashboard")}
                  className="group p-3 lg:p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg lg:rounded-xl text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FaQuestionCircle className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">لوحة الأسئلة والأجوبة</span>
                </button>
                <button
                  onClick={() => navigate("/admin/course-dashboard")}
                  className="group p-3 lg:p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg lg:rounded-xl text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FaBook className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">إدارة الدورات</span>
                </button>
                <button
                  onClick={() => navigate("/admin/subject-dashboard")}
                  className="group p-3 lg:p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-lg lg:rounded-xl text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FaGraduationCap className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">لوحة المواد</span>
                </button>
                <button
                  onClick={() => navigate("/admin/users")}
                  className="group p-3 lg:p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg lg:rounded-xl text-white hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FaUsers className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">إدارة المستخدمين</span>
                </button>
                <button
                  onClick={() => navigate("/admin/course-content")}
                  className="group p-3 lg:p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg lg:rounded-xl text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FaClipboardCheck className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">إدارة محتوى الدورات</span>
                </button>
                <button
                  onClick={() => navigate("/admin/user-progress")}
                  className="group p-3 lg:p-4 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg lg:rounded-xl text-white hover:from-teal-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FaChartLine className="text-lg lg:text-2xl mx-auto mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs lg:text-sm font-medium">تقدم الطلاب</span>
                </button>

              </div>
            </div>



        
          </div>
        </section>
      </div>
    </Layout>
  );
}
