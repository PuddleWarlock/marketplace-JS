
const User = require('../models/user');
const { validationResult } = require('express-validator');



const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        return res.status(400).json({ errors: errors.array() });
    }
    next();
};


const register = async (req, res, next) => {

    const { username, password } = req.body;

    try {

        const user = await User.findOne({ username: username.toLowerCase() });
        if (user) {

            return res.status(409).json({ error: 'Пользователь с таким именем уже существует' });
        }


        const newUser = new User({ username: username.toLowerCase(), password });
        await newUser.save();


        req.session.user = { id: newUser._id, username: newUser.username };


        res.status(201).json({ message: 'Пользователь успешно зарегистрирован', user: { id: newUser._id, username: newUser.username } });

    } catch (error) {

        next(error);
    }
};

const login = async (req, res, next) => {

    const { username, password } = req.body;

    try {

        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {

            return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
        }


        const isMatch = await user.comparePassword(password);
        if (!isMatch) {

            return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
        }


        req.session.user = { id: user._id, username: user.username };


        res.status(200).json({ message: 'Авторизация успешна', user: { id: user._id, username: user.username } });

    } catch (error) {
        next(error);
    }
};

const getUsers = async (req, res, next) => {
    try {

        const users = await User.find({}, { password: 0, __v: 0 });

        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};


module.exports = {
    register,
    login,
    getUsers,
    handleValidationErrors
};