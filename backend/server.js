const express = require('express');
const cors = require('cors');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://hugoputigna:SzyF0sJk6Z40f1Uh@cardcluster.eup3fgb.mongodb.net/?retryWrites=true&w=majority&appName=CardCluster';
const client = new MongoClient(url);
client.connect();
app.use(cors({
    origin: 'http://134.199.193.253:3000/', // Replace with your frontend's origin
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));
//app.use(bodyParser.json())

async function connectDB() {
  try {
    await client.connect();
    console.log('MongoDB Connected');
  } catch(err) {
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
    const { login, password, firstName, lastName} = req.body;

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

app.listen(5000, () => {
    console.log('Server running on port 5000');
});
