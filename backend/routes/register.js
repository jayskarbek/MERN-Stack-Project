const express = require('express');
const bcrypt = require('bcrypt');

/* TODO: Add email when database is updated*/

module.exports = function (db) {
    const router = express.Router();
    const users = db.collection('Users');

    router.post('/register', async (req, res) => {
        try {
            let { login, password, firstName, lastName } = req.body;

            // Trims all fields
            [login, password, firstName, lastName] = [login, password, firstName, lastName].map(f => f?.trim());

            // Check inputs
            if (!login || !password || !firstName || !lastName) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            // Check if username is taken
            const existingUser = await users.findOne({ Login: login });
            if (existingUser) {
                return res.status(409).json({ error: 'Username already taken' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert into database
            const result = await users.insertOne({
                Login: login,
                Password: hashedPassword,
                FirstName: firstName,
                LastName: lastName
            });

            // Register successful
            res.status(201).json({
                userId: result.insertedId,
                error: ''
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
}

