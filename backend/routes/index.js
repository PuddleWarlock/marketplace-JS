const express = require('express');
const productRoutes = require('./products');
const infoRoutes = require('./info');

const router = express.Router();

router.use('/products', productRoutes);
router.use('/info', infoRoutes);

module.exports = router;
