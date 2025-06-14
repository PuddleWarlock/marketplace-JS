// backend\routes\products.js
const express = require('express');
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    sortProducts,
    handleValidationErrors // Импортируем
} = require('../controllers/products');

const authMiddleware = require('../middlewares/auth'); // Импортируем authMiddleware
const { body, param, query } = require('express-validator'); // Импортируем body, param, query

const router = express.Router();

// Маршрут для сортировки (доступен всем)
router.get('/sort', [
    query('by').optional().trim().notEmpty().withMessage('Поле сортировки не может быть пустым'),
    query('order').optional().trim().isIn(['asc', 'desc', '1', '-1']).withMessage('Некорректный порядок сортировки (asc, desc, 1, -1)')
], handleValidationErrors, sortProducts);

// Маршрут для получения всех продуктов (доступен всем)
router.get('/', getProducts);

// Маршрут для получения продукта по ID (доступен всем)
router.get('/:id', [
    param('id').isMongoId().withMessage('Некорректный ID продукта')
], handleValidationErrors, getProductById);

// Маршруты для добавления, обновления, удаления доступны только авторизованным админам
// В этой простой реализации authMiddleware проверяет просто авторизацию любого пользователя
// Для реальной админки нужна более сложная проверка ролей (is_admin и т.п.)

// Маршрут для создания продукта (доступен только админам)
router.post('/', authMiddleware, [
    body('name').trim().notEmpty().withMessage('Название продукта обязательно'),
    body('seller').trim().notEmpty().withMessage('Продавец обязателен'),
    body('price').isFloat({ gt: 0 }).withMessage('Цена должна быть положительным числом'),
    body('category').trim().notEmpty().withMessage('Категория обязательна'),
    body('quantity').isInt({ gt: -1 }).withMessage('Количество должно быть целым неотрицательным числом')
], handleValidationErrors, createProduct);

// Маршрут для обновления продукта (доступен только админам)
router.put('/:id', authMiddleware, [
    param('id').isMongoId().withMessage('Некорректный ID продукта'),
    // Делаем поля опциональными при обновлении, т.к. может обновляться не все
    body('name').optional().trim().notEmpty().withMessage('Название продукта не может быть пустым'),
    body('seller').optional().trim().notEmpty().withMessage('Продавец не может быть пустым'),
    body('price').optional().isFloat({ gt: 0 }).withMessage('Цена должна быть положительным числом'),
    body('category').optional().trim().notEmpty().withMessage('Категория не может быть пустой'),
    body('quantity').optional().isInt({ gt: -1 }).withMessage('Количество должно быть целым неотрицательным числом')
], handleValidationErrors, updateProduct);

// Маршрут для удаления продукта (доступен только админам)
router.delete('/:id', authMiddleware, [
    param('id').isMongoId().withMessage('Некорректный ID продукта')
], handleValidationErrors, deleteProduct);


module.exports = router;