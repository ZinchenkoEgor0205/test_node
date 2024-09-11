const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const CREDENTIALS = require('./credentials');



const authenticateToken = (req, res, next) => {
    const token = req.cookies['token'];
    if (!token) return res.status(401).json({ message: 'Token is missing' });

    jwt.verify(token, CREDENTIALS.jwtSecret, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });

        req.user = user;
        next();
    });
};

/**
 * @swagger
 * protected/:
 *   get:
 *     summary: Access a protected route
 *     description: This endpoint is protected and requires a valid JWT token to access. The token must be provided in the Authorization header as a token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully accessed the protected route.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This is a protected route
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: john_doe
 *       401:
 *         description: Unauthorized, token is missing or invalid
 *       403:
 *         description: Forbidden, token is invalid or expired
 */
router.get('/', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router