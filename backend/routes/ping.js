const express = require('express');

module.exports = function (db) {
    const router = express.Router();

    router.get("/ping", (req, res, next) => {
        res.status(200).json({ message: "Hello World" });
    });

    return router;
}