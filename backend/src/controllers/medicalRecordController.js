const { MedicalRecord, Appointment, User } = require('../models');
const { logActivity } = require('../utils/logger');
const multer = require('multer');
const path = require('path');

// Configure Multer for attachments
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// @desc    Create medical record (End Consultation)
// @route   POST /api/medical-records
// @access  Private (Doctor)
const createMedicalRecord = async (req, res) => {
    try {
        const { 
            patientId, appointmentId, vitals, symptoms, 
            diagnosis, treatmentPlan, soapNotes, attachments,
            prescriptions, labOrders 
        } = req.body;

        const record = await MedicalRecord.create({
            patientId,
            doctorId: req.user.id,
            appointmentId,
            vitals,
            symptoms,
            diagnosis,
            treatmentPlan,
            soapNotes: soapNotes || {},
            attachments: attachments || []
        });

        // Handle Prescriptions
        if (prescriptions && prescriptions.length > 0) {
            const { Prescription } = require('../models');
            await Prescription.create({
                patientId,
                doctorId: req.user.id,
                medicalRecordId: record.id,
                medications: prescriptions,
                status: 'Pending'
            });
        }

        // Handle Lab Orders
        if (labOrders && labOrders.length > 0) {
            const { LabTest } = require('../models');
            for (const order of labOrders) {
                await LabTest.create({
                    testName: order.testName,
                    testCategory: order.category || 'General',
                    patientId,
                    doctorId: req.user.id,
                    appointmentId,
                    status: 'Pending'
                });
            }
        }

        // Update appointment status to Completed if linked
        if (appointmentId) {
            const appointment = await Appointment.findByPk(appointmentId);
            if (appointment) {
                appointment.status = 'Completed';
                await appointment.save();
            }
        }

        res.status(201).json(record);
        logActivity(req.user.id, 'CREATE', 'MedicalRecord', record.id, { patientId, appointmentId }, req.ip);
    } catch (error) {
        console.error('Record creation error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get patient medical history
// @route   GET /api/medical-records/patient/:id
// @access  Private (Doctor, Nurse, Patient)
const getPatientHistory = async (req, res) => {
    try {
        const records = await MedicalRecord.findAll({
            where: { patientId: req.params.id },
            include: [{ model: User, as: 'doctor', attributes: ['firstName', 'lastName'] }],
            order: [['createdAt', 'DESC']]
        });

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get medical record by appointment ID
// @route   GET /api/medical-records/appointment/:id
// @access  Private
const getRecordByAppointment = async (req, res) => {
    try {
        const record = await MedicalRecord.findOne({
            where: { appointmentId: req.params.id }
        });
        res.json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update medical record
// @route   PUT /api/medical-records/:id
// @access  Private (Doctor or Nurse for vitals)
const updateMedicalRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.findByPk(req.params.id);
        if (!record) return res.status(404).json({ message: 'Record not found' });

        const { vitals, symptoms, diagnosis, treatmentPlan, soapNotes, attachments } = req.body;

        if (vitals) record.vitals = { ...record.vitals, ...vitals };
        if (symptoms) record.symptoms = symptoms;
        if (diagnosis) record.diagnosis = diagnosis;
        if (treatmentPlan) record.treatmentPlan = treatmentPlan;
        if (soapNotes) record.soapNotes = { ...record.soapNotes, ...soapNotes };
        if (attachments) record.attachments = attachments;

        await record.save();
        logActivity(req.user.id, 'UPDATE', 'MedicalRecord', record.id, { changes: req.body }, req.ip);
        res.json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllMedicalRecords = async (req, res) => {
    try {
        const records = await MedicalRecord.findAll({
            include: [
                { model: User, as: 'patient', attributes: ['firstName', 'lastName'] },
                { model: User, as: 'doctor', attributes: ['firstName', 'lastName'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload attachment
// @route   POST /api/medical-records/upload
// @access  Private (Doctor, Nurse)
const uploadAttachment = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({ url: fileUrl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createMedicalRecord,
    getPatientHistory,
    getRecordByAppointment,
    updateMedicalRecord,
    getAllMedicalRecords,
    uploadAttachment,
    upload
};
