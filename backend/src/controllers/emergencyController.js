const { EmergencyRecord, User } = require('../models');

exports.createEmergencyRecord = async (req, res) => {
    try {
        const record = await EmergencyRecord.create(req.body);
        res.status(201).json(record);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getActiveEmergencyRecords = async (req, res) => {
    try {
        const records = await EmergencyRecord.findAll({
            where: {
                status: ['Triage', 'Active', 'Stable']
            },
            include: [
                { model: User, as: 'patient', attributes: ['firstName', 'lastName', 'email'] },
                { model: User, as: 'doctor', attributes: ['firstName', 'lastName'] }
            ],
            order: [
                ['triageLevel', 'ASC'], // Critical (1st) -> Urgent (2nd) -> Normal (3rd)
                ['arrivalTimestamp', 'ASC']
            ]
        });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateTriage = async (req, res) => {
    try {
        const record = await EmergencyRecord.findByPk(req.params.id);
        if (!record) return res.status(404).json({ message: 'Emergency record not found' });

        await record.update(req.body);
        res.json(record);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.dischargeEmergencyRecord = async (req, res) => {
    try {
        const record = await EmergencyRecord.findByPk(req.params.id);
        if (!record) return res.status(404).json({ message: 'Emergency record not found' });

        await record.update({ status: 'Discharged' });
        res.json({ message: 'Patient discharged from ER' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
