
const express = require('express');
const { sendContactMessage, getContactMessages, handleValidationErrors } = require('../controllers/contact');
const authMiddleware = require('../middlewares/auth');
const { body } = require('express-validator');

const router = express.Router();


router.post('/', [
    body('name').trim().notEmpty().withMessage('Имя обязательно'),
    body('email').isEmail().withMessage('Некорректный формат email'),
    body('message').trim().notEmpty().withMessage('Сообщение обязательно')
], handleValidationErrors, sendContactMessage);


router.get('/messages', authMiddleware, getContactMessages);


module.exports = router;