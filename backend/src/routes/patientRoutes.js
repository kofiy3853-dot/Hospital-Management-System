const express = require('express');
const router = express.Router();
const { getPatients, getPatientById, updatePatient, registerPatient, deletePatient } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin', 'doctor', 'nurse', 'receptionist'), getPatients);
router.post('/', protect, authorize('admin', 'receptionist'), registerPatient);
router.get('/:id', protect, getPatientById);
router.put('/:id', protect, updatePatient);
router.delete('/:id', protect, authorize('admin'), deletePatient);

module.exports = router;
