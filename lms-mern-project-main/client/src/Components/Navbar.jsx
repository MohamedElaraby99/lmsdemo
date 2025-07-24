import React, { useEffect, useState } from "react";
import { FaSun, FaMoon, FaBars, FaHome, FaUser, FaGraduationCap, FaBlog, FaQuestionCircle, FaSignOutAlt, FaPlus, FaList, FaInfoCircle, FaPhone } from "react-icons/fa";
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
    // Trigger the Sidebar drawer instead of mobile menu
    const drawerToggle = document.getElementById('my-drawer');
    const drawerSide = document.getElementsByClassName("drawer-side");
    
    if (drawerToggle && drawerSide[0]) {
      console.log("Navbar burger clicked - toggling drawer");
      drawerToggle.checked = !drawerToggle.checked;
      
      if (drawerToggle.checked) {
        // Open drawer
        drawerSide[0].style.width = "auto";
        drawerSide[0].style.right = "0";
        drawerSide[0].style.left = "auto";
        drawerSide[0].classList.add("drawer-open");
      } else {
        // Close drawer
        drawerSide[0].style.width = "0";
        drawerSide[0].style.right = "0";
        drawerSide[0].style.left = "auto";
        drawerSide[0].classList.remove("drawer-open");
      }
    } else {
      console.log("Drawer elements not found");
    }
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
    { name: "All Courses", path: "/courses", icon: FaList },
    { name: "Blog", path: "/blogs", icon: FaBlog },
    { name: "Q&A", path: "/qa", icon: FaQuestionCircle },
    { name: "About", path: "/about", icon: FaInfoCircle },
    { name: "Contact", path: "/contact", icon: FaPhone },
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
          <Link to="/" className="flex items-center space-x-3 group logo-hover">
            <div className="group-hover:scale-110 transition-transform duration-300">
              <svg 
                className="w-10 h-10 opacity-80 group-hover:opacity-100 transition-opacity duration-300" 
                viewBox="0 0 226 314" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_2311_2)">
                  <path d="M222.67 242.4C222.12 242.34 217.25 235.37 215.69 233.82C202.05 220.28 177.14 219.92 159.86 225.41C149.37 228.74 140.73 233.2 136.92 244.19C147.26 244.32 158.57 241.07 168.89 241.88C170.36 242 176.59 243.02 176.49 244.82C176.47 245.16 172.12 245.53 169.99 246.96C160.84 253.09 160.13 266.77 156.21 276.38C147.17 298.52 136.12 302.03 113.78 302.57C111.49 302.63 96.8599 302.97 96.2899 302.3C95.4699 301.33 105.6 282.56 106.87 279.27C110.3 270.4 113.17 259.84 114.94 250.53C112.4 253.15 108.03 251.89 105.92 254.92C100.98 280.78 88.8799 319.26 55.4199 313.23C59.6299 308.26 64.4799 304.38 68.5899 299.24C73.7799 292.74 77.8799 284.83 81.2199 277.26L86.1799 261.54C83.6099 263.47 74.7199 266.14 73.2599 268.07C71.3199 270.63 70.6899 280.54 68.3299 284.18C63.4899 291.67 57.0699 289.94 49.8599 291.84C41.5899 294.01 32.5299 298.36 24.0199 299.07C18.3099 299.55 10.4399 297.61 4.65991 296.77C6.55991 295.07 8.87991 295.84 11.1599 294.52C18.3399 290.36 22.3599 275.68 24.8699 267.7C25.9099 264.39 26.1099 259.75 27.2999 256.28C36.5199 233.8 62.3199 241.46 81.3999 240.56C79.2899 249.02 75.2199 257.36 74.8199 266.12C77.7099 263.09 85.0099 261.91 87.0099 258.76C88.2399 252.27 90.6799 244.71 90.7499 238.21C90.7699 236.8 88.8999 235.79 91.1799 235.06C93.6999 234.26 103.82 234.26 107.17 234.22C108.61 234.2 112.61 232.4 111.05 235.63C108.82 240.26 108.06 247.06 107.23 252.17C109.07 250.29 114.82 250.96 116.07 249.41C116.73 248.59 116.56 246.56 117.24 245.34C121.22 238.21 125.47 233.69 132.33 229.06C125.11 228.24 117.27 230.38 109.99 231.07C87.1799 233.24 48.0499 236.21 29.2499 221.53C19.1099 213.61 13.8199 203.83 10.0299 191.77C9.60991 190.42 8.14991 187.26 9.35991 186.28C29.9799 222.47 73.5699 216.94 108.63 213.22C141.34 209.75 186.72 195.54 212.78 222.49C215.14 224.93 224.08 235.67 225.05 238.07C225.77 239.86 223.68 242.51 222.68 242.4H222.67ZM119.18 295.24C128.23 297.31 131.67 286.59 134.35 279.8C136.47 274.43 137.36 267.96 139.28 262.82C141.43 257.06 144.77 251.66 147.54 246.21C144.73 245.69 138.4 246.1 136.73 248.29C131.14 263.96 127.48 280.74 119.17 295.25L119.18 295.24ZM33.5999 291.63C36.5599 292.91 47.6599 288.15 48.8899 286.28C49.8699 281.26 61.2099 247.4 59.9399 245.71C59.1699 244.68 56.6699 246.16 55.6599 246.83C40.7299 256.79 48.3699 280.95 33.5999 291.62V291.63Z" fill="#113352" className="dark:fill-gray-300"></path>
                  <path d="M7.81982 252.68C13.8098 250.4 10.4198 237.81 11.9098 235.99C12.7098 235.01 25.4498 233.78 26.1498 234.3C28.1998 235.81 26.7898 247.54 24.3498 249.97C21.3798 252.93 11.8498 253.85 7.81982 252.68Z" fill="#1B98C3" className="dark:fill-blue-400"></path>
                  <path d="M19.3199 255.58C13.3299 257.86 16.7199 270.45 15.2299 272.27C14.4299 273.25 1.68989 274.48 0.989891 273.96C-1.06011 272.45 0.349891 260.72 2.78989 258.29C5.75989 255.33 15.2899 254.41 19.3199 255.58Z" fill="#1B98C3" className="dark:fill-blue-400"></path>
                  <path d="M183.28 258.91L186.13 252.14C187.14 249.94 185.52 240.72 186.74 239.78C187.34 239.32 201.32 238.25 201.77 238.85C202.12 239.31 201.84 249.22 201.41 250.49C198.56 259 189.51 256.08 183.28 258.91Z" fill="#1B98C3" className="dark:fill-blue-400"></path>
                  <path d="M18.0701 94.52C18.0701 42.32 60.3901 0 112.59 0C164.79 0 207.11 42.32 207.11 94.52C207.11 124.4 193.24 151.04 171.59 168.37C188.53 152.57 199.13 130.05 199.13 105.06C199.13 57.26 160.38 18.52 112.59 18.52C64.8001 18.52 26.0501 57.26 26.0501 105.06C26.0501 130.05 36.6501 152.57 53.5901 168.37C31.9401 151.05 18.0701 124.41 18.0701 94.52Z" fill="#113352" className="dark:fill-gray-300"></path>
                  <path d="M84.82 211.68V202.96C84.82 201.56 85.96 200.43 87.35 200.43H92.97V191.42L64.43 162.93C62.32 160.83 61.14 157.98 61.14 155V144.77L59.97 144.42C53.08 142.36 48.63 135.8 49.37 128.44C50.06 121.6 55.57 115.98 62.39 115.12C71.53 113.98 79.34 121.11 79.34 130.03C79.34 136.72 75.05 142.5 68.67 144.42L67.5 144.77V153.76C67.5 155.84 68.33 157.84 69.8 159.31L99.33 188.78V200.43H109.4V138.71C109.4 136.59 108.56 134.57 107.06 133.07L92.29 118.32V60.96L91.12 60.61C84.23 58.55 79.78 51.98 80.52 44.62C81.21 37.78 86.73 32.16 93.55 31.31C102.69 30.18 110.49 37.3 110.49 46.22C110.49 52.91 106.2 58.69 99.82 60.61L98.65 60.96V115.68L113.32 130.32C114.89 131.88 115.77 134 115.77 136.22V167.74L126.51 157.02V102.3L125.34 101.95C118.45 99.88 114.01 93.32 114.75 85.96C115.44 79.12 120.96 73.5 127.78 72.66C136.91 71.53 144.72 78.65 144.72 87.57C144.72 94.27 140.43 100.05 134.05 101.96L132.88 102.31V159.67L115.77 176.75V200.45H125.84V188.8L157.67 157.03V144.79L156.5 144.44C149.61 142.38 145.17 135.81 145.91 128.45C146.6 121.61 152.12 115.99 158.94 115.14C168.08 114 175.88 121.13 175.88 130.05C175.88 136.74 171.59 142.53 165.2 144.44L164.03 144.79V159.67L132.2 191.44V200.45H137.14C138.91 200.45 140.35 201.89 140.35 203.66V206.71C121.42 209.21 102.32 211.17 84.8 211.7L84.82 211.68ZM67.02 120.46C59.48 118.46 52.75 125.18 54.76 132.72C55.64 136.03 58.32 138.71 61.63 139.59C69.17 141.59 75.89 134.87 73.89 127.33C73.01 124.02 70.33 121.34 67.02 120.46ZM132.42 77.99C124.87 75.98 118.14 82.71 120.15 90.26C121.03 93.57 123.71 96.25 127.02 97.12C134.56 99.12 141.28 92.4 139.28 84.86C138.4 81.55 135.73 78.87 132.42 77.99Z" fill="#1B98C3" className="dark:fill-blue-400"></path>
                </g>
                <defs>
                  <clipPath id="clip0_2311_2">
                    <rect width="225.18" height="313.86" fill="white"></rect>
                  </clipPath>
                </defs>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              Fikra Software
            </span>
          </Link>



          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 mr-11 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300 group"
            >
              {darkMode ? (
                <FaSun className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <FaMoon className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform duration-300" />
              )}
            </button>

            {/* Desktop User Menu */}
            {user && user.fullName ? (
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
            ) : null}

            {/* Menu Button - Visible on all devices */}
            <div className="flex items-center space-x-2">
              {user && (
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center user-avatar">
                    <span className="text-white text-sm font-semibold">
                      {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Burger Menu Button */}
              <button
                onClick={toggleMenu}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <FaBars className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
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
                {user.role === "ADMIN" && (
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
