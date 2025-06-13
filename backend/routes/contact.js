// backend\routes\contact.js
const express = require('express');
const { sendContactMessage } = require('../controllers/contact');
const { body } = require('express-validator'); // Для валидации

const router = express.Router();

// Маршрут для отправки сообщения обратной связи
router.post('/', [
    body('name').trim().notEmpty().withMessage('Имя обязательно'),
    body('email').isEmail().withMessage('Некорректный формат email'),
    body('message').trim().notEmpty().withMessage('Сообщение обязательно')
], sendContactMessage);

module.exports = router;