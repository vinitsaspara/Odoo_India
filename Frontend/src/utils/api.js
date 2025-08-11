import axios from 'axios';

// Get base URL from environment variables or use default
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token from localStorage
api.interceptors.request.use(
    (config) => {
        // Get JWT token from localStorage
        const token = localStorage.getItem('token');

        // Add Authorization header if token exists
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling and token management
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle network errors
        if (!error.response) {
            console.error('Network error:', error.message);
            return Promise.reject(new Error('Network error. Please check your connection.'));
        }

        const { status } = error.response;

        // Handle authentication errors
        if (status === 401) {
            console.warn('Unauthorized request - clearing token and redirecting to login');

            // Clear token from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Clear authorization header
            delete api.defaults.headers.common['Authorization'];

            // Redirect to login page (avoid redirect if already on auth pages)
            const currentPath = window.location.pathname;
            if (!['/login', '/signup'].includes(currentPath)) {
                window.location.href = '/login';
            }

            return Promise.reject(new Error('Session expired. Please login again.'));
        }

        // Handle other HTTP errors
        const errorMessage = error.response?.data?.message ||
            error.response?.data?.error ||
            `Request failed with status ${status}`;

        console.error(`API Error (${status}):`, errorMessage);
        return Promise.reject(new Error(errorMessage));
    }
);

// Utility function to set token (useful for login)
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
    }
};

// Utility function to check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

// Utility function to get current token
export const getToken = () => {
    return localStorage.getItem('token');
};

// Utility function to clear authentication
export const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
};

// Utility function to handle API errors in components
export const handleApiError = (error, setError = null) => {
    console.error('API Error:', error);

    let errorMessage = 'An unexpected error occurred';

    if (error.message) {
        errorMessage = error.message;
    } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
    } else if (error.response?.status) {
        switch (error.response.status) {
            case 400:
                errorMessage = 'Invalid request. Please check your input.';
                break;
            case 401:
                errorMessage = 'Please login to continue.';
                break;
            case 403:
                errorMessage = 'You do not have permission to perform this action.';
                break;
            case 404:
                errorMessage = 'Resource not found.';
                break;
            case 500:
                errorMessage = 'Server error. Please try again later.';
                break;
            default:
                errorMessage = `Request failed with status ${error.response.status}`;
        }
    }

    // Set error in component state if setError function is provided
    if (setError && typeof setError === 'function') {
        setError(errorMessage);
    }

    return errorMessage;
};

// Export configured axios instance as default
export default api;
