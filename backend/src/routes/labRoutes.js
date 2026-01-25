const express = require('express');
const router = express.Router();
const { requestTest, getTests, updateResult, getPatientHistory } = require('../controllers/labController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/tests', protect, getTests);
router.post('/request', protect, authorize('doctor'), requestTest);
router.put('/result/:id', protect, authorize('lab_tech', 'admin'), updateResult);
router.get('/patient/:patientId', protect, getPatientHistory);

module.exports = router;
