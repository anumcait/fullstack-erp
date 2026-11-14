const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/HR/settingsController');

// Company settings routes:
// - GET /api/settings/company: public (read-only branding)
// - POST /api/settings/company: first-run setup is public; subsequent updates require auth & permissions (enforced in controller)
router.get('/company', settingsController.getCompanySettings);
router.post('/company', settingsController.updateCompanySettings);

module.exports = router;
