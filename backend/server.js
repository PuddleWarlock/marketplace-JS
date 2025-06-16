
require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const routes = require('./routes');
const connectDB = require('./middlewares/db');
const { logRequest, logError } = require('./utils/logger');

const server = express();


connectDB();


server.use(logRequest);


server.use(express.json());
server.use(express.urlencoded({ extended: true }));



server.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));


server.set('view engine', 'ejs');
server.set('views', path.join(__dirname, 'views'));


const authMiddleware = require('./middlewares/auth');






server.get('/', (req, res) => {
    res.render('layout', {
        title: 'Главная страница',
        user: req.session.user,
        pageTemplate: 'pages/index'
    });
});


server.get('/admin', authMiddleware, (req, res) => {
    res.render('layout', {
        title: 'Панель Администратора',
        user: req.session.user,
        pageTemplate: 'pages/admin'
    });
});


server.get('/contact', (req, res) => {
    res.render('layout', {
        title: 'Обратная связь',
        user: req.session.user,
        pageTemplate: 'pages/contact'
    });
});


server.get('/auth', (req, res) => {

    if (req.session.user) {
        return res.redirect('/admin');
    }
    res.render('layout', {
        title: 'Вход и Регистрация',
        user: null,
        error: req.query.error,
        pageTemplate: 'pages/auth'
    });
});


server.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Ошибка при выходе:', err);
        }
        res.redirect('/auth');
    });
});



server.use('/api', routes);




server.use(express.static(path.join(__dirname, 'public')));




server.use((req, res, next) => {
    res.status(404).render('layout', {
        title: 'Страница не найдена',
        user: req.session.user,
        pageTemplate: 'pages/404'
    });
});


server.use((err, req, res, next) => {
    logError(req, err);
    console.error(err.stack);


    const statusCode = err.status || 500;


    if (req.originalUrl.startsWith('/api/')) {
        res.status(statusCode).json({ error: err.message || 'Внутренняя ошибка сервера' });
    } else {


        res.status(statusCode).render('layout', {
            title: `Ошибка ${statusCode}`,
            user: req.session.user,
            pageTemplate: 'pages/error',
            errorStatus: statusCode,
            errorMessage: err.message || 'Что-то пошло не так! Пожалуйста, попробуйте позже или свяжитесь с поддержкой.'
        });
    }
});



const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});