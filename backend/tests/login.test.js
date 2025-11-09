const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./setup');
const { createTestUser } = require('./testData');

// Setup Express app for testing
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
    
    // Setup login route
    const loginRoute = require('../routes/login')(db);
    app.use('/api', loginRoute);
    
    // Set JWT secret for testing
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.JWT_EXPIRES_IN = '7d';
});

afterAll(async () => {
    await teardownTestDB();
});

afterEach(async () => {
    await clearDatabase();
});

describe('POST /api/login', () => {
    test('should login successfully with valid credentials', async () => {
        // Create test user
        const testUser = await createTestUser();
        await usersCollection.insertOne(testUser);

        const response = await request(app)
            .post('/api/login')
            .send({
                email: 'john.doe@example.com',
                password: 'Password123!'
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('firstName', 'John');
        expect(response.body).toHaveProperty('lastName', 'Doe');
        expect(response.body).toHaveProperty('id');
        expect(response.body.error).toBe('');
        
        // Verify token is valid
        const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
        expect(decoded).toHaveProperty('email', 'john.doe@example.com');
    });

    test('should fail login with incorrect password', async () => {
        const testUser = await createTestUser();
        await usersCollection.insertOne(testUser);

        const response = await request(app)
            .post('/api/login')
            .send({
                email: 'john.doe@example.com',
                password: 'WrongPassword!'
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Invalid login or password');
    });

    test('should fail login with non-existent email', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                email: 'nonexistent@example.com',
                password: 'Password123!'
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Invalid login or password');
    });

    test('should fail login with missing email', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                password: 'Password123!'
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing login or password');
    });

    test('should fail login with missing password', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                email: 'john.doe@example.com'
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing login or password');
    });

    test('should trim whitespace from email and password', async () => {
        const testUser = await createTestUser();
        await usersCollection.insertOne(testUser);

        const response = await request(app)
            .post('/api/login')
            .send({
                email: '  john.doe@example.com  ',
                password: '  Password123!  '
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });
});
