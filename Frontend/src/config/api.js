// API configuration constants
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
};

// API endpoints
export const API_ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        PROFILE: '/auth/profile',
        REFRESH: '/auth/refresh',
        LOGOUT: '/auth/logout',
    },
    // Venue endpoints
    VENUES: {
        LIST: '/venues',
        DETAILS: (id) => `/venues/${id}`,
        SEARCH: '/venues/search',
        BOOK: (id) => `/venues/${id}/book`,
        DELETE: '/venues',
    },
    // Owner endpoints
    OWNER: {
        VENUES: '/owner/venues',
        ADD_VENUE: '/owner/venues',
        UPDATE_VENUE: (id) => `/owner/venues/${id}`,
        DELETE_VENUE: (id) => `/owner/venues/${id}`,
    },
    // Admin endpoints
    ADMIN: {
        VENUES: '/admin/venues',
        UPDATE_VENUE_STATUS: '/admin/venues',
        APPROVE_VENUE: (id) => `/admin/venues/${id}/approve`,
        REJECT_VENUE: (id) => `/admin/venues/${id}/reject`,
        STATS: '/admin/stats',
        ACTIVITY: '/admin/activity',
    },
    // Sports endpoints
    SPORTS: {
        LIST: '/sports',
        POPULAR: '/sports/popular',
    },
    // Booking endpoints
    BOOKINGS: {
        LIST: '/bookings',
        CREATE: '/bookings',
        DETAILS: (id) => `/bookings/${id}`,
        CANCEL: (id) => `/bookings/${id}/cancel`,
    },
    // User endpoints
    USER: {
        PROFILE: '/user/profile',
        UPDATE: '/user/profile',
        BOOKINGS: '/user/bookings',
    },
};

// HTTP status codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You need to login to access this feature.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
};
