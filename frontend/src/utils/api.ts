// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to build API endpoints
export const buildApiUrl = (endpoint: string): string => {
    // Remove leading slash and 'api/' if present
    const cleanEndpoint = endpoint.replace(/^\/?(api\/)?/, '');
    return `${API_URL}/${cleanEndpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export default API_URL;
