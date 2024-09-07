const express = require('express')
const router = express.Router();


router.get('/', (req, res) => {

    console.log(req.params)
    res.json(req.params);
});

module.exports = router