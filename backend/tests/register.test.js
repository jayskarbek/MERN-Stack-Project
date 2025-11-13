const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./setup');

// Mock SendGrid
jest.mock('@sendgrid/mail');

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
    
    // Setup register route
    const registerRoute = require('../routes/register')(db);
    app.use('/api', registerRoute);
    
    // Mock SendGrid environment variables
    process.env.SENDGRID_API_KEY = 'test-sendgrid-key';
    process.env.EMAIL_USER = 'test@example.com';
});

afterAll(async () => {
    await teardownTestDB();
});

afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
});

describe('POST /api/register', () => {
    test('should register a new user successfully', async () => {
        // Mock SendGrid send method
        sgMail.send.mockResolvedValue([{ statusCode: 202 }]);

        const userData = {
            email: 'newuser@example.com',
            password: 'Password123!',
            firstName: 'Jane',
            lastName: 'Smith'
        };

        const response = await request(app)
            .post('/api/register')
            .send(userData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('userId');
        expect(response.body).toHaveProperty('message', 'Registration successful. Check your email to verify your account.');
        expect(response.body.error).toBe('');

        // Verify user was created in database
        const user = await usersCollection.findOne({ Email: 'newuser@example.com' });
        expect(user).not.toBeNull();
        expect(user.FirstName).toBe('Jane');
        expect(user.LastName).toBe('Smith');
        expect(user.Verified).toBe(false);
        expect(user).toHaveProperty('VerificationToken');

        // Verify password was hashed
        const passwordMatch = await bcrypt.compare('Password123!', user.Password);
        expect(passwordMatch).toBe(true);

        // Verify email was sent
        expect(sgMail.send).toHaveBeenCalledTimes(1);
        expect(sgMail.send).toHaveBeenCalledWith(
            expect.objectContaining({
                to: 'newuser@example.com',
                from: expect.objectContaining({
                    email: 'test@example.com',
                    name: 'Park Reviews'
                }),
                subject: 'Verify Your Email',
                html: expect.stringContaining('click here')
            })
        );
    });

    test('should fail when email already exists', async () => {
        // Create existing user
        await usersCollection.insertOne({
            Email: 'existing@example.com',
            Password: await bcrypt.hash('Password123!', 10),
            FirstName: 'Existing',
            LastName: 'User',
            Verified: true
        });

        const userData = {
            email: 'existing@example.com',
            password: 'NewPassword123!',
            firstName: 'New',
            lastName: 'User'
        };

        const response = await request(app)
            .post('/api/register')
            .send(userData);

        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty('error', 'Username already taken');
        expect(sgMail.send).not.toHaveBeenCalled();
    });

    test('should fail when email is missing', async () => {
        const userData = {
            password: 'Password123!',
            firstName: 'Jane',
            lastName: 'Smith'
        };

        const response = await request(app)
            .post('/api/register')
            .send(userData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'All fields are required');
    });

    test('should fail when password is missing', async () => {
        const userData = {
            email: 'newuser@example.com',
            firstName: 'Jane',
            lastName: 'Smith'
        };

        const response = await request(app)
            .post('/api/register')
            .send(userData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'All fields are required');
    });

    test('should fail when firstName is missing', async () => {
        const userData = {
            email: 'newuser@example.com',
            password: 'Password123!',
            lastName: 'Smith'
        };

        const response = await request(app)
            .post('/api/register')
            .send(userData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'All fields are required');
    });

    test('should fail when lastName is missing', async () => {
        const userData = {
            email: 'newuser@example.com',
            password: 'Password123!',
            firstName: 'Jane'
        };

        const response = await request(app)
            .post('/api/register')
            .send(userData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'All fields are required');
    });

    test('should trim whitespace from all fields', async () => {
        sgMail.send.mockResolvedValue([{ statusCode: 202 }]);

        const userData = {
            email: '  newuser@example.com  ',
            password: '  Password123!  ',
            firstName: '  Jane  ',
            lastName: '  Smith  '
        };

        const response = await request(app)
            .post('/api/register')
            .send(userData);

        expect(response.status).toBe(201);

        const user = await usersCollection.findOne({ Email: 'newuser@example.com' });
        expect(user).not.toBeNull();
        expect(user.FirstName).toBe('Jane');
        expect(user.LastName).toBe('Smith');
    });

    test('should handle SendGrid email failure gracefully', async () => {
        sgMail.send.mockRejectedValue(new Error('SendGrid error'));

        const userData = {
            email: 'newuser@example.com',
            password: 'Password123!',
            firstName: 'Jane',
            lastName: 'Smith'
        };

        const response = await request(app)
            .post('/api/register')
            .send(userData);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Internal server error');
    });

    test('should create verification token', async () => {
        sgMail.send.mockResolvedValue([{ statusCode: 202 }]);

        const userData = {
            email: 'newuser@example.com',
            password: 'Password123!',
            firstName: 'Jane',
            lastName: 'Smith'
        };

        await request(app)
            .post('/api/register')
            .send(userData);

        const user = await usersCollection.findOne({ Email: 'newuser@example.com' });
        expect(user.VerificationToken).toBeDefined();
        expect(user.VerificationToken.length).toBeGreaterThan(0);
    });

    test('should set Verified to false initially', async () => {
        sgMail.send.mockResolvedValue([{ statusCode: 202 }]);

        const userData = {
            email: 'newuser@example.com',
            password: 'Password123!',
            firstName: 'Jane',
            lastName: 'Smith'
        };

        await request(app)
            .post('/api/register')
            .send(userData);

        const user = await usersCollection.findOne({ Email: 'newuser@example.com' });
        expect(user.Verified).toBe(false);
    });

    test('should include verification link in email', async () => {
        sgMail.send.mockResolvedValue([{ statusCode: 202 }]);

        const userData = {
            email: 'newuser@example.com',
            password: 'Password123!',
            firstName: 'Jane',
            lastName: 'Smith'
        };

        await request(app)
            .post('/api/register')
            .send(userData);

        expect(sgMail.send).toHaveBeenCalledWith(
            expect.objectContaining({
                html: expect.stringMatching(/https:\/\/floridastateparks\.xyz\/api\/verify\/[a-f0-9]{64}/)
            })
        );
    });
});