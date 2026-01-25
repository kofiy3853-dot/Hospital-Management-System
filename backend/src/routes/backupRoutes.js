const express = require('express');
const router = express.Router();
const { createBackup, getBackups, restoreBackup, downloadBackup } = require('../controllers/backupController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.get('/', getBackups);
router.post('/', createBackup);
router.get('/download/:filename', downloadBackup);
router.post('/restore/:filename', restoreBackup);

module.exports = router;
