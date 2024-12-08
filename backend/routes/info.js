const express = require('express');
const { getOSInfo, getFileInfo } = require('../controllers/info');

const router = express.Router();

router.get('/os', getOSInfo);
router.get('/file', getFileInfo);

module.exports = router;
