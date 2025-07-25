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

            {/* Wallet Balance Display */}
            {isLoggedIn && role !== "ADMIN" && (
              <li className="mb-3">
                <div className="bg-gradient-to-r from-green-400 to-blue-400 rounded-lg p-3 text-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaWallet className="text-white" size={14} />
                      <span className="text-xs font-medium">Balance</span>
                    </div>
                  </div>
                  <div className="text-lg font-bold mt-1">
                    {balance ? `${balance.toFixed(2)} EGP` : "0.00 EGP"}
                  </div>
                </div>
              </li>
            )}
            <li>
              <Link to="/" className="flex gap-4 items-center">
                <FaHome
                  size={18}
                  className="text-gray-500 dark:text-slate-100"
                />
                Home
              </Link>
            </li>

            <li>
              <Link to="/blogs" className="flex gap-4 items-center">
                <FaBlog
                  size={18}
                  className="text-gray-500 dark:text-slate-100"
                />
                Blog
              </Link>
            </li>

            <li>
              <Link to="/qa" className="flex gap-4 items-center">
                <FaQuestionCircle
                  size={18}
                  className="text-gray-500 dark:text-slate-100"
                />
                Q&A
              </Link>
            </li>

            {isLoggedIn && role !== "ADMIN" && (
              <li>
                <Link to="/wallet" className="flex gap-4 items-center">
                  <FaWallet
                    size={18}
                    className="text-gray-500 dark:text-slate-100"
                  />
                  My Wallet
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
                  Admin DashBoard
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
                  Create new course
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
                  Blog Management
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
                  Q&A Management
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
                  Recharge Codes
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
                  User Management
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
                  WhatsApp Management
                </Link>
              </li>
            )}

            <li>
              <Link to="/courses" className="flex gap-4 items-center">
                <FaList
                  size={18}
                  className="text-gray-500 dark:text-slate-100"
                />
                All Courses
              </Link>
            </li>

            <li>
              <Link to="/whatsapp-services" className="flex gap-4 items-center">
                <FaWhatsapp
                  size={18}
                  className="text-gray-500 dark:text-slate-100"
                />
                WhatsApp Services
              </Link>
            </li>

            <li>
              <Link to="/contact" className="flex gap-4 items-center">
                <FaPhone
                  size={18}
                  className="text-gray-500 dark:text-slate-100"
                />
                Contact Us
              </Link>
            </li>

            <li>
              <Link to="/about" className="flex gap-4 items-center">
                <FaInfoCircle
                  size={18}
                  className="text-gray-500 dark:text-slate-100"
                />
                About Us
              </Link>
            </li>

            {isLoggedIn ? (
              <li className="absolute bottom-4 w-[90%]">
                <div className="w-full flex flex-col gap-3 items-center justify-center">
                  {/* User Avatar Circle */}
                  <Link 
                    to="/user/profile" 
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
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
                      {role === "ADMIN" ? "Administrator" : "Student"}
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    className="btn-secondary px-3.5 py-2.5 font-semibold rounded-md w-full"
                    onClick={onLogout}
                    disabled={isLoading}
                  >
                    {isLoading ? "Logout..." : "Logout"}
                  </button>
                </div>
              </li>
            ) : (
              <li className="absolute bottom-4 w-[90%]">
                <div className="w-full flex items-center justify-center">
                  <button className="btn-primary px-3.5 py-2.5 font-semibold rounded-md w-full">
                    <Link to="/login">Login</Link>
                  </button>
                  <button className="btn-secondary px-3.5 py-2.5 font-semibold rounded-md w-full">
                    <Link to="/signup">Signup</Link>
                  </button>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    );
}
