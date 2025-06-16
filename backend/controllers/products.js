
const Product = require('../models/product');
const { validationResult } = require('express-validator');


const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        return res.status(400).json({ errors: errors.array() });
    }
    next();
};


const getProducts = async (req, res, next) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    const { id } = req.params;
    try {

        const product = await Product.findById(id);
        if (!product) {
            const error = new Error('Продукт не найден');
            error.status = 404;
            return next(error);
        }
        res.status(200).json(product);
    } catch (error) {

        if (error.kind === 'ObjectId' || error.name === 'CastError') {
            error.status = 400;
            error.message = 'Некорректный формат ID продукта';
        } else {
            error.status = 500;
            error.message = 'Ошибка при получении продукта';
        }
        next(error);
    }
};

const createProduct = async (req, res, next) => {

    const { seller, name, description, price, category, quantity } = req.body;
    try {
        const newProduct = new Product({ seller, name, description, price, category, quantity });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {

        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    const { id } = req.params;

    const updates = req.body;

    delete updates._id;
    delete updates.createdAt;


    updates.updatedAt = new Date();


    try {


        const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!updatedProduct) {
            const error = new Error('Продукт не найден для обновления');
            error.status = 404;
            return next(error);
        }
        res.status(200).json(updatedProduct);
    } catch (error) {

        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            error.status = 400;
            error.message = 'Некорректный формат ID продукта';
        } else if (error.name === 'ValidationError') {

            error.status = 400;

            error.message = `Ошибка валидации: ${error.message}`;
        } else {
            error.status = 500;
            error.message = 'Ошибка при обновлении продукта';
        }
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    const { id } = req.params;

    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            const error = new Error('Продукт не найден для удаления');
            error.status = 404;
            return next(error);
        }
        res.status(200).json({ message: 'Продукт успешно удален', deletedId: id });
    } catch (error) {

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
    const { by, order = 'asc' } = req.query;


    const allowedSortFields = ['category', 'seller', 'price', 'name', '_id', 'createdAt', 'updatedAt', 'quantity'];
    if (!allowedSortFields.includes(by)) {
        const error = new Error(`Некорректное поле сортировки. Разрешенные поля: ${allowedSortFields.join(', ')}.`);
        error.status = 400;
        return next(error);
    }


    const sortOrder = (order.toLowerCase() === 'desc' || order === '-1') ? -1 : 1;

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
    handleValidationErrors
};