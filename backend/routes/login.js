const express = require('express');
const bcrypt = require('bcrypt');
<<<<<<< HEAD
const jwt = require('jsonwebtoken');
=======

/* TODO: Add email when database is updated*/
>>>>>>> a3614589a1533beab59ef8eae3ef0100eaa81ce5

module.exports = function (db) {
    const router = express.Router();
    const users = db.collection('Users');

<<<<<<< HEAD
    router.post('/login', async (req, res) => {
=======
    router.post('/login', async (req, res, next) => {
        // incoming: login, password
        // outgoing: id, firstName, lastName, error
        var error = '';
>>>>>>> a3614589a1533beab59ef8eae3ef0100eaa81ce5
        let { login, password } = req.body;

        // Trims all fields
        [login, password] = [login, password].map(f => f?.trim());

        // Check inputs
        if (!login || !password) {
            return res.status(400).json({
<<<<<<< HEAD
=======
                id: 0,
                firstName: '',
                lastName: '',
>>>>>>> a3614589a1533beab59ef8eae3ef0100eaa81ce5
                error: 'Missing login or password'
            });
        }

        try {
            const user = await users.findOne({ Login: login });

            // Username not found
            if (!user) {
                return res.status(401).json({
<<<<<<< HEAD
=======
                    id: 0,
                    firstName: '',
                    lastName: '',
>>>>>>> a3614589a1533beab59ef8eae3ef0100eaa81ce5
                    error: 'Invalid login or password'
                });
            }

            // Check against hashed password
            const passwordMatch = await bcrypt.compare(password, user.Password);

            // Password does not match
            if (!passwordMatch) {
                return res.status(401).json({
<<<<<<< HEAD
=======
                    id: 0,
                    firstName: '',
                    lastName: '',
>>>>>>> a3614589a1533beab59ef8eae3ef0100eaa81ce5
                    error: 'Invalid login or password'
                });
            }

<<<<<<< HEAD
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
=======
            // Login Successful
            return res.status(200).json({
                id: user.UserID,
                firstName: user.FirstName,
                lastName: user.LastName,
>>>>>>> a3614589a1533beab59ef8eae3ef0100eaa81ce5
                error: ''
            });
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({
<<<<<<< HEAD
=======
                id: 0,
                firstName: '',
                lastName: '',
>>>>>>> a3614589a1533beab59ef8eae3ef0100eaa81ce5
                error: 'Server error'
            });
        }
    });

    return router;
<<<<<<< HEAD
}
=======
}

>>>>>>> a3614589a1533beab59ef8eae3ef0100eaa81ce5
