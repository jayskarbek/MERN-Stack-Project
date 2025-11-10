require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

// MongoDB Consts
const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODB_URI || 'mongodb+srv://hugoputigna:SzyF0sJk6Z40f1Uh@cardcluster.eup3fgb.mongodb.net/?retryWrites=true&w=majority&appName=CardCluster';
const client = new MongoClient(url);

const local = 'http://localhost:5100'
const ipaddress = 'http://134.199.193.253:5100/'

// App setup
app.use(cors({
    origin: ipaddress,
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
app.use('/api', verifyRoute);


// Starts the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
