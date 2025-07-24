import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { axiosInstance } from '../../Helpers/axiosInstance';

const initialState = {
    blogs: [],
    currentBlog: null,
    loading: false,
    totalPages: 0,
    currentPage: 1,
    total: 0
};

// Get all blogs
export const getAllBlogs = createAsyncThunk("/blogs/get", async (params = {}) => {
    const { page = 1, limit = 10, category = '', search = '' } = params;
    const loadingMessage = toast.loading("Fetching blogs...");
    try {
        const res = await axiosInstance.get(`/blogs?page=${page}&limit=${limit}&category=${category}&search=${search}`);
        toast.success(res?.data?.message, { id: loadingMessage });
        return res?.data;
    } catch (error) {
        toast.error(error?.response?.data?.message, { id: loadingMessage });
        throw error;
    }
});

// Get blog by ID
export const getBlogById = createAsyncThunk("/blogs/getById", async (id) => {
    const loadingMessage = toast.loading("Fetching blog...");
    try {
        const res = await axiosInstance.get(`/blogs/${id}`);
        toast.success(res?.data?.message, { id: loadingMessage });
        return res?.data;
    } catch (error) {
        toast.error(error?.response?.data?.message, { id: loadingMessage });
        throw error;
    }
});

// Create blog
export const createBlog = createAsyncThunk("/blogs/create", async (data) => {
    const loadingMessage = toast.loading("Creating blog...");
    try {
        const res = await axiosInstance.post("/blogs", data);
        toast.success(res?.data?.message, { id: loadingMessage });
        return res?.data;
    } catch (error) {
        toast.error(error?.response?.data?.message, { id: loadingMessage });
        throw error;
    }
});

// Update blog
export const updateBlog = createAsyncThunk("/blogs/update", async ({ id, data }) => {
    const loadingMessage = toast.loading("Updating blog...");
    try {
        const res = await axiosInstance.put(`/blogs/${id}`, data);
        toast.success(res?.data?.message, { id: loadingMessage });
        return res?.data;
    } catch (error) {
        toast.error(error?.response?.data?.message, { id: loadingMessage });
        throw error;
    }
});

// Delete blog
export const deleteBlog = createAsyncThunk("/blogs/delete", async (id) => {
    const loadingMessage = toast.loading("Deleting blog...");
    try {
        const res = await axiosInstance.delete(`/blogs/${id}`);
        toast.success(res?.data?.message, { id: loadingMessage });
        return res?.data;
    } catch (error) {
        toast.error(error?.response?.data?.message, { id: loadingMessage });
        throw error;
    }
});

// Like blog
export const likeBlog = createAsyncThunk("/blogs/like", async (id) => {
    try {
        const res = await axiosInstance.post(`/blogs/${id}/like`);
        return res?.data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
        throw error;
    }
});

const blogSlice = createSlice({
    name: 'blog',
    initialState,
    reducers: {
        clearCurrentBlog: (state) => {
            state.currentBlog = null;
        }
    },
    extraReducers: (builder) => {
        // Get all blogs
        builder.addCase(getAllBlogs.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getAllBlogs.fulfilled, (state, action) => {
            state.loading = false;
            state.blogs = action?.payload?.blogs;
            state.totalPages = action?.payload?.totalPages;
            state.currentPage = action?.payload?.currentPage;
            state.total = action?.payload?.total;
        });
        builder.addCase(getAllBlogs.rejected, (state) => {
            state.loading = false;
        });

        // Get blog by ID
        builder.addCase(getBlogById.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getBlogById.fulfilled, (state, action) => {
            state.loading = false;
            state.currentBlog = action?.payload?.blog;
        });
        builder.addCase(getBlogById.rejected, (state) => {
            state.loading = false;
        });

        // Create blog
        builder.addCase(createBlog.fulfilled, (state, action) => {
            state.blogs.unshift(action?.payload?.blog);
        });

        // Update blog
        builder.addCase(updateBlog.fulfilled, (state, action) => {
            const index = state.blogs.findIndex(blog => blog._id === action?.payload?.blog._id);
            if (index !== -1) {
                state.blogs[index] = action?.payload?.blog;
            }
            if (state.currentBlog?._id === action?.payload?.blog._id) {
                state.currentBlog = action?.payload?.blog;
            }
        });

        // Delete blog
        builder.addCase(deleteBlog.fulfilled, (state, action) => {
            state.blogs = state.blogs.filter(blog => blog._id !== action?.meta?.arg);
            if (state.currentBlog?._id === action?.meta?.arg) {
                state.currentBlog = null;
            }
        });

        // Like blog
        builder.addCase(likeBlog.fulfilled, (state, action) => {
            const blogId = action?.meta?.arg;
            const blog = state.blogs.find(b => b._id === blogId);
            if (blog) {
                blog.likes = action?.payload?.likes;
            }
            if (state.currentBlog?._id === blogId) {
                state.currentBlog.likes = action?.payload?.likes;
            }
        });
    }
});

export const { clearCurrentBlog } = blogSlice.actions;
export default blogSlice.reducer; 