import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../Helpers/axiosInstance';

// Simple purchase lesson
export const purchaseLesson = createAsyncThunk(
    'lessonPurchase/purchaseLesson',
    async ({ lessonId, amount = 10 }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/lesson-purchases/purchase', {
                lessonId,
                amount
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Purchase failed');
        }
    }
);

// Check lesson access
export const checkLessonAccess = createAsyncThunk(
    'lessonPurchase/checkLessonAccess',
    async (lessonId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/lesson-purchases/access/${lessonId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Access check failed');
        }
    }
);

// Get user purchases
export const getUserPurchases = createAsyncThunk(
    'lessonPurchase/getUserPurchases',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/lesson-purchases/user-purchases');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to get purchases');
        }
    }
);

// Get purchase statistics (admin only)
export const getPurchaseStats = createAsyncThunk(
    'lessonPurchase/getPurchaseStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/lesson-purchases/stats');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to get stats');
        }
    }
);

const initialState = {
    purchases: [],
    purchaseStats: null,
    loading: false,
    error: null,
    purchaseLoading: false,
    accessLoading: false
};

const lessonPurchaseSlice = createSlice({
    name: 'lessonPurchase',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearPurchases: (state) => {
            state.purchases = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Purchase lesson
            .addCase(purchaseLesson.pending, (state) => {
                state.purchaseLoading = true;
                state.error = null;
            })
            .addCase(purchaseLesson.fulfilled, (state, action) => {
                state.purchaseLoading = false;
                state.error = null;
                // Add the new purchase to the list
                if (action.payload.data?.purchase) {
                    state.purchases.unshift(action.payload.data.purchase);
                }
            })
            .addCase(purchaseLesson.rejected, (state, action) => {
                state.purchaseLoading = false;
                state.error = action.payload?.message || 'Purchase failed';
            })
            
            // Check lesson access
            .addCase(checkLessonAccess.pending, (state) => {
                state.accessLoading = true;
                state.error = null;
            })
            .addCase(checkLessonAccess.fulfilled, (state, action) => {
                state.accessLoading = false;
                state.error = null;
            })
            .addCase(checkLessonAccess.rejected, (state, action) => {
                state.accessLoading = false;
                state.error = action.payload?.message || 'Access check failed';
            })
            
            // Get user purchases
            .addCase(getUserPurchases.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserPurchases.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.purchases = action.payload.data?.purchases || [];
            })
            .addCase(getUserPurchases.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to get purchases';
            })
            
            // Get purchase stats
            .addCase(getPurchaseStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPurchaseStats.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.purchaseStats = action.payload.data;
            })
            .addCase(getPurchaseStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to get stats';
            });
    }
});

export const { clearError, clearPurchases } = lessonPurchaseSlice.actions;
export default lessonPurchaseSlice.reducer; 