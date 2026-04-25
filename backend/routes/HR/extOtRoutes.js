const express = require('express');
const router = express.Router();
const extOtController = require('../../controllers/HR/extOtController');

router.get('/all', extOtController.getAll);
router.get('/:id', extOtController.getById);
router.post('/', extOtController.create);
router.put('/:id', extOtController.update);
router.delete('/:id', extOtController.delete);
router.put('/manager-approve/:id', extOtController.managerApprove);
router.put('/hr-approve/:id', extOtController.hrApprove);
router.put('/hr-update/:id', extOtController.hrUpdate);
router.post('/manager-bulk-approve', extOtController.managerBulkApprove);
router.post('/hr-bulk-approve', extOtController.hrBulkApprove);

module.exports = router;
