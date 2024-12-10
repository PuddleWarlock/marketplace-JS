const Product = require('../models/product');

const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
};

const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ error: 'Error fetching product by Id' });
    }
};

const createProduct = async (req, res) => {
    const { seller, name, description, price, category, quantity } = req.body;
    try {
        const newProduct = new Product({ seller, name, description, price, category, quantity });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error creating product' });
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, updates);
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error updating product' });
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting product' });
    }
};

const sortProducts = async (req, res) => {
    const { by } = req.query;

    if (!['category', 'seller'].includes(by)) {
        return res.status(400).json({ error: 'Invalid sort field' });
    }

    try {
        const sortedProducts = await Product.find().sort({ [by]: 1 }); // Сортировка по возрастанию
        res.json(sortedProducts);
    } catch (error) {
        console.error('Error sorting products:', error);
        res.status(500).json({ error: 'Error sorting products' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    sortProducts
};
