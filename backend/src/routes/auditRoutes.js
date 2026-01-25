const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Only Admins can view audit logs
router.get('/', protect, authorize('admin'), getLogs);

module.exports = router;
