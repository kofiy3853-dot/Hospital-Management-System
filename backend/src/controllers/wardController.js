const { Ward, Bed, Department } = require('../models');

// @desc    Get all wards with their beds
// @route   GET /api/wards
// @access  Private
const getWards = async (req, res, next) => {
    try {
        const wards = await Ward.findAll({
            include: [
                { model: Department, as: 'department', attributes: ['name'] },
                { model: Bed, as: 'beds' }
            ]
        });
        res.json(wards);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new ward
// @route   POST /api/wards
// @access  Private (Admin)
const createWard = async (req, res, next) => {
    try {
        const { name, type, departmentId, capacity } = req.body;
        const ward = await Ward.create({ name, type, departmentId, capacity });

        // Auto-generate beds if capacity is provided
        if (capacity > 0) {
            const beds = [];
            for (let i = 1; i <= capacity; i++) {
                beds.push({
                    bedNumber: `${type.charAt(0).toUpperCase()}${i.toString().padStart(3, '0')}`,
                    wardId: ward.id,
                    status: 'Available'
                });
            }
            await Bed.bulkCreate(beds);
        }

        res.status(201).json(ward);
    } catch (error) {
        next(error);
    }
};

// @desc    Get beds for a specific ward
// @route   GET /api/wards/:id/beds
// @access  Private
const getWardBeds = async (req, res, next) => {
    try {
        const beds = await Bed.findAll({
            where: { wardId: req.params.id }
        });
        res.json(beds);
    } catch (error) {
        next(error);
    }
};

// @desc    Update bed status
// @route   PUT /api/beds/:id
// @access  Private
const updateBedStatus = async (req, res, next) => {
    try {
        const bed = await Bed.findByPk(req.params.id);
        if (!bed) return res.status(404).json({ message: 'Bed not found' });

        bed.status = req.body.status || bed.status;
        await bed.save();
        res.json(bed);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getWards,
    createWard,
    getWardBeds,
    updateBedStatus
};
