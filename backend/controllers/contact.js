// backend\controllers\contact.js
const ContactMessage = require('../models/contact');
const { validationResult } = require('express-validator');

const sendContactMessage = async (req, res) => {
    // Проверяем результаты валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Если есть ошибки валидации, отправляем их в JSON формате
        // В случае формы на странице, JS на клиенте должен будет их обработать и показать пользователю
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    try {
        // Создаем и сохраняем новое сообщение
        const newMessage = new ContactMessage({ name, email, message });
        await newMessage.save();

        // Отправляем успешный ответ
        // В случае формы на странице, JS на клиенте должен будет показать это сообщение
        res.status(201).json({ message: 'Ваше сообщение успешно отправлено!' });

    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        res.status(500).json({ error: 'Ошибка сервера при отправке сообщения' });
    }
};

module.exports = {
    sendContactMessage
};