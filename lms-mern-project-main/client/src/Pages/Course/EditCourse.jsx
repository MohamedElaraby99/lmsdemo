import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { updateCourse } from "../../Redux/Slices/CourseSlice";
import Layout from "../../Layout/Layout";
import toast from "react-hot-toast";
import InputBox from "../../Components/InputBox/InputBox";
import TextArea from "../../Components/InputBox/TextArea";
import { 
  FaEdit, 
  FaBook, 
  FaUser, 
  FaTag, 
  FaImage, 
  FaSave, 
  FaArrowLeft, 
  FaUpload, 
  FaEye,
  FaTrash,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaGraduationCap,
  FaUsers,
  FaStar,
  FaInfo
} from "react-icons/fa";
import { axiosInstance } from "../../Helpers/axiosInstance";

export default function EditCourse() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const courseData = location.state;

  const [isUpdatingCourse, setIsUpdatingCourse] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInput, setUserInput] = useState({
    title: courseData?.title || "",
    category: courseData?.category || "",
    subject: courseData?.subject || "",
    stage: courseData?.stage || "General",
    createdBy: courseData?.createdBy || "",
    description: courseData?.description || "",
    thumbnail: null,
    previewImage: courseData?.thumbnail?.secure_url || "",
  });

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axiosInstance.get('/subjects');
        if (response.data.success) {
          setSubjects(response.data.subjects);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
        toast.error('Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!courseData) {
      toast.error("No course data found");
      navigate("/admin/dashboard");
    }
  }, [courseData, navigate]);

  function handleImageUpload(e) {
    e.preventDefault();
    const uploadImage = e.target.files[0];
    if (uploadImage) {
      // Validate file size (max 5MB)
      if (uploadImage.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!uploadImage.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }

      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadImage);
      fileReader.addEventListener("load", function () {
        setUserInput({
          ...userInput,
          previewImage: this.result,
          thumbnail: uploadImage,
        });
        toast.success("Image uploaded successfully!");
      });
    }
  }

  function handleUserInput(e) {
    const { name, value } = e.target;
    setUserInput({
      ...userInput,
      [name]: value,
    });
  }

  function removeImage() {
    setUserInput({
      ...userInput,
      previewImage: "",
      thumbnail: null,
    });
    toast.success("Image removed");
  }

  async function onFormSubmit(e) {
    e.preventDefault();

    if (!userInput.title || !userInput.description || !userInput.subject || !userInput.stage) {
      toast.error("Title, description, subject, and stage are mandatory!");
      return;
    }

    setIsUpdatingCourse(true);
    const formData = new FormData();
    formData.append("title", userInput.title);
    formData.append("description", userInput.description);
    formData.append("category", userInput.category);
    formData.append("subject", userInput.subject);
    formData.append("stage", userInput.stage);
    formData.append("createdBy", userInput.createdBy);
    
    // Only append thumbnail if a new one is selected
    if (userInput.thumbnail) {
      formData.append("thumbnail", userInput.thumbnail);
    }

    try {
      const response = await dispatch(updateCourse({ id: courseData._id, formData }));
      if (response?.payload?.success) {
        toast.success("Course updated successfully!");
        navigate("/admin/dashboard");
      }
    } catch (error) {
      toast.error("Failed to update course");
    }
    setIsUpdatingCourse(false);
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading course editor...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!courseData) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <section className="relative py-8 lg:py-12 px-4 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-16 h-16 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute top-40 right-20 w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 animate-pulse"></div>
          
          <div className="relative z-10 container mx-auto max-w-6xl">
            {/* Header */}
            <div className="text-center mb-8 lg:mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                  <FaEdit className="text-white text-2xl" />
                </div>
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 mb-4">
                Edit Course
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Update your course information and make it even better for your students.
              </p>
            </div>

            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 font-medium"
              >
                <FaArrowLeft className="text-sm" />
                Back to Dashboard
              </button>
            </div>

            {/* Main Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <form onSubmit={onFormSubmit} autoComplete="off" noValidate className="p-6 lg:p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FaBook className="text-blue-500" />
                        Course Details
                      </h3>
                      
                      <div className="space-y-4">
                        <InputBox
                          label={"Course Title *"}
                          name={"title"}
                          type={"text"}
                          placeholder={"Enter course title"}
                          onChange={handleUserInput}
                          value={userInput.title}
                          required
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Course Description *
                          </label>
                          <TextArea
                            name={"description"}
                            rows={4}
                            placeholder={"Enter detailed course description..."}
                            onChange={handleUserInput}
                            value={userInput.description}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                          />
                        </div>

                        <InputBox
                          label={"Category"}
                          name={"category"}
                          type={"text"}
                          placeholder={"Enter course category"}
                          onChange={handleUserInput}
                          value={userInput.category}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FaUser className="text-green-500" />
                        Instructor Information
                      </h3>
                      
                      <InputBox
                        label={"Instructor Name"}
                        name={"createdBy"}
                        type={"text"}
                        placeholder={"Enter instructor name"}
                        onChange={handleUserInput}
                        value={userInput.createdBy}
                      />
                    </div>
                  </div>

                  {/* Right Column - Subject, Stage & Image */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FaTag className="text-purple-500" />
                        Subject & Stage
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Subject *
                          </label>
                          <select
                            name="subject"
                            value={userInput.subject}
                            onChange={handleUserInput}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          >
                            <option value="">Select a subject</option>
                            {subjects.map((subject) => (
                              <option key={subject._id} value={subject._id}>
                                {subject.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Stage *
                          </label>
                          <select
                            name="stage"
                            value={userInput.stage}
                            onChange={handleUserInput}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          >
                            <option value="General">General</option>
                            <option value="Primary">Primary</option>
                            <option value="Secondary">Secondary</option>
                            <option value="High School">High School</option>
                            <option value="University">University</option>
                            <option value="Professional">Professional</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FaImage className="text-orange-500" />
                        Course Thumbnail
                      </h3>
                      
                      {/* Image Upload Area */}
                      <div className="relative">
                        <label htmlFor="image_uploads" className="cursor-pointer block">
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 hover:border-blue-400 dark:hover:border-blue-400 transition-colors duration-200">
                            {userInput.previewImage ? (
                              <div className="relative">
                                <img
                                  className="w-full h-48 lg:h-56 object-cover rounded-lg"
                                  src={userInput.previewImage}
                                  alt="course thumbnail"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                  <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                                    <FaUpload className="text-white text-2xl" />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <FaImage className="text-gray-400 text-4xl mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400 font-medium">
                                  Click to upload thumbnail
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                  JPG, PNG up to 5MB
                                </p>
                              </div>
                            )}
                          </div>
                        </label>
                        
                        {/* Image Actions */}
                        {userInput.previewImage && (
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              type="button"
                              onClick={() => document.getElementById('image_uploads').click()}
                              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm"
                            >
                              <FaEdit className="text-xs" />
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={removeImage}
                              className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm"
                            >
                              <FaTrash className="text-xs" />
                              Remove
                            </button>
                          </div>
                        )}
                        
                        <input
                          className="hidden"
                          type="file"
                          id="image_uploads"
                          accept=".jpg, .jpeg, .png"
                          name="thumbnail"
                          onChange={handleImageUpload}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Information Summary */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                    <FaInfo className="text-blue-500" />
                    Course Information Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FaBook className="text-blue-500" />
                      <span className="text-gray-700 dark:text-gray-300">Title:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{userInput.title || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaTag className="text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">Subject:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {subjects.find(s => s._id === userInput.subject)?.title || 'Not selected'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-purple-500" />
                      <span className="text-gray-700 dark:text-gray-300">Stage:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{userInput.stage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUser className="text-orange-500" />
                      <span className="text-gray-700 dark:text-gray-300">Instructor:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{userInput.createdBy || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-500" />
                      <span className="text-gray-700 dark:text-gray-300">Category:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{userInput.category || 'General'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaGraduationCap className="text-red-500" />
                      <span className="text-gray-700 dark:text-gray-300">Status:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">Active</span>
                    </div>
                  </div>
                </div>

                {/* Form Validation */}
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                    <FaCheck className="text-blue-500" />
                    Required Fields
                  </h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li className="flex items-center gap-2">
                      {userInput.title ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      Course Title
                    </li>
                    <li className="flex items-center gap-2">
                      {userInput.description ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      Course Description
                    </li>
                    <li className="flex items-center gap-2">
                      {userInput.subject ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      Subject
                    </li>
                    <li className="flex items-center gap-2">
                      {userInput.stage ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      Stage
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={isUpdatingCourse || !userInput.title || !userInput.description || !userInput.subject || !userInput.stage}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {isUpdatingCourse ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Updating Course...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Update Course
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
} 