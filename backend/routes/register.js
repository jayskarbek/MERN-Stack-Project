const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

module.exports = function (db) {
    const router = express.Router();
    const users = db.collection('Users');

    router.post('/register', async (req, res) => {
        try {
            let { email, password, firstName, lastName } = req.body;

            // Trims all fields
            [email, password, firstName, lastName] = [email, password, firstName, lastName].map(f => f?.trim());

            // Check inputs
            if (!email || !password || !firstName || !lastName) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            // Check if username is taken
            const existingUser = await users.findOne({ Email: email });
            if (existingUser) {
                return res.status(409).json({ error: 'Username already taken' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');

            // Insert into database
            const result = await users.insertOne({
                Password: hashedPassword,
                FirstName: firstName,
                LastName: lastName,
                Email: email,
                VerificationToken: verificationToken,
                Verified: false
            });

             const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
            
            const verifyLink = `http://localhost:5101/verify/${verificationToken}`;
            await transporter.sendMail({
                to: email,
                subject: 'Verify Your Email',
                html: `<p>Thank you for signing up! Please <a href="${verifyLink}">click here</a> to verify your account.</p>
                    <p>This link will expire in 24 hours.</p>`
            })

            // Register successful
            res.status(201).json({
                userId: result.insertedId,
                message: 'Registration successful. Check your email to verify your account.',
                error: ''
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
}

