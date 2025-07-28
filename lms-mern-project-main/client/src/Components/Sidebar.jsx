import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../Redux/Slices/AuthSlice";
import { getWalletBalance } from "../Redux/Slices/WalletSlice";
import { Link, useNavigate } from "react-router-dom";
import { AiFillCloseCircle } from "react-icons/ai";
import { FiMenu } from "react-icons/fi";
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
} from "react-icons/fa";

export default function Sidebar({ hideBar = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { isLoggedIn, role, data } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.wallet);

  // Listen for window resize to force re-render
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  function changeWidth() {
    const drawerSide = document.getElementsByClassName("drawer-side");
    drawerSide[0].style.width = "auto";
    drawerSide[0].style.right = "0";
    drawerSide[0].style.left = "auto";
    drawerSide[0].classList.add("drawer-open");
  }

  function hideDrawer() {
    const element = document.getElementsByClassName("drawer-toggle");
    element[0].checked = false;

    const drawerSide = document.getElementsByClassName("drawer-side");
    drawerSide[0].style.width = "0";
    drawerSide[0].style.right = "0";
    drawerSide[0].style.left = "auto";
    drawerSide[0].classList.remove("drawer-open");
  }

  return (
    <div className="drawer absolute right-0 z-50 w-fit" key={windowWidth}>
      <input className="drawer-toggle" id="my-drawer" type="checkbox" />
      <div className="drawer-content ">
        <label
          htmlFor="my-drawer"
          className="cursor-pointer fixed top-4 right-4 z-50"
        >
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300">
            <FiMenu
              onClick={changeWidth}
              size={"24px"}
              className="text-gray-700 dark:text-gray-300"
            />
          </div>
        </label>
      </div>
        <div className="drawer-side drawer-side-right w-0 shadow-custom dark:shadow-lg" style={{right: '0', left: 'auto'}}>
          <label
            htmlFor="my-drawer"
            className="drawer-overlay w-screen"
          ></label>
          <ul className="menu  p-4 pt-7 h-[100%] min-w-[250px] max-w-[350px]  bg-white dark:bg-[#29303ea3] backdrop-blur-[8px] text-gray-500 font-inter dark:text-slate-50 md:text-[17px] text-base font-[600] relative">
            <li className="w-fit absolute right-2 z-50 text-red-500">
              <button onClick={hideDrawer}>
                <AiFillCloseCircle size={28} />
              </button>
            </li>

            {/* Platform Name */}
            <li className="mb-6">
              <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400">
                  مركز التعلم
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  بوابتك للمعرفة
                </p>
              </div>
            </li>

            {/* Enhanced Wallet Balance Display */}
            {isLoggedIn && role !== "ADMIN" && (
              <li className="mb-4">
                <div className="relative group">
                  {/* Main Balance Card */}
                  <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-emerald-400/20">
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl"></div>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-2 translate-x-2"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full translate-y-2 -translate-x-2"></div>
                    
                    {/* Header */}
                    <div className="relative z-10 flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                          <FaWallet className="text-white" size={16} />
                        </div>
                        <div>
                          <span className="text-xs font-medium opacity-90">رصيد المحفظة</span>
                          <div className="text-xs opacity-75">Wallet Balance</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                        <span className="text-xs opacity-75">متصل</span>
                      </div>
                    </div>
                    
                    {/* Balance Amount */}
                    <div className="relative z-10">
                      <div className="text-2xl font-bold mb-1">
                        {balance ? `${balance.toFixed(2)}` : "0.00"}
                      </div>
                      <div className="text-sm opacity-90 font-medium">جنيه مصري</div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="relative z-10 flex items-center gap-2 mt-3 pt-3 border-t border-white/20">
                      <Link 
                        to="/wallet" 
                        className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1"
                        onClick={hideDrawer}
                      >
                        <FaWallet size={12} />
                        إدارة المحفظة
                      </Link>
                      <button 
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-2 text-xs transition-all duration-200"
                        title="تحديث الرصيد"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Floating Notification Badge */}
                  {balance && balance > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-bounce">
                      نشط
                    </div>
                  )}
                </div>
              </li>
            )}
            <li>
              <Link to="/" className="flex gap-4 items-center">
                <FaHome
                  size={18}
                  className="text-gray-500 dark:text-slate-100"
                />
                الرئيسية
              </Link>
            </li>

            <li>
              <Link to="/blogs" className="flex gap-4 items-center">
                <FaBlog
                  size={18}
                  className="text-gray-500 dark:text-slate-100"
                />
                المدونة
              </Link>
            </li>

            <li>
              <Link to="/qa" className="flex gap-4 items-center">
                <FaQuestionCircle
                  size={18}
                  className="text-gray-500 dark:text-slate-100"
                />
                الأسئلة والأجوبة
              </Link>
            </li>

            {isLoggedIn && role !== "ADMIN" && (
              <li>
                <Link to="/wallet" className="flex gap-4 items-center">
                  <FaWallet
                    size={18}
                    className="text-gray-500 dark:text-slate-100"
                  />
                  محفظتي
                </Link>
              </li>
            )}

            {role === "ADMIN" && (
              <li>
                <Link to="/admin/dashboard" className="flex gap-4 items-center">
                  <FaUserCircle
                    size={18}
                    className="text-gray-500 dark:text-slate-100"
                  />
                  لوحة تحكم الإدارة
                </Link>
              </li>
            )}

            {role === "ADMIN" && (
              <li>
                <Link to="/course/create" className="flex gap-4 items-center">
                  <FaPlus
                    size={18}
                    className="text-gray-500 dark:text-slate-100"
                  />
                  إنشاء دورة جديدة
                </Link>
              </li>
            )}

            {role === "ADMIN" && (
              <li>
                <Link to="/admin/blog-dashboard" className="flex gap-4 items-center">
                  <FaBlog
                    size={18}
                    className="text-gray-500 dark:text-slate-100"
                  />
                  إدارة المدونة
                </Link>
              </li>
            )}

            {role === "ADMIN" && (
              <li>
                <Link to="/admin/qa-dashboard" className="flex gap-4 items-center">
                  <FaQuestionCircle
                    size={18}
                    className="text-gray-500 dark:text-slate-100"
                  />
                  إدارة الأسئلة والأجوبة
                </Link>
              </li>
            )}

            {role === "ADMIN" && (
              <li>
                <Link to="/admin/recharge-codes" className="flex gap-4 items-center">
                  <FaCreditCard
                    size={18}
                    className="text-gray-500 dark:text-slate-100"
                  />
                  رموز الشحن
                </Link>
              </li>
            )}

            {role === "ADMIN" && (
              <li>
                <Link to="/admin/users" className="flex gap-4 items-center">
                  <FaUsers
                    size={18}
                    className="text-gray-500 dark:text-slate-100"
                  />
                  إدارة المستخدمين
                </Link>
              </li>
            )}

            {role === "ADMIN" && (
              <li>
                <Link to="/admin/instructors" className="flex gap-4 items-center">
                  <FaChalkboardTeacher
                    size={18}
                    className="text-gray-500 dark:text-slate-100"
                  />
                  إدارة المدرسين
                </Link>
              </li>
            )}

            {role === "ADMIN" && (
              <li>
                <Link to="/admin/stages" className="flex gap-4 items-center">
                  <FaGraduationCap
                    size={18}
                    className="text-gray-500 dark:text-slate-100"
                  />
                  إدارة المراحل
                </Link>
              </li>
            )}

            {role === "ADMIN" && (
              <li>
                <Link to="/admin/whatsapp-services" className="flex gap-4 items-center">
                  <FaWhatsapp
                    size={18}
                    className="text-gray-500 dark:text-slate-100"
                  />
                  إدارة واتساب
                </Link>
              </li>
            )}

            <li>
              <Link to="/courses" className="flex gap-4 items-center">
                <FaList
                  size={18}
                  className="text-gray-500 dark:text-slate-100"
                />
                {role === "USER" ? "كورساتي" : "جميع الكورسات"}
              </Link>
            </li>

            <li>
              <Link to="/instructors" className="flex gap-4 items-center">
                <FaChalkboardTeacher
                  size={18}
                  className="text-gray-500 dark:text-slate-100"
                />
                المدرسين
              </Link>
            </li>

            <li>
              <Link to="/whatsapp-services" className="flex gap-4 items-center">
                <FaWhatsapp
                  size={18}
                  className="text-gray-500 dark:text-slate-100"
                />
                خدمات واتساب
              </Link>
            </li>

            <li>
              <Link to="/contact" className="flex gap-4 items-center">
                <FaPhone
                  size={18}
                  className="text-gray-500 dark:text-slate-100"
                />
                اتصل بنا
              </Link>
            </li>

            <li>
              <Link to="/about" className="flex gap-4 items-center">
                <FaInfoCircle
                  size={18}
                  className="text-gray-500 dark:text-slate-100"
                />
                عننا
              </Link>
            </li>

            {isLoggedIn ? (
              <li className="absolute bottom-4 w-[90%]">
                <div className="w-full flex flex-col gap-4 items-center justify-center">
                  {/* User Avatar Circle */}
                  <Link 
                    to="/user/profile" 
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-white dark:border-gray-700"
                    onClick={hideDrawer}
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

                  {/* Modern Logout Button */}
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
              </li>
            ) : (
              <li className="absolute bottom-4 w-[90%]">
                <div className="w-full flex flex-col gap-3 items-center justify-center">
                  {/* Modern Sign In Button */}
                  <Link 
                    to="/login" 
                    onClick={hideDrawer}
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

                  {/* Modern Sign Up Button */}
                  <Link 
                    to="/signup" 
                    onClick={hideDrawer}
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
              </li>
            )}
          </ul>
        </div>
      </div>
    );
}
