const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const CREDENTIALS = require('./credentials');
const db = require("./models");


/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 */
/**
 * @swagger
 * auth/register:
 *   post:
 *     summary: Registers a new user
 *     description: This endpoint registers a new user and hashes their password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 */
router.post('/register', async (req, res) => {
    const {username, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.sequelize.models.User.create({
        username: username,
        password: hashedPassword
    }).then(user => {
        console.log('User created:', user.toJSON());
    });
    const token = jwt.sign({username: username}, CREDENTIALS.jwtSecret, {expiresIn: '1h'});
    res.cookie('token', token)
    res.json({message: 'User registered successfully', token: token});
});

/**
 * @swagger
 * auth/login:
 *   post:
 *     summary: Logs in a user
 *     description: This endpoint logs in a user and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: JWT token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid username or password
 */
router.post('/login', async (req, res) => {
    const {username, password} = req.body;
    const user = await db.sequelize.models.User.findOne({
        where: {
            username: username
        }
    });
    // const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(400).json({message: 'Invalid username or password'});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({message: 'Invalid username or password'});
    }

    const token = jwt.sign({username: user.username}, CREDENTIALS.jwtSecret, {expiresIn: '1h'});
    res.cookie('token', token)
    res.json({token});
});


module.exports = router;
