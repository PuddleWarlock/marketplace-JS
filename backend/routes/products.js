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

const { body, param } = require('express-validator'); // Импортируем body и param

const router = express.Router();

// Маршрут для сортировки (нужен до маршрута с id)
router.get('/sort', sortProducts);

// Маршрут для получения всех продуктов
router.get('/', getProducts);

// Маршрут для получения продукта по ID
router.get('/:id', [
    param('id').isMongoId().withMessage('Некорректный ID продукта') // Валидация ID
], handleValidationErrors, getProductById); // Применяем валидацию и обработчик

// Маршрут для создания продукта
router.post('/', [
    body('name').trim().notEmpty().withMessage('Название продукта обязательно'),
    body('seller').trim().notEmpty().withMessage('Продавец обязателен'),
    body('price').isFloat({ gt: 0 }).withMessage('Цена должна быть положительным числом'),
    body('category').trim().notEmpty().withMessage('Категория обязательна'),
    body('quantity').isInt({ gt: -1 }).withMessage('Количество должно быть целым неотрицательным числом')
    // description - опциональное поле, не требует notEmpty
], handleValidationErrors, createProduct); // Применяем валидацию и обработчик

// Маршрут для обновления продукта
router.put('/:id', [
    param('id').isMongoId().withMessage('Некорректный ID продукта'), // Валидация ID
    // Валидация обновляемых полей - делаем их опциональными с помощью optional()
    body('name').optional().trim().notEmpty().withMessage('Название продукта не может быть пустым'),
    body('seller').optional().trim().notEmpty().withMessage('Продавец не может быть пустым'),
    body('price').optional().isFloat({ gt: 0 }).withMessage('Цена должна быть положительным числом'),
    body('category').optional().trim().notEmpty().withMessage('Категория не может быть пустой'),
    body('quantity').optional().isInt({ gt: -1 }).withMessage('Количество должно быть целым неотрицательным числом')
], handleValidationErrors, updateProduct); // Применяем валидацию и обработчик

// Маршрут для удаления продукта
router.delete('/:id', [
    param('id').isMongoId().withMessage('Некорректный ID продукта') // Валидация ID
], handleValidationErrors, deleteProduct); // Применяем валидацию и обработчик


module.exports = router;