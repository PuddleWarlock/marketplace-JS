// backend\routes\contact.js
const express = require('express');
const { sendContactMessage, getContactMessages, handleValidationErrors } = require('../controllers/contact'); // Импортируем handleValidationErrors и getContactMessages
const authMiddleware = require('../middlewares/auth'); // Импортируем authMiddleware
const { body } = require('express-validator');

const router = express.Router();

// Маршрут для отправки сообщения обратной связи
router.post('/', [
    body('name').trim().notEmpty().withMessage('Имя обязательно'),
    body('email').isEmail().withMessage('Некорректный формат email'),
    body('message').trim().notEmpty().withMessage('Сообщение обязательно')
], handleValidationErrors, sendContactMessage); // Применяем handleValidationErrors

// Маршрут для получения сообщений обратной связи (доступен только авторизованным админам)
router.get('/messages', authMiddleware, getContactMessages);


module.exports = router;