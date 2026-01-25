const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getFinancialAnalytics,
    getClinicalAnalytics,
    getPatientAnalytics,
    getInventoryAnalytics
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Dashboard statistics
router.get('/stats', protect, getDashboardStats);

// Analytics routes
router.get('/revenue', protect, authorize('admin', 'super_admin', 'accountant'), getFinancialAnalytics);
router.get('/clinical', protect, authorize('admin', 'super_admin', 'doctor'), getClinicalAnalytics);
router.get('/patients', protect, authorize('admin', 'super_admin', 'receptionist'), getPatientAnalytics);
router.get('/inventory', protect, authorize('admin', 'super_admin', 'pharmacist'), getInventoryAnalytics);

module.exports = router;
