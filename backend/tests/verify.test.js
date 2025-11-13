const request = require('supertest');
const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./setup');
const { createTestUser } = require('./testData');

let app;
let db;
let usersCollection;

beforeAll(async () => {
    const testDB = await setupTestDB();
    db = testDB.db;
    usersCollection = db.collection('Users');
    
    // Setup Express app
    app = express();
    app.use(express.json());
    
    // Setup verify route
    const verifyRoute = require('../routes/verify')(db);
    app.use('/api', verifyRoute);
    
    // Set environment variables
    process.env.FRONTEND_URL = 'https://floridastateparks.xyz';
});

afterAll(async () => {
    await teardownTestDB();
});

afterEach(async () => {
    await clearDatabase();
});

describe('GET /api/verify/:token', () => {
    test('should verify user with valid token', async () => {
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        // Create unverified user
        const user = await createTestUser({
            Email: 'unverified@example.com',
            VerificationToken: verificationToken,
            Verified: false
        });
        await usersCollection.insertOne(user);

        const response = await request(app)
            .get(`/api/verify/${verificationToken}`);

        expect(response.status).toBe(302); // Redirect
        expect(response.headers.location).toBe('https://floridastateparks.xyz/verifyemail');

        // Verify user is now verified
        const verifiedUser = await usersCollection.findOne({ Email: 'unverified@example.com' });
        expect(verifiedUser.Verified).toBe(true);
        expect(verifiedUser.VerificationToken).toBeUndefined();
    });

    test('should fail with invalid token', async () => {
        const invalidToken = crypto.randomBytes(32).toString('hex');

        const response = await request(app)
            .get(`/api/verify/${invalidToken}`);

        expect(response.status).toBe(400);
        expect(response.text).toContain('Invalid or expired verification link');
    });

    test('should fail when user already verified', async () => {
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        // Create already verified user
        const user = await createTestUser({
            Email: 'verified@example.com',
            VerificationToken: verificationToken,
            Verified: true
        });
        await usersCollection.insertOne(user);

        const response = await request(app)
            .get(`/api/verify/${verificationToken}`);

        expect(response.status).toBe(400);
        expect(response.text).toContain('Email already verified');
    });

    test('should remove verification token after successful verification', async () => {
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        const user = await createTestUser({
            Email: 'test@example.com',
            VerificationToken: verificationToken,
            Verified: false
        });
        await usersCollection.insertOne(user);

        await request(app).get(`/api/verify/${verificationToken}`);

        const updatedUser = await usersCollection.findOne({ Email: 'test@example.com' });
        expect(updatedUser.VerificationToken).toBeUndefined();
    });

    test('should handle malformed token', async () => {
        const response = await request(app)
            .get('/api/verify/invalid-token-format');

        expect(response.status).toBe(400);
        expect(response.text).toContain('Invalid or expired verification link');
    });

    test('should redirect to correct frontend URL', async () => {
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        const user = await createTestUser({
            VerificationToken: verificationToken,
            Verified: false
        });
        await usersCollection.insertOne(user);

        const response = await request(app)
            .get(`/api/verify/${verificationToken}`);

        expect(response.status).toBe(302);
        expect(response.headers.location).toContain('floridastateparks.xyz');
        expect(response.headers.location).toContain('/verifyemail');
    });
});