// backend\server.js (обновленный код без express-ejs-layouts)
const express = require('express');
const path = require('path');
// const expressLayouts = require('express-ejs-layouts'); // УДАЛИТЬ
const session = require('express-session');
const routes = require('./routes');
const connectDB = require('./middlewares/db');
const { logRequest, logError } = require('./utils/logger');
// const cors = require('cors');

const server = express();

// Connect to MongoDB
connectDB();

// Middlewares
server.use(logRequest);

// Парсеры
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Сессии
server.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Настройка View Engine (EJS)
server.set('view engine', 'ejs');
server.set('views', path.join(__dirname, 'views'));

// server.use(expressLayouts); // УДАЛИТЬ
// server.set('layout', 'layout'); // УДАЛИТЬ

// Обслуживание статических файлов (после парсеров и сессий, до 404)
server.use(express.static(path.join(__dirname, 'public')));


// Импортируем middleware авторизации после настройки сессий
const authMiddleware = require('./middlewares/auth');


// --- Маршруты для страниц ---
// Теперь рендерим layout, передавая в него pageTemplate

// Главная страница (список продуктов)
server.get('/', (req, res) => {
    console.log('Rendering index page...');
    res.render('layout', { // Рендерим макет
        title: 'Главная страница',
        user: req.session.user,
        pageTemplate: 'pages/index' // Указываем макету, какой файл контента включить
        // Здесь можно передать другие данные, специфичные для главной страницы, если они нужны в pageTemplate
    });
});

// Панель администратора
server.get('/admin', authMiddleware, (req, res) => { // Защищаем страницу админки
    console.log('Rendering admin page...');
    res.render('layout', { // Рендерим макет
        title: 'Панель Администратора',
        user: req.session.user,
        pageTemplate: 'pages/admin' // Контент админки
        // Здесь можно передать данные для админки (например, список продуктов)
    });
});

// Страница обратной связи
server.get('/contact', (req, res) => {
    console.log('Rendering contact page...');
    res.render('layout', { // Рендерим макет
        title: 'Обратная связь',
        user: req.session.user,
        pageTemplate: 'pages/contact' // Контент формы обратной связи
        // ... данные для страницы обратной связи ...
    });
});

// Страница регистрации и входа
server.get('/auth', (req, res) => {
    console.log('Rendering auth page...');
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('layout', { // Рендерим макет
        title: 'Вход и Регистрация',
        user: null, // Для этой страницы пользователя нет
        error: req.query.error, // Передаем ошибку из URL
        pageTemplate: 'pages/auth' // Контент форм входа/регистрации
    });
});

// Маршрут для выхода
server.get('/logout', (req, res) => {
    console.log('Logging out...');
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/auth');
    });
});


// --- Маршруты для API ---
server.use('/api', routes);


// --- Обработка 404 ---
server.use((req, res, next) => {
    console.log('Handling 404...');
    res.status(404).render('layout', { // Рендерим макет для 404
        title: 'Страница не найдена',
        user: req.session.user,
        pageTemplate: 'pages/404' // Контент 404
    });
});

// --- Middleware для обработки ошибок ---
server.use((err, req, res, next) => {
    logError(req, err);
    console.error(err.stack);

    const statusCode = err.status || 500;

    if (req.originalUrl.startsWith('/api/')) {
        res.status(statusCode).json({ error: err.message || 'Внутренняя ошибка сервера' });
    } else {
        // При рендеринге страницы ошибки, тоже используем макет
        res.status(statusCode).render('layout', {
            title: `Ошибка ${statusCode}`,
            user: req.session.user,
            pageTemplate: 'pages/error', // Указываем шаблон для контента ошибки (нужно создать error.ejs)
            errorStatus: statusCode, // Передаем статус ошибки в шаблон
            errorMessage: err.message || 'Что-то пошло не так!' // Передаем сообщение ошибки
        });
    }
});


// Start server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});