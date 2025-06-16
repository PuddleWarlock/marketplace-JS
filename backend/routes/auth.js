
const express = require('express');
const { register, login, getUsers, handleValidationErrors } = require('../controllers/auth');
const authMiddleware = require('../middlewares/auth');
const { body } = require('express-validator');

const router = express.Router();


router.post('/register', [
    body('username').trim().notEmpty().withMessage('Имя пользователя обязательно'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен быть минимум 6 символов')
], handleValidationErrors, register);


router.post('/login', [
    body('username').trim().notEmpty().withMessage('Имя пользователя обязательно'),
    body('password').notEmpty().withMessage('Пароль обязателен')
], handleValidationErrors, login);




router.get('/users', authMiddleware, getUsers);


module.exports = router;