const express = require('express');
const winston = require('winston');
const cors = require('cors')
const cookieParser = require('cookie-parser');

const {swaggerUi, swaggerSpec} = require('./swagger');
const loginRouter = require('./auth');
const protectedRouter = require('./protected')
const webhookRouter = require('./webHook')
const clientRouter = require('./clients');
const analyticsRouter = require('./orders');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cookieParser());
app.use(cors({origin: true, credentials: true, sameSite: 'None'}));

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
            responseBody: res.locals.responseData,
            requestOrigin: req.headers.origin
        });
    });
    next();
});



app.use(express.json());

app.use('/:name/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/:name/auth', loginRouter);
app.use('/:name/protected', protectedRouter);
app.use('/:name/webhook', webhookRouter)
app.use('/:name/clients', clientRouter);
app.use('/:name/orders', analyticsRouter);


app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));

app.get('/:name', (req, res) => {

    res.json('test');
});


module.exports = app;
