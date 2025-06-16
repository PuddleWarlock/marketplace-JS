
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');


const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)){
    fs.mkdirSync(logDir);
}
const logFilePath = path.join(logDir, 'requests.log');


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


const logError = (req, error) => {

    const requestId = req && req.requestId ? req.requestId : 'N/A';
    const method = req ? req.method : 'N/A';
    const url = req ? req.originalUrl : 'N/A';

    const errorEntry = `${new Date().toISOString()} | ID: ${requestId} | Method: ${method} | URL: ${url} | Error: ${error.message} | Stack: ${error.stack}\n`;
    const errorLogFilePath = path.join(logDir, 'errors.log');

    fs.appendFile(errorLogFilePath, errorEntry, (err) => {
        if (err) {
            console.error('Error writing error log:', err);
        }
    });
};

module.exports = { logRequest, logError };