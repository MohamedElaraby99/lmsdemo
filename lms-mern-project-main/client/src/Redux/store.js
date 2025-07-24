import {configureStore} from "@reduxjs/toolkit"
import AuthSliceReducer from "./Slices/AuthSlice"
import CourseSliceReducer from "./Slices/CourseSlice"
import RazorpaySliceReducer from "./Slices/RazorpaySlice"
import LectureSliceReducer from "./Slices/LectureSlice"
import StatSliceReducer from "./Slices/StatSlice"
import BlogSliceReducer from "./Slices/BlogSlice"
import QASliceReducer from "./Slices/QASlice"
import SubjectSliceReducer from "./Slices/SubjectSlice"
import WalletSliceReducer from "./Slices/WalletSlice"
import AdminRechargeCodeSliceReducer from "./Slices/AdminRechargeCodeSlice"
import AdminUserSliceReducer from "./Slices/AdminUserSlice"

 const store = configureStore({
    reducer: {
        auth: AuthSliceReducer,
        course: CourseSliceReducer,
        razorpay: RazorpaySliceReducer,
        lecture: LectureSliceReducer,
        stat: StatSliceReducer,
        blog: BlogSliceReducer,
        qa: QASliceReducer,
        subject: SubjectSliceReducer,
        wallet: WalletSliceReducer,
        adminRechargeCode: AdminRechargeCodeSliceReducer,
        adminUser: AdminUserSliceReducer
    },
    devTools: true
})

export default store