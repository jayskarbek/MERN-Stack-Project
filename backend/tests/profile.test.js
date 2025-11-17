const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { setupTestDB, teardownTestDB } = require('./setup');
const { createTestUser, createTestPark, createTestReview } = require('./testData');

let app;
let db;
let parksCollection;
let reviewsCollection;
let usersCollection;
let testToken;
let testUserId;
let testUser;
let otherUser;
let otherUserId;
let otherUserToken;

beforeAll(async () => {
    const testDB = await setupTestDB();
    db = testDB.db;
    parksCollection = db.collection('Parks');
    reviewsCollection = db.collection('Reviews');
    usersCollection = db.collection('Users');
    
    // Setup Express app
    app = express();
    app.use(express.json());
    
    // Setup profile route
    const profileRoute = require('../routes/profile')(db);
    app.use('/api', profileRoute);
    
    // Set JWT secret for testing
    process.env.JWT_SECRET = 'test-secret-key';
});

afterAll(async () => {
    await teardownTestDB();
});

beforeEach(async () => {
    // Clear collections
    await usersCollection.deleteMany({});
    await parksCollection.deleteMany({});
    await reviewsCollection.deleteMany({});
    
    // Create test user 1
    testUser = await createTestUser();
    await usersCollection.insertOne(testUser);
    testUserId = testUser.UserID;
    
    testToken = jwt.sign(
        { 
            userId: testUserId,
            email: testUser.Email,
            firstName: testUser.FirstName,
            lastName: testUser.LastName
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    // Create test user 2
    otherUser = {
        UserID: 'other-user-id-123',
        Email: 'jane@test.com',
        FirstName: 'Jane',
        LastName: 'Smith',
        Password: 'hashed_password',
        DateCreated: new Date('2024-01-15'),
        Verified: true
    };
    await usersCollection.insertOne(otherUser);
    otherUserId = otherUser.UserID;

    otherUserToken = jwt.sign(
        { 
            userId: otherUserId,
            email: otherUser.Email,
            firstName: otherUser.FirstName,
            lastName: otherUser.LastName
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
});

afterEach(async () => {
    await parksCollection.deleteMany({});
    await reviewsCollection.deleteMany({});
    await usersCollection.deleteMany({});
});

describe('GET /api/profile - Own Profile', () => {
    test('should get own profile with stats when authenticated', async () => {
        // Create parks and reviews for test user
        const park1 = { _id: new ObjectId(), name: 'Test Park 1', counties: ['County1'], image_url: 'url1' };
        const park2 = { _id: new ObjectId(), name: 'Test Park 2', counties: ['County2'], image_url: 'url2' };
        await parksCollection.insertMany([park1, park2]);
        
        const review1 = createTestReview(park1._id, testUserId, {
            ratings: { views: 5, location: 4, amenities: 5 }
        });
        const review2 = createTestReview(park2._id, testUserId, {
            ratings: { views: 4, location: 5, amenities: 4 }
        });
        await reviewsCollection.insertMany([review1, review2]);

        const response = await request(app)
            .get('/api/profile')
            .set('Authorization', `Bearer ${testToken}`);

        expect(response.status).toBe(200);
        expect(response.body.user).toHaveProperty('userId', testUserId);
        expect(response.body.user).toHaveProperty('firstName', 'John');
        expect(response.body.user).toHaveProperty('lastName', 'Doe');
        expect(response.body.user).toHaveProperty('email', 'john.doe@example.com');
        expect(response.body.stats).toHaveProperty('totalReviews', 2);
        expect(response.body.stats).toHaveProperty('parksVisited', 2);
        expect(response.body.stats).toHaveProperty('averageRatingGiven');
        expect(response.body).toHaveProperty('isOwnProfile', true);
    });

    test('should return 401 when not authenticated', async () => {
        const response = await request(app).get('/api/profile');

        expect(response.status).toBe(401);
    });

    test('should calculate correct average rating given', async () => {
        const park = { _id: new ObjectId(), name: 'Test Park', counties: ['County'], image_url: 'url' };
        await parksCollection.insertOne(park);
        
        const review = createTestReview(park._id, testUserId, {
            ratings: { views: 5, location: 3, amenities: 4 }
        });
        await reviewsCollection.insertOne(review);

        const response = await request(app)
            .get('/api/profile')
            .set('Authorization', `Bearer ${testToken}`);

        expect(response.status).toBe(200);
        expect(response.body.stats.averageRatingGiven).toBe(4.0);
    });

    test('should return empty stats for user with no reviews', async () => {
        const response = await request(app)
            .get('/api/profile')
            .set('Authorization', `Bearer ${testToken}`);

        expect(response.status).toBe(200);
        expect(response.body.stats).toHaveProperty('totalReviews', 0);
        expect(response.body.stats).toHaveProperty('parksVisited', 0);
        expect(response.body.stats).toHaveProperty('averageRatingGiven', 0);
        expect(response.body.topParks).toEqual([]);
        expect(response.body.recentReviews).toEqual([]);
        expect(response.body.allReviews).toEqual([]);
    });

    test('should return top 5 parks sorted by rating', async () => {
        // Create 6 parks
        const parks = [];
        for (let i = 1; i <= 6; i++) {
            const park = { 
                _id: new ObjectId(), 
                name: `Park ${i}`, 
                counties: ['County'], 
                image_url: 'url' 
            };
            parks.push(park);
        }
        await parksCollection.insertMany(parks);
        
        // Create reviews with different ratings
        const reviews = parks.map((park, index) => 
            createTestReview(park._id, testUserId, {
                ratings: { views: 5 - index, location: 5 - index, amenities: 5 - index }
            })
        );
        await reviewsCollection.insertMany(reviews);

        const response = await request(app)
            .get('/api/profile')
            .set('Authorization', `Bearer ${testToken}`);

        expect(response.status).toBe(200);
        expect(response.body.topParks).toHaveLength(5);
        // First park should have highest rating (5)
        expect(response.body.topParks[0].rating).toBe(5.0);
        // Last should have rating of 1
        expect(response.body.topParks[4].rating).toBe(1.0);
    });

    test('should include park details in reviews', async () => {
        const park = { 
            _id: new ObjectId(), 
            name: 'Beautiful Park', 
            counties: ['Orange', 'Lake'], 
            image_url: 'http://example.com/image.jpg' 
        };
        await parksCollection.insertOne(park);
        
        const review = createTestReview(park._id, testUserId);
        await reviewsCollection.insertOne(review);

        const response = await request(app)
            .get('/api/profile')
            .set('Authorization', `Bearer ${testToken}`);

        expect(response.status).toBe(200);
        expect(response.body.allReviews).toHaveLength(1);
        expect(response.body.allReviews[0].park).toHaveProperty('name', 'Beautiful Park');
        expect(response.body.allReviews[0].park).toHaveProperty('counties');
        expect(response.body.allReviews[0].park.counties).toEqual(['Orange', 'Lake']);
    });

    test('should return only 5 recent reviews', async () => {
        // Create 10 parks and reviews
        const parks = [];
        for (let i = 1; i <= 10; i++) {
            const park = { _id: new ObjectId(), name: `Park ${i}`, counties: ['County'], image_url: 'url' };
            parks.push(park);
        }
        await parksCollection.insertMany(parks);
        
        const reviews = parks.map(park => createTestReview(park._id, testUserId));
        await reviewsCollection.insertMany(reviews);

        const response = await request(app)
            .get('/api/profile')
            .set('Authorization', `Bearer ${testToken}`);

        expect(response.status).toBe(200);
        expect(response.body.recentReviews).toHaveLength(5);
        expect(response.body.allReviews).toHaveLength(10);
    });
});

describe('GET /api/profile/:userId - Public Profile', () => {
    test('should get public profile without authentication', async () => {
        const park = { _id: new ObjectId(), name: 'Test Park', counties: ['County'], image_url: 'url' };
        await parksCollection.insertOne(park);
        
        const review = createTestReview(park._id, otherUserId);
        await reviewsCollection.insertOne(review);

        const response = await request(app)
            .get(`/api/profile/${otherUserId}`);

        expect(response.status).toBe(200);
        expect(response.body.user).toHaveProperty('userId', otherUserId);
        expect(response.body.user).toHaveProperty('firstName', 'Jane');
        expect(response.body.user).toHaveProperty('lastName', 'Smith');
        expect(response.body.user).toHaveProperty('email', null); // Email should be hidden
        expect(response.body).toHaveProperty('isOwnProfile', false);
    });

    test('should hide email in public profile', async () => {
        const response = await request(app)
            .get(`/api/profile/${otherUserId}`);

        expect(response.status).toBe(200);
        expect(response.body.user.email).toBeNull();
    });

    test('should return 404 for non-existent user', async () => {
        const response = await request(app)
            .get('/api/profile/non-existent-user-id');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'User not found');
    });

    test('should show correct stats for public profile', async () => {
        // Create 3 parks and 3 reviews for other user
        const parks = [];
        for (let i = 1; i <= 3; i++) {
            const park = { _id: new ObjectId(), name: `Park ${i}`, counties: ['County'], image_url: 'url' };
            parks.push(park);
        }
        await parksCollection.insertMany(parks);
        
        const reviews = parks.map(park => 
            createTestReview(park._id, otherUserId, {
                ratings: { views: 5, location: 4, amenities: 5 }
            })
        );
        await reviewsCollection.insertMany(reviews);

        const response = await request(app)
            .get(`/api/profile/${otherUserId}`);

        expect(response.status).toBe(200);
        expect(response.body.stats.totalReviews).toBe(3);
        expect(response.body.stats.parksVisited).toBe(3);
        expect(response.body.stats.averageRatingGiven).toBeCloseTo(4.67, 1);
    });

    test('should only show reviews by requested user', async () => {
        const park = { _id: new ObjectId(), name: 'Test Park', counties: ['County'], image_url: 'url' };
        await parksCollection.insertOne(park);
        
        // Create review by other user
        const otherReview = createTestReview(park._id, otherUserId);
        // Create review by test user
        const testReview = createTestReview(park._id, testUserId);
        
        await reviewsCollection.insertMany([otherReview, testReview]);

        const response = await request(app)
            .get(`/api/profile/${otherUserId}`);

        expect(response.status).toBe(200);
        expect(response.body.allReviews).toHaveLength(1);
        expect(response.body.allReviews[0].userId).toBe(otherUserId);
    });

    test('should handle user with ObjectId format', async () => {
        // Create user with ObjectId _id
        const objectIdUser = {
            _id: new ObjectId(),
            UserID: 'user-with-objectid',
            Email: 'objectid@test.com',
            FirstName: 'ObjectId',
            LastName: 'User',
            Password: 'hashed',
            DateCreated: new Date(),
            Verified: true
        };
        await usersCollection.insertOne(objectIdUser);

        const response = await request(app)
            .get(`/api/profile/${objectIdUser._id.toString()}`);

        expect(response.status).toBe(200);
        expect(response.body.user).toHaveProperty('firstName', 'ObjectId');
    });
});

describe('Profile Edge Cases', () => {
    test('should handle user with no member since date', async () => {
        // Create user without DateCreated
        const noDateUser = {
            UserID: 'no-date-user',
            Email: 'nodate@test.com',
            FirstName: 'NoDate',
            LastName: 'User',
            Password: 'hashed',
            Verified: true
        };
        await usersCollection.insertOne(noDateUser);

        const response = await request(app)
            .get(`/api/profile/${noDateUser.UserID}`);

        expect(response.status).toBe(200);
        expect(response.body.user.memberSince).toBeNull();
    });

    test('should handle reviews with deleted parks gracefully', async () => {
        const park = { _id: new ObjectId(), name: 'Deleted Park', counties: ['County'], image_url: 'url' };
        await parksCollection.insertOne(park);
        
        const review = createTestReview(park._id, testUserId);
        await reviewsCollection.insertOne(review);
        
        // Delete the park
        await parksCollection.deleteOne({ _id: park._id });

        const response = await request(app)
            .get('/api/profile')
            .set('Authorization', `Bearer ${testToken}`);

        expect(response.status).toBe(200);
        expect(response.body.allReviews).toHaveLength(1);
        expect(response.body.allReviews[0].park).toBeNull();
    });

    test('should count parks visited correctly with multiple reviews on same park', async () => {
        const park = { _id: new ObjectId(), name: 'Test Park', counties: ['County'], image_url: 'url' };
        await parksCollection.insertOne(park);
        
        // Create 3 reviews for the same park
        const reviews = [
            createTestReview(park._id, testUserId, { comment: 'First visit' }),
            createTestReview(park._id, testUserId, { comment: 'Second visit' }),
            createTestReview(park._id, testUserId, { comment: 'Third visit' })
        ];
        await reviewsCollection.insertMany(reviews);

        const response = await request(app)
            .get('/api/profile')
            .set('Authorization', `Bearer ${testToken}`);

        expect(response.status).toBe(200);
        expect(response.body.stats.totalReviews).toBe(3);
        expect(response.body.stats.parksVisited).toBe(1); // Should count as 1 unique park
    });

    test('should sort reviews by creation date (newest first)', async () => {
        const park = { _id: new ObjectId(), name: 'Test Park', counties: ['County'], image_url: 'url' };
        await parksCollection.insertOne(park);
        
        // Create reviews with different dates
        const oldReview = createTestReview(park._id, testUserId, { 
            comment: 'Old review',
            createdAt: new Date('2024-01-01')
        });
        const newReview = createTestReview(park._id, testUserId, { 
            comment: 'New review',
            createdAt: new Date('2024-12-01')
        });
        
        await reviewsCollection.insertMany([oldReview, newReview]);

        const response = await request(app)
            .get('/api/profile')
            .set('Authorization', `Bearer ${testToken}`);

        expect(response.status).toBe(200);
        expect(response.body.allReviews[0].comment).toBe('New review');
        expect(response.body.allReviews[1].comment).toBe('Old review');
    });
});
