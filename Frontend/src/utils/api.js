import axios from 'axios';
import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from '../config/api.js';

// Create axios instance with environment-based URL
const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Utility function to check if user is authenticated
const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

// Utility function to redirect to login
const redirectToLogin = () => {
    // Clear any existing token
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];

    // Only redirect if not already on auth pages
    const currentPath = window.location.pathname;
    if (!['/login', '/signup'].includes(currentPath)) {
        window.location.href = '/login';
    }
};

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add retry configuration for this request
        config.retryAttempts = config.retryAttempts || 0;

        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle network errors
        if (!error.response) {
            console.error('Network error:', error.message);
            const networkError = new Error(ERROR_MESSAGES.NETWORK_ERROR);
            networkError.isNetworkError = true;
            return Promise.reject(networkError);
        }

        const { status } = error.response;

        // Handle different error types
        switch (status) {
            case HTTP_STATUS.UNAUTHORIZED:
                console.warn('Unauthorized request, redirecting to login');
                redirectToLogin();
                return Promise.reject(new Error(ERROR_MESSAGES.UNAUTHORIZED));

            case HTTP_STATUS.FORBIDDEN:
                console.warn('Forbidden request');
                return Promise.reject(new Error(ERROR_MESSAGES.FORBIDDEN));

            case HTTP_STATUS.NOT_FOUND:
                console.warn('Resource not found');
                return Promise.reject(new Error(ERROR_MESSAGES.NOT_FOUND));

            case HTTP_STATUS.INTERNAL_SERVER_ERROR:
                console.error('Server error');
                return Promise.reject(new Error(ERROR_MESSAGES.SERVER_ERROR));

            default:
                // Handle other errors with custom message if available
                const errorMessage = error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
                return Promise.reject(new Error(errorMessage));
        }
    }
);

// Utility function to make authenticated requests
export const makeAuthenticatedRequest = async (requestFunction) => {
    if (!isAuthenticated()) {
        console.warn('Attempted to make authenticated request without token');
        redirectToLogin();
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    try {
        return await requestFunction();
    } catch (error) {
        console.error('Authenticated request failed:', error);
        throw error;
    }
};

// Utility function to handle API errors in components
export const handleApiError = (error, setError) => {
    console.error('API Error:', error);

    let errorMessage = ERROR_MESSAGES.GENERIC_ERROR;

    if (error.isNetworkError) {
        errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
    } else if (error.message) {
        errorMessage = error.message;
    }

    if (setError && typeof setError === 'function') {
        setError(errorMessage);
    }

    return errorMessage;
};

// Export the configured axios instance
export default api;
