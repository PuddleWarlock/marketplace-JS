// backend\routes\auth.js
const express = require('express');
const { register, login, getUsers, handleValidationErrors } = require('../controllers/auth'); // Импортируем handleValidationErrors и getUsers
const authMiddleware = require('../middlewares/auth'); // Импортируем authMiddleware
const { body } = require('express-validator');

const router = express.Router();

// Маршрут для регистрации нового пользователя
router.post('/register', [
    body('username').trim().notEmpty().withMessage('Имя пользователя обязательно'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен быть минимум 6 символов')
], handleValidationErrors, register); // Применяем handleValidationErrors

// Маршрут для входа пользователя
router.post('/login', [
    body('username').trim().notEmpty().withMessage('Имя пользователя обязательно'),
    body('password').notEmpty().withMessage('Пароль обязателен')
], handleValidationErrors, login); // Применяем handleValidationErrors

// Маршрут для получения списка пользователей (доступен только авторизованным админам)
// В этой простой реализации authMiddleware проверяет просто авторизацию любого пользователя
// Для реальной админки нужна более сложная проверка ролей (is_admin и т.п.)
router.get('/users', authMiddleware, getUsers);


module.exports = router;