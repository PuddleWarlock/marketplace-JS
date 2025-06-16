// backend\models\contact.js
const mongoose = require('mongoose');
const { isEmail } = require('validator'); // Добавим валидатор email

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate: [isEmail, 'Некорректный формат email'] // Валидация формата email
    },
    message: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactMessage', contactSchema);