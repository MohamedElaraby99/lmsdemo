import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../Helpers/axiosInstance";

// Get all subjects
export const getAllSubjects = createAsyncThunk("/subjects/get", async (params = {}) => {
  const { page = 1, limit = 12, category = '', search = '', status = '', featured = '' } = params;
  try {
    const res = await axiosInstance.get(`/subjects?page=${page}&limit=${limit}&category=${category}&search=${search}&status=${status}&featured=${featured}`);
    return res?.data;
  } catch (error) {
    throw error;
  }
});

// Get single subject
export const getSubjectById = createAsyncThunk("/subjects/getById", async (id) => {
  try {
    const res = await axiosInstance.get(`/subjects/${id}`);
    return res?.data;
  } catch (error) {
    throw error;
  }
});

// Create subject
export const createSubject = createAsyncThunk("/subjects/create", async (subjectData) => {
  try {
    const res = await axiosInstance.post("/subjects", subjectData);
    return res?.data;
  } catch (error) {
    throw error;
  }
});

// Update subject
export const updateSubject = createAsyncThunk("/subjects/update", async ({ id, subjectData }) => {
  try {
    const res = await axiosInstance.put(`/subjects/${id}`, subjectData);
    return res?.data;
  } catch (error) {
    throw error;
  }
});

// Delete subject
export const deleteSubject = createAsyncThunk("/subjects/delete", async (id) => {
  try {
    const res = await axiosInstance.delete(`/subjects/${id}`);
    return res?.data;
  } catch (error) {
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
    return res?.data;
  } catch (error) {
    throw error;
  }
});

// Update subject status
export const updateSubjectStatus = createAsyncThunk("/subjects/updateStatus", async ({ id, status }) => {
  try {
    const res = await axiosInstance.put(`/subjects/${id}/status`, { status });
    return res?.data;
  } catch (error) {
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