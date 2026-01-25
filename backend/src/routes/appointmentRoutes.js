const express = require('express');
const router = express.Router();
const { createAppointment, getAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('receptionist', 'patient', 'admin'), createAppointment);
router.get('/', protect, getAppointments);
router.put('/:id/status', protect, authorize('admin', 'doctor', 'nurse', 'receptionist'), updateAppointmentStatus);

module.exports = router;
