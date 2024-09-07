const express = require('express')
const router = express.Router();


router.get('/', (req, res) => {

    console.log(req)
    res.json(1984251505);
});

module.exports = router