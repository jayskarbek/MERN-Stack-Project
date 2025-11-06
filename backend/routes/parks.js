const express = require('express');
const { ObjectId } = require('mongodb');
<<<<<<< HEAD
const authenticateToken = require('../middleware/auth');
=======
>>>>>>> a3614589a1533beab59ef8eae3ef0100eaa81ce5

module.exports = function (db) {
    const router = express.Router();
    const parksCollection = db.collection('Parks');
    const reviewsCollection = db.collection('Reviews');
<<<<<<< HEAD
    const usersCollection = db.collection('Users');

    // Helper function to calculate average ratings for a park
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
        averageRating: Math.round(overallAverage * 10) / 10, // Round to 1 decimal, out of 5
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
=======

    // Get all parks
    router.get('/parks', async (req, res) => {
        try {
            const parks = await parksCollection.find().toArray();
            res.status(200).json(parks);
>>>>>>> a3614589a1533beab59ef8eae3ef0100eaa81ce5
        } catch (err) {
            console.error('Error fetching parks:', err);
            res.status(500).json({ error: 'Failed to fetch parks' });
        }
    });

<<<<<<< HEAD
    // Get a specific park by ID with ratings (Public - No authentication required)
=======
    // Get a specific park by ID
>>>>>>> a3614589a1533beab59ef8eae3ef0100eaa81ce5
    router.get('/parks/:id', async (req, res) => {
        try {
            const park = await parksCollection.findOne({ _id: new ObjectId(req.params.id) });
            if (!park) return res.status(404).json({ error: 'Park not found' });
<<<<<<< HEAD
            
            // Add ratings to the park
            const ratings = await calculateParkRatings(park._id);
            
            res.status(200).json({
                ...park,
                ...ratings
            });
=======
            res.status(200).json(park);
>>>>>>> a3614589a1533beab59ef8eae3ef0100eaa81ce5
        } catch (err) {
            console.error('Error fetching park:', err);
            res.status(500).json({ error: 'Failed to fetch park' });
        }
    });

<<<<<<< HEAD
    // Get reviews for a specific park (Public - No authentication required)
    router.get('/parks/:id/reviews', async (req, res) => {
        try {
            const parkId = req.params.id;
            console.log('Fetching reviews for parkId:', parkId);
=======
    // Get reviews for a specific park
    router.get('/parks/:id/reviews', async (req, res) => {
        try {
            const parkId = req.params.id;
            console.log('Fetching reviews for parkId:', parkId); // Debug log
>>>>>>> a3614589a1533beab59ef8eae3ef0100eaa81ce5
            const reviews = await reviewsCollection
                .find({ parkId })
                .sort({ createdAt: -1 })
                .toArray();
<<<<<<< HEAD
            console.log('Found reviews:', reviews.length);
=======
            console.log('Found reviews:', reviews.length); // Debug log
>>>>>>> a3614589a1533beab59ef8eae3ef0100eaa81ce5
            res.status(200).json(reviews);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            res.status(500).json({ error: 'Failed to fetch reviews' });
        }
    });

<<<<<<< HEAD
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
=======
    // Add a new review for a park
    router.post('/parks/:id/reviews', async (req, res) => {
        try {
            const parkId = req.params.id;
            const { ratings, comment, userId } = req.body;

            // Validate inputs
            if (!ratings || !ratings.views || !ratings.location || !ratings.amenities) {
                return res.status(400).json({ 
                    error: 'All ratings (views, location, amenities) are required' 
                });
            }

            if (!comment) {
                return res.status(400).json({ error: 'Comment is required' });
            }

            // Validate all ratings are between 1-5
            const ratingValues = [ratings.views, ratings.location, ratings.amenities];
            if (ratingValues.some(r => r < 1 || r > 5)) {
                return res.status(400).json({ 
                    error: 'All ratings must be between 1 and 5' 
                });
            }

            // Calculate overall rating
            const overallRating = (ratings.views + ratings.location + ratings.amenities) / 3;

            const newReview = {
                parkId,
                userId: userId || 'anonymous',
                ratings: {
                    views: Number(ratings.views),
                    location: Number(ratings.location),
                    amenities: Number(ratings.amenities),
                    overall: Number(overallRating.toFixed(1))
                },
>>>>>>> a3614589a1533beab59ef8eae3ef0100eaa81ce5
                comment,
                createdAt: new Date(),
            };

            const result = await reviewsCollection.insertOne(newReview);
<<<<<<< HEAD
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
=======
            
            const createdReview = { ...newReview, _id: result.insertedId };
            res.status(201).json(createdReview);
        } catch (err) {
            console.error('Error adding review:', err);
            res.status(500).json({ error: 'Failed to add review' });
>>>>>>> a3614589a1533beab59ef8eae3ef0100eaa81ce5
        }
    });

    return router;
};