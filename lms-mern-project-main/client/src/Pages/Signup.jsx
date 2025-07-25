import { useState } from "react";
import { toast } from "react-hot-toast";
import { BsPersonCircle } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import { createAccount } from "../Redux/Slices/AuthSlice";
import InputBox from "../Components/InputBox/InputBox";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserPlus, FaGraduationCap, FaCamera, FaUpload, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [previewImage, setPreviewImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signupData, setSignupData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    fatherPhoneNumber: "",
    governorate: "",
    grade: "",
    age: "",
    avatar: "",
    adminCode: "",
  });

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

  async function createNewAccount(event) {
    event.preventDefault();
    
    // Check if this is an admin registration
    const isAdminRegistration = signupData.adminCode === 'ADMIN123';
    
    // Basic required fields for all users
    if (!signupData.email || !signupData.password || !signupData.fullName || !signupData.username) {
      toast.error("Name, username, email, and password are required");
      return;
    }
    
    // For regular users, check all required fields
    if (!isAdminRegistration) {
      if (!signupData.phoneNumber || !signupData.fatherPhoneNumber || !signupData.governorate || !signupData.grade || !signupData.age) {
        toast.error("Please fill all the required fields");
        return;
      }
    }

    // checking name field length
    if (signupData.fullName.length < 3) {
      toast.error("Name should be at least 3 characters");
      return;
    }
    // checking username field length
    if (signupData.username.length < 3) {
      toast.error("Username should be at least 3 characters");
      return;
    }
    // checking username format
    if (!signupData.username.match(/^[a-zA-Z0-9_]+$/)) {
      toast.error("Username can only contain letters, numbers, and underscores");
      return;
    }
    // checking valid email
    if (!signupData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
      toast.error("Invalid email id");
      return;
    }
    // For regular users, validate additional fields
    if (!isAdminRegistration) {
      // checking valid phone numbers
      if (!signupData.phoneNumber.match(/^(\+20|0)?1[0125][0-9]{8}$/)) {
        toast.error("Please enter a valid Egyptian phone number");
        return;
      }
      if (!signupData.fatherPhoneNumber.match(/^(\+20|0)?1[0125][0-9]{8}$/)) {
        toast.error("Please enter a valid father's phone number");
        return;
      }
      // checking valid age
      const age = parseInt(signupData.age);
      if (isNaN(age) || age < 5 || age > 100) {
        toast.error("Please enter a valid age between 5 and 100");
        return;
      }
    }

    const formData = new FormData();
    formData.append("fullName", signupData.fullName);
    formData.append("username", signupData.username);
    formData.append("email", signupData.email);
    formData.append("password", signupData.password);
    formData.append("adminCode", signupData.adminCode);
    
    // Only append additional fields for regular users
    if (!isAdminRegistration) {
      formData.append("phoneNumber", signupData.phoneNumber);
      formData.append("fatherPhoneNumber", signupData.fatherPhoneNumber);
      formData.append("governorate", signupData.governorate);
      formData.append("grade", signupData.grade);
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
        grade: "",
        age: "",
        avatar: "",
        adminCode: "",
      });
      setPreviewImage("");

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
              Join Fikra Software
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Create your account and start your learning journey
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <form onSubmit={createNewAccount} className="space-y-6">
              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
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
                    placeholder="Enter your full name"
                    value={signupData.fullName}
                    onChange={handleUserInput}
                  />
                </div>
              </div>

              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
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
                    placeholder="Enter your username"
                    value={signupData.username}
                    onChange={handleUserInput}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Only letters, numbers, and underscores allowed
                </p>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
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
                    placeholder="Enter your email"
                    value={signupData.email}
                    onChange={handleUserInput}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
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
                    placeholder="Create a strong password"
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

              {/* Admin Code Field (Optional) */}
              <div>
                <label htmlFor="adminCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Code (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUserPlus className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="adminCode"
                    name="adminCode"
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter admin code to create admin account"
                    value={signupData.adminCode}
                    onChange={handleUserInput}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Leave empty for regular user account
                </p>
              </div>

              {/* Phone Number Field */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your phone number"
                    value={signupData.phoneNumber}
                    onChange={handleUserInput}
                  />
                </div>
              </div>

              {/* Father's Phone Number Field */}
              <div>
                <label htmlFor="fatherPhoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Father's Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="fatherPhoneNumber"
                    name="fatherPhoneNumber"
                    type="tel"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter father's phone number"
                    value={signupData.fatherPhoneNumber}
                    onChange={handleUserInput}
                  />
                </div>
              </div>

              {/* Governorate Field */}
              <div>
                <label htmlFor="governorate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Governorate
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="governorate"
                    name="governorate"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    value={signupData.governorate}
                    onChange={handleUserInput}
                  >
                    <option value="">Select Governorate</option>
                    <option value="Cairo">Cairo</option>
                    <option value="Giza">Giza</option>
                    <option value="Alexandria">Alexandria</option>
                    <option value="Dakahlia">Dakahlia</option>
                    <option value="Red Sea">Red Sea</option>
                    <option value="Beheira">Beheira</option>
                    <option value="Fayoum">Fayoum</option>
                    <option value="Gharbiya">Gharbiya</option>
                    <option value="Ismailia">Ismailia</option>
                    <option value="Menofia">Menofia</option>
                    <option value="Minya">Minya</option>
                    <option value="Qaliubiya">Qaliubiya</option>
                    <option value="New Valley">New Valley</option>
                    <option value="Suez">Suez</option>
                    <option value="Aswan">Aswan</option>
                    <option value="Assiut">Assiut</option>
                    <option value="Beni Suef">Beni Suef</option>
                    <option value="Port Said">Port Said</option>
                    <option value="Damietta">Damietta</option>
                    <option value="Sharkia">Sharkia</option>
                    <option value="South Sinai">South Sinai</option>
                    <option value="Kafr Al sheikh">Kafr Al sheikh</option>
                    <option value="Matrouh">Matrouh</option>
                    <option value="Luxor">Luxor</option>
                    <option value="Qena">Qena</option>
                    <option value="North Sinai">North Sinai</option>
                    <option value="Sohag">Sohag</option>
                  </select>
                </div>
              </div>

              {/* Grade Field */}
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Grade
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaGraduationCap className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="grade"
                    name="grade"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    value={signupData.grade}
                    onChange={handleUserInput}
                  >
                    <option value="">Select Grade</option>
                    <option value="1 ابتدائي">1 ابتدائي</option>
                    <option value="2 ابتدائي">2 ابتدائي</option>
                    <option value="3 ابتدائي">3 ابتدائي</option>
                    <option value="4 ابتدائي">4 ابتدائي</option>
                    <option value="5 ابتدائي">5 ابتدائي</option>
                    <option value="6 ابتدائي">6 ابتدائي</option>
                    <option value="1 إعدادي">1 إعدادي</option>
                    <option value="2 إعدادي">2 إعدادي</option>
                    <option value="3 إعدادي">3 إعدادي</option>
                    <option value="1 ثانوي">1 ثانوي</option>
                    <option value="2 ثانوي">2 ثانوي</option>
                    <option value="3 ثانوي">3 ثانوي</option>
                    <option value="1 جامعة">1 جامعة</option>
                    <option value="2 جامعة">2 جامعة</option>
                    <option value="3 جامعة">3 جامعة</option>
                    <option value="4 جامعة">4 جامعة</option>
                  </select>
                </div>
              </div>

              {/* Age Field */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age
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
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your age"
                    value={signupData.age}
                    onChange={handleUserInput}
                  />
                </div>
              </div>

              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile Picture <span className="text-gray-500 text-xs">(Optional)</span>
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
                          {previewImage ? "Change Photo" : "Upload Photo"}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <FaUserPlus className="h-5 w-5 text-purple-200 group-hover:text-purple-100" />
                </span>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
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
                    Already have an account?
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
                Sign in to your account
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-purple-600 dark:text-purple-400 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
