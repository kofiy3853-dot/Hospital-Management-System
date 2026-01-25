const express = require('express');
const router = express.Router();
const { createMedicalRecord, getPatientHistory, getRecordByAppointment, updateMedicalRecord, getAllMedicalRecords, uploadAttachment, upload } = require('../controllers/medicalRecordController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('doctor', 'nurse'), createMedicalRecord);
router.post('/upload', protect, authorize('doctor', 'nurse'), upload.single('file'), uploadAttachment);
router.get('/', protect, authorize('doctor', 'nurse', 'admin'), getAllMedicalRecords);
router.get('/patient/:id', protect, getPatientHistory);
router.get('/appointment/:id', protect, getRecordByAppointment);
router.put('/:id', protect, updateMedicalRecord);

module.exports = router;
