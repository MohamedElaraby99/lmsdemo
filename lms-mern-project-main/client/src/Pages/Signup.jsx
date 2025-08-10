import { useState } from "react";
import { toast } from "react-hot-toast";
import { BsPersonCircle } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import { createAccount } from "../Redux/Slices/AuthSlice";
import InputBox from "../Components/InputBox/InputBox";
import CaptchaComponent from "../Components/CaptchaComponent";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserPlus, FaGraduationCap, FaCamera, FaUpload, FaPhone, FaMapMarkerAlt, FaBook } from "react-icons/fa";
import { axiosInstance } from "../Helpers/axiosInstance";
import { useEffect } from "react";
import { egyptianGovernorates } from "../utils/governorateMapping";

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [previewImage, setPreviewImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [stages, setStages] = useState([]);
  const [captchaSessionId, setCaptchaSessionId] = useState("");
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [signupData, setSignupData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    fatherPhoneNumber: "",
    governorate: "",
    stage: "",
    age: "",
    avatar: "",
    adminCode: "",
  });

  // Fetch stages on component mount
  useEffect(() => {
    const fetchStages = async () => {
      try {
        const response = await axiosInstance.get('/stages');
        if (response.data.success) {
          setStages(response.data.data.stages);
        }
      } catch (error) {
        console.error('Error fetching stages:', error);
      }
    };

    fetchStages();
  }, []);

  function handleUserInput(e) {
    const { name, value } = e.target;
    setSignupData({
      ...signupData,
      [name]: value,
    });
  }

  function getImage(event) {
    event.preventDefault();
    // getting the image
    const uploadedImage = event.target.files[0];

    if (uploadedImage) {
      setSignupData({
        ...signupData,
        avatar: uploadedImage,
      });
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadedImage);
      fileReader.addEventListener("load", function () {
        setPreviewImage(this.result);
      });
    }
  }

  // CAPTCHA handlers
  function handleCaptchaVerified(sessionId) {
    console.log('CAPTCHA verified with session ID:', sessionId);
    setCaptchaSessionId(sessionId);
    setIsCaptchaVerified(true);
  }

  function handleCaptchaError(error) {
    console.log('CAPTCHA error:', error);
    setIsCaptchaVerified(false);
    setCaptchaSessionId("");
  }

  async function createNewAccount(event) {
    event.preventDefault();
    
    // Check CAPTCHA verification first
    console.log('Form submission - CAPTCHA verified:', isCaptchaVerified);
    console.log('Form submission - CAPTCHA session ID:', captchaSessionId);
    
    if (!isCaptchaVerified) {
      toast.error("يرجى التحقق من رمز الأمان أولاً");
      return;
    }
    
    // Check if this is an admin registration
    const isAdminRegistration = signupData.adminCode === 'ADMIN123';
    
    // Basic required fields for all users
    if (!signupData.email || !signupData.password || !signupData.fullName || !signupData.username) {
      toast.error("الاسم، اسم المستخدم، البريد الإلكتروني، وكلمة المرور مطلوبة");
      return;
    }
    
    // For regular users, check all required fields
    if (!isAdminRegistration) {
      if (!signupData.phoneNumber || !signupData.fatherPhoneNumber || !signupData.governorate || !signupData.stage || !signupData.age) {
        toast.error("يرجى ملء جميع الحقول المطلوبة");
        return;
      }
    }

    // checking name field length
    if (signupData.fullName.length < 3) {
      toast.error("يجب أن يكون الاسم 3 أحرف على الأقل");
      return;
    }
    // checking username field length
    if (signupData.username.length < 3) {
      toast.error("يجب أن يكون اسم المستخدم 3 أحرف على الأقل");
      return;
    }
    // checking username format
    if (!signupData.username.match(/^[a-zA-Z0-9_]+$/)) {
      toast.error("يمكن أن يحتوي اسم المستخدم على أحرف وأرقام وشرطة سفلية فقط");
      return;
    }
    // checking valid email
    if (!signupData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
      toast.error("بريد إلكتروني غير صحيح");
      return;
    }
    // For regular users, validate additional fields
    if (!isAdminRegistration) {
      // checking valid phone numbers
      if (!signupData.phoneNumber.match(/^(\+20|0)?1[0125][0-9]{8}$/)) {
        toast.error("يرجى إدخال رقم هاتف مصري صحيح");
        return;
      }
      if (!signupData.fatherPhoneNumber.match(/^(\+20|0)?1[0125][0-9]{8}$/)) {
        toast.error("يرجى إدخال رقم هاتف الأب الصحيح");
        return;
      }
      // checking valid age
      const age = parseInt(signupData.age);
      if (isNaN(age) || age < 5 || age > 100) {
        toast.error("يرجى إدخال عمر صحيح بين 5 و 100");
        return;
      }
    }

    const formData = new FormData();
    formData.append("fullName", signupData.fullName);
    formData.append("username", signupData.username);
    formData.append("email", signupData.email);
    formData.append("password", signupData.password);
    formData.append("adminCode", signupData.adminCode);
    formData.append("captchaSessionId", captchaSessionId);
    
    // Only append additional fields for regular users
    if (!isAdminRegistration) {
      formData.append("phoneNumber", signupData.phoneNumber);
      formData.append("fatherPhoneNumber", signupData.fatherPhoneNumber);
      formData.append("governorate", signupData.governorate);
      formData.append("stage", signupData.stage);
      formData.append("age", signupData.age);
    }
    
    formData.append("avatar", signupData.avatar);

    // dispatch create account action
    const response = await dispatch(createAccount(formData));
    if (response?.payload?.success) {
      setSignupData({
        fullName: "",
        username: "",
        email: "",
        password: "",
        phoneNumber: "",
        fatherPhoneNumber: "",
        governorate: "",
        stage: "",
        age: "",
        avatar: "",
        adminCode: "",
      });
      setPreviewImage("");
      setIsCaptchaVerified(false);
      setCaptchaSessionId("");

      navigate("/");
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <FaGraduationCap className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              انضم إلى منصتنا التعليمية
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              أنشئ حسابك وابدأ رحلة التعلم
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <form onSubmit={createNewAccount} className="space-y-6">
              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="أدخل اسمك الكامل"
                    value={signupData.fullName}
                    onChange={handleUserInput}
                  />
                </div>
              </div>

              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="أدخل اسم المستخدم"
                    value={signupData.username}
                    onChange={handleUserInput}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  يمكن استخدام الأحرف والأرقام والشرطة السفلية فقط
                </p>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={signupData.email}
                    onChange={handleUserInput}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="أنشئ كلمة مرور قوية"
                    value={signupData.password}
                    onChange={handleUserInput}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Phone Number Field - Only for regular users */}
              {!signupData.adminCode && (
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    رقم الهاتف
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      required={!signupData.adminCode}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="أدخل رقم هاتفك"
                      value={signupData.phoneNumber}
                      onChange={handleUserInput}
                    />
                  </div>
                </div>
              )}

              {/* Father's Phone Number Field - Only for regular users */}
              {!signupData.adminCode && (
                <div>
                  <label htmlFor="fatherPhoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    رقم هاتف الأب
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="fatherPhoneNumber"
                      name="fatherPhoneNumber"
                      type="tel"
                      required={!signupData.adminCode}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="أدخل رقم هاتف الأب"
                      value={signupData.fatherPhoneNumber}
                      onChange={handleUserInput}
                    />
                  </div>
                </div>
              )}

              {/* Governorate Field - Only for regular users */}
              {!signupData.adminCode && (
                <div>
                  <label htmlFor="governorate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    المحافظة
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="governorate"
                      name="governorate"
                      required={!signupData.adminCode}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      value={signupData.governorate}
                      onChange={handleUserInput}
                    >
                      <option value="">اختر المحافظة</option>
                      {egyptianGovernorates.map((gov) => (
                        <option key={gov.value} value={gov.value}>
                          {gov.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Stage Field - Only for regular users */}
              {!signupData.adminCode && (
                <div>
                  <label htmlFor="stage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    المرحلة الدراسية
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaBook className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="stage"
                      name="stage"
                      required={!signupData.adminCode}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      value={signupData.stage}
                      onChange={handleUserInput}
                    >
                      <option value="">اختر المرحلة الدراسية</option>
                      {stages.map((stage) => (
                        <option key={stage._id} value={stage._id}>
                          {stage.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Age Field - Only for regular users */}
              {!signupData.adminCode && (
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    العمر
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      min="5"
                      max="100"
                      required={!signupData.adminCode}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="أدخل عمرك"
                      value={signupData.age}
                      onChange={handleUserInput}
                    />
                  </div>
                </div>
              )}

              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  صورة الملف الشخصي <span className="text-gray-500 text-xs">(اختياري)</span>
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600 overflow-hidden">
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BsPersonCircle className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    {previewImage && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <FaCamera className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label htmlFor="image_uploads" className="cursor-pointer">
                      <div className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-400 dark:hover:border-purple-400 transition-colors duration-200">
                        <FaUpload className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {previewImage ? "تغيير الصورة" : "رفع صورة"}
                        </span>
                      </div>
                    </label>
                    <input
                      id="image_uploads"
                      onChange={getImage}
                      type="file"
                      accept=".jpg, .jpeg, .png, image/*"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* CAPTCHA Component */}
              <CaptchaComponent
                onVerified={handleCaptchaVerified}
                onError={handleCaptchaError}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !isCaptchaVerified}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <FaUserPlus className="h-5 w-5 text-purple-200 group-hover:text-purple-100" />
                </span>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    جاري إنشاء الحساب...
                  </div>
                ) : (
                  "إنشاء الحساب"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    لديك حساب بالفعل؟
                  </span>
                </div>
              </div>
            </div>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors duration-200"
              >
                تسجيل الدخول إلى حسابك
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              بإنشاء حساب، فإنك توافق على{" "}
              <Link to="/terms" className="text-purple-600 dark:text-purple-400 hover:underline">
                شروط الخدمة
              </Link>{" "}
              و{" "}
              <Link to="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">
                سياسة الخصوصية
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
