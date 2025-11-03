const express = require('express');
const { ObjectId } = require('mongodb');

module.exports = function (db) {
    const router = express.Router();
    const parksCollection = db.collection('Parks');
    const reviewsCollection = db.collection('Reviews');

    // Get all parks
    router.get('/parks', async (req, res) => {
        try {
            const parks = await parksCollection.find().toArray();
            res.status(200).json(parks);
        } catch (err) {
            console.error('Error fetching parks:', err);
            res.status(500).json({ error: 'Failed to fetch parks' });
        }
    });

    // Get a specific park by ID
    router.get('/parks/:id', async (req, res) => {
        try {
            const park = await parksCollection.findOne({ _id: new ObjectId(req.params.id) });
            if (!park) return res.status(404).json({ error: 'Park not found' });
            res.status(200).json(park);
        } catch (err) {
            console.error('Error fetching park:', err);
            res.status(500).json({ error: 'Failed to fetch park' });
        }
    });

    // Get reviews for a specific park
    router.get('/parks/:id/reviews', async (req, res) => {
        try {
            const parkId = req.params.id;
            console.log('Fetching reviews for parkId:', parkId); // Debug log
            const reviews = await reviewsCollection
                .find({ parkId })
                .sort({ createdAt: -1 })
                .toArray();
            console.log('Found reviews:', reviews.length); // Debug log
            res.status(200).json(reviews);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            res.status(500).json({ error: 'Failed to fetch reviews' });
        }
    });

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
                comment,
                createdAt: new Date(),
            };

            const result = await reviewsCollection.insertOne(newReview);
            
            const createdReview = { ...newReview, _id: result.insertedId };
            res.status(201).json(createdReview);
        } catch (err) {
            console.error('Error adding review:', err);
            res.status(500).json({ error: 'Failed to add review' });
        }
    });

    return router;
};