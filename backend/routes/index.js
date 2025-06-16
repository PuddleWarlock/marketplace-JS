
const express = require('express');
const productRoutes = require('./products');
const infoRoutes = require('./info');
const authRoutes = require('./auth');
const contactRoutes = require('./contact');

const router = express.Router();


router.use('/products', productRoutes);
router.use('/info', infoRoutes);


router.use('/auth', authRoutes);
router.use('/contact', contactRoutes);

module.exports = router;