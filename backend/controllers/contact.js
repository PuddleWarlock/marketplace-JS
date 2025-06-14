// backend\controllers\contact.js
const ContactMessage = require('../models/contact');
const { validationResult } = require('express-validator');

// Вспомогательная функция для обработки ошибок валидации (уже есть в auth, но лучше иметь локально или в общем файле)
// Если решите сделать handleValidationErrors общим, удалите его из auth.js и contact.js и импортируйте.
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};


const sendContactMessage = async (req, res, next) => {
    // Валидация уже выполнена
    const { name, email, message } = req.body;

    try {
        // Создаем и сохраняем новое сообщение
        const newMessage = new ContactMessage({ name, email, message });
        await newMessage.save();

        // 201 Created - успешное создание ресурса
        res.status(201).json({ message: 'Ваше сообщение успешно отправлено!' });

    } catch (error) {
        next(error); // Передаем ошибку дальше, включая ошибки валидации Mongoose
    }
};

const getContactMessages = async (req, res, next) => {
    try {
        // Находим все сообщения обратной связи
        const messages = await ContactMessage.find({}).sort({ createdAt: -1 }); // Сортируем по дате создания (новые сверху)
        // 200 OK - успешный запрос
        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
};


module.exports = {
    sendContactMessage,
    getContactMessages, // Экспортируем новую функцию
    handleValidationErrors // Экспортируем для использования в маршрутах contact
};