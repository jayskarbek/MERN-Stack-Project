const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your frontend's origin
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));
//app.use(bodyParser.json());
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
    var id = -1;
    var fn = '';
    var ln = '';
    if (login.toLowerCase() == 'rickl' && password == 'COP4331') {
        id = 1;
        fn = 'Rick';
        ln = 'Leinecker';
    }
    else {
        error = 'Invalid user name/password';
    }
    var ret = { id: id, firstName: fn, lastName: ln, error: error };
    res.status(200).json(ret);
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});
