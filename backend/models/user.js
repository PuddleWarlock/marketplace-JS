// backend\models\user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Для хэширования паролей

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, // Username должен быть уникальным
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Middleware Mongoose: хэшируем пароль перед сохранением
userSchema.pre('save', async function(next) {
    // 'this' относится к документу, который сохраняется (новому пользователю)
    if (!this.isModified('password')) { // Проверяем, был ли пароль изменен (нужно при обновлении пользователя)
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10); // Генерируем "соль"
        this.password = await bcrypt.hash(this.password, salt); // Хэшируем пароль
        next();
    } catch (err) {
        next(err); // Передаем ошибку дальше
    }
});

// Метод для сравнения введенного пароля с хэшем в БД
userSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model('User', userSchema);