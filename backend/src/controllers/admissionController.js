const { Admission, Bed, User, Ward } = require('../models');
const { logActivity } = require('../utils/logger');

// @desc    Admit a patient
// @route   POST /api/admissions
// @access  Private (Doctor, Nurse)
const admitPatient = async (req, res, next) => {
    try {
        const { patientId, bedId, reason, admissionDate, diagnosis } = req.body;

        // Check if bed is available
        const bed = await Bed.findByPk(bedId);
        if (!bed) return res.status(404).json({ message: 'Bed not found' });
        if (bed.status !== 'Available') return res.status(400).json({ message: 'Bed is not available' });

        // Create admission record
        const admission = await Admission.create({
            patientId,
            bedId,
            reason,
            admissionDate: admissionDate || new Date(),
            diagnosis,
            status: 'Admitted'
        });

        // Update bed status
        bed.status = 'Occupied';
        await bed.save();

        logActivity(req.user.id, 'ADMIT', 'Patient', patientId, { bedId, admissionId: admission.id }, req.ip);

        res.status(201).json(admission);
    } catch (error) {
        next(error);
    }
};

// @desc    Discharge a patient
// @route   PUT /api/admissions/:id/discharge
// @access  Private (Doctor, Nurse)
const dischargePatient = async (req, res, next) => {
    try {
        const admission = await Admission.findByPk(req.params.id);
        if (!admission) return res.status(404).json({ message: 'Admission record not found' });
        if (admission.status === 'Discharged') return res.status(400).json({ message: 'Patient already discharged' });

        const { dischargeDate, notes } = req.body;

        // Update admission record
        admission.dischargeDate = dischargeDate || new Date();
        admission.status = 'Discharged';
        admission.notes = notes;
        await admission.save();

        // Update bed status to available
        const bed = await Bed.findByPk(admission.bedId);
        if (bed) {
            bed.status = 'Available';
            await bed.save();
        }

        logActivity(req.user.id, 'DISCHARGE', 'Patient', admission.patientId, { admissionId: admission.id }, req.ip);

        res.json(admission);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all current admissions
// @route   GET /api/admissions
// @access  Private
const getAllAdmissions = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status) where.status = status;

        const admissions = await Admission.findAll({
            where,
            include: [
                { model: User, as: 'patient', attributes: ['firstName', 'lastName', 'gender', 'dateOfBirth'] },
                { model: Bed, as: 'bed', include: [{ model: Ward, as: 'ward' }] }
            ],
            order: [['admissionDate', 'DESC']]
        });
        res.json(admissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    admitPatient,
    dischargePatient,
    getAllAdmissions
};
