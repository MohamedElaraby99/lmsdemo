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
import { FaUsers, FaBlog, FaQuestionCircle, FaBook } from "react-icons/fa";
import { FcSalesPerformance } from "react-icons/fc";
import { GiMoneyStack } from "react-icons/gi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Layout from "../../Layout/Layout";
import { getAllCourses, deleteCourse } from "../../Redux/Slices/CourseSlice";
import { getPaymentRecord } from "../../Redux/Slices/RazorpaySlice";
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

  const { allPayments } = useSelector(
    (state) => state.razorpay
  );

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [instructorFilter, setInstructorFilter] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");

  // New chart data for course categories
  const courseCategoryData = {
    labels: ["Mathematics", "Science", "Literature", "History", "Technology", "Arts"],
    datasets: [
      {
        label: "Courses by Category",
        data: [totalCourses, totalLectures, allUsersCount, subscribedCount, totalPayments, totalRevenue],
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
          "rgba(255, 159, 64, 0.8)"
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)"
        ],
        borderWidth: 2,
      },
    ],
  };

  // New chart data for platform growth
  const platformGrowthData = {
    labels: ["Users", "Courses", "Lectures", "Revenue", "Payments"],
    datasets: [
      {
        label: "Platform Growth Metrics",
        data: [allUsersCount, totalCourses, totalLectures, totalRevenue / 1000, totalPayments],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const myCourses = useSelector((state) => state.course.coursesData);

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = myCourses || [];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.createdBy?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(course => course.category === categoryFilter);
    }

    // Instructor filter
    if (instructorFilter !== "all") {
      filtered = filtered.filter(course => course.createdBy === instructorFilter);
    }

    // Sort
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

  // Get unique categories and instructors for filters
  const uniqueCategories = useMemo(() => {
    const categories = myCourses?.map(course => course.category).filter(Boolean) || [];
    return [...new Set(categories)];
  }, [myCourses]);

  const uniqueInstructors = useMemo(() => {
    const instructors = myCourses?.map(course => course.createdBy).filter(Boolean) || [];
    return [...new Set(instructors)];
  }, [myCourses]);

  async function onCourseDelete(id) {
    if (window.confirm("Are you sure you want to delete the course ? ")) {
      const res = await dispatch(deleteCourse(id));
      if (res?.payload?.success) {
        await dispatch(getAllCourses());
      }
    }
  }

  useEffect(() => {
    (async () => {
      await dispatch(getAllCourses());
      await dispatch(getStatsData());
      await dispatch(getPaymentRecord());
    })();
  }, []);

  return (
    <Layout hideFooter={true}>
      <section className="py-5 lg:py-10 flex flex-col gap-7">
        <h1 className="text-center text-3xl text-yellow-500 font-inter font-semibold">
          Admin{" "}
          <span className="text-violet-500 font-nunito-sans">Dashboard</span>
        </h1>
        <div className="flex flex-col gap-14">
          {/* creating the records card and chart for course categories and platform growth */}
          <div className="grid lg:grid-cols-2 grid-cols-1 lg:gap-12 gap-7 m-auto lg:mx-10 mx-2">
            {/* displaying the course categories chart and data */}
            <div className="flex flex-col items-center  gap-5  lg:px-6 px-4 lg:py-8 py-7 shadow-custom  dark:bg-base-100 rounded-md">
              {/* for displaying the pie chart */}
              <div className="w-full h-60">
                <Pie
                  className="pb-3 px-2.5"
                  data={courseCategoryData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          color: 'white',
                          font: {
                            size: 12
                          }
                        }
                      }
                    }
                  }}
                />
              </div>

              {/* card for course data */}
              <div className="grid grid-cols-2 gap-5 w-full">
                {/* Total Courses */}
                <div className="flex  items-center relative h-32 justify-between p-5 gap-5 rounded-md shadow-md">
                  <div className="flex flex-col items-center mt-3 justify-center">
                    <p className="font-semibold text-gray-700 dark:text-white md:static absolute top-3 left-3">
                      Total Courses
                    </p>
                    <h3 className="md:text-4xl text-xl font-inter font-bold">
                      {totalCourses}
                    </h3>
                  </div>
                  <FaBook className="text-blue-500 text-5xl" />
                </div>

                {/* Total Lectures */}
                <div className="flex  items-center relative h-32 justify-between p-5 gap-5 rounded-md shadow-md">
                  <div className="flex flex-col items-center mt-3 justify-center">
                    <p className="font-semibold text-gray-700 dark:text-white md:static absolute top-3 left-3">
                      Total Lectures
                    </p>
                    <h3 className="md:text-4xl text-xl font-inter font-bold">
                      {totalLectures}
                    </h3>
                  </div>
                  <BsCollectionPlayFill className="text-green-500 text-5xl" />
                </div>
              </div>
            </div>

            {/* displaying the platform growth chart and data */}
            <div className="flex flex-col items-center gap-5 dark:bg-base-100 lg:px-6 px-4 lg:py-8 py-7 shadow-custom rounded-md">
              {/* for displaying the line chart */}
              <div className="h-60 relative w-full">
                <Bar
                  data={platformGrowthData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: {
                          color: 'white',
                          font: {
                            size: 12
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        ticks: {
                          color: 'white'
                        },
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)'
                        }
                      },
                      x: {
                        ticks: {
                          color: 'white'
                        },
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)'
                        }
                      }
                    }
                  }}
                />
              </div>

              {/* card for platform data */}
              <div className="grid grid-cols-2 gap-5 w-full">
                {/* Total Users */}
                <div className="flex  items-center relative h-32 justify-between p-5 gap-5 rounded-md shadow-md">
                  <div className="flex flex-col items-center mt-3 justify-center">
                    <p className="font-semibold text-gray-700 dark:text-white md:static absolute top-3 left-3">
                      Total Users
                    </p>
                    <h3 className="md:text-4xl text-xl font-inter font-bold">
                      {allUsersCount}
                    </h3>
                  </div>
                  <FaUsers className="text-purple-500 text-5xl" />
                </div>

                {/* Total Revenue */}
                <div className="flex  items-center relative h-32 justify-center p-5 gap-5 rounded-md shadow-md">
                  <div className="flex flex-col items-center mt-3 justify-center">
                    <p className="font-semibold text-gray-700 dark:text-white md:static absolute top-3 left-3">
                      Total Revenue
                    </p>
                    <h3 className="md:text-4xl text-xl font-inter font-bold">
                      EGP {totalRevenue}
                    </h3>
                  </div>
                  <GiMoneyStack className="text-green-500 text-5xl" />
                </div>
              </div>
            </div>
          </div>



          <div className=" w-[100%] self-center flex flex-col   justify-center gap-10 mb-10">
            <div className="flex w-full items-center justify-between md:px-[40px] px-3">
              <h1 className="text-center font-inter md:text-3xl text-xl text-gray-600 dark:text-slate-50 font-semibold">
                Courses overview
              </h1>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    navigate("/course/create");
                  }}
                  className="w-fit bg-yellow-500  transition-all ease-in-out duration-300 rounded py-2 px-4 font-[600] font-inter text-lg text-white cursor-pointer"
                >
                  Create new course
                </button>
                <button
                  onClick={() => {
                    navigate("/admin/blog-dashboard");
                  }}
                  className="w-fit bg-blue-500  transition-all ease-in-out duration-300 rounded py-2 px-4 font-[600] font-inter text-lg text-white cursor-pointer flex items-center gap-2"
                >
                  <FaBlog />
                  Blog Dashboard
                </button>
                <button
                  onClick={() => {
                    navigate("/admin/qa-dashboard");
                  }}
                  className="w-fit bg-purple-500  transition-all ease-in-out duration-300 rounded py-2 px-4 font-[600] font-inter text-lg text-white cursor-pointer flex items-center gap-2"
                >
                  <FaQuestionCircle />
                  Q&A Dashboard
                </button>
                <button
                  onClick={() => {
                    navigate("/admin/subject-dashboard");
                  }}
                  className="w-fit bg-green-500  transition-all ease-in-out duration-300 rounded py-2 px-4 font-[600] font-inter text-lg text-white cursor-pointer flex items-center gap-2"
                >
                  <FaBook />
                  Subject Dashboard
                </button>
              </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mx-4">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search Bar */}
                <div className="flex-1 w-full lg:w-auto">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search courses by title, description, category, or instructor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  {/* Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                  >
                    <option value="all">All Categories</option>
                    {uniqueCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>

                  {/* Instructor Filter */}
                  <select
                    value={instructorFilter}
                    onChange={(e) => setInstructorFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                  >
                    <option value="all">All Instructors</option>
                    {uniqueInstructors.map(instructor => (
                      <option key={instructor} value={instructor}>{instructor}</option>
                    ))}
                  </select>

                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                  >
                    <option value="title">Sort by Title</option>
                    <option value="category">Sort by Category</option>
                    <option value="createdBy">Sort by Instructor</option>
                    <option value="numberOfLectures">Sort by Lectures</option>
                  </select>

                  {/* Sort Order */}
                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors duration-200"
                  >
                    {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
                  </button>

                  {/* Clear Filters */}
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setCategoryFilter("all");
                      setInstructorFilter("all");
                      setSortBy("title");
                      setSortOrder("asc");
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredAndSortedCourses.length} of {myCourses?.length || 0} courses
                {(searchTerm || categoryFilter !== "all" || instructorFilter !== "all") && (
                  <span className="ml-2 text-blue-600 dark:text-blue-400">
                    (filtered)
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-6">
              {filteredAndSortedCourses?.map((course, idx) => (
                <div key={course._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Course Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <FaBook className="text-white text-2xl" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                              {course?.title}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              #{idx + 1}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                            {course?.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Course Details */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Category:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {course?.category || 'General'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Instructor:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {course?.createdBy || 'Admin'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Lectures:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {course?.numberOfLectures || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        className="group relative inline-flex items-center justify-center p-3 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 transition-all duration-200"
                        onClick={() =>
                          navigate("/course/displaylectures", {
                            state: { ...course },
                          })
                        }
                        title="View Lectures"
                      >
                        <BsCollectionPlayFill className="w-5 h-5" />
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          View Lectures
                        </span>
                      </button>
                      
                      <button
                        className="group relative inline-flex items-center justify-center p-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-200"
                        onClick={() =>
                          navigate("/course/edit", {
                            state: { ...course },
                          })
                        }
                        title="Edit Course"
                      >
                        <BsPencilSquare className="w-5 h-5" />
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          Edit Course
                        </span>
                      </button>
                      
                      <button
                        className="group relative inline-flex items-center justify-center p-3 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800 transition-all duration-200"
                        onClick={() => onCourseDelete(course?._id)}
                        title="Delete Course"
                      >
                        <BsTrash className="w-5 h-5" />
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          Delete Course
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {(!myCourses || myCourses.length === 0) && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <FaBook className="text-gray-400 text-3xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No courses found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Get started by creating your first course.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
