// backend\routes\auth.js
const express = require('express');
const { register, login, logout } = require('../controllers/auth');
const { body } = require('express-validator'); // Для валидации

const router = express.Router();

// Маршрут для регистрации нового пользователя
router.post('/register', [
    body('username').trim().notEmpty().withMessage('Имя пользователя обязательно'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен быть минимум 6 символов')
], register);

// Маршрут для входа пользователя
router.post('/login', [
    body('username').trim().notEmpty().withMessage('Имя пользователя обязательно'),
    body('password').notEmpty().withMessage('Пароль обязателен')
], login);

// Маршрут для выхода пользователя (опционально, можно использовать GET /logout)
// router.post('/logout', logout); // Или реализовать POST logout endpoint если нужно

module.exports = router;