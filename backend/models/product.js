const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    seller: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    price: { type: Number, required: true },
    category: String,
    quantity: Number,
    isVisible: Boolean
});

module.exports = mongoose.model('Product', productSchema);
