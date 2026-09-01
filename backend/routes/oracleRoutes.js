const express = require('express');
const router = express.Router();
const { migrateToOracle } = require('../services/oracleSync');
const { requirePermission } = require('../middleware/auth');
const { SETTINGS_PERMISSIONS } = require('../constants/permissions');

// Trigger a one-way mirror of live Postgres HR/ERP data into the parallel
// Oracle HR / ERP schemas. Admin-only.
router.post('/migrate', requirePermission(SETTINGS_PERMISSIONS.MANAGE), async (req, res) => {
  try {
    const result = await migrateToOracle();
    res.json({ success: true, mirrored: result });
  } catch (err) {
    console.error('Oracle migration error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
