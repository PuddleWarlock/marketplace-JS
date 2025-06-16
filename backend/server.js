// backend\server.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const routes = require('./routes'); // API маршруты
const connectDB = require('./middlewares/db');
const { logRequest, logError } = require('./utils/logger');

const server = express();

// Connect to MongoDB
connectDB();

// Middlewares - Применяем в правильном порядке
server.use(logRequest); // 1. Ваш middleware для логирования запросов

// 2. Для парсинга тела запроса (JSON и формы)
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// 3. Настройка сессий (для простой авторизации страниц)
// ВАЖНО: secret должен быть уникальным и храниться в безопасном месте (например, в переменных окружения)
server.use(session({
    secret: process.env.SESSION_SECRET, // Используем переменную окружения или дефолт
    resave: false,
    saveUninitialized: false, // Не сохранять сессии без данных
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // secure: true для HTTPS в продакшне, maxAge для срока жизни
}));

// Настройка View Engine (EJS)
server.set('view engine', 'ejs');
server.set('views', path.join(__dirname, 'views'));

// Импортируем middleware авторизации после настройки сессий
const authMiddleware = require('./middlewares/auth');


// --- 4. Маршруты для страниц ---
// Рендерим layout, передавая в него pageTemplate и данные

// Главная страница (список продуктов)
server.get('/', (req, res) => {
    res.render('layout', {
        title: 'Главная страница',
        user: req.session.user,
        pageTemplate: 'pages/index'
    });
});

// Панель администратора (защищено авторизацией)
server.get('/admin', authMiddleware, (req, res) => {
    res.render('layout', {
        title: 'Панель Администратора',
        user: req.session.user,
        pageTemplate: 'pages/admin'
    });
});

// Страница обратной связи
server.get('/contact', (req, res) => {
    res.render('layout', {
        title: 'Обратная связь',
        user: req.session.user,
        pageTemplate: 'pages/contact'
    });
});

// Страница регистрации и входа
server.get('/auth', (req, res) => {
    // Если пользователь уже авторизован, перенаправляем на главную или админку
    if (req.session.user) {
        return res.redirect('/admin'); // Перенаправляем на админку, если вошел
    }
    res.render('layout', {
        title: 'Вход и Регистрация',
        user: null, // На этой странице пользователя нет
        error: req.query.error, // Передаем возможную ошибку из URL (например, при редиректе из authMiddleware)
        pageTemplate: 'pages/auth'
    });
});

// Маршрут для выхода (GET запрос для простоты)
server.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Ошибка при выходе:', err);
        }
        res.redirect('/auth'); // Перенаправляем на страницу входа
    });
});


// --- 5. Маршруты для API ---
server.use('/api', routes);


// --- 6. Обслуживание статических файлов ---
// Этот middleware должен быть после маршрутов страниц и API
server.use(express.static(path.join(__dirname, 'public')));


// --- 7. Обработка 404 - Not Found ---
// Этот middleware будет вызван, если ни один из предыдущих маршрутов (страницы, API, статика) не подошел
server.use((req, res, next) => {
    res.status(404).render('layout', { // Рендерим макет для 404
        title: 'Страница не найдена',
        user: req.session.user, // Передаем пользователя на 404 тоже
        pageTemplate: 'pages/404'
    });
});

// --- 8. Middleware для обработки ошибок ---
server.use((err, req, res, next) => {
    logError(req, err); // Логируем ошибку сервера
    console.error(err.stack); // Выводим стек ошибки в консоль сервера

    // Определяем статус код ошибки (по умолчанию 500 Internal Server Error)
    const statusCode = err.status || 500;

    // Отправляем пользователю JSON для API запросов или HTML страницу для обычных запросов
    if (req.originalUrl.startsWith('/api/')) {
        res.status(statusCode).json({ error: err.message || 'Внутренняя ошибка сервера' });
    } else {
        // Рендерим страницу ошибки с использованием макета
        // Передаем статус и сообщение ошибки в шаблон
        res.status(statusCode).render('layout', {
            title: `Ошибка ${statusCode}`,
            user: req.session.user,
            pageTemplate: 'pages/error', // Шаблон для контента ошибки
            errorStatus: statusCode,
            errorMessage: err.message || 'Что-то пошло не так! Пожалуйста, попробуйте позже или свяжитесь с поддержкой.'
        });
    }
});


// Start server
const PORT = process.env.PORT; // Используем переменную окружения или дефолт
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});