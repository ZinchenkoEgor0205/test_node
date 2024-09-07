const express = require('express')
const router = express.Router();


router.get('/', (req, res) => {

    console.log(req.query['hub.challenge'])
    res.json(req.query['hub.challenge']);
});

module.exports = router