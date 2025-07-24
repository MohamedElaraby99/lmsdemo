import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../Helpers/axiosInstance";
import toast from "react-hot-toast";

// Get all subjects
export const getAllSubjects = createAsyncThunk("/subjects/get", async (params = {}) => {
  const { page = 1, limit = 12, category = '', search = '', status = '', featured = '' } = params;
  const loadingMessage = toast.loading("Fetching subjects...");
  try {
    const res = await axiosInstance.get(`/subjects?page=${page}&limit=${limit}&category=${category}&search=${search}&status=${status}&featured=${featured}`);
    toast.success(res?.data?.message, { id: loadingMessage });
    return res?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message, { id: loadingMessage });
    throw error;
  }
});

// Get single subject
export const getSubjectById = createAsyncThunk("/subjects/getById", async (id) => {
  const loadingMessage = toast.loading("Fetching subject...");
  try {
    const res = await axiosInstance.get(`/subjects/${id}`);
    toast.success(res?.data?.message, { id: loadingMessage });
    return res?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message, { id: loadingMessage });
    throw error;
  }
});

// Create subject
export const createSubject = createAsyncThunk("/subjects/create", async (subjectData) => {
  const loadingMessage = toast.loading("Creating subject...");
  try {
    const res = await axiosInstance.post("/subjects", subjectData);
    toast.success(res?.data?.message, { id: loadingMessage });
    return res?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message, { id: loadingMessage });
    throw error;
  }
});

// Update subject
export const updateSubject = createAsyncThunk("/subjects/update", async ({ id, subjectData }) => {
  const loadingMessage = toast.loading("Updating subject...");
  try {
    const res = await axiosInstance.put(`/subjects/${id}`, subjectData);
    toast.success(res?.data?.message, { id: loadingMessage });
    return res?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message, { id: loadingMessage });
    throw error;
  }
});

// Delete subject
export const deleteSubject = createAsyncThunk("/subjects/delete", async (id) => {
  const loadingMessage = toast.loading("Deleting subject...");
  try {
    const res = await axiosInstance.delete(`/subjects/${id}`);
    toast.success(res?.data?.message, { id: loadingMessage });
    return res?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message, { id: loadingMessage });
    throw error;
  }
});

// Get featured subjects
export const getFeaturedSubjects = createAsyncThunk("/subjects/featured", async () => {
  try {
    const res = await axiosInstance.get("/subjects/featured");
    return res?.data;
  } catch (error) {
    console.error("Error fetching featured subjects:", error);
    throw error;
  }
});

// Toggle featured status
export const toggleFeatured = createAsyncThunk("/subjects/toggleFeatured", async (id) => {
  try {
    const res = await axiosInstance.post(`/subjects/${id}/toggle-featured`);
    toast.success(res?.data?.message);
    return res?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
    throw error;
  }
});

// Update subject status
export const updateSubjectStatus = createAsyncThunk("/subjects/updateStatus", async ({ id, status }) => {
  const loadingMessage = toast.loading("Updating status...");
  try {
    const res = await axiosInstance.put(`/subjects/${id}/status`, { status });
    toast.success(res?.data?.message, { id: loadingMessage });
    return res?.data;
  } catch (error) {
    toast.error(error?.response?.data?.message, { id: loadingMessage });
    throw error;
  }
});

const initialState = {
  subjects: [],
  currentSubject: null,
  featuredSubjects: [],
  loading: false,
  totalPages: 1,
  currentPage: 1,
  total: 0,
  categories: [
    'Programming',
    'Design',
    'Business',
    'Marketing',
    'Technology',
    'Science',
    'Arts',
    'Other'
  ],
  levels: [
    'Beginner',
    'Intermediate',
    'Advanced'
  ]
};

const subjectSlice = createSlice({
  name: "subject",
  initialState,
  reducers: {
    clearCurrentSubject: (state) => {
      state.currentSubject = null;
    },
    clearSubjects: (state) => {
      state.subjects = [];
    }
  },
  extraReducers: (builder) => {
    // Get all subjects
    builder.addCase(getAllSubjects.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllSubjects.fulfilled, (state, action) => {
      state.loading = false;
      state.subjects = action?.payload?.subjects;
      state.totalPages = action?.payload?.totalPages;
      state.currentPage = action?.payload?.currentPage;
      state.total = action?.payload?.total;
    });
    builder.addCase(getAllSubjects.rejected, (state) => {
      state.loading = false;
    });

    // Get single subject
    builder.addCase(getSubjectById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getSubjectById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentSubject = action?.payload?.subject;
    });
    builder.addCase(getSubjectById.rejected, (state) => {
      state.loading = false;
    });

    // Create subject
    builder.addCase(createSubject.fulfilled, (state, action) => {
      state.subjects.unshift(action?.payload?.subject);
    });

    // Update subject
    builder.addCase(updateSubject.fulfilled, (state, action) => {
      const updatedSubject = action?.payload?.subject;
      const index = state.subjects.findIndex(subject => subject._id === updatedSubject._id);
      if (index !== -1) {
        state.subjects[index] = updatedSubject;
      }
      if (state.currentSubject && state.currentSubject._id === updatedSubject._id) {
        state.currentSubject = updatedSubject;
      }
    });

    // Delete subject
    builder.addCase(deleteSubject.fulfilled, (state, action) => {
      const deletedId = action?.payload?.subject?._id;
      state.subjects = state.subjects.filter(subject => subject._id !== deletedId);
      if (state.currentSubject && state.currentSubject._id === deletedId) {
        state.currentSubject = null;
      }
    });

    // Get featured subjects
    builder.addCase(getFeaturedSubjects.fulfilled, (state, action) => {
      state.featuredSubjects = action?.payload?.subjects;
    });

    // Toggle featured
    builder.addCase(toggleFeatured.fulfilled, (state, action) => {
      const updatedSubject = action?.payload?.subject;
      const index = state.subjects.findIndex(subject => subject._id === updatedSubject._id);
      if (index !== -1) {
        state.subjects[index] = updatedSubject;
      }
      if (state.currentSubject && state.currentSubject._id === updatedSubject._id) {
        state.currentSubject = updatedSubject;
      }
    });

    // Update status
    builder.addCase(updateSubjectStatus.fulfilled, (state, action) => {
      const updatedSubject = action?.payload?.subject;
      const index = state.subjects.findIndex(subject => subject._id === updatedSubject._id);
      if (index !== -1) {
        state.subjects[index] = updatedSubject;
      }
      if (state.currentSubject && state.currentSubject._id === updatedSubject._id) {
        state.currentSubject = updatedSubject;
      }
    });
  }
});

export const { clearCurrentSubject, clearSubjects } = subjectSlice.actions;
export default subjectSlice.reducer; 