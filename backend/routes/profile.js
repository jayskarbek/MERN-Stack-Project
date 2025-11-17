const express = require('express');
const { ObjectId } = require('mongodb');
const authenticateToken = require('../middleware/auth');

module.exports = function (db) {
    const router = express.Router();
    const parksCollection = db.collection('Parks');
    const reviewsCollection = db.collection('Reviews');
    const usersCollection = db.collection('Users');

    // Get user profile stats (for logged-in user)
    router.get('/profile', authenticateToken, async (req, res) => {
        try {
            const userId = req.user.userId;

            // Get user info
            const isValidObjectId = ObjectId.isValid(userId) && /^[0-9a-fA-F]{24}$/.test(userId);
            
            let user;
            if (isValidObjectId) {
                user = await usersCollection.findOne({ 
                    $or: [
                        { _id: new ObjectId(userId) },
                        { UserID: userId }
                    ]
                });
            } else {
                user = await usersCollection.findOne({ UserID: userId });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Get all user reviews
            const userReviews = await reviewsCollection
                .find({ userId })
                .sort({ createdAt: -1 })
                .toArray();

            // Get unique park IDs from reviews
            const parkIds = [...new Set(userReviews.map(review => review.parkId))];

            // Calculate stats
            const totalReviews = userReviews.length;
            const parksVisited = parkIds.length;

            // Calculate average rating the user gives
            let averageRatingGiven = 0;
            if (userReviews.length > 0) {
                const totalRating = userReviews.reduce((sum, review) => {
                    const avg = (review.ratings.views + review.ratings.location + review.ratings.amenities) / 3;
                    return sum + avg;
                }, 0);
                averageRatingGiven = Math.round((totalRating / userReviews.length) * 10) / 10;
            }

            // Get parks with reviews details
            const reviewedParksWithDetails = await Promise.all(
                userReviews.map(async (review) => {
                    try {
                        const park = await parksCollection.findOne({ _id: new ObjectId(review.parkId) });
                        return {
                            ...review,
                            park: park ? {
                                _id: park._id,
                                name: park.name,
                                counties: park.counties,
                                image_url: park.image_url
                            } : null
                        };
                    } catch (err) {
                        console.error('Error fetching park for review:', err);
                        return { ...review, park: null };
                    }
                })
            );

            // Get top rated parks (user's highest rated parks)
            const topParks = reviewedParksWithDetails
                .filter(r => r.park)
                .map(r => ({
                    park: r.park,
                    rating: (r.ratings.views + r.ratings.location + r.ratings.amenities) / 3,
                    reviewDate: r.createdAt
                }))
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 5);

            // Get recent reviews (last 5)
            const recentReviews = reviewedParksWithDetails.slice(0, 5);

            res.status(200).json({
                user: {
                    userId: userId,
                    firstName: user.FirstName,
                    lastName: user.LastName,
                    email: user.Email,
                    memberSince: user.DateCreated || null
                },
                stats: {
                    totalReviews,
                    parksVisited,
                    averageRatingGiven
                },
                topParks,
                recentReviews,
                allReviews: reviewedParksWithDetails,
                isOwnProfile: true
            });
        } catch (err) {
            console.error('Error fetching user profile:', err);
            res.status(500).json({ error: 'Failed to fetch user profile' });
        }
    });

    // Get public user profile by userId (no auth required)
    router.get('/profile/:userId', async (req, res) => {
        try {
            const userId = req.params.userId;

            // Get user info
            const isValidObjectId = ObjectId.isValid(userId) && /^[0-9a-fA-F]{24}$/.test(userId);
            
            let user;
            if (isValidObjectId) {
                user = await usersCollection.findOne({ 
                    $or: [
                        { _id: new ObjectId(userId) },
                        { UserID: userId }
                    ]
                });
            } else {
                user = await usersCollection.findOne({ UserID: userId });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Get all user reviews
            const userReviews = await reviewsCollection
                .find({ userId })
                .sort({ createdAt: -1 })
                .toArray();

            // Get unique park IDs from reviews
            const parkIds = [...new Set(userReviews.map(review => review.parkId))];

            // Calculate stats
            const totalReviews = userReviews.length;
            const parksVisited = parkIds.length;

            // Calculate average rating the user gives
            let averageRatingGiven = 0;
            if (userReviews.length > 0) {
                const totalRating = userReviews.reduce((sum, review) => {
                    const avg = (review.ratings.views + review.ratings.location + review.ratings.amenities) / 3;
                    return sum + avg;
                }, 0);
                averageRatingGiven = Math.round((totalRating / userReviews.length) * 10) / 10;
            }

            // Get parks with reviews details
            const reviewedParksWithDetails = await Promise.all(
                userReviews.map(async (review) => {
                    try {
                        const park = await parksCollection.findOne({ _id: new ObjectId(review.parkId) });
                        return {
                            ...review,
                            park: park ? {
                                _id: park._id,
                                name: park.name,
                                counties: park.counties,
                                image_url: park.image_url
                            } : null
                        };
                    } catch (err) {
                        console.error('Error fetching park for review:', err);
                        return { ...review, park: null };
                    }
                })
            );

            // Get top rated parks (user's highest rated parks)
            const topParks = reviewedParksWithDetails
                .filter(r => r.park)
                .map(r => ({
                    park: r.park,
                    rating: (r.ratings.views + r.ratings.location + r.ratings.amenities) / 3,
                    reviewDate: r.createdAt
                }))
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 5);

            // Get recent reviews (last 5)
            const recentReviews = reviewedParksWithDetails.slice(0, 5);

            // Check if viewing own profile
            let isOwnProfile = false;
            // This is a public endpoint so we can't check auth, frontend will handle this

            res.status(200).json({
                user: {
                    userId: userId,
                    firstName: user.FirstName,
                    lastName: user.LastName,
                    // Don't show email for public profiles
                    email: null,
                    memberSince: user.DateCreated || null
                },
                stats: {
                    totalReviews,
                    parksVisited,
                    averageRatingGiven
                },
                topParks,
                recentReviews,
                allReviews: reviewedParksWithDetails,
                isOwnProfile: false
            });
        } catch (err) {
            console.error('Error fetching user profile:', err);
            res.status(500).json({ error: 'Failed to fetch user profile' });
        }
    });

    return router;
};
