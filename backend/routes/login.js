const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = function (db) {
    const router = express.Router();
    const users = db.collection('Users');

    router.post('/login', async (req, res) => {
        let { login, password } = req.body;

        // Trims all fields
        [login, password] = [login, password].map(f => f?.trim());

        // Check inputs
        if (!login || !password) {
            return res.status(400).json({
                error: 'Missing login or password'
            });
        }

        try {
            const user = await users.findOne({ Login: login });

            // Username not found
            if (!user) {
                return res.status(401).json({
                    error: 'Invalid login or password'
                });
            }

            // Check against hashed password
            const passwordMatch = await bcrypt.compare(password, user.Password);

            // Password does not match
            if (!passwordMatch) {
                return res.status(401).json({
                    error: 'Invalid login or password'
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    userId: user.UserID || user._id.toString(),
                    login: user.Login,
                    firstName: user.FirstName,
                    lastName: user.LastName
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            // Login Successful
            return res.status(200).json({
                id: user.UserID || user._id.toString(),
                firstName: user.FirstName,
                lastName: user.LastName,
                token: token,
                error: ''
            });
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({
                error: 'Server error'
            });
        }
    });

    return router;
}
