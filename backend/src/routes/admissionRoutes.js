const express = require('express');
const router = express.Router();
const { admitPatient, dischargePatient, getAllAdmissions } = require('../controllers/admissionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin', 'doctor', 'nurse'), getAllAdmissions);
router.post('/', protect, authorize('admin', 'doctor', 'nurse'), admitPatient);
router.put('/:id/discharge', protect, authorize('admin', 'doctor', 'nurse'), dischargePatient);

module.exports = router;
