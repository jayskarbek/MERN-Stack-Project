// Imports
const express = require('express');
const cors = require('cors');
const app = express();

// MongoDB Consts
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://hugoputigna:SzyF0sJk6Z40f1Uh@cardcluster.eup3fgb.mongodb.net/?retryWrites=true&w=majority&appName=CardCluster';
const client = new MongoClient(url);

// App settup
app.use(cors({
    origin: 'http://134.199.193.253:5100/', // Replace with your frontend's origin
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));
app.use(express.json());

// Connect to Database
async function connectDB() {
    try {
        await client.connect();
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Failed');
    }
}
connectDB();
const db = client.db('COP4331Cards');

app.use((req, res, next) => {
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

// Define routes
const pingRoute = require('./routes/ping')(db);
app.use('/api', pingRoute);

const loginRoute = require('./routes/login')(db);
app.use('/api', loginRoute);

const registerRoute = require('./routes/register')(db);
app.use('/api', registerRoute);

const parksRoute = require('./routes/parks')(db);
app.use('/api', parksRoute);

// Starts the server
app.listen(5000, () => {
    console.log('Server running on port 5000');
});
