const express = require('express');
const cors = require('cors');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://hugoputigna:SzyF0sJk6Z40f1Uh@cardcluster.eup3fgb.mongodb.net/?retryWrites=true&w=majority&appName=CardCluster';
const client = new MongoClient(url);
client.connect();
app.use(cors({
    origin: true, // Replace with your frontend's origin
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));
//app.use(bodyParser.json())

async function connectDB() {
    try {
        await client.connect();
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Failed');
    }
}
connectDB();

app.use(express.json());
app.use((req, res, next) => {
    app.get("/api/ping", (req, res, next) => {
        res.status(200).json({ message: "Hello World" });
    });
    res.setHeader('Access-Control-Allow-Origin',
        '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});

app.post('/api/login', async (req, res, next) => {
    // incoming: login, password
    // outgoing: id, firstName, lastName, error
    var error = '';
    const { login, password } = req.body;
    const db = client.db('COP4331Cards');
    const results = await db.collection('users').find({ Login: login, Password: password }).toArray();
    var id = -1;
    var fn = '';
    var ln = '';
    if (results.length > 0) {
        id = results[0].UserID;
        fn = results[0].FirstName;
        ln = results[0].LastName;
    }
    var ret = { id: id, firstName: fn, lastName: ln, error: '' };
    res.status(200).json(ret);
});


app.post('/api/register', (req, res) => {
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

// Get all parks
app.get('/api/parks', async (req, res) => {
    try {
        const parks = await parksCollection.find().toArray();
        res.status(200).json(parks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch parks' });
    }
});

// Get a specific park by ID
app.get('/api/parks/:id', async (req, res) => {
    try {
        const park = await parksCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!park) return res.status(404).json({ error: 'Park not found' });
        res.status(200).json(park);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch park' });
    }
});

// Add a new park
app.post('/api/parks', async (req, res) => {
    try {
        const newPark = req.body;
        const result = await parksCollection.insertOne(newPark);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add park' });
    }
});

// Submit a ranking for a park
app.post('/api/parks/:id/rank', async (req, res) => {
    try {
        const { userId, ratings, comment } = req.body; // ratings = { price, views, other }
        const park = await parksCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!park) return res.status(404).json({ error: 'Park not found' });

        // Add the new ranking
        const newRanking = { userId, ratings, comment };
        const updatedRankings = [...park.rankings, newRanking];

        // Calculate new average ratings
        const totalRatings = updatedRankings.length;
        const averageRatings = updatedRankings.reduce(
            (acc, r) => {
                acc.price += r.ratings.price;
                acc.views += r.ratings.views;
                acc.other += r.ratings.other;
                return acc;
            },
            { price: 0, views: 0, other: 0 }
        );

        averageRatings.price /= totalRatings;
        averageRatings.views /= totalRatings;
        averageRatings.other /= totalRatings;

        // Update the park document
        await parksCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { rankings: updatedRankings, averageRatings } }
        );

        res.status(200).json({ message: 'Ranking submitted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to submit ranking' });
    }
});

// Update park details
app.put('/api/parks/:id', async (req, res) => {
    try {
        const updatedPark = req.body;
        const result = await parksCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updatedPark }
        );
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update park' });
    }
});

// Delete a park
app.delete('/api/parks/:id', async (req, res) => {
    try {
        const result = await parksCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete park' });
    }
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});
