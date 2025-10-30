const express = require('express');

module.exports = function (db) {
    const router = express.Router();

    router.post('/login', async (req, res, next) => {
        // incoming: login, password
        // outgoing: id, firstName, lastName, error
        var error = '';
        const { login, password } = req.body;

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
            const collection = db.collection('Users');
            const user = await collection.findOne({ Login: login });

            // Username not found
            if (!user) {
                return res.status(401).json({
                    id: 0,
                    firstName: '',
                    lastName: '',
                    error: 'Invalid login or password'
                });
            }

            // Password does not match
            if (!(password == user.password)) {
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

