
const express = require('express');
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    sortProducts,
    handleValidationErrors,
    getAllProductsForAdmin
} = require('../controllers/products');

const authMiddleware = require('../middlewares/auth');
const { body, param, query } = require('express-validator');

const router = express.Router();

router.get('/admin/all', authMiddleware, getAllProductsForAdmin);

router.get('/sort', [
    query('by').optional().trim().notEmpty().withMessage('Поле сортировки не может быть пустым'),
    query('order').optional().trim().isIn(['asc', 'desc', '1', '-1']).withMessage('Некорректный порядок сортировки (asc, desc, 1, -1)')
], handleValidationErrors, sortProducts);


router.get('/', getProducts);


router.get('/:id', [
    param('id').isMongoId().withMessage('Некорректный ID продукта')
], handleValidationErrors, getProductById);






router.post('/', authMiddleware, [
    body('name').trim().notEmpty().withMessage('Название продукта обязательно'),
    body('seller').trim().notEmpty().withMessage('Продавец обязателен'),
    body('price').isFloat({ gt: 0 }).withMessage('Цена должна быть положительным числом'),
    body('category').trim().notEmpty().withMessage('Категория обязательна'),
    body('quantity').isInt({ gt: -1 }).withMessage('Количество должно быть целым неотрицательным числом')
], handleValidationErrors, createProduct);


router.put('/:id', authMiddleware, [
    param('id').isMongoId().withMessage('Некорректный ID продукта'),

    body('name').optional().trim().notEmpty().withMessage('Название продукта не может быть пустым'),
    body('seller').optional().trim().notEmpty().withMessage('Продавец не может быть пустым'),
    body('price').optional().isFloat({ gt: 0 }).withMessage('Цена должна быть положительным числом'),
    body('category').optional().trim().notEmpty().withMessage('Категория не может быть пустой'),
    body('quantity').optional().isInt({ gt: -1 }).withMessage('Количество должно быть целым неотрицательным числом')
], handleValidationErrors, updateProduct);


router.delete('/:id', authMiddleware, [
    param('id').isMongoId().withMessage('Некорректный ID продукта')
], handleValidationErrors, deleteProduct);


module.exports = router;