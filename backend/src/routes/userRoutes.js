const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateUserRole,
    resetUserPassword
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Apply protection to all routes
router.use(protect);

// Allow specific roles to view users (e.g., to find doctors)
router.get('/', authorize('admin', 'receptionist', 'doctor', 'nurse', 'lab_tech', 'pharmacist'), getAllUsers);

// Restrict creation to admin (although registration might need public access or special route?)
// Assuming registration happens via authRoutes or similar, or admin creates users.
router.post('/', authorize('admin'), createUser);

// Admin only for modifying users directly
router.use(authorize('admin'));
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.put('/:id/role', updateUserRole);
router.put('/:id/password', resetUserPassword);

module.exports = router;
