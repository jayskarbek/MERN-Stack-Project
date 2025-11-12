const express = require('express');

module.exports = function (db) {
    const router = express.Router();
    const users = db.collection('Users');

    // Verify email by token
    router.get('/verify/:token', async (req, res) => {
        const { token } = req.params;
        const frontendURL = process.env.FRONTEND_URL || 'https://floridastateparks.xyz';

        try {
            // Find user with the token
            const user = await users.findOne({ VerificationToken: token });

            if (!user) {
                return res.status(400).send('Invalid or expired verification link.');
            }

            if (user.Verified) {
                return res.status(400).send('Email already verified.');
            }

            // Update user to verified
            await users.updateOne(
                { VerificationToken: token },
                { $set: { Verified: true }, $unset: { VerificationToken: "" } }
            );

            // Redirect to verification success page
            return res.redirect(`${frontendURL}/verifyemail`);
        } catch (err) {
            console.error('Verification error:', err);
            return res.status(500).send('Internal server error.');
        }
    });

    return router;
};