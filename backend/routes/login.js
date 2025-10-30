const express = require('express');
const bcrypt = require('bcrypt');

/* TODO: Add email when database is updated*/

module.exports = function (db) {
    const router = express.Router();
    const users = db.collection('Users');

    router.post('/login', async (req, res, next) => {
        // incoming: login, password
        // outgoing: id, firstName, lastName, error
        var error = '';
        let { login, password } = req.body;

        // Trims all fields
        [login, password] = [login, password].map(f => f?.trim());

        // Check inputs
        if (!login || !password) {
            return res.status(400).json({
                id: 0,
                firstName: '',
                lastName: '',
                error: 'Missing login or password'
            });
        }

        try {
            const user = await users.findOne({ Login: login });

            // Username not found
            if (!user) {
                return res.status(401).json({
                    id: 0,
                    firstName: '',
                    lastName: '',
                    error: 'Invalid login or password'
                });
            }

            // Check against hashed password
            const passwordMatch = await bcrypt.compare(password, user.Password);

            // Password does not match
            if (!passwordMatch) {
                return res.status(401).json({
                    id: 0,
                    firstName: '',
                    lastName: '',
                    error: 'Invalid login or password'
                });
            }

            // Login Successful
            return res.status(200).json({
                id: user.UserID,
                firstName: user.FirstName,
                lastName: user.LastName,
                error: ''
            });
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({
                id: 0,
                firstName: '',
                lastName: '',
                error: 'Server error'
            });
        }
    });

    return router;
}

