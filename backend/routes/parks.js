const express = require('express');
const { ObjectId } = require('mongodb');
const authenticateToken = require('../middleware/auth');

module.exports = function (db) {
    const router = express.Router();
    const parksCollection = db.collection('Parks');
    const reviewsCollection = db.collection('Reviews');
    const usersCollection = db.collection('Users');

    // Helper function to calculate average ratings for a park
async function calculateParkRatings(parkId) {
    const reviews = await reviewsCollection.find({ parkId: parkId.toString() }).toArray();
    
    if (reviews.length === 0) {
        return {
            averageRating: 0,
            reviewCount: 0,
            ratingBreakdown: {
                views: 0,
                location: 0,
                amenities: 0
            }
        };
    }

    const totals = reviews.reduce((acc, review) => {
        acc.views += review.ratings.views || 0;
        acc.location += review.ratings.location || 0;
        acc.amenities += review.ratings.amenities || 0;
        return acc;
    }, { views: 0, location: 0, amenities: 0 });

    const count = reviews.length;
    
    const avgViews = totals.views / count;
    const avgLocation = totals.location / count;
    const avgAmenities = totals.amenities / count;
    
    const overallAverage = (avgViews + avgLocation + avgAmenities) / 3;

    return {
        averageRating: Math.round(overallAverage * 10) / 10,
        reviewCount: count,
        ratingBreakdown: {
            views: Math.round(avgViews * 10) / 10,
            location: Math.round(avgLocation * 10) / 10,
            amenities: Math.round(avgAmenities * 10) / 10
        }
    };
}

    // Get all parks with ratings (Public - No authentication required)
    router.get('/parks', async (req, res) => {
        try {
            const parks = await parksCollection.find().toArray();
            
            // Add ratings to each park
            const parksWithRatings = await Promise.all(
                parks.map(async (park) => {
                    const ratings = await calculateParkRatings(park._id);
                    return {
                        ...park,
                        ...ratings
                    };
                })
            );
            
            res.status(200).json(parksWithRatings);
        } catch (err) {
            console.error('Error fetching parks:', err);
            res.status(500).json({ error: 'Failed to fetch parks' });
        }
    });

    // Get parks that the user has reviewed (Protected - Requires authentication)
    router.get('/my-reviewed-parks', authenticateToken, async (req, res) => {
        try {
            const userId = req.user.userId;
            
            const userReviews = await reviewsCollection.find({ userId }).toArray();
            
            const parkIds = [...new Set(userReviews.map(review => review.parkId))];
            
            if (parkIds.length === 0) {
                return res.status(200).json([]);
            }
            
            const reviewedParks = await parksCollection.find({ 
                _id: { $in: parkIds.map(id => new ObjectId(id)) }
            }).toArray();
            
            const parksWithRatings = await Promise.all(
                reviewedParks.map(async (park) => {
                    const ratings = await calculateParkRatings(park._id);
                    return {
                        ...park,
                        ...ratings
                    };
                })
            );
            
            res.status(200).json(parksWithRatings);
        } catch (err) {
            console.error('Error fetching reviewed parks:', err);
            res.status(500).json({ error: 'Failed to fetch reviewed parks' });
        }
    });

    // Get a specific park by ID with ratings (Public - No authentication required)
    router.get('/parks/:id', async (req, res) => {
        try {
            const park = await parksCollection.findOne({ _id: new ObjectId(req.params.id) });
            if (!park) return res.status(404).json({ error: 'Park not found' });
            
            // Add ratings to the park
            const ratings = await calculateParkRatings(park._id);
            
            res.status(200).json({
                ...park,
                ...ratings
            });
        } catch (err) {
            console.error('Error fetching park:', err);
            res.status(500).json({ error: 'Failed to fetch park' });
        }
    });

    // Get reviews for a specific park (Public - No authentication required)
    router.get('/parks/:id/reviews', async (req, res) => {
        try {
            const parkId = req.params.id;
            console.log('Fetching reviews for parkId:', parkId);
            const reviews = await reviewsCollection
                .find({ parkId })
                .sort({ createdAt: -1 })
                .toArray();
            console.log('Found reviews:', reviews.length);
            res.status(200).json(reviews);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            res.status(500).json({ error: 'Failed to fetch reviews' });
        }
    });

    // Add a new review for a park (Protected - Requires authentication)
    router.post('/parks/:id/reviews', authenticateToken, async (req, res) => {
        try {
            const { ratings, comment } = req.body;
            
            // Get userId from the authenticated token
            const userId = req.user.userId;

            // Validate input
            if (!ratings || !comment) {
                return res.status(400).json({ error: 'Ratings and comment are required' });
            }

            // Fetch the user's name from the Users collection
            const user = await usersCollection.findOne({ 
                $or: [
                    { _id: new ObjectId(userId) },
                    { UserID: userId }
                ]
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const userName = `${user.FirstName} ${user.LastName}`;

            const newReview = {
                parkId: req.params.id,
                userId,
                userName,
                ratings,
                comment,
                createdAt: new Date(),
            };

            const result = await reviewsCollection.insertOne(newReview);
            res.status(201).json({ ...newReview, _id: result.insertedId });
        } catch (err) {
            console.error('Error creating review:', err);
            res.status(500).json({ error: 'Failed to create review' });
        }
    });

    // Update a review (Protected - User can only update their own reviews)
    router.patch('/parks/:parkId/reviews/:reviewId', authenticateToken, async (req, res) => {
        try {
            const { parkId, reviewId } = req.params;
            const { ratings, comment } = req.body;
            const userId = req.user.userId;

            // Find the review
            const review = await reviewsCollection.findOne({ _id: new ObjectId(reviewId) });

            if (!review) {
                return res.status(404).json({ error: 'Review not found' });
            }

            // Check if the user owns this review
            if (review.userId !== userId) {
                return res.status(403).json({ error: 'You can only edit your own reviews' });
            }

            // Update the review
            const updateData = {
                ...(ratings && { ratings }),
                ...(comment && { comment }),
                updatedAt: new Date()
            };

            await reviewsCollection.updateOne(
                { _id: new ObjectId(reviewId) },
                { $set: updateData }
            );

            const updatedReview = await reviewsCollection.findOne({ _id: new ObjectId(reviewId) });
            res.status(200).json(updatedReview);
        } catch (err) {
            console.error('Error updating review:', err);
            res.status(500).json({ error: 'Failed to update review' });
        }
    });

    // Delete a review (Protected - User can only delete their own reviews)
    router.delete('/parks/:parkId/reviews/:reviewId', authenticateToken, async (req, res) => {
        try {
            const { reviewId } = req.params;
            const userId = req.user.userId;

            // Find the review
            const review = await reviewsCollection.findOne({ _id: new ObjectId(reviewId) });

            if (!review) {
                return res.status(404).json({ error: 'Review not found' });
            }

            // Check if the user owns this review
            if (review.userId !== userId) {
                return res.status(403).json({ error: 'You can only delete your own reviews' });
            }

            // Delete the review
            await reviewsCollection.deleteOne({ _id: new ObjectId(reviewId) });

            res.status(200).json({ message: 'Review deleted successfully' });
        } catch (err) {
            console.error('Error deleting review:', err);
            res.status(500).json({ error: 'Failed to delete review' });
        }
    });

    return router;
};