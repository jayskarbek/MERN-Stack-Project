// Utility functions for authentication

export const auth = {
    // Save authentication data
    login: (token: string, userId: string, firstName: string, lastName: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('firstName', firstName);
        localStorage.setItem('lastName', lastName);
    },

    // Clear authentication data
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('firstName');
        localStorage.removeItem('lastName');
    },

    // Get token
    getToken: (): string | null => {
        return localStorage.getItem('token');
    },

    // Get user ID
    getUserId: (): string | null => {
        return localStorage.getItem('userId');
    },

    // Get user's full name
    getUserName: (): string => {
        const firstName = localStorage.getItem('firstName') || '';
        const lastName = localStorage.getItem('lastName') || '';
        return `${firstName} ${lastName}`.trim() || 'Guest';
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('token');
    },

    // Get authorization headers
    getAuthHeaders: () => {
        const token = auth.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }
};