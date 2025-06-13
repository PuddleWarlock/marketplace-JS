// backend\routes\index.js
const express = require('express');
const productRoutes = require('./products');
const infoRoutes = require('./info');
const authRoutes = require('./auth'); // Импортируем
const contactRoutes = require('./contact'); // Импортируем

const router = express.Router();

// Ваши существующие API маршруты
router.use('/products', productRoutes);
router.use('/info', infoRoutes);

// Новые API маршруты
router.use('/auth', authRoutes); // Добавляем
router.use('/contact', contactRoutes); // Добавляем

module.exports = router;