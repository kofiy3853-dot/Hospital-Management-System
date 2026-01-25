const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', emergencyController.createEmergencyRecord);
router.get('/active', emergencyController.getActiveEmergencyRecords);
router.patch('/:id/triage', emergencyController.updateTriage);
router.post('/:id/discharge', emergencyController.dischargeEmergencyRecord);

module.exports = router;
