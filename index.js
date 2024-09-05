const express = require('express');
const winston = require('winston');
const cors = require('cors')
const cookieParser = require('cookie-parser');

// Add cookie-parser middleware

const {swaggerUi, swaggerSpec} = require('./swagger');
const loginRouter = require('./login');
const protectedRouter = require('./protected')

const app = express();
const port = 8000;

app.use(cookieParser());
app.use(cors({origin: true, credentials: true}));

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({filename: 'logs/combined.log'}),
    ],
});

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            requestBody: req.body,
            responseBody: res.locals.responseData, // Assuming you've saved the response data in res.locals
            requestOrigin: req.headers.origin // Log the request origin URL
        });
    });
    next();
});


app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/auth', loginRouter);
app.use('/protected', protectedRouter);


app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`);
});

app.get('/', (req, res) => {
    const a = req.originalUrl
    console.log(a)
    res.json({ url: a });
});


module.exports = app;
