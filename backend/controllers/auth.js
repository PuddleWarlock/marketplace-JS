// backend\controllers\auth.js
const User = require('../models/user');
const { validationResult } = require('express-validator');
// bcryptjs не импортируем здесь напрямую, т.к. сравнение в модели User.methods.comparePassword

// Вспомогательная функция для обработки ошибок валидации
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Отправляем JSON ответ с деталями ошибок валидации
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};


const register = async (req, res, next) => {
    // Валидация уже выполнена middleware в маршруте, handleValidationErrors отправил бы 400
    const { username, password } = req.body;

    try {
        // Проверяем, существует ли пользователь с таким именем
        const user = await User.findOne({ username: username.toLowerCase() }); // Ищем по нижнему регистру
        if (user) {
            // 409 Conflict - ресурс уже существует
            return res.status(409).json({ error: 'Пользователь с таким именем уже существует' });
        }

        // Создаем нового пользователя (пароль будет захэширован middleware в модели)
        const newUser = new User({ username: username.toLowerCase(), password });
        await newUser.save();

        // Автоматически авторизуем пользователя после регистрации
        req.session.user = { id: newUser._id, username: newUser.username };

        // 201 Created - успешное создание ресурса
        res.status(201).json({ message: 'Пользователь успешно зарегистрирован', user: { id: newUser._id, username: newUser.username } });

    } catch (error) {
        // Передаем ошибку дальше в центральный обработчик ошибок
        next(error);
    }
};

const login = async (req, res, next) => {
    // Валидация уже выполнена
    const { username, password } = req.body;

    try {
        // Находим пользователя по имени (ищем по нижнему регистру)
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            // 401 Unauthorized - Неверные учетные данные
            return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
        }

        // Сравниваем введенный пароль с хэшем из БД
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // 401 Unauthorized - Неверные учетные данные
            return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
        }

        // Если учетные данные верны, авторизуем пользователя, сохраняя его в сессии
        req.session.user = { id: user._id, username: user.username };

        // 200 OK - успешный вход
        res.status(200).json({ message: 'Авторизация успешна', user: { id: user._id, username: user.username } });

    } catch (error) {
        next(error);
    }
};

const getUsers = async (req, res, next) => {
    try {
        // Находим всех пользователей, исключая поле password
        const users = await User.find({}, { password: 0, __v: 0 }); // Проекция: {} - все поля, { password: 0, __v: 0 } - исключаем password и __v
        // 200 OK - успешный запрос
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};


module.exports = {
    register,
    login,
    getUsers, // Экспортируем новую функцию
    handleValidationErrors // Экспортируем для использования в маршрутах auth
};