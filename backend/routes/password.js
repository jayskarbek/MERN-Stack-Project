const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

module.exports = function (db) {
    const router = express.Router();
    const users = db.collection('Users');

    router.post('/forgotpass', async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ error: "Email is required"})

            const user = await users.findOne({ Email: email });

            // email not found
            if (!user) {
                return res.status(401).json({
                    error: 'No email found for this account'
                });
            }

            const token = crypto.randomBytes(32).toString('hex');
            
            await users.updateOne( 
                { Email: email }, 
                { $set: {
                    resetToken: token,
                    resetTokenExp: Date.now() + 15 * 60 * 1000 //15 minutes
                    }
                }
            )

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const resetLink = `${process.env.FRONTEND_URL}/resetpass?token=${token}&email=${encodeURIComponent(email)}`;
            await transporter.sendMail({
                to: user.Email,
                subject: 'Password Reset',
                html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>
                    <p>This link will expire in 15 minutes.</p>`
            })

            res.json({ message: 'Reset password link set to email.' });
        } catch (err) {
            console.error('Forgot Password Error:', err);
            res.status(500).json({
                error: 'Server error'
            });
        }
    });

    router.post('/resetpass', async (req, res) => {
        try {
            const { email, token, newPassword } = req.body;

            const user = await users.findOne({ Email: email });

            if (!user || user.resetToken !== token) {
                return res.status(400).json({ error: 'Invalid or expired reset token.' });
            }

            if (Date.now() > user.resetTokenExp) {
                return res.status(400).json({ error: 'Reset token has expired.' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // update password and clear token fields
            await users.updateOne(
            { Email: email },
                { 
                $set: { Password: hashedPassword },
                $unset: { resetToken: '', resetTokenExp: '' }
                }
            );

            res.json({ message: 'Password has been reset successfully!' });
        } catch (err) {
            console.error('Reset Password Error:', err);
            res.status(500).json({ error: 'Server error. Please try again later.' });
        }
    });

    return router;
}
