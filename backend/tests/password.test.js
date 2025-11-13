const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./setup');
const { createTestUser } = require('./testData');

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
    
    // Setup password routes
    const passwordRoute = require('../routes/password')(db);
    app.use('/api', passwordRoute);
    
    // Set environment variables
    process.env.SENDGRID_API_KEY = 'test-sendgrid-key';
    process.env.EMAIL_USER = 'test@example.com';
    process.env.FRONTEND_URL = 'https://floridastateparks.xyz';
});

afterAll(async () => {
    await teardownTestDB();
});

afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
});

describe('POST /api/forgotpass', () => {
    test('should send password reset email for valid user', async () => {
        sgMail.send.mockResolvedValue([{ statusCode: 202 }]);

        const user = await createTestUser({ Email: 'user@example.com' });
        await usersCollection.insertOne(user);

        const response = await request(app)
            .post('/api/forgotpass')
            .send({ email: 'user@example.com' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Reset password link sent to email.');

        // Verify reset token was created
        const updatedUser = await usersCollection.findOne({ Email: 'user@example.com' });
        expect(updatedUser).toHaveProperty('resetToken');
        expect(updatedUser).toHaveProperty('resetTokenExp');
        expect(updatedUser.resetToken.length).toBeGreaterThan(0);

        // Verify email was sent
        expect(sgMail.send).toHaveBeenCalledTimes(1);
        expect(sgMail.send).toHaveBeenCalledWith(
            expect.objectContaining({
                to: 'user@example.com',
                from: expect.objectContaining({
                    email: 'test@example.com',
                    name: 'Park Reviews'
                }),
                subject: 'Password Reset',
                html: expect.stringContaining('Click')
            })
        );
    });

    test('should fail with non-existent email', async () => {
        const response = await request(app)
            .post('/api/forgotpass')
            .send({ email: 'nonexistent@example.com' });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'No email found for this account');
        expect(sgMail.send).not.toHaveBeenCalled();
    });

    test('should fail with missing email', async () => {
        const response = await request(app)
            .post('/api/forgotpass')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Email is required');
    });

    test('should set reset token expiration to 15 minutes', async () => {
        sgMail.send.mockResolvedValue([{ statusCode: 202 }]);

        const user = await createTestUser({ Email: 'user@example.com' });
        await usersCollection.insertOne(user);

        const beforeRequest = Date.now();
        
        await request(app)
            .post('/api/forgotpass')
            .send({ email: 'user@example.com' });

        const updatedUser = await usersCollection.findOne({ Email: 'user@example.com' });
        const afterRequest = Date.now();

        // Token should expire 15 minutes from now (900000 ms)
        const expectedExpMin = beforeRequest + 15 * 60 * 1000;
        const expectedExpMax = afterRequest + 15 * 60 * 1000;

        expect(updatedUser.resetTokenExp).toBeGreaterThanOrEqual(expectedExpMin);
        expect(updatedUser.resetTokenExp).toBeLessThanOrEqual(expectedExpMax);
    });

    test('should include reset link in email', async () => {
        sgMail.send.mockResolvedValue([{ statusCode: 202 }]);

        const user = await createTestUser({ Email: 'user@example.com' });
        await usersCollection.insertOne(user);

        await request(app)
            .post('/api/forgotpass')
            .send({ email: 'user@example.com' });

        expect(sgMail.send).toHaveBeenCalledWith(
            expect.objectContaining({
                html: expect.stringMatching(/https:\/\/floridastateparks\.xyz\/resetpass\?token=[a-f0-9]{64}&email=user%40example\.com/)
            })
        );
    });

    test('should handle SendGrid failure', async () => {
        sgMail.send.mockRejectedValue(new Error('SendGrid error'));

        const user = await createTestUser({ Email: 'user@example.com' });
        await usersCollection.insertOne(user);

        const response = await request(app)
            .post('/api/forgotpass')
            .send({ email: 'user@example.com' });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Server error');
    });
});

describe('POST /api/resetpass', () => {
    test('should reset password with valid token', async () => {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExp = Date.now() + 15 * 60 * 1000;

        const user = await createTestUser({
            Email: 'user@example.com',
            resetToken,
            resetTokenExp
        });
        await usersCollection.insertOne(user);

        const response = await request(app)
            .post('/api/resetpass')
            .send({
                email: 'user@example.com',
                token: resetToken,
                newPassword: 'NewPassword123!'
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Password has been reset successfully!');

        // Verify password was changed
        const updatedUser = await usersCollection.findOne({ Email: 'user@example.com' });
        const passwordMatch = await bcrypt.compare('NewPassword123!', updatedUser.Password);
        expect(passwordMatch).toBe(true);

        // Verify reset token was removed
        expect(updatedUser.resetToken).toBeUndefined();
        expect(updatedUser.resetTokenExp).toBeUndefined();
    });

    test('should fail with invalid token', async () => {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExp = Date.now() + 15 * 60 * 1000;

        const user = await createTestUser({
            Email: 'user@example.com',
            resetToken,
            resetTokenExp
        });
        await usersCollection.insertOne(user);

        const response = await request(app)
            .post('/api/resetpass')
            .send({
                email: 'user@example.com',
                token: 'wrong-token',
                newPassword: 'NewPassword123!'
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid or expired reset token.');
    });

    test('should fail with expired token', async () => {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExp = Date.now() - 1000; // Expired 1 second ago

        const user = await createTestUser({
            Email: 'user@example.com',
            resetToken,
            resetTokenExp
        });
        await usersCollection.insertOne(user);

        const response = await request(app)
            .post('/api/resetpass')
            .send({
                email: 'user@example.com',
                token: resetToken,
                newPassword: 'NewPassword123!'
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Reset token has expired.');
    });

    test('should fail with non-existent email', async () => {
        const resetToken = crypto.randomBytes(32).toString('hex');

        const response = await request(app)
            .post('/api/resetpass')
            .send({
                email: 'nonexistent@example.com',
                token: resetToken,
                newPassword: 'NewPassword123!'
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid or expired reset token.');
    });

    test('should hash the new password', async () => {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExp = Date.now() + 15 * 60 * 1000;

        const user = await createTestUser({
            Email: 'user@example.com',
            resetToken,
            resetTokenExp
        });
        const oldPasswordHash = user.Password;
        await usersCollection.insertOne(user);

        await request(app)
            .post('/api/resetpass')
            .send({
                email: 'user@example.com',
                token: resetToken,
                newPassword: 'NewPassword123!'
            });

        const updatedUser = await usersCollection.findOne({ Email: 'user@example.com' });
        
        // New hash should be different from old hash
        expect(updatedUser.Password).not.toBe(oldPasswordHash);
        
        // New password should be hashed (not plain text)
        expect(updatedUser.Password).not.toBe('NewPassword123!');
        
        // Should be able to verify with bcrypt
        const passwordMatch = await bcrypt.compare('NewPassword123!', updatedUser.Password);
        expect(passwordMatch).toBe(true);
    });

    test('should clear reset token fields after successful reset', async () => {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExp = Date.now() + 15 * 60 * 1000;

        const user = await createTestUser({
            Email: 'user@example.com',
            resetToken,
            resetTokenExp
        });
        await usersCollection.insertOne(user);

        await request(app)
            .post('/api/resetpass')
            .send({
                email: 'user@example.com',
                token: resetToken,
                newPassword: 'NewPassword123!'
            });

        const updatedUser = await usersCollection.findOne({ Email: 'user@example.com' });
        expect(updatedUser.resetToken).toBeUndefined();
        expect(updatedUser.resetTokenExp).toBeUndefined();
    });
});