import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import useScrollToTop from "./Helpers/useScrollToTop";
import { initializeDeviceProtection } from "./utils/deviceDetection";
import DeviceProtection from "./Components/DeviceProtection";
import "./utils/deviceProtection.css";
import HomePage from "./Pages/HomePage";
import AboutUs from "./Pages/About";
import NotFound from "./Pages/NotFound";
import Signup from "./Pages/Signup";
import Login from "./Pages/Login";
import ChangePassword from "./Pages/Password/ChangePassword"
import ForgotPassword from "./Pages/Password/ForgotPassword";
import ResetPassword from "./Pages/Password/ResetPassword";
import CourseList from "./Pages/Course/CourseList";
import Contact from "./Pages/Contact";
import Denied from "./Pages/Denied";
import CourseDescription from "./Pages/Course/CourseDescription";
import BlogList from "./Pages/Blog/BlogList";
import BlogDetail from "./Pages/Blog/BlogDetail";
import BlogDashboard from "./Pages/Dashboard/BlogDashboard";
import QAList from "./Pages/QA/QAList";
import QADetail from "./Pages/QA/QADetail";
import QADashboard from "./Pages/Dashboard/QADashboard";
import QACreate from "./Pages/QA/QACreate";
import QAEdit from "./Pages/QA/QAEdit";
import QAPendingQuestions from "./Pages/QA/QAPendingQuestions";
import SubjectList from "./Pages/Subjects/SubjectList";
import SubjectDashboard from "./Pages/Dashboard/SubjectDashboard";
import TermsOfService from "./Pages/TermsOfService";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import Wallet from "./Pages/Wallet/Wallet";
import AdminRechargeCodeDashboard from "./Pages/Dashboard/AdminRechargeCodeDashboard";
import AdminUserDashboard from "./Pages/Dashboard/AdminUserDashboard";
import WhatsAppServiceDashboard from "./Pages/Dashboard/WhatsAppServiceDashboard";
import WhatsAppServices from "./Pages/WhatsAppServices/WhatsAppServices";
import InstructorDashboard from "./Pages/Dashboard/InstructorDashboard";
import StageDashboard from "./Pages/Dashboard/StageDashboard";
import Instructors from "./Pages/Instructors";
import InstructorDetail from "./Pages/InstructorDetail";

import RequireAuth from "./Components/auth/RequireAuth";
import CreateCourse from "./Pages/Course/CreateCourse";
import CourseStructure from "./Pages/Course/CourseStructure";
import EditCourse from "./Pages/Course/EditCourse";
import Profile from "./Pages/User/Profile";

import DisplayLecture from "./Pages/Dashboard/DisplayLecture";
import AddLecture from "./Pages/Dashboard/AddLecture";
import AdminDashboard from "./Pages/Dashboard/AdminDashboard";
import AddPdfToLesson from "./Pages/Dashboard/AddPdfToLesson";
import AddExamToLesson from "./Pages/Dashboard/AddExamToLesson";
import ExamHistory from "./Pages/User/ExamHistory";

function App() {
  // Auto scroll to top on route change
  useScrollToTop();

  // Initialize device protection on app load
  useEffect(() => {
    initializeDeviceProtection();
  }, []);

  return (
    <DeviceProtection>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/denied" element={<Denied />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/admin/recharge-codes" element={<AdminRechargeCodeDashboard />} />
        <Route path="/admin/users" element={<AdminUserDashboard />} />
        <Route path="/admin/instructors" element={<InstructorDashboard />} />
        <Route path="/admin/stages" element={<StageDashboard />} />
        <Route path="/admin/whatsapp-services" element={<WhatsAppServiceDashboard />} />
        <Route path="/whatsapp-services" element={<WhatsAppServices />} />
        <Route path="/instructors" element={<Instructors />} />
        <Route path="/instructors/:id" element={<InstructorDetail />} />

        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/user/profile/reset-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/user/profile/reset-password/:resetToken"
          element={<ResetPassword />}
        />

        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/description" element={<CourseDescription />} />
        <Route path="/blogs" element={<BlogList />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/qa" element={<QAList />} />
        <Route path="/qa/create" element={<QACreate />} />
        <Route path="/qa/edit/:id" element={<QAEdit />} />
        <Route path="/qa/:id" element={<QADetail />} />
        <Route path="/subjects" element={<SubjectList />} />

                  <Route element={<RequireAuth allowedRoles={["ADMIN"]} />}>
                    <Route path="/course/create" element={<CreateCourse />} />
                    <Route path="/course/structure/edit/:id" element={<CourseStructure />} />
                    <Route path="/course/structure" element={<CourseStructure />} />
                    <Route path="/course/edit/:id" element={<EditCourse />} />
                    <Route path="/course/addlecture" element={<AddLecture />} />
                    <Route path="/course/add-pdf" element={<AddPdfToLesson />} />
                    <Route path="/course/add-exam" element={<AddExamToLesson />} />
                    <Route path="/exam-history" element={<ExamHistory />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/blog-dashboard" element={<BlogDashboard />} />
                    <Route path="/admin/qa-dashboard" element={<QADashboard />} />
                    <Route path="/admin/qa-pending" element={<QAPendingQuestions />} />
                    <Route path="/admin/subject-dashboard" element={<SubjectDashboard />} />
                  </Route>

        <Route element={<RequireAuth allowedRoles={["USER", "ADMIN"]} />}>
          <Route path="/user/profile" element={<Profile />} />
          <Route
            path="/user/profile/change-password"
            element={<ChangePassword />}
          />
          
          <Route path="/course/displaylectures/:id" element={<DisplayLecture />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </DeviceProtection>
  );
}

export default App;
