const { User, Department } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
    try {
        const { role, search } = req.query;
        const where = {};

        if (role) where.role = role;
        if (search) {
            where[Op.or] = [
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const users = await User.findAll({
            where,
            attributes: { exclude: ['password'] },
            include: [{ model: Department, as: 'department' }],
            order: [['createdAt', 'DESC']]
        });

        res.json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin)
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Department, as: 'department' }]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
};

// @desc    Create new user/staff
// @route   POST /api/users
// @access  Private (Admin)
const createUser = async (req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            role,
            phoneNumber,
            address,
            gender,
            dateOfBirth,
            departmentId,
            doctorInfo,
            patientInfo
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password, // Will be hashed by the model hook
            role,
            phoneNumber,
            address,
            gender,
            dateOfBirth,
            departmentId,
            doctorInfo,
            patientInfo
        });

        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        next(error);
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const {
            firstName,
            lastName,
            email,
            role,
            phoneNumber,
            address,
            gender,
            dateOfBirth,
            departmentId,
            doctorInfo,
            patientInfo
        } = req.body;

        // Update fields
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (role) user.role = role;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (address) user.address = address;
        if (gender) user.gender = gender;
        if (dateOfBirth) user.dateOfBirth = dateOfBirth;
        if (departmentId) user.departmentId = departmentId;
        if (doctorInfo) user.doctorInfo = doctorInfo;
        if (patientInfo) user.patientInfo = patientInfo;

        await user.save();

        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json(userResponse);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete/Deactivate user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Soft delete - you could add an 'active' field to the model
        await user.destroy();

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json(userResponse);
    } catch (error) {
        next(error);
    }
};

// @desc    Reset user password
// @route   PUT /api/users/:id/password
// @access  Private (Admin)
const resetUserPassword = async (req, res, next) => {
    try {
        const { newPassword } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = newPassword; // Will be hashed by the model hook
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateUserRole,
    resetUserPassword
};
