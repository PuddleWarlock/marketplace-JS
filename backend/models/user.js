// backend\models\user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Для хэширования паролей

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true, lowercase: true }, // Trim и lowercase для чистоты
    password: { type: String, required: true, minlength: 6 }, // Минимальная длина пароля
    createdAt: { type: Date, default: Date.now }
});

// Middleware Mongoose: хэшируем пароль перед сохранением
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Метод для сравнения введенного пароля с хэшем в БД
userSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model('User', userSchema);