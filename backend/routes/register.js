const express = require('express');

module.exports = function (db) {
    const router = express.Router();

    router.post('/register', (req, res) => {
        const { login, password, firstName, lastName } = req.body;

        if (!login || !password || !firstName || !lastName) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newUser = {
            id: Math.floor(Math.random() * 1000),
            login,
            firstName,
            lastName
        };

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser
        });
    });

    return router;
}

