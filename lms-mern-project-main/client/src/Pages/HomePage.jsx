import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../Layout/Layout";
import heroPng from "../assets/images/hero.png";
import { getAllBlogs } from "../Redux/Slices/BlogSlice";
import { FaEye, FaHeart, FaCalendar, FaUser, FaArrowRight } from "react-icons/fa";
import { placeholderImages } from "../utils/placeholderImages";

export default function HomePage() {
  const dispatch = useDispatch();
  const { blogs } = useSelector((state) => state.blog);

  useEffect(() => {
    // Fetch latest blogs for homepage
    dispatch(getAllBlogs({ page: 1, limit: 3 }));
  }, [dispatch]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="md:py-10 py-7 mb-10 text-white flex md:flex-row flex-col-reverse items-center justify-center md:gap-10 gap-7 md:px-16 px-6 min-h-[85vh]">
        <div className="md:w-1/2 w-full space-y-7">
          <h1 className="md:text-5xl text-6xl font-semibold text-gray-900 dark:text-gray-200">
            Find out best
            <span className="text-yellow-500 font-bold font-open-sans">Online Courses</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-300 font-inter">
            We have a large library of courses taught by highly skilled and
            qualified faculties at a very affordable cost.
          </p>

          <div className="space-x-6 flex">
            <Link to="/courses">
              <button className="bg-yellow-500 font-inter font-[400] text-slate-100 dark:text-gray-950 md:px-5 px-3 md:py-3 py-3 rounded-md  md:text-lg text-base cursor-pointer transition-all ease-in-out duration-300">
                Explore courses
              </button>
            </Link>

            <Link to="/contact">
              <button className="border border-yellow-500 text-gray-700 dark:text-white px-5 py-3 rounded-md font-semibold md:text-lg text-base cursor-pointer  transition-all ease-in-out duration-300">
                Contact Us
              </button>
            </Link>
          </div>
        </div>

        <div className="md:w-1/2 w-1/7 flex items-center justify-center">
          <img alt="homepage image" src={heroPng} />
        </div>
      </section>

      {/* Latest Blogs Section */}
      <section className="py-16 px-4 lg:px-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Latest from Our Blog
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Discover insights, tips, and stories from our learning community
            </p>
          </div>

          {blogs && blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.slice(0, 3).map((blog) => (
                <div key={blog._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={blog.image?.secure_url || placeholderImages.blog}
                      alt={blog.title}
                      className="w-full h-full object-cover"
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
                    
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 line-clamp-2">
                      {blog.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FaEye />
                          {blog.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaHeart />
                          {blog.likes}
                        </span>
                      </div>
                      <Link
                        to={`/blog/${blog._id}`}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Read More
                        <FaArrowRight />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300">No blogs available yet.</p>
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/blogs"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              View All Blogs
            </Link>
          </div>
        </div>
      </section>

      {/* Q&A Section */}
      <section className="py-16 px-4 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Find answers to common questions about our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                How do I get started?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Simply create an account, browse our course catalog, and enroll in courses that interest you. You can start learning immediately after enrollment.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We accept all major credit cards, debit cards, and digital wallets. All payments are processed securely through our payment partners.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Can I access courses offline?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Currently, our courses are available online only. However, you can download course materials for offline reference.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Do you offer certificates?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes! Upon completion of a course, you'll receive a certificate that you can download and share on your professional profiles.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              to="/contact"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Ask a Question
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
