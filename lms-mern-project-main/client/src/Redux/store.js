import {configureStore} from "@reduxjs/toolkit"
import AuthSliceReducer from "./Slices/AuthSlice"
import CourseSliceReducer from "./Slices/CourseSlice"

import LectureSliceReducer from "./Slices/LectureSlice"
import StatSliceReducer from "./Slices/StatSlice"
import BlogSliceReducer from "./Slices/BlogSlice"
import QASliceReducer from "./Slices/QASlice"
import SubjectSliceReducer from "./Slices/SubjectSlice"
import WalletSliceReducer from "./Slices/WalletSlice"
import AdminRechargeCodeSliceReducer from "./Slices/AdminRechargeCodeSlice"
import AdminUserSliceReducer from "./Slices/AdminUserSlice"
import WhatsAppServiceSliceReducer from "./Slices/WhatsAppServiceSlice"
import VideoProgressSliceReducer from "./Slices/VideoProgressSlice"
import LessonPurchaseSliceReducer from "./Slices/LessonPurchaseSlice"
import ExamSliceReducer from "./Slices/ExamSlice"
import GradeSliceReducer from "./Slices/GradeSlice"
import InstructorSliceReducer from "./Slices/InstructorSlice"
import StageSliceReducer from "./Slices/StageSlice"

 const store = configureStore({
    reducer: {
        auth: AuthSliceReducer,
        course: CourseSliceReducer,
    
        lecture: LectureSliceReducer,
        stat: StatSliceReducer,
        blog: BlogSliceReducer,
        qa: QASliceReducer,
        subject: SubjectSliceReducer,
        wallet: WalletSliceReducer,
        adminRechargeCode: AdminRechargeCodeSliceReducer,
        adminUser: AdminUserSliceReducer,
        whatsappService: WhatsAppServiceSliceReducer,
        videoProgress: VideoProgressSliceReducer,
        lessonPurchase: LessonPurchaseSliceReducer,
          exam: ExamSliceReducer,
  grade: GradeSliceReducer,
  instructor: InstructorSliceReducer,
  stage: StageSliceReducer
    },
    devTools: true
})

export default store