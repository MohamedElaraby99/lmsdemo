import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { axiosInstance } from '../../Helpers/axiosInstance';

const initialState = {
    coursesData: [],
    courseData: null,
    loading: false,
    error: null
}

// ....get all courses....
export const getAllCourses = createAsyncThunk("/courses/get", async () => {
    const loadingMessage = toast.loading("fetching courses...");
    try {
        const res = await axiosInstance.get("/courses");
        toast.success(res?.data?.message, { id: loadingMessage });
        return res?.data
    } catch (error) {
        toast.error(error?.response?.data?.message, { id: loadingMessage });
        throw error;
    }
})

// ....get course by id....
export const fetchCourseById = createAsyncThunk("/courses/getById", async (id) => {
    const loadingMessage = toast.loading("fetching course...");
    try {
        const res = await axiosInstance.get(`/courses/${id}`);
        toast.success(res?.data?.message, { id: loadingMessage });
        return res?.data
    } catch (error) {
        toast.error(error?.response?.data?.message, { id: loadingMessage });
        throw error;
    }
})

// ....create course....
export const createNewCourse = createAsyncThunk("/courses/create", async (data) => {
    const loadingMessage = toast.loading("Creating course...");
    try {
        const res = await axiosInstance.post("/courses", data);
        toast.success(res?.data?.message, { id: loadingMessage });
        return res?.data
    } catch (error) {
        toast.error(error?.response?.data?.message, { id: loadingMessage });
        throw error;
    }
})

// ....update course....
export const updateCourse = createAsyncThunk("/courses/update", async ({ id, formData }) => {
    const loadingMessage = toast.loading("Updating course...");
    try {
        const res = await axiosInstance.put(`/courses/${id}`, formData);
        toast.success(res?.data?.message, { id: loadingMessage });
        return res?.data
    } catch (error) {
        toast.error(error?.response?.data?.message, { id: loadingMessage });
        throw error;
    }
})

// ....delete course......
export const deleteCourse = createAsyncThunk("/course/delete", async (id) => {
    const loadingId = toast.loading("deleting course ...")
    try {
        const response = await axiosInstance.delete(`/courses/${id}`);
        toast.success("Courses deleted successfully", { id: loadingId });
        return response?.data
    } catch (error) {
        toast.error("Failed to delete course", { id: loadingId });
        throw error
    }
});

const courseSlice = createSlice({
    name: 'course',
    initialState,
    reducers: {
        clearCourseData: (state) => {
            state.courseData = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {

        // for get all courses
        builder.addCase(getAllCourses.fulfilled, (state, action) => {
            state.coursesData = action?.payload?.courses;
        })

        // for get course by id
        builder.addCase(fetchCourseById.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        builder.addCase(fetchCourseById.fulfilled, (state, action) => {
            state.loading = false;
            state.courseData = action?.payload?.course;
        })
        builder.addCase(fetchCourseById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
    }
})

export default courseSlice.reducer;