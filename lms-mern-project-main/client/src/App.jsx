import React from "react";
import { Routes, Route } from "react-router-dom";
import useScrollToTop from "./Helpers/useScrollToTop";
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

import RequireAuth from "./Components/auth/RequireAuth";
import CreateCourse from "./Pages/Course/CreateCourse";
import Profile from "./Pages/User/Profile";
import Checkout from "./Pages/Payment/Checkout";
import CheckoutSuccess from "./Pages/Payment/CheckoutSuccess";
import CheckoutFail from "./Pages/Payment/CheckoutFail";
import DisplayLecture from "./Pages/Dashboard/DisplayLecture";
import AddLecture from "./Pages/Dashboard/AddLecture";
import AdminDashboard from "./Pages/Dashboard/AdminDashboard";

function App() {
  // Auto scroll to top on route change
  useScrollToTop();

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/denied" element={<Denied />} />

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
          <Route path="/course/addlecture" element={<AddLecture />} />
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
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/fail" element={<CheckoutFail />} />
          <Route path="/course/displaylectures" element={<DisplayLecture />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
