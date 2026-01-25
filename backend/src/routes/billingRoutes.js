const express = require('express');
const router = express.Router();
const {
    createBill,
    getAllBills,
    getBillById,
    updateBillStatus,
    getPatientBills,
    deleteBill
} = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('accountant', 'admin'), getAllBills);
router.post('/', protect, authorize('accountant', 'admin'), createBill);
router.get('/patient/:patientId', protect, getPatientBills);
router.get('/:id', protect, getBillById);
router.put('/:id/status', protect, authorize('accountant', 'admin'), updateBillStatus);
router.delete('/:id', protect, authorize('admin'), deleteBill);

module.exports = router;
