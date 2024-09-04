const express = require('express');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - login
 *         - password
 *       properties:
 *         login:
 *           type: string
 *           description: The user's login
 *         password:
 *           type: string
 *           description: The user's password
 *       example:
 *         login: 'user123'
 *         password: 'password123'
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication
 */

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Login and password are required
 */
router.post('/', (req, res) => {
    const {login, password} = req.body;

    if (!login || !password) return res.status(400).send('Login and password are required');

    const user = {
        login,
        password
    };

    res.set("login", login)
    res.set("password", password)

    res.cookie('login', login, {
        httpOnly: false, // Cannot be accessed via JavaScript
        secure: false,   // Ensure it is sent over HTTPS
        sameSite: 'None', // Prevent CSRF attacks
    });

    res.cookie('password', password, {
        httpOnly: false, // Cannot be accessed via JavaScript
        secure: false,   // Ensure it is sent over HTTPS
        sameSite: 'None', // Prevent CSRF attacks
    });

    res.status(201).json(user);
});

module.exports = router;
