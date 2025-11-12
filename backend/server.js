require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

// MongoDB Consts
const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODB_URI || 'mongodb+srv://hugoputigna:SzyF0sJk6Z40f1Uh@cardcluster.eup3fgb.mongodb.net/?retryWrites=true&w=majority&appName=CardCluster';
const client = new MongoClient(url);

const allowedOrigins = (process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : [
        'http://localhost:3000',
        'http://localhost:5000',
        'http://localhost:5100',
        'http://localhost:5173',
        'http://134.199.193.253:5100',
        'https://ratingflstateparks.xyz',
        'http://192.168.7.223:5000'
    ]);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || origin.startsWith('http://localhost')) {
            return callback(null, true);
        }
        console.warn(`CORS blocked origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true
}));
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (allowedOrigins.includes(origin) || origin.startsWith('http://localhost'))) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});
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

// Define routes
const pingRoute = require('./routes/ping')(db);
app.use('/api', pingRoute);

const loginRoute = require('./routes/login')(db);
app.use('/api', loginRoute);

const registerRoute = require('./routes/register')(db);
app.use('/api', registerRoute);

const parksRoute = require('./routes/parks')(db);
app.use('/api', parksRoute);

const passwordRoute = require('./routes/password')(db);
app.use('/api', passwordRoute);

const verifyRoute = require('./routes/verify')(db);
app.use('/verify', verifyRoute);


// Starts the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
