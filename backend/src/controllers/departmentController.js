const { Department } = require('../models');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = async (req, res, next) => {
    try {
        const departments = await Department.findAll({
            order: [['name', 'ASC']]
        });
        res.json(departments);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private (Admin)
const createDepartment = async (req, res, next) => {
    try {
        const { name, description, location } = req.body;
        
        const departmentExists = await Department.findOne({ where: { name } });
        if (departmentExists) {
            return res.status(400).json({ message: 'Department already exists' });
        }

        const department = await Department.create({
            name,
            description,
            location
        });

        res.status(201).json(department);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDepartments,
    createDepartment
};
