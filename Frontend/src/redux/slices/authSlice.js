import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { handleApiError } from '../../utils/api.js';
import { API_ENDPOINTS } from '../../config/api.js';

// Initial state
const initialState = {
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
};

// Async thunks for API calls
export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
                email,
                password,
            });

            // Set token in localStorage and axios defaults
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            }

            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = handleApiError(error);
            return rejectWithValue(errorMessage);
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async ({ name, email, password, role, avatar }, { rejectWithValue }) => {
        try {
            // Create FormData if avatar is provided, otherwise use regular JSON
            let requestData;
            let config = {};

            if (avatar) {
                // Use FormData for file upload
                requestData = new FormData();
                requestData.append('name', name);
                requestData.append('email', email);
                requestData.append('password', password);
                requestData.append('role', role);
                requestData.append('avatar', avatar);

                // Don't set Content-Type header - let browser set it with boundary
                config.headers = {};
            } else {
                // Use regular JSON for registration without avatar
                requestData = {
                    name,
                    email,
                    password,
                    role,
                };
                config.headers = {
                    'Content-Type': 'application/json'
                };
            }

            const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, requestData, config);

            // Set token in localStorage and axios defaults
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            }

            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = handleApiError(error);
            return rejectWithValue(errorMessage);
        }
    }
);

export const getUserProfile = createAsyncThunk(
    'auth/profile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(API_ENDPOINTS.AUTH.PROFILE);
            return response.data;
        } catch (error) {
            console.error('Get profile error:', error);
            const errorMessage = handleApiError(error);
            return rejectWithValue(errorMessage);
        }
    }
);

// Auth slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
        },
        clearError: (state) => {
            state.error = null;
        },
        setCredentials: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;

            if (token) {
                localStorage.setItem('token', token);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Login cases
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = action.payload;
            })
            // Register cases
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = action.payload;
            })
            // Get profile cases
            .addCase(getUserProfile.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
            })
            .addCase(getUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
