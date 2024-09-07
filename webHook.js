const express = require('express')
const {log} = require("winston");
const router = express.Router();


router.get('/', (req, res) => {
    console.log(req.query['hub.challenge']);
    console.log(req.query['hub.challenge'])
    res.send(req.query['hub.challenge'])
});

module.exports = router