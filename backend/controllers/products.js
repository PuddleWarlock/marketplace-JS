// backend\controllers\products.js
const Product = require('../models/product');
const { validationResult } = require('express-validator');

// Вспомогательная функция для обработки ошибок валидации (лучше сделать общей, но пока оставляем тут)
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Отправляем JSON ответ с деталями ошибок валидации
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};


const getProducts = async (req, res, next) => {
    try {
        const products = await Product.find();
        res.status(200).json(products); // Content-Type: application/json устанавливается Express по умолчанию для json()
    } catch (error) {
        next(error); // Передаем ошибку дальше
    }
};

const getProductById = async (req, res, next) => {
    const { id } = req.params;
    try {
        // Mongoose бросит CastError, если ID невалидный MongoID, она будет поймана в catch
        const product = await Product.findById(id);
        if (!product) {
            const error = new Error('Продукт не найден');
            error.status = 404;
            return next(error);
        }
        res.status(200).json(product);
    } catch (error) {
        // Ловим CastError или другие ошибки поиска
        if (error.kind === 'ObjectId' || error.name === 'CastError') {
            error.status = 400; // Неверный формат ID - это 400 Bad Request
            error.message = 'Некорректный формат ID продукта';
        } else {
            error.status = 500; // Другие ошибки - 500 Internal Server Error
            error.message = 'Ошибка при получении продукта';
        }
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    // Валидация уже выполнена middleware в маршруте, handleValidationErrors отправил бы 400
    const { seller, name, description, price, category, quantity } = req.body;
    try {
        const newProduct = new Product({ seller, name, description, price, category, quantity });
        await newProduct.save();
        res.status(201).json(newProduct); // 201 Created
    } catch (error) {
        // Ловим ошибки сохранения (например, из-за ограничений схемы Mongoose, кроме required, которые уже валидируются express-validator)
        next(error); // Передаем ошибку дальше
    }
};

const updateProduct = async (req, res, next) => {
    const { id } = req.params;
    // Валидация id и полей обновления уже выполнена
    const updates = req.body;
    // Удаляем поля, которые не должны обновляться пользователем напрямую
    delete updates._id;
    delete updates.createdAt;
    // updatedAt может обновляться автоматически Mongoose, если настроены timestamps в схеме
    // Если timestamps не настроены, можно обновить его здесь:
    updates.updatedAt = new Date();


    try {
        // { new: true } возвращает обновленный документ
        // { runValidators: true } запускает валидаторы Mongoose при обновлении (для полей с validate)
        const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!updatedProduct) {
            const error = new Error('Продукт не найден для обновления');
            error.status = 404;
            return next(error);
        }
        res.status(200).json(updatedProduct); // 200 OK
    } catch (error) {
        // Ловим ошибки обновления (например, валидация Mongoose, CastError)
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            error.status = 400;
            error.message = 'Некорректный формат ID продукта';
        } else if (error.name === 'ValidationError') {
            // Ошибки валидации Mongoose при runValidators: true
            error.status = 400;
            // Mongoose ValidationError содержит details, можно распарсить, но express-validator лучше
            error.message = `Ошибка валидации: ${error.message}`; // Mongoose Validation Error message already contains details
        } else {
            error.status = 500;
            error.message = 'Ошибка при обновлении продукта';
        }
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    const { id } = req.params;
    // Валидация id уже выполнена
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            const error = new Error('Продукт не найден для удаления');
            error.status = 404;
            return next(error);
        }
        res.status(200).json({ message: 'Продукт успешно удален', deletedId: id }); // 200 OK
    } catch (error) {
        // Ловим CastError или другие ошибки
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            error.status = 400;
            error.message = 'Некорректный формат ID продукта';
        } else {
            error.status = 500;
            error.message = 'Ошибка при удалении продукта';
        }
        next(error);
    }
};

const sortProducts = async (req, res, next) => {
    const { by, order = 'asc' } = req.query; // Добавим возможность указывать порядок (asc/desc)

    // Базовая проверка поля сортировки
    const allowedSortFields = ['category', 'seller', 'price', 'name', '_id', 'createdAt', 'updatedAt', 'quantity'];
    if (!allowedSortFields.includes(by)) {
        const error = new Error(`Некорректное поле сортировки. Разрешенные поля: ${allowedSortFields.join(', ')}.`);
        error.status = 400;
        return next(error);
    }

    // Проверка порядка сортировки
    const sortOrder = (order.toLowerCase() === 'desc' || order === '-1') ? -1 : 1; // 1 for asc, -1 for desc

    try {
        const sortedProducts = await Product.find().sort({ [by]: sortOrder });
        res.status(200).json(sortedProducts);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    sortProducts,
    handleValidationErrors // Экспортируем для использования в маршрутах products
};