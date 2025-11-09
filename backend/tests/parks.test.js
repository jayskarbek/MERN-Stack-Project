const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./setup');
const { createTestUser, createTestPark, createTestReview, createMultipleTestParks } = require('./testData');

let app;
let db;
let parksCollection;
let reviewsCollection;
let usersCollection;
let testToken;
let testUserId;
let testUser;

beforeAll(async () => {
    const testDB = await setupTestDB();
    db = testDB.db;
    parksCollection = db.collection('Parks');
    reviewsCollection = db.collection('Reviews');
    usersCollection = db.collection('Users');
    
    // Setup Express app
    app = express();
    app.use(express.json());
    
    // Setup parks route
    const parksRoute = require('../routes/parks')(db);
    app.use('/api', parksRoute);
    
    // Set JWT secret for testing
    process.env.JWT_SECRET = 'test-secret-key';
});

afterAll(async () => {
    await teardownTestDB();
});

beforeEach(async () => {
    // Clear and recreate test user for each test
    await usersCollection.deleteMany({});
    
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
});

afterEach(async () => {
    await parksCollection.deleteMany({});
    await reviewsCollection.deleteMany({});
});

describe('GET /api/parks', () => {
    test('should get all parks with ratings', async () => {
        const parks = createMultipleTestParks(3);
        await parksCollection.insertMany(parks);
        
        // Add reviews to first park
        const review = createTestReview(parks[0]._id, testUserId);
        await reviewsCollection.insertOne(review);

        const response = await request(app).get('/api/parks');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(3);
        expect(response.body[0]).toHaveProperty('averageRating');
        expect(response.body[0]).toHaveProperty('reviewCount');
        expect(response.body[0]).toHaveProperty('ratingBreakdown');
    });

    test('should return empty array when no parks exist', async () => {
        const response = await request(app).get('/api/parks');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    test('should calculate correct average rating', async () => {
        const park = createTestPark();
        await parksCollection.insertOne(park);
        
        // Add review with specific ratings
        const review = createTestReview(park._id, testUserId, {
            ratings: { views: 5, location: 4, amenities: 3 }
        });
        await reviewsCollection.insertOne(review);

        const response = await request(app).get('/api/parks');

        expect(response.status).toBe(200);
        expect(response.body[0].averageRating).toBe(4.0); 
        expect(response.body[0].reviewCount).toBe(1);
    });
});

describe('GET /api/parks/:id', () => {
    test('should get specific park by ID with ratings', async () => {
        const park = createTestPark();
        await parksCollection.insertOne(park);

        const response = await request(app).get(`/api/parks/${park._id}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('name', park.name);
        expect(response.body).toHaveProperty('averageRating');
        expect(response.body).toHaveProperty('reviewCount');
    });

    test('should return 404 for non-existent park', async () => {
        const fakeId = new ObjectId();
        const response = await request(app).get(`/api/parks/${fakeId}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Park not found');
    });
});

describe('GET /api/parks/:id/reviews', () => {
    test('should get all reviews for a park', async () => {
        const park = createTestPark();
        await parksCollection.insertOne(park);
        
        const reviews = [
            createTestReview(park._id, testUserId),
            createTestReview(park._id, 'other-user', { userName: 'Jane Doe' })
        ];
        await reviewsCollection.insertMany(reviews);

        const response = await request(app).get(`/api/parks/${park._id}/reviews`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body[0]).toHaveProperty('comment');
        expect(response.body[0]).toHaveProperty('ratings');
    });

    test('should return empty array for park with no reviews', async () => {
        const park = createTestPark();
        await parksCollection.insertOne(park);

        const response = await request(app).get(`/api/parks/${park._id}/reviews`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });
});

describe('POST /api/parks/:id/reviews', () => {
    test('should create a new review with valid data', async () => {
        const park = createTestPark();
        await parksCollection.insertOne(park);

        const reviewData = {
            ratings: { views: 5, location: 4, amenities: 5 },
            comment: 'Great park!'
        };

        const response = await request(app)
            .post(`/api/parks/${park._id}/reviews`)
            .set('Authorization', `Bearer ${testToken}`)
            .send(reviewData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('userName', 'John Doe');
        expect(response.body).toHaveProperty('comment', 'Great park!');
        expect(response.body.ratings).toEqual(reviewData.ratings);
    });

    test('should fail to create review without authentication', async () => {
        const park = createTestPark();
        await parksCollection.insertOne(park);

        const response = await request(app)
            .post(`/api/parks/${park._id}/reviews`)
            .send({
                ratings: { views: 5, location: 4, amenities: 5 },
                comment: 'Great park!'
            });

        expect(response.status).toBe(401);
    });

    test('should fail to create review with missing ratings', async () => {
        const park = createTestPark();
        await parksCollection.insertOne(park);

        const response = await request(app)
            .post(`/api/parks/${park._id}/reviews`)
            .set('Authorization', `Bearer ${testToken}`)
            .send({ comment: 'Great park!' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Ratings and comment are required');
    });
});

describe('PATCH /api/parks/:parkId/reviews/:reviewId', () => {
    test('should update own review successfully', async () => {
        const park = createTestPark();
        await parksCollection.insertOne(park);
        
        const review = createTestReview(park._id, testUserId);
        const result = await reviewsCollection.insertOne(review);

        const updatedData = {
            comment: 'Updated comment!',
            ratings: { views: 4, location: 5, amenities: 4 }
        };

        const response = await request(app)
            .patch(`/api/parks/${park._id}/reviews/${result.insertedId}`)
            .set('Authorization', `Bearer ${testToken}`)
            .send(updatedData);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('comment', 'Updated comment!');
        expect(response.body.ratings).toEqual(updatedData.ratings);
    });

    test('should not allow updating someone else\'s review', async () => {
        const park = createTestPark();
        await parksCollection.insertOne(park);
        
        const review = createTestReview(park._id, 'different-user-id');
        const result = await reviewsCollection.insertOne(review);

        const response = await request(app)
            .patch(`/api/parks/${park._id}/reviews/${result.insertedId}`)
            .set('Authorization', `Bearer ${testToken}`)
            .send({ comment: 'Updated comment!' });

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('error', 'You can only edit your own reviews');
    });
});

describe('DELETE /api/parks/:parkId/reviews/:reviewId', () => {
    test('should delete own review successfully', async () => {
        const park = createTestPark();
        await parksCollection.insertOne(park);
        
        const review = createTestReview(park._id, testUserId);
        const result = await reviewsCollection.insertOne(review);

        const response = await request(app)
            .delete(`/api/parks/${park._id}/reviews/${result.insertedId}`)
            .set('Authorization', `Bearer ${testToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Review deleted successfully');
        
        // Verify review is deleted
        const deletedReview = await reviewsCollection.findOne({ _id: result.insertedId });
        expect(deletedReview).toBeNull();
    });

    test('should not allow deleting someone else\'s review', async () => {
        const park = createTestPark();
        await parksCollection.insertOne(park);
        
        const review = createTestReview(park._id, 'different-user-id');
        const result = await reviewsCollection.insertOne(review);

        const response = await request(app)
            .delete(`/api/parks/${park._id}/reviews/${result.insertedId}`)
            .set('Authorization', `Bearer ${testToken}`);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('error', 'You can only delete your own reviews');
    });
});