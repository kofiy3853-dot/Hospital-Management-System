const express = require('express');
const router = express.Router();
const { getWards, createWard, getWardBeds, updateBedStatus } = require('../controllers/wardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getWards);
router.post('/', protect, authorize('admin'), createWard);
router.get('/:id/beds', protect, getWardBeds);
router.put('/beds/:id', protect, authorize('admin', 'nurse'), updateBedStatus);

module.exports = router;
