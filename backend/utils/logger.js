const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const logFilePath = path.join(__dirname, '..', 'logs', 'requests.log');

// Middleware для логирования запросов
const logRequest = (req, res, next) => {
    const requestId = uuidv4();
    req.requestId = requestId;

    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logEntry = `${new Date().toISOString()} | ID: ${requestId} | Method: ${req.method} | URL: ${req.originalUrl} | Status: ${res.statusCode} | Duration: ${duration}ms\n`;

        fs.appendFile(logFilePath, logEntry, (err) => {
            if (err) {
                console.error('Error writing log:', err);
            }
        });
    });

    res.on('error', (error) => {
        logError(req, error);
    });

    next();
};

// Логирование ошибок
const logError = (req, error) => {
    const errorEntry = `${new Date().toISOString()} | ID: ${req.requestId || 'N/A'} | Method: ${req.method} | URL: ${req.originalUrl} | Error: ${error.message} | Stack: ${error.stack}\n`;

    fs.appendFile(logFilePath, errorEntry, (err) => {
        if (err) {
            console.error('Error writing error log:', err);
        }
    });
};

module.exports = { logRequest, logError };
