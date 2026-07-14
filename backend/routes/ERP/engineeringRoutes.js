const express = require('express');
const multer = require('multer');
const router = express.Router();
const bomController = require('../../controllers/ERP/bomController');
const bomImportController = require('../../controllers/ERP/bomImportController');
const productController = require('../../controllers/ERP/productController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ── Product Master ──
router.get('/products', productController.getList);
router.get('/products/:id', productController.getOne);
router.post('/products', productController.create);
router.put('/products/:id', productController.update);
router.delete('/products/:id', productController.delete);

// ── BOM Import ──
router.post('/bom/import', upload.single('file'), bomImportController.importExcel);

// ── BOM ──
router.get('/bom', bomController.getList);
router.get('/bom/:id/explode', bomController.explode);
router.get('/bom/:id', bomController.getOne);
router.post('/bom', bomController.create);
router.put('/bom/:id', bomController.update);
router.delete('/bom/:id', bomController.delete);

module.exports = router;
