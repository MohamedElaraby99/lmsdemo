import React, { useEffect, useState } from "react";
import { FaSun, FaMoon, FaBars, FaHome, FaUser, FaGraduationCap, FaBlog, FaQuestionCircle, FaSignOutAlt } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../Redux/Slices/AuthSlice";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const element = document.querySelector("html");
    element.classList.remove("light", "dark");
    if (darkMode) {
      element.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      element.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const menuItems = [
    { name: "Home", path: "/", icon: FaHome },
    { name: "Courses", path: "/subjects", icon: FaGraduationCap },
    { name: "Blog", path: "/blogs", icon: FaBlog },
    { name: "Q&A", path: "/qa", icon: FaQuestionCircle },
  ];

  const adminMenuItems = [
    { name: "Dashboard", path: "/admin", icon: FaUser },
    { name: "Manage Courses", path: "/admin/courses", icon: FaGraduationCap },
    { name: "Manage Users", path: "/admin/users", icon: FaUser },
    { name: "Manage Blogs", path: "/admin/blogs", icon: FaBlog },
    { name: "Manage Q&A", path: "/admin/qa", icon: FaQuestionCircle },
    { name: "Manage Subjects", path: "/admin/subjects", icon: FaGraduationCap },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group logo-hover">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FaGraduationCap className="text-white text-xl" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              LMS Platform
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium navbar-item menu-item ${
                  location.pathname === item.path
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 active-menu-item"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300 group"
            >
              {darkMode ? (
                <FaSun className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <FaMoon className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform duration-300" />
              )}
            </button>

            {/* Desktop User Menu */}
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center user-avatar">
                    <span className="text-white text-sm font-semibold">
                      {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.fullName}
                  </span>
                </div>
                
                {/* Desktop Dropdown Menu */}
                <div className="relative group">
                  <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300">
                    <FaUser className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                  
                  {/* Dropdown Content */}
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
                      >
                        <FaUser className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-300 w-full text-left"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-300 transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile User Avatar - ONLY on mobile */}
            <div className="md:hidden flex items-center space-x-2">
              {user && (
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center user-avatar">
                    <span className="text-white text-sm font-semibold">
                      {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu - Enhanced Design */}
        <div
          className={`md:hidden mobile-menu-container transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen
              ? "max-h-screen opacity-100 visible"
              : "max-h-0 opacity-0 invisible"
          }`}
        >
          <div className="py-6 space-y-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            {/* Navigation Links */}
            <div className="space-y-2">
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Navigation
                </p>
              </div>
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 mx-4 rounded-xl font-medium transition-all duration-300 mobile-menu-item ${
                    location.pathname === item.path
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    location.pathname === item.path
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* User Menu Items */}
            {user && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="px-4 py-3 mx-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {user.fullName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase">
                          {user.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Menu */}
                {user.role === "admin" && (
                  <div className="space-y-2">
                    <div className="px-4 py-2">
                      <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                        Admin Panel
                      </p>
                    </div>
                    {adminMenuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 mx-4 rounded-xl font-medium transition-all duration-300 mobile-menu-item ${
                          location.pathname === item.path
                            ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 shadow-md"
                            : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          location.pathname === item.path
                            ? "bg-purple-100 dark:bg-purple-900/30"
                            : "bg-gray-100 dark:bg-gray-700"
                        }`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="font-semibold">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* User Actions */}
                <div className="space-y-2">
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Account
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-4 py-3 mx-4 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 mobile-menu-item"
                  >
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                      <FaUser className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 mx-4 rounded-xl font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 w-full text-left mobile-menu-item"
                  >
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                      <FaSignOutAlt className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">Logout</span>
                  </button>
                </div>
              </>
            )}

            {/* Guest Actions */}
            {!user && (
              <div className="space-y-3 px-4">
                <Link
                  to="/login"
                  className="block w-full px-6 py-3 text-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors duration-300 transform hover:scale-105 mobile-menu-item"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block w-full px-6 py-3 text-center border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl font-semibold transition-all duration-300 mobile-menu-item"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
