import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../Redux/Slices/AuthSlice";
import { getWalletBalance } from "../Redux/Slices/WalletSlice";
import { Link, useNavigate } from "react-router-dom";
import { AiFillCloseCircle } from "react-icons/ai";
import {
  FaHome,
  FaUserCircle,
  FaPlus,
  FaList,
  FaInfoCircle,
  FaPhone,
  FaBlog,
  FaQuestionCircle,
  FaWallet,
  FaCreditCard,
  FaUsers,
  FaWhatsapp,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaChevronDown,
  FaChevronUp,
  FaServer,
  FaVideo,
} from "react-icons/fa";

export default function Sidebar({ hideBar = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const { isLoggedIn, role, data } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.wallet);

  // Fetch wallet balance when user is logged in
  useEffect(() => {
    if (isLoggedIn && role !== "ADMIN") {
      dispatch(getWalletBalance());
    }
  }, [dispatch, isLoggedIn, role]);

  const onLogout = async function () {
    await dispatch(logout());
    navigate("/");
  };

  // Function to get user initials from full name
  const getUserInitials = (fullName) => {
    if (!fullName) return "U";
    const names = fullName.split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const closeSidebar = () => {
    const drawerToggle = document.getElementById('sidebar-drawer');
    if (drawerToggle) {
      drawerToggle.checked = false;
    }
  };

  const toggleAdminDropdown = () => {
    setAdminDropdownOpen(!adminDropdownOpen);
  };

  return (
    <div className="drawer drawer-end">
      <input className="drawer-toggle" id="sidebar-drawer" type="checkbox" />
      <div className="drawer-side z-50">
        <label htmlFor="sidebar-drawer" className="drawer-overlay"></label>
        <div className="min-h-full w-80 bg-white dark:bg-gray-900 text-base-content p-4 relative z-60">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400">
              مركز التعلم
            </h2>
            <button onClick={closeSidebar} className="text-red-500 hover:text-red-700">
              <AiFillCloseCircle size={24} />
            </button>
          </div>

          {/* Wallet Balance */}
          {isLoggedIn && role !== "ADMIN" && (
            <div className="mb-6">
              <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-lg p-4 text-white shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FaWallet className="text-white" size={16} />
                    <span className="text-sm font-medium">رصيد المحفظة</span>
                  </div>
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                </div>
                <div className="text-lg font-bold mb-1">
                  {balance ? `${balance.toFixed(2)}` : "0.00"}
                </div>
                <div className="text-xs opacity-90">جنيه مصري</div>
                <Link 
                  to="/wallet" 
                  className="mt-3 block w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-md px-3 py-2 text-xs font-medium transition-all duration-200 text-center"
                  onClick={closeSidebar}
                >
                  إدارة المحفظة
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <ul className="menu space-y-2">
            <li>
              <Link to="/" className="flex gap-4 items-center" onClick={closeSidebar}>
                <FaHome size={18} className="text-gray-500 dark:text-slate-100" />
                الرئيسية
              </Link>
            </li>

            {/* Courses Section */}
            <li>
              <Link to="/courses" className="flex gap-4 items-center" onClick={closeSidebar}>
                <FaList size={18} className="text-gray-500 dark:text-slate-100" />
                {role === "ADMIN" ? "جميع الكورسات" : "كورساتي"}
              </Link>
            </li>

            {isLoggedIn && role !== "ADMIN" && (
              <li>
                <Link to="/wallet" className="flex gap-4 items-center" onClick={closeSidebar}>
                  <FaWallet size={18} className="text-gray-500 dark:text-slate-100" />
                  محفظتي
                </Link>
              </li>
            )}

            {isLoggedIn && (
              <li>
                <Link to="/live-meetings" className="flex gap-4 items-center" onClick={closeSidebar}>
                  <FaVideo size={18} className="text-gray-500 dark:text-slate-100" />
                  الجلسات المباشرة
                </Link>
              </li>
            )}

            {role === "ADMIN" && (
              <li>
                <Link to="/admin/dashboard" className="flex gap-4 items-center" onClick={closeSidebar}>
                  <FaUserCircle size={18} className="text-gray-500 dark:text-slate-100" />
                  لوحة تحكم الإدارة
                </Link>
              </li>
            )}



            {role === "ADMIN" && (
              <li>
                <Link to="/admin/recharge-codes" className="flex gap-4 items-center" onClick={closeSidebar}>
                  <FaCreditCard size={18} className="text-gray-500 dark:text-slate-100" />
                  رموز الشحن
                </Link>
              </li>
            )}

            {role === "ADMIN" && (
              <li>
                <Link to="/admin/users" className="flex gap-4 items-center" onClick={closeSidebar}>
                  <FaUsers size={18} className="text-gray-500 dark:text-slate-100" />
                  إدارة المستخدمين
                </Link>
              </li>
            )}

            {role === "ADMIN" && (
              <li>
                <Link to="/admin/device-management" className="flex gap-4 items-center" onClick={closeSidebar}>
                  <FaServer size={18} className="text-gray-500 dark:text-slate-100" />
                  إدارة الأجهزة
                </Link>
              </li>
            )}

            {role === "ADMIN" && (
              <li>
                <Link to="/admin/instructors" className="flex gap-4 items-center" onClick={closeSidebar}>
                  <FaChalkboardTeacher size={18} className="text-gray-500 dark:text-slate-100" />
                  إدارة المدرسين
                </Link>
              </li>
            )}

            {role === "ADMIN" && (
              <li>
                <Link to="/admin/stages" className="flex gap-4 items-center" onClick={closeSidebar}>
                  <FaGraduationCap size={18} className="text-gray-500 dark:text-slate-100" />
                  إدارة المراحل
                </Link>
              </li>
            )}

            {/* Admin Services Dropdown */}
            {role === "ADMIN" && (
              <li>
                <button 
                  onClick={toggleAdminDropdown}
                  className="flex gap-4 items-center justify-between w-full"
                >
                  <div className="flex gap-4 items-center">
                    <FaInfoCircle size={18} className="text-gray-500 dark:text-slate-100" />
                    خدمات الإدارة
                  </div>
                  {adminDropdownOpen ? (
                    <FaChevronUp size={14} className="text-gray-500 dark:text-slate-100" />
                  ) : (
                    <FaChevronDown size={14} className="text-gray-500 dark:text-slate-100" />
                  )}
                </button>
                
                {adminDropdownOpen && (
                  <ul className="mt-2 mr-8 space-y-2">
                    <li>
                      <Link 
                        to="/admin/blog-dashboard" 
                        className="flex gap-4 items-center text-sm"
                        onClick={closeSidebar}
                      >
                        <FaBlog size={16} className="text-gray-500 dark:text-slate-100" />
                        إدارة المدونة
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/admin/qa-dashboard" 
                        className="flex gap-4 items-center text-sm"
                        onClick={closeSidebar}
                      >
                        <FaQuestionCircle size={16} className="text-gray-500 dark:text-slate-100" />
                        إدارة الأسئلة والأجوبة
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/admin/whatsapp-services" 
                        className="flex gap-4 items-center text-sm"
                        onClick={closeSidebar}
                      >
                        <FaWhatsapp size={16} className="text-gray-500 dark:text-slate-100" />
                        إدارة واتساب
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/admin/live-meetings" 
                        className="flex gap-4 items-center text-sm"
                        onClick={closeSidebar}
                      >
                        <FaVideo size={16} className="text-gray-500 dark:text-slate-100" />
                        إدارة الجلسات المباشرة
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/about" 
                        className="flex gap-4 items-center text-sm"
                        onClick={closeSidebar}
                      >
                        <FaInfoCircle size={16} className="text-gray-500 dark:text-slate-100" />
                        عننا
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/contact" 
                        className="flex gap-4 items-center text-sm"
                        onClick={closeSidebar}
                      >
                        <FaPhone size={16} className="text-gray-500 dark:text-slate-100" />
                        اتصل بنا
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            )}



            <li>
              <Link to="/instructors" className="flex gap-4 items-center" onClick={closeSidebar}>
                <FaChalkboardTeacher size={18} className="text-gray-500 dark:text-slate-100" />
                المدرسين
              </Link>
            </li>

            {/* Show these links for non-admin users */}
            {role !== "ADMIN" && (
              <>
                <li>
                  <Link to="/blogs" className="flex gap-4 items-center" onClick={closeSidebar}>
                    <FaBlog size={18} className="text-gray-500 dark:text-slate-100" />
                    المدونة
                  </Link>
                </li>

                <li>
                  <Link to="/qa" className="flex gap-4 items-center" onClick={closeSidebar}>
                    <FaQuestionCircle size={18} className="text-gray-500 dark:text-slate-100" />
                    الأسئلة والأجوبة
                  </Link>
                </li>

                <li>
                  <Link to="/whatsapp-services" className="flex gap-4 items-center" onClick={closeSidebar}>
                    <FaWhatsapp size={18} className="text-gray-500 dark:text-slate-100" />
                    خدمات واتساب
                  </Link>
                </li>

                <li>
                  <Link to="/contact" className="flex gap-4 items-center" onClick={closeSidebar}>
                    <FaPhone size={18} className="text-gray-500 dark:text-slate-100" />
                    اتصل بنا
                  </Link>
                </li>

                <li>
                  <Link to="/about" className="flex gap-4 items-center" onClick={closeSidebar}>
                    <FaInfoCircle size={18} className="text-gray-500 dark:text-slate-100" />
                    عننا
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* User Section */}
          <div className="absolute bottom-4 left-4 right-4">
            {isLoggedIn ? (
              <div className="w-full flex flex-col gap-4 items-center justify-center">
                {/* User Avatar */}
                <Link 
                  to="/user/profile" 
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-white dark:border-gray-700"
                  onClick={closeSidebar}
                >
                  {data?.avatar?.secure_url ? (
                    <img 
                      src={data.avatar.secure_url} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getUserInitials(data?.fullName)
                  )}
                </Link>
                
                {/* User Name */}
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {data?.fullName || "User"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {role === "ADMIN" ? "مدير" : "طالب"}
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  disabled={isLoading}
                  className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500 to-pink-500 p-0.5 hover:from-red-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="relative flex items-center justify-center gap-2 rounded-[10px] bg-white dark:bg-gray-800 px-4 py-3 transition-all duration-300 group-hover:bg-transparent">
                    <div className="relative z-10 flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-500 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="font-semibold text-red-500 group-hover:text-white transition-colors duration-300">
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin group-hover:border-white group-hover:border-t-transparent"></div>
                            جاري تسجيل الخروج...
                          </div>
                        ) : (
                          "تسجيل الخروج"
                        )}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-3 items-center justify-center">
                {/* Sign In Button */}
                <Link 
                  to="/login" 
                  onClick={closeSidebar}
                  className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-0.5 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                >
                  <div className="relative flex items-center justify-center gap-2 rounded-[10px] bg-white dark:bg-gray-800 px-4 py-3 transition-all duration-300 group-hover:bg-transparent">
                    <div className="relative z-10 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span className="font-semibold text-blue-500 group-hover:text-white transition-colors duration-300">
                        تسجيل الدخول
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Sign Up Button */}
                <Link 
                  to="/signup" 
                  onClick={closeSidebar}
                  className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-0.5 hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                >
                  <div className="relative flex items-center justify-center gap-2 rounded-[10px] bg-white dark:bg-gray-800 px-4 py-3 transition-all duration-300 group-hover:bg-transparent">
                    <div className="relative z-10 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span className="font-semibold text-green-500 group-hover:text-white transition-colors duration-300">
                        إنشاء حساب
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
