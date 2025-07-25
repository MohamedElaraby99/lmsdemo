import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserData, updateUserData } from "../../Redux/Slices/AuthSlice";
import InputBox from "../../Components/InputBox/InputBox";
import { FaUserCircle, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaCalendarAlt, FaEnvelope, FaUser, FaIdCard, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { IoIosLock, IoIosRefresh } from "react-icons/io";
import { FiMoreVertical } from "react-icons/fi";
import Layout from "../../Layout/Layout";
import { useNavigate } from "react-router-dom";


export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.data);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userInput, setUserInput] = useState({
    name: userData?.fullName || "",
    phoneNumber: userData?.phoneNumber || "",
    fatherPhoneNumber: userData?.fatherPhoneNumber || "",
    governorate: userData?.governorate || "",
    grade: userData?.grade || "",
    age: userData?.age || "",
    avatar: null,
    previewImage: null,
    userId: null,
  });
  const avatarInputRef = useRef(null);
  const [isChanged, setIschanged] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function handleImageUpload(e) {
    e.preventDefault();
    const uploadImage = e.target.files[0];
    if (uploadImage) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadImage);
      fileReader.addEventListener("load", function () {
        setUserInput({
          ...userInput,
          previewImage: this.result,
          avatar: uploadImage,
        });
      });
    }
  }

  async function onFormSubmit(e) {
    setIsUpdating(true);
    e.preventDefault();

    const formData = new FormData();
    formData.append("fullName", userInput.name);
    formData.append("phoneNumber", userInput.phoneNumber);
    formData.append("fatherPhoneNumber", userInput.fatherPhoneNumber);
    formData.append("governorate", userInput.governorate);
    formData.append("grade", userInput.grade);
    formData.append("age", userInput.age);
    if (userInput.avatar) {
      formData.append("avatar", userInput.avatar);
    }
    const data = { formData, id: userInput.userId };
    const response = await dispatch(updateUserData(data));
    if (response?.payload?.success) {
      await dispatch(getUserData());
      setIschanged(false);
      setIsEditing(false); // Exit edit mode after successful save
    }
    setIsUpdating(false);
  }

  async function handleCancelSubscription() {
    const res = await dispatch(cancelCourseBundle());
    if (res?.payload?.success) {
      await dispatch(getUserData());
    }
  }

  function handleEditClick() {
    setIsEditing(true);
    // Reset form to current user data
    setUserInput({
      name: userData?.fullName || "",
      phoneNumber: userData?.phoneNumber || "",
      fatherPhoneNumber: userData?.fatherPhoneNumber || "",
      governorate: userData?.governorate || "",
      grade: userData?.grade || "",
      age: userData?.age || "",
      avatar: null,
      previewImage: null,
      userId: userData?._id,
    });
    console.log('Edit mode - userInput set to:', {
      name: userData?.fullName || "",
      phoneNumber: userData?.phoneNumber || "",
      fatherPhoneNumber: userData?.fatherPhoneNumber || "",
      governorate: userData?.governorate || "",
      grade: userData?.grade || "",
      age: userData?.age || "",
    });
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setIschanged(false);
    // Reset to original values
    setUserInput({
      name: userData?.fullName || "",
      phoneNumber: userData?.phoneNumber || "",
      fatherPhoneNumber: userData?.fatherPhoneNumber || "",
      governorate: userData?.governorate || "",
      grade: userData?.grade || "",
      age: userData?.age || "",
      avatar: null,
      previewImage: null,
      userId: userData?._id,
    });
  }

  useEffect(() => {
    if (isEditing) {
      setIschanged(
        userInput.name !== userData?.fullName || 
        userInput.phoneNumber !== userData?.phoneNumber ||
        userInput.fatherPhoneNumber !== userData?.fatherPhoneNumber ||
        userInput.governorate !== userData?.governorate ||
        userInput.grade !== userData?.grade ||
        userInput.age !== userData?.age ||
        userInput.avatar
      );
    } else {
      setIschanged(false);
    }
  }, [userInput, userData, isEditing]);

  useEffect(() => {
    async function fetchUser() {
      console.log('Fetching user data...');
      const result = await dispatch(getUserData());
      console.log('User data fetch result:', result);
    }
    if (Object.keys(userData).length < 1) fetchUser();
  }, []);

  // Debug: Log user data to see what's being received
  useEffect(() => {
    console.log('Current userData:', userData);
    console.log('Grade from userData:', userData?.grade);
    console.log('Grade from userInput:', userInput.grade);
  }, [userData, userInput.grade]);

  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      setUserInput({
        ...userInput,
        name: userData?.fullName || "",
        phoneNumber: userData?.phoneNumber || "",
        fatherPhoneNumber: userData?.fatherPhoneNumber || "",
        governorate: userData?.governorate || "",
        grade: userData?.grade || "",
        age: userData?.age || "",
        userId: userData?._id,
      });
    }
  }, [userData]);

  return (
    <Layout hideFooter={true}>
      <section className="flex flex-col gap-6 items-center py-8 px-3 min-h-[100vh]">
        <form
          autoComplete="off"
          noValidate
          onSubmit={onFormSubmit}
          className="flex flex-col dark:bg-base-100 relative gap-7 rounded-lg md:py-10 py-7 md:px-7 px-3 md:w-[750px] w-full shadow-custom dark:shadow-xl  "
        >
          <div className="flex justify-center items-center">
            <h1 className="text-center absolute left-6 md:top-auto top-5 text-violet-500 dark:text-purple-500 md:text-4xl text-3xl font-bold font-inter after:content-[' ']  after:absolute after:-bottom-3.5 after:left-0 after:h-1.5 after:w-[60%] after:rounded-full after:bg-yellow-400 dark:after:bg-yellow-600">
              Profile
            </h1>
            {/* avatar */}
            <div
              className="w-16 h-16 rounded-full overflow-hidden self-center cursor-pointer"
              onClick={() => avatarInputRef.current.click()}
            >
              {userData?.avatar?.secure_url || userInput.previewImage ? (
                <img
                  src={
                    userInput.previewImage
                      ? userInput.previewImage
                      : userData?.avatar?.secure_url
                  }
                  alt="avatar"
                  className="h-full w-full"
                />
              ) : (
                <FaUserCircle className="h-full w-full" />
              )}
              <input
                type="file"
                accept=".png, .jpeg, .jpg"
                className="hidden"
                ref={avatarInputRef}
                onChange={handleImageUpload}
              />
            </div>
            {/* more options */}
            <div className="absolute right-3 top-3">
              <button
                type="button"
                className="absolute right-0 text-gray-500 dark:text-slate-50 font-inter font-[600]"
                onClick={() => setIsDialogOpen((prev) => !prev)}
              >
                <FiMoreVertical size={20} />
              </button>

              <dialog
                open={isDialogOpen}
                className="bg-white dark:bg-base-300 transition-all duration-500 border-[1px] border-gray-200 dark:border-gray-500 rounded-s-xl rounded-ee-xl py-5 shadow-lg w-fit relative right-0 top-7"
              >
                <div className="w-full flex flex-col gap-2 items-start">
                  <button
                    className="text-gray-700 w-full flex items-center gap-2 dark:text-white px-3 pb-2 border-b-[1px] border-gray-300"
                    onClick={() => navigate("change-password")}
                  >
                    <IoIosLock /> Change password
                  </button>
                  <button
                    className="text-[#ff1414] dark:text-red-300 px-3 w-full flex items-center gap-2"
                    onClick={() => navigate("reset-password")}
                  >
                    <IoIosRefresh /> Reset password
                  </button>
                </div>
              </dialog>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="w-full space-y-6">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Personal Information
              </h2>
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <FaEdit size={14} />
                  Edit Profile
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FaUser className="text-blue-500" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={isEditing ? userInput.name : (userData?.fullName || "")}
                  onChange={(e) => setUserInput({ ...userInput, name: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FaEnvelope className="text-green-500" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={userData?.email || ""}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FaPhone className="text-green-500" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={isEditing ? userInput.phoneNumber : (userData?.phoneNumber || "")}
                  onChange={(e) => setUserInput({ ...userInput, phoneNumber: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Father's Phone Number */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FaPhone className="text-purple-500" />
                  Father's Phone Number
                </label>
                <input
                  type="tel"
                  value={isEditing ? userInput.fatherPhoneNumber : (userData?.fatherPhoneNumber || "")}
                  onChange={(e) => setUserInput({ ...userInput, fatherPhoneNumber: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                  placeholder="Enter father's phone number"
                />
              </div>

              {/* Age */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FaCalendarAlt className="text-orange-500" />
                  Age
                </label>
                <input
                  type="number"
                  value={isEditing ? userInput.age : (userData?.age || "")}
                  onChange={(e) => setUserInput({ ...userInput, age: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                  placeholder="Enter your age"
                  min="5"
                  max="100"
                />
              </div>

              {/* Grade */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FaGraduationCap className="text-indigo-500" />
                  Grade
                </label>
                
                <select
                  value={isEditing ? userInput.grade : (userData?.grade || "")}
                  onChange={(e) => setUserInput({ ...userInput, grade: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <option value="">Select Grade</option>
                  <option value="Primary 1">Primary 1</option>
                  <option value="Primary 2">Primary 2</option>
                  <option value="Primary 3">Primary 3</option>
                  <option value="Primary 4">Primary 4</option>
                  <option value="Primary 5">Primary 5</option>
                  <option value="Primary 6">Primary 6</option>
                  <option value="Preparatory 1">Preparatory 1</option>
                  <option value="Preparatory 2">Preparatory 2</option>
                  <option value="Preparatory 3">Preparatory 3</option>
                  <option value="Secondary 1">Secondary 1</option>
                  <option value="Secondary 2">Secondary 2</option>
                  <option value="Secondary 3">Secondary 3</option>
                  <option value="University">University</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Governorate */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FaMapMarkerAlt className="text-red-500" />
                  Governorate
                </label>
                <select
                  value={isEditing ? userInput.governorate : (userData?.governorate || "")}
                  onChange={(e) => setUserInput({ ...userInput, governorate: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <option value="">Select Governorate</option>
                  <option value="Cairo">Cairo</option>
                  <option value="Alexandria">Alexandria</option>
                  <option value="Giza">Giza</option>
                  <option value="Qalyubia">Qalyubia</option>
                  <option value="Port Said">Port Said</option>
                  <option value="Suez">Suez</option>
                  <option value="Gharbia">Gharbia</option>
                  <option value="Monufia">Monufia</option>
                  <option value="Beheira">Beheira</option>
                  <option value="Ismailia">Ismailia</option>
                  <option value="Kafr El Sheikh">Kafr El Sheikh</option>
                  <option value="Dakahlia">Dakahlia</option>
                  <option value="Sharqia">Sharqia</option>
                  <option value="Damietta">Damietta</option>
                  <option value="Assiut">Assiut</option>
                  <option value="Sohag">Sohag</option>
                  <option value="Qena">Qena</option>
                  <option value="Aswan">Aswan</option>
                  <option value="Luxor">Luxor</option>
                  <option value="Red Sea">Red Sea</option>
                  <option value="New Valley">New Valley</option>
                  <option value="Matruh">Matruh</option>
                  <option value="North Sinai">North Sinai</option>
                  <option value="South Sinai">South Sinai</option>
                  <option value="Beni Suef">Beni Suef</option>
                  <option value="Faiyum">Faiyum</option>
                  <option value="Minya">Minya</option>
                  <option value="Asyut">Asyut</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Information Section */}
          <div className="w-full space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Account Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FaIdCard className="text-blue-500" />
                  Account Role
                </label>
                <input
                  type="text"
                  value={userData?.role || "USER"}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed"
                />
              </div>

              {/* Subscription Status */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FaIdCard className="text-green-500" />
                  Subscription Status
                </label>
                <input
                  type="text"
                  value={userData?.subscription?.status || "Not Active"}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
          {/* submit button */}
          <div className="w-full flex md:flex-row flex-col md:justify-between justify-center md:gap-0 gap-3">
            {isEditing ? (
              <>
                <button
                  type="submit"
                  className="py-3.5 rounded-md bg-green-500 hover:bg-green-600 mt-3 text-white font-inter md:w-[48%] w-full flex items-center justify-center gap-2"
                  disabled={!isChanged || isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <FaSave size={14} />
                      Save Changes
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="py-3.5 rounded-md bg-gray-500 hover:bg-gray-600 mt-3 text-white font-inter md:w-[48%] w-full flex items-center justify-center gap-2"
                  disabled={isUpdating}
                >
                  <FaTimes size={14} />
                  Cancel
                </button>
              </>
            ) : (
              /* show cancel subscription btn if Active */
              userData?.subscription?.status === "active" && (
                <button
                  type="button"
                  onClick={handleCancelSubscription}
                  className="py-3.5 rounded-md bg-[#f32e2e] mt-3 text-white font-inter md:w-[48%] w-full"
                >
                  Cancel Subscription
                </button>
              )
            )}
          </div>
        </form>
      </section>
    </Layout>
  );
}
