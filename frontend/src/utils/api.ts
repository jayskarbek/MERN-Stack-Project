// Get API URL - use HTTPS in production, HTTP in development
const API_URL = import.meta.env.VITE_API_URL || 
    (window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api'
        : 'https://floridastateparks.xyz/api');  // HTTPS for production

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