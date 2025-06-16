
const ContactMessage = require('../models/contact');
const { validationResult } = require('express-validator');



const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};


const sendContactMessage = async (req, res, next) => {

    const { name, email, message } = req.body;

    try {

        const newMessage = new ContactMessage({ name, email, message });
        await newMessage.save();


        res.status(201).json({ message: 'Ваше сообщение успешно отправлено!' });

    } catch (error) {
        next(error);
    }
};

const getContactMessages = async (req, res, next) => {
    try {

        const messages = await ContactMessage.find({}).sort({ createdAt: -1 });

        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
};


module.exports = {
    sendContactMessage,
    getContactMessages,
    handleValidationErrors
};