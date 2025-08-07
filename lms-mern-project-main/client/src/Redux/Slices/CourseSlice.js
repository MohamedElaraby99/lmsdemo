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
export const fetchCourseById = createAsyncThunk("/courses/getById", async (id, { getState }) => {
    const loadingMessage = toast.loading("fetching course...");
    try {
        // Get user role from state
        const state = getState();
        const userRole = state.auth.data?.role || 'USER';
        const isLoggedIn = state.auth.isLoggedIn;
        
        console.log('CourseSlice Debug:', {
            userRole: userRole,
            authData: state.auth.data,
            isLoggedIn: isLoggedIn,
            courseId: id,
            localStorage: {
                role: localStorage.getItem('role'),
                data: localStorage.getItem('data'),
                isLoggedIn: localStorage.getItem('isLoggedIn')
            }
        });
        
        // If user is not logged in, throw an error
        if (!isLoggedIn) {
            throw new Error('User not logged in');
        }
        
        // Use the course structure endpoint which includes purchase status
        const endpoint = `/courses/${id}/structure`;
        
        console.log('Using course structure endpoint:', endpoint);
        
        try {
            const res = await axiosInstance.get(endpoint);
            toast.success(res?.data?.message, { id: loadingMessage });
            return res?.data;
        } catch (error) {
            // If structure endpoint fails, try the regular course endpoint as fallback
            console.log('Structure endpoint failed, trying regular course endpoint as fallback');
            const regularEndpoint = userRole === 'ADMIN' ? `/courses/admin/${id}` : `/courses/${id}`;
            try {
                const regularRes = await axiosInstance.get(regularEndpoint);
                toast.success(regularRes?.data?.message, { id: loadingMessage });
                return regularRes?.data;
            } catch (regularError) {
                // If regular route also fails, try public route as final fallback
                if (regularError?.response?.status === 403 && 
                    regularError?.response?.data?.message?.includes('subscribe') && 
                    regularEndpoint.includes('/courses/') && 
                    !regularEndpoint.includes('/admin/') && 
                    !regularEndpoint.includes('/public/')) {
                    
                    console.log('Subscription error, trying public route as final fallback');
                    const publicEndpoint = `/courses/public/${id}`;
                    const publicRes = await axiosInstance.get(publicEndpoint);
                    toast.success(publicRes?.data?.message, { id: loadingMessage });
                    return publicRes?.data;
                }
                throw regularError;
            }
        }
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