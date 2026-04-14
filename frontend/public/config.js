// config.js - API Configuration
const API_BASE_URL = (() => {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';

    if (isLocal) {
        return 'http://localhost:5001/api';
    }

    return 'https://public-transport-route-helper-app.onrender.com/api';
})();

// Auth endpoints
const AUTH_ENDPOINTS = {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    PROFILE: `${API_BASE_URL}/auth/profile`
};

// Routes endpoints
const ROUTE_ENDPOINTS = {
    SEARCH: `${API_BASE_URL}/routes/search`,
    GET_ROUTE: (id) => `${API_BASE_URL}/routes/${id}`,
    GET_STOPS: (id) => `${API_BASE_URL}/routes/${id}/stops`
};

// Favorites endpoints
const FAVORITE_ENDPOINTS = {
    GET_ALL: `${API_BASE_URL}/favorites`,
    CREATE: `${API_BASE_URL}/favorites`,
    DELETE: (id) => `${API_BASE_URL}/favorites/${id}`
};

// Utility function to get JWT token
function getToken() {
    return localStorage.getItem('token');
}

// Utility function to check if user is authenticated
function isAuthenticated() {
    return !!getToken();
}

// Utility function to make API calls
async function apiCall(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (isAuthenticated()) {
        headers['Authorization'] = `Bearer ${getToken()}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        const raw = await response.text();
        let data = {};
        if (raw) {
            try {
                data = JSON.parse(raw);
            } catch (parseError) {
                if (!response.ok) {
                    throw new Error(`Request failed (${response.status}). Received non-JSON response.`);
                }
                throw new Error('Server returned an invalid response. Please try again.');
            }
        }

        if (!response.ok) {
            throw new Error(data.error || 'An error occurred');
        }

        return data;
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
}

// Utility function to redirect to login if not authenticated
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}