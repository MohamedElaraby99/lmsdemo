import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaBook, 
  FaPlay, 
  FaGripVertical,
  FaChevronDown,
  FaChevronRight,
  FaFolder,
  FaFileAlt,
  FaArrowLeft,
  FaArrowRight,
  FaGraduationCap,
  FaTag,
  FaUser,
  FaImage,
  FaSave,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaInfo,
  FaVideo,
  FaClock,
  FaCalendarAlt,
  FaStar,
  FaUsers,
  FaExclamationTriangle,
  FaUpload
} from "react-icons/fa";
import Layout from "../../Layout/Layout";
import InputBox from "../../Components/InputBox/InputBox";
import TextArea from "../../Components/InputBox/TextArea";
import { axiosInstance } from "../../Helpers/axiosInstance";

export default function CreateCourse() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useSelector((state) => state.auth);

  // Get course data from location state or initialize empty
  const initialCourseData = location.state?.courseData || {
    title: "",
    description: "",
    category: "",
    subject: "",
    stage: "",
    createdBy: user?.fullName || "Admin",
    thumbnail: null,
    previewImage: "",
    price: 0,
    currency: "EGP",
    isPaid: false,
    structureType: "unified",
    units: [],
    directLessons: [],
    unifiedStructure: []
  };

  const [courseData, setCourseData] = useState(initialCourseData);
  const [subjects, setSubjects] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Update courseData when location state changes (coming back from structure page)
  useEffect(() => {
    if (location.state?.courseData) {
      console.log('Received course data from structure page:', location.state.courseData);
      setCourseData(location.state.courseData);
    }
  }, [location.state]);

  // Debug course data changes
  useEffect(() => {
    console.log('Course data updated:', courseData);
    console.log('Units count:', courseData.units?.length || 0);
    console.log('Direct lessons count:', courseData.directLessons?.length || 0);
  }, [courseData]);

  // Fetch subjects and stages on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch subjects
        const subjectsResponse = await axiosInstance.get('/subjects');
        if (subjectsResponse.data.success) {
          setSubjects(subjectsResponse.data.subjects);
        }

        // Fetch stages
        const stagesResponse = await axiosInstance.get('/stages');
        if (stagesResponse.data.success) {
          setStages(stagesResponse.data.data.stages);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Course Info Handlers
  const handleCourseInput = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  function handleImageUpload(e) {
    e.preventDefault();
    const uploadImage = e.target.files[0];
    if (uploadImage) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadImage);
      fileReader.addEventListener("load", function () {
        setCourseData(prev => ({
          ...prev,
          previewImage: this.result,
          thumbnail: uploadImage,
        }));
      });
    }
  }

  const goToStructurePage = () => {
    // Navigate to separate structure page
    navigate('/course/structure', { 
      state: { 
        courseData: courseData,
        fromCreate: true 
      } 
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading course creation...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
                  <FaGraduationCap className="text-white text-2xl" />
                </div>
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 mb-4">
                إنشاء دورة جديدة
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                أنشئ دورة رائعة لطلابك مع عملية الإنشاء خطوة بخطوة.
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  true 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  <span className="font-semibold">1</span>
                </div>
                <div className={`w-16 h-1 ${
                  true ? 'bg-blue-500' : 'bg-gray-300'
                }`}></div>
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  true 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  <span className="font-semibold">2</span>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 font-medium"
              >
                <FaArrowLeft className="text-sm" />
                العودة إلى لوحة التحكم
              </button>
            </div>

            {/* Stage 1: Basic Course Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 lg:p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    المعلومات الأساسية للدورة
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    دعنا نبدأ بالتفاصيل الأساسية لدورتك
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FaBook className="text-blue-500" />
                        تفاصيل الدورة
                      </h3>
                      
                      <div className="space-y-4">
                        <InputBox
                          label="عنوان الدورة *"
                          name="title"
                          type="text"
                          placeholder="أدخل عنوان الدورة"
                          onChange={handleCourseInput}
                          value={courseData.title}
                          required
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            وصف الدورة *
                          </label>
                          <TextArea
                            name="description"
                            rows={4}
                            placeholder="أدخل وصف مفصل للدورة..."
                            onChange={handleCourseInput}
                            value={courseData.description}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FaUser className="text-green-500" />
                        معلومات المدرس
                      </h3>
                      
                      <InputBox
                        label="اسم المدرس"
                        name="createdBy"
                        type="text"
                        placeholder="أدخل اسم المدرس"
                        onChange={handleCourseInput}
                        value={courseData.createdBy}
                      />
                    </div>
                  </div>

                  {/* Right Column - Subject & Stage */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FaTag className="text-purple-500" />
                        المادة والمرحلة
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            المادة *
                          </label>
                          <select
                            name="subject"
                            value={courseData.subject}
                            onChange={handleCourseInput}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          >
                            <option value="">اختر مادة</option>
                            {subjects.map((subject) => (
                              <option key={subject._id} value={subject._id}>
                                {subject.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            المرحلة *
                          </label>
                          <select
                            name="stage"
                            value={courseData.stage}
                            onChange={handleCourseInput}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          >
                            <option value="">اختر مرحلة</option>
                            {stages.map((stage) => (
                              <option key={stage._id} value={stage._id}>
                                {stage.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FaImage className="text-orange-500" />
                        صورة مصغرة للدورة
                      </h3>
                      
                      <div className="relative">
                        <label htmlFor="image_uploads" className="cursor-pointer block">
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 hover:border-blue-400 dark:hover:border-blue-400 transition-colors duration-200">
                            {courseData.previewImage ? (
                              <div className="relative">
                                <img
                                  className="w-full h-48 object-cover rounded-lg"
                                  src={courseData.previewImage}
                                  alt="Course thumbnail"
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
                                  انقر لرفع الصورة المصغرة
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                  JPG, PNG up to 5MB
                                </p>
                              </div>
                            )}
                          </div>
                        </label>
                        
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

                {/* Form Validation */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                    <FaCheck className="text-blue-500" />
                    الحقول المطلوبة
                  </h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li className="flex items-center gap-2">
                      {courseData.title ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      عنوان الدورة
                    </li>
                    <li className="flex items-center gap-2">
                      {courseData.description ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      وصف الدورة
                    </li>
                    <li className="flex items-center gap-2">
                      {courseData.subject ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      المادة
                    </li>
                    <li className="flex items-center gap-2">
                      {courseData.stage ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                      المرحلة
                    </li>
                  </ul>
                </div>

                {/* Navigation Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-end">
                    <button
                      onClick={goToStructurePage}
                      disabled={!courseData.title || !courseData.description || !courseData.subject || !courseData.stage}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-8 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                      <FaArrowRight />
                      التالي - إضافة هيكل الدورة
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
