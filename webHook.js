const express = require('express')
const router = express.Router();


router.get('/', (req, res) => {

    console.log(req.params['hub.challenge'])
    res.json(req.params['hub.challenge']);
});

module.exports = router