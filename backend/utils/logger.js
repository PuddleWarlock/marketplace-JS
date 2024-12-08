const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const logFilePath = path.join(__dirname, '..', 'logs', 'requests.log');

const logRequest = (req, res, next) => {
    const requestId = uuidv4();
    req.requestId = requestId;

    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logEntry = `${new Date().toISOString()} | ID: ${requestId} | Method: ${req.method} | URL: ${req.originalUrl} | Status: ${res.statusCode} | Duration: ${duration}ms
`;

        fs.appendFile(logFilePath, logEntry, (err) => {
            if (err) {
                console.error('Error writing log:', err);
            }
        });
    });

    next();
};

module.exports = { logRequest };
