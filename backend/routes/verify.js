const express = require('express');
const router = express.Router();

module.exports = function (db) {
    const users = db.collection('Users');

    // Verify email by token
    router.get('/:token', async (req, res) => {
        const { token } = req.params;
        const frontendURL = process.env.FRONTEND_URL || 'http://134.199.193.253:5100';

        try {
            // Find user with the token
            const user = await users.findOne({ VerificationToken: token });

            if (!user) {
                return res.status(400).send('Invalid or expired verification link.');
            }

            // Update user to verified
            await users.updateOne(
                { VerificationToken: token },
                { $set: { Verified: true }, $unset: { VerificationToken: "" } }
            );

            // Go to verify confirmation page
            return res.redirect(`${frontendURL}/verifyemail`);
        } catch (err) {
            console.error('Verification error:', err);
            return res.status(500).send('Internal server error.');
        }
    });

    return router;
};