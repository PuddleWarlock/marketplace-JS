// backend\controllers\auth.js
const User = require('../models/user');
const { validationResult } = require('express-validator');

const register = async (req, res) => {
    // Проверяем результаты валидации из маршрута
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Если есть ошибки валидации, отправляем их в JSON формате
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        // Проверяем, существует ли пользователь с таким именем
        let user = await User.findOne({ username });
        if (user) {
            return res.status(409).json({ error: 'Пользователь с таким именем уже существует' });
        }

        // Создаем нового пользователя (пароль будет захэширован middleware в модели)
        user = new User({ username, password });
        await user.save();

        // Автоматически авторизуем пользователя после регистрации (опционально)
        req.session.user = { id: user._id, username: user.username }; // Сохраняем пользователя в сессии

        // Отправляем успешный ответ
        res.status(201).json({ message: 'Пользователь успешно зарегистрирован', user: { id: user._id, username: user.username } });

    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ error: 'Ошибка сервера при регистрации' });
    }
};

const login = async (req, res) => {
    // Проверяем результаты валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        // Находим пользователя по имени
        const user = await User.findOne({ username });
        if (!user) {
            // Отправляем 401 (Unauthorized) или 400 (Bad Request) при неверных учетных данных
            return res.status(400).json({ error: 'Неверное имя пользователя или пароль' });
        }

        // Сравниваем введенный пароль с хэшем из БД
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Неверное имя пользователя или пароль' });
        }

        // Если учетные данные верны, авторизуем пользователя, сохраняя его в сессии
        req.session.user = { id: user._id, username: user.username };

        // Отправляем успешный ответ
        res.status(200).json({ message: 'Авторизация успешна', user: { id: user._id, username: user.username } });

    } catch (error) {
        console.error('Ошибка при входе:', error);
        res.status(500).json({ error: 'Ошибка сервера при входе' });
    }
};

// Функция logout не обязательна в контроллере, т.к. мы обрабатываем GET /logout прямо в server.js
// const logout = (req, res) => { ... };


module.exports = {
    register,
    login,
    // logout
};