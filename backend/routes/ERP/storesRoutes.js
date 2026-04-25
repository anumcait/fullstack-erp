const express = require('express');
const router = express.Router();
const storesController = require('../../controllers/ERP/storesController');

router.get('/', storesController.getStock);

module.exports = router;
