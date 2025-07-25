import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../Helpers/axiosInstance";

// Async thunks
export const getAllUsers = createAsyncThunk(
    "adminUser/getAll",
    async ({ page = 1, limit = 20, role, status, search }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams({
                page,
                limit,
                ...(role && { role }),
                ...(status && { status }),
                ...(search && { search })
            });
            const response = await axiosInstance.get(`/admin/users/users?${params}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to get users");
        }
    }
);

export const getUserDetails = createAsyncThunk(
    "adminUser/getDetails",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/admin/users/users/${userId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to get user details");
        }
    }
);

export const toggleUserStatus = createAsyncThunk(
    "adminUser/toggleStatus",
    async ({ userId, isActive }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/admin/users/users/${userId}/status`, { isActive });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to toggle user status");
        }
    }
);

export const updateUserRole = createAsyncThunk(
    "adminUser/updateRole",
    async ({ userId, role }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/admin/users/users/${userId}/role`, { role });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update user role");
        }
    }
);

export const deleteUser = createAsyncThunk(
    "adminUser/delete",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/admin/users/users/${userId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete user");
        }
    }
);

export const getUserActivities = createAsyncThunk(
    "adminUser/getActivities",
    async ({ userId, page = 1, limit = 20 }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams({ page, limit });
            const response = await axiosInstance.get(`/admin/users/users/${userId}/activities?${params}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to get user activities");
        }
    }
);

export const getUserStats = createAsyncThunk(
    "adminUser/getStats",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/admin/users/users/${userId}/stats`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to get user stats");
        }
    }
);

const initialState = {
    users: [],
    selectedUser: null,
    userActivities: [],
    userStats: null,
    stats: {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        adminUsers: 0,
        regularUsers: 0
    },
    pagination: {
        currentPage: 1,
        totalPages: 1,
        total: 0,
        limit: 20
    },
    loading: false,
    error: null,
    actionLoading: false,
    actionError: null
};

const adminUserSlice = createSlice({
    name: "adminUser",
    initialState,
    reducers: {
        clearAdminUserError: (state) => {
            state.error = null;
            state.actionError = null;
        },
        clearSelectedUser: (state) => {
            state.selectedUser = null;
            state.userActivities = [];
            state.userStats = null;
        },
        clearAdminUserState: (state) => {
            state.users = [];
            state.selectedUser = null;
            state.userActivities = [];
            state.userStats = null;
            state.stats = {
                totalUsers: 0,
                activeUsers: 0,
                inactiveUsers: 0,
                adminUsers: 0,
                regularUsers: 0
            };
            state.pagination = {
                currentPage: 1,
                totalPages: 1,
                total: 0,
                limit: 20
            };
            state.loading = false;
            state.error = null;
            state.actionLoading = false;
            state.actionError = null;
        }
    },
    extraReducers: (builder) => {
        // Get all users
        builder
            .addCase(getAllUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.data.users;
                state.pagination = action.payload.data.pagination;
                state.stats = action.payload.data.stats;
            })
            .addCase(getAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Get user details
        builder
            .addCase(getUserDetails.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(getUserDetails.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.selectedUser = action.payload.data.user;
            })
            .addCase(getUserDetails.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });

        // Toggle user status
        builder
            .addCase(toggleUserStatus.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(toggleUserStatus.fulfilled, (state, action) => {
                state.actionLoading = false;
                // Update user in the list
                const userIndex = state.users.findIndex(user => user.id === action.payload.data.userId);
                if (userIndex !== -1) {
                    state.users[userIndex].isActive = action.payload.data.isActive;
                }
                // Update selected user if it's the same user
                if (state.selectedUser && state.selectedUser.id === action.payload.data.userId) {
                    state.selectedUser.isActive = action.payload.data.isActive;
                }
            })
            .addCase(toggleUserStatus.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });

        // Update user role
        builder
            .addCase(updateUserRole.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(updateUserRole.fulfilled, (state, action) => {
                state.actionLoading = false;
                // Update user in the list
                const userIndex = state.users.findIndex(user => user.id === action.payload.data.userId);
                if (userIndex !== -1) {
                    state.users[userIndex].role = action.payload.data.role;
                }
                // Update selected user if it's the same user
                if (state.selectedUser && state.selectedUser.id === action.payload.data.userId) {
                    state.selectedUser.role = action.payload.data.role;
                }
            })
            .addCase(updateUserRole.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });

        // Delete user
        builder
            .addCase(deleteUser.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.actionLoading = false;
                // Remove user from the list
                const userId = action.meta.arg;
                state.users = state.users.filter(user => user.id !== userId);
                // Clear selected user if it's the deleted user
                if (state.selectedUser && state.selectedUser.id === userId) {
                    state.selectedUser = null;
                }
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });

        // Get user activities
        builder
            .addCase(getUserActivities.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(getUserActivities.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.userActivities = action.payload.data.activities;
            })
            .addCase(getUserActivities.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });

        // Get user stats
        builder
            .addCase(getUserStats.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(getUserStats.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.userStats = action.payload.data.stats;
            })
            .addCase(getUserStats.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });
    }
});

export const { clearAdminUserError, clearSelectedUser, clearAdminUserState } = adminUserSlice.actions;
export default adminUserSlice.reducer; 