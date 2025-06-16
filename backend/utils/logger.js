// backend\utils\logger.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Убедимся, что папка logs существует
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)){
    fs.mkdirSync(logDir);
}
const logFilePath = path.join(logDir, 'requests.log');

// Middleware для логирования запросов
const logRequest = (req, res, next) => {
    const requestId = uuidv4();
    req.requestId = requestId; // Присваиваем ID запросу

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
        // При ошибке в процессе обработки запроса
        logError(req, error); // Используем logError с req
    });

    next();
};

// Логирование ошибок (вызывается middleware обработки ошибок или напрямую при необходимости)
const logError = (req, error) => {
    // Проверяем наличие req и requestId
    const requestId = req && req.requestId ? req.requestId : 'N/A';
    const method = req ? req.method : 'N/A';
    const url = req ? req.originalUrl : 'N/A';

    const errorEntry = `${new Date().toISOString()} | ID: ${requestId} | Method: ${method} | URL: ${url} | Error: ${error.message} | Stack: ${error.stack}\n`;
    const errorLogFilePath = path.join(logDir, 'errors.log'); // Отдельный файл для ошибок

    fs.appendFile(errorLogFilePath, errorEntry, (err) => {
        if (err) {
            console.error('Error writing error log:', err);
        }
    });
};

module.exports = { logRequest, logError };