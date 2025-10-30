const express = require('express');
const { ObjectId } = require('mongodb');

module.exports = function (db) {
    const router = express.Router();
    const parksCollection = db.collection('Parks'); 

    // Get all parks
    router.get('/parks', async (req, res) => {
        try {
            const parks = await parksCollection.find().toArray();
            res.status(200).json(parks);
        } catch (err) {
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
            res.status(500).json({ error: 'Failed to fetch park' });
        }
    });

    return router;
}