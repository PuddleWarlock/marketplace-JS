// backend\controllers\products.js
const Product = require('../models/product');
const { validationResult } = require('express-validator'); // Для валидации

// Вспомогательная функция для проверки ошибок валидации
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next(); // Если ошибок нет, передаем управление следующему middleware/контроллеру
};

const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        // Установка заголовков Content-Type и статуса
        res.status(200).setHeader('Content-Type', 'application/json').json(products);
    } catch (error) {
        // Логирование ошибки выполняется middleware обработки ошибок в server.js
        // Отправка JSON ошибки пользователю также выполняется там
        next(error); // Передаем ошибку дальше
    }
};

const getProductById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            // Создаем ошибку с нужным статусом, которую подхватит middleware обработки ошибок
            const error = new Error('Product not found');
            error.status = 404;
            return next(error);
        }
        res.status(200).setHeader('Content-Type', 'application/json').json(product);
    } catch (error) {
        // Если ID имеет неверный формат, Mongoose бросит ошибку, передаем ее дальше
        error.status = 400; // Часто ошибки вроде CastError при неверном ID - это 400
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    // handleValidationErrors уже проверил req и отправил ответ, если были ошибки
    // Если мы здесь, значит, валидация прошла успешно
    const { seller, name, description, price, category, quantity } = req.body;
    try {
        const newProduct = new Product({ seller, name, description, price, category, quantity });
        await newProduct.save();
        res.status(201).setHeader('Content-Type', 'application/json').json(newProduct); // 201 Created
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    const { id } = req.params;
    // handleValidationErrors уже проверил req
    const updates = req.body;
    // Удаляем поле updatedAt из обновлений, т.к. мы обновляем его вручную или через Mongoose timestamp (если настроено)
    delete updates.updatedAt;


    try {
        // Можно добавить опцию { new: true } чтобы получить обновленный документ
        const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedProduct) {
            const error = new Error('Product not found');
            error.status = 404;
            return next(error);
        }
        res.status(200).setHeader('Content-Type', 'application/json').json(updatedProduct);
    } catch (error) {
        error.status = 400; // Ошибки обновления часто 400
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    const { id } = req.params;
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            const error = new Error('Product not found');
            error.status = 404;
            return next(error);
        }
        // Отправляем успешный ответ 200 OK
        res.status(200).setHeader('Content-Type', 'application/json').json({ message: 'Product deleted', deletedId: id });
    } catch (error) {
        error.status = 400; // Ошибки удаления часто 400
        next(error);
    }
};

const sortProducts = async (req, res, next) => {
    const { by } = req.query;

    // Базовая проверка поля сортировки
    if (!['category', 'seller', 'price', 'name', '_id', 'createdAt'].includes(by)) {
        const error = new Error('Invalid sort field. Allowed fields: category, seller, price, name, _id, createdAt');
        error.status = 400;
        return next(error);
    }

    try {
        // Сортировка по возрастанию (1)
        const sortedProducts = await Product.find().sort({ [by]: 1 });
        res.status(200).setHeader('Content-Type', 'application/json').json(sortedProducts);
    } catch (error) {
        next(error); // Передаем ошибку дальше
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    sortProducts,
    handleValidationErrors // Экспортируем для использования в маршрутах
};