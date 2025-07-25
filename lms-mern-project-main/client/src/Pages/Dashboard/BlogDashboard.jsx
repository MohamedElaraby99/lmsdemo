import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllBlogsForAdmin, deleteBlog, createBlog, updateBlog } from "../../Redux/Slices/BlogSlice";
import Layout from "../../Layout/Layout";
import { FaPlus, FaEdit, FaTrash, FaEye, FaHeart, FaCalendar, FaUser, FaSearch, FaFilter } from "react-icons/fa";
import { placeholderImages } from "../../utils/placeholderImages";
import toast from "react-hot-toast";

export default function BlogDashboard() {
  const dispatch = useDispatch();
  const { blogs, loading } = useSelector((state) => state.blog);
  const { data } = useSelector((state) => state.auth);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    author: "",
    tags: "",
    status: "draft",
    image: null
  });

  useEffect(() => {
    dispatch(getAllBlogsForAdmin({ page: currentPage, category, search, status }));
  }, [currentPage, category, search, status]);



  const categories = [
    "Technology",
    "Education", 
    "Programming",
    "Design",
    "Business",
    "Other"
  ];

  const handleCreateBlog = async (e) => {
    e.preventDefault();
    try {
      const formDataObj = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData[key]) {
          console.log('Adding image to form data:', formData[key].name, formData[key].size);
          formDataObj.append('image', formData[key]);
        } else if (key === 'tags') {
          formDataObj.append(key, formData[key]);
        } else {
          formDataObj.append(key, formData[key]);
        }
      });
      
      await dispatch(createBlog(formDataObj));
      setShowCreateModal(false);
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        category: "",
        author: "",
        tags: "",
        status: "draft",
        image: null
      });
      setSelectedImage(null);
    } catch (error) {
      console.error("Error creating blog:", error);
    }
  };

  const handleEditBlog = async (e) => {
    e.preventDefault();
    try {
      const formDataObj = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData[key]) {
          formDataObj.append('image', formData[key]);
        } else if (key === 'tags') {
          formDataObj.append(key, formData[key]);
        } else {
          formDataObj.append(key, formData[key]);
        }
      });
      
      await dispatch(updateBlog({ id: selectedBlog._id, data: formDataObj }));
      setShowEditModal(false);
      setSelectedBlog(null);
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        category: "",
        author: "",
        tags: "",
        status: "draft",
        image: null
      });
      setSelectedImage(null);
    } catch (error) {
      console.error("Error updating blog:", error);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await dispatch(deleteBlog(blogId));
        toast.success("Blog deleted successfully");
      } catch (error) {
        console.error("Error deleting blog:", error);
      }
    }
  };

  const openEditModal = (blog) => {
    setSelectedBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      category: blog.category,
      author: blog.author,
      tags: blog.tags?.join(", ") || "",
      status: blog.status,
      image: null
    });
    setSelectedImage(null);
    setShowEditModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate statistics
  const totalBlogs = blogs?.length || 0;
  const publishedBlogs = blogs?.filter(blog => blog.status === 'published').length || 0;
  const draftBlogs = blogs?.filter(blog => blog.status === 'draft').length || 0;
  const totalViews = blogs?.reduce((sum, blog) => sum + (blog.views || 0), 0) || 0;
  const totalLikes = blogs?.reduce((sum, blog) => sum + (blog.likes || 0), 0) || 0;

  return (
    <Layout>
      <section className="min-h-screen py-8 px-4 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Blog Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your blog posts and content
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <FaPlus />
              Create New Blog
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Blogs</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalBlogs}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                  <FaEye className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
                  <p className="text-2xl font-bold text-green-600">{publishedBlogs}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                  <FaCalendar className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Drafts</p>
                  <p className="text-2xl font-bold text-yellow-600">{draftBlogs}</p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                  <FaEdit className="text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                  <p className="text-2xl font-bold text-purple-600">{totalViews}</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                  <FaEye className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Likes</p>
                  <p className="text-2xl font-bold text-red-600">{totalLikes}</p>
                </div>
                <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
                  <FaHeart className="text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search blogs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearch("");
                    setCategory("");
                    setStatus("");
                  }}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Blogs Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Blog
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">Loading blogs...</p>
                      </td>
                    </tr>
                  ) : blogs && blogs.length > 0 ? (
                    blogs.map((blog) => (
                      <tr key={blog._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src={(() => {
                                const imageUrl = blog.image?.secure_url?.startsWith('/uploads/') 
                                  ? `http://localhost:5000${blog.image.secure_url}` 
                                  : blog.image?.secure_url || placeholderImages.blogSmall;
                                console.log('Generated image URL:', imageUrl);
                                return imageUrl;
                              })()}
                              alt={blog.title}
                              className="h-10 w-10 rounded-lg object-cover mr-3"
                              onError={(e) => {
                                console.log('Image failed to load:', blog.image?.secure_url);
                                e.target.src = placeholderImages.blogSmall;
                              }}
                              onLoad={() => {
                                console.log('Image loaded successfully:', blog.image?.secure_url);
                              }}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {blog.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                {blog.excerpt}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {blog.author}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                            {blog.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            blog.status === 'published' 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          }`}>
                            {blog.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <FaEye className="text-gray-400" />
                              {blog.views || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaHeart className="text-red-400" />
                              {blog.likes || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(blog.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(blog)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(blog._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No blogs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create Blog Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create New Blog</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleCreateBlog} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Excerpt *
                  </label>
                  <textarea
                    required
                    value={formData.excerpt}
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Author *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.author}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="tag1, tag2, tag3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Featured Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        setFormData({...formData, image: e.target.files[0]});
                        setSelectedImage(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {selectedImage && (
                    <div className="mt-2">
                      <img 
                        src={selectedImage} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedImage(null);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Blog
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Blog Modal */}
        {showEditModal && selectedBlog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Blog</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleEditBlog} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Excerpt *
                  </label>
                  <textarea
                    required
                    value={formData.excerpt}
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Author *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.author}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="tag1, tag2, tag3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Featured Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        setFormData({...formData, image: e.target.files[0]});
                        setSelectedImage(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {selectedImage && (
                    <div className="mt-2">
                      <img 
                        src={selectedImage} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  {selectedBlog?.image?.secure_url && !selectedImage && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Image:</p>
                      <img 
                        src={selectedBlog.image.secure_url} 
                        alt="Current" 
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedImage(null);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update Blog
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
} 