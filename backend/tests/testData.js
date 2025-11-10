const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

// Sample user data
const createTestUser = async (overrides = {}) => {
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    return {
        UserID: 'test-user-123',
        FirstName: 'John',
        LastName: 'Doe',
        Email: 'john.doe@example.com',
        Password: hashedPassword,
        Verified: true,
        ...overrides
    };
};

// Sample park data
const createTestPark = (overrides = {}) => {
    return {
        _id: new ObjectId(),
        name: 'Yellowstone National Park',
        description: 'America\'s first national park',
        location: {
            state: 'Wyoming',
            coordinates: { lat: 44.428, lng: -110.588 }
        },
        ...overrides
    };
};

// Sample review data
const createTestReview = (parkId, userId, overrides = {}) => {
    return {
        parkId: parkId.toString(),
        userId: userId,
        userName: 'John Doe',
        ratings: {
            views: 5,
            location: 4,
            amenities: 5
        },
        comment: 'Amazing park! Loved the wildlife and scenery.',
        createdAt: new Date(),
        ...overrides
    };
};

// Create multiple test parks
const createMultipleTestParks = (count = 3) => {
    const parkNames = [
        'Yellowstone National Park',
        'Grand Canyon National Park',
        'Yosemite National Park',
        'Zion National Park',
        'Glacier National Park'
    ];
    
    return Array.from({ length: count }, (_, i) => ({
        _id: new ObjectId(),
        name: parkNames[i] || `Test Park ${i + 1}`,
        description: `Description for ${parkNames[i] || `Test Park ${i + 1}`}`,
        location: {
            state: 'Test State',
            coordinates: { lat: 40.0 + i, lng: -110.0 - i }
        }
    }));
};

module.exports = {
    createTestUser,
    createTestPark,
    createTestReview,
    createMultipleTestParks
};
