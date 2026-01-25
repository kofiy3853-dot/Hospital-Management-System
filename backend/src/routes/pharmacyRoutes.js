const express = require('express');
const router = express.Router();
const { createPrescription, dispenseMedication, getPrescriptions, getInventory, updateInventoryItem } = require('../controllers/pharmacyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/prescriptions', protect, getPrescriptions);
router.post('/prescriptions', protect, authorize('doctor'), createPrescription);
router.get('/inventory', protect, getInventory);
router.post('/inventory', protect, authorize('pharmacist', 'admin'), updateInventoryItem);
router.put('/dispense/:id', protect, authorize('pharmacist'), dispenseMedication);

module.exports = router;
