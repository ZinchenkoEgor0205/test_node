const express = require('express')
const router = express.Router();


router.get('/', (req, res) => {

    console.log(1111)
    res.json("test");
});

module.exports = router