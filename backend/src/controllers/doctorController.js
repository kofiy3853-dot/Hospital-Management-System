const { User } = require('../models');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Private
const getDoctors = async (req, res, next) => {
    try {
        const doctors = await User.findAll({
            where: { role: 'doctor' },
            attributes: ['id', 'firstName', 'lastName', 'professionalInfo']
        });
        res.json(doctors);
    } catch (error) {
        next(error);
    }
};

module.exports = { getDoctors };
