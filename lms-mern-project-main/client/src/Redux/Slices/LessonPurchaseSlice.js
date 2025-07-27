import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../Helpers/axiosInstance';

// Async thunks
export const purchaseLesson = createAsyncThunk(
    'lessonPurchase/purchaseLesson',
    async (purchaseData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/lesson-purchases/purchase', purchaseData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to purchase lesson');
        }
    }
);

export const checkLessonPurchase = createAsyncThunk(
    'lessonPurchase/checkLessonPurchase',
    async ({ courseId, lessonId }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/lesson-purchases/check/${courseId}/${lessonId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to check lesson purchase');
        }
    }
);

export const getUserLessonPurchases = createAsyncThunk(
    'lessonPurchase/getUserLessonPurchases',
    async (_, { rejectWithValue }) => {
        try {
            console.log('Fetching user lesson purchases...');
            const response = await axiosInstance.get('/lesson-purchases/user/history');
            console.log('User lesson purchases response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching user lesson purchases:', error);
            return rejectWithValue(error.response?.data?.message || 'Failed to get lesson purchases');
        }
    }
);

const initialState = {
    purchases: [],
    purchaseHistory: [],
    loading: false,
    error: null,
    purchaseLoading: false,
    purchaseError: null
};

const lessonPurchaseSlice = createSlice({
    name: 'lessonPurchase',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
            state.purchaseError = null;
        },
        clearPurchaseError: (state) => {
            state.purchaseError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Purchase lesson
            .addCase(purchaseLesson.pending, (state) => {
                state.purchaseLoading = true;
                state.purchaseError = null;
            })
            .addCase(purchaseLesson.fulfilled, (state, action) => {
                state.purchaseLoading = false;
                state.purchases.push(action.payload.data.purchase);
            })
            .addCase(purchaseLesson.rejected, (state, action) => {
                state.purchaseLoading = false;
                // Only set error if it's not an "already purchased" error
                if (!action.payload?.includes('already purchased')) {
                    state.purchaseError = action.payload;
                }
            })
            // Check lesson purchase
            .addCase(checkLessonPurchase.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkLessonPurchase.fulfilled, (state, action) => {
                state.loading = false;
                const { hasPurchased, purchase } = action.payload.data;
                if (hasPurchased) {
                    // Add to purchases if not already present
                    const existingPurchase = state.purchases.find(p => p.lessonId === purchase.lessonId);
                    if (!existingPurchase) {
                        state.purchases.push(purchase);
                    }
                }
            })
            .addCase(checkLessonPurchase.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get user lesson purchases
            .addCase(getUserLessonPurchases.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserLessonPurchases.fulfilled, (state, action) => {
                state.loading = false;
                state.purchases = action.payload.data.purchases;
                state.purchaseHistory = action.payload.data.purchases;
            })
            .addCase(getUserLessonPurchases.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearPurchaseError } = lessonPurchaseSlice.actions;

// Selectors
export const selectLessonPurchases = (state) => state.lessonPurchase.purchases;
export const selectPurchaseHistory = (state) => state.lessonPurchase.purchaseHistory;
export const selectLessonPurchaseLoading = (state) => state.lessonPurchase.loading;
export const selectLessonPurchaseError = (state) => state.lessonPurchase.error;
export const selectPurchaseLoading = (state) => state.lessonPurchase.purchaseLoading;
export const selectPurchaseError = (state) => state.lessonPurchase.purchaseError;

// Helper selector to check if a lesson is purchased
export const selectIsLessonPurchased = (state, lessonId) => {
    return state.lessonPurchase.purchases.some(purchase => purchase.lessonId === lessonId);
};

export default lessonPurchaseSlice.reducer; 