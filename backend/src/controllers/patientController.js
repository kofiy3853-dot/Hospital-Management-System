const { User, Admission } = require('../models');
const { logActivity } = require('../utils/logger');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (Admin, Doctor, Nurse, Receptionist)
const getPatients = async (req, res, next) => {
    try {
        const patients = await User.findAll({
            where: { role: 'patient' },
            include: [{ model: Admission, as: 'admissions', where: { status: 'Admitted' }, required: false }],
            attributes: { exclude: ['password'] }
        });
        res.json(patients);
    } catch (error) {
        console.error('Error in getPatients:', error);
        next(error);
    }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private (Staff or the Patient themselves)
const getPatientById = async (req, res, next) => {
    try {
        const patient = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        if (patient && (patient.role === 'patient')) {
            // Check if user is staff or the patient themselves
            if (req.user.role !== 'patient' || req.user.id === patient.id) {
                // Log access
                logActivity(req.user.id, 'VIEW', 'Patient', patient.id, { name: `${patient.firstName} ${patient.lastName}` }, req.ip);
                res.json(patient);
            } else {
                res.status(403).json({ message: 'Not authorized to view this profile' });
            }
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error) {
        console.error('Error in getPatientById:', error);
        next(error);
    }
};

// @desc    Update patient profile
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (user && user.role === 'patient') {
            const {
                firstName, lastName, email, phoneNumber, address,
                gender, dateOfBirth, patientInfo, emergencyContact
            } = req.body;

            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.email = email || user.email;
            user.phoneNumber = phoneNumber || user.phoneNumber;
            user.address = address || user.address;
            user.gender = gender || user.gender;
            user.dateOfBirth = dateOfBirth || user.dateOfBirth;

            if (patientInfo) {
                user.patientInfo = { ...user.patientInfo, ...patientInfo };
            }

            if (emergencyContact) {
                user.emergencyContact = { ...user.emergencyContact, ...emergencyContact };
            }

            await user.save();
            logActivity(req.user.id, 'UPDATE', 'Patient', user.id, { changes: req.body }, req.ip);
            res.json(user);
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error) {
        console.error('Error in updatePatient:', error);
        next(error);
    }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private (Admin)
const deletePatient = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (user && user.role === 'patient') {
            const patientId = user.id;
            const patientName = `${user.firstName} ${user.lastName}`;
            await user.destroy();
            logActivity(req.user.id, 'DELETE', 'Patient', patientId, { name: patientName }, req.ip);
            res.json({ message: 'Patient removed' });
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error) {
        console.error('Error in deletePatient:', error);
        next(error);
    }
};

// @desc    Register a new patient
// @route   POST /api/patients
// @access  Private (Admin, Receptionist)
const registerPatient = async (req, res, next) => {
    try {
        const { firstName, lastName, email, phoneNumber, address, gender, dateOfBirth, patientInfo, emergencyContact } = req.body;

        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'Patient already exists' });
        }

        const patient = await User.create({
            firstName,
            lastName,
            email,
            password: 'PatientPassword123',
            role: 'patient',
            phoneNumber,
            address,
            gender,
            dateOfBirth,
            patientInfo: patientInfo || {},
            emergencyContact: emergencyContact || {}
        });

        logActivity(req.user.id, 'CREATE', 'Patient', patient.id, { name: `${firstName} ${lastName}`, email }, req.ip);
        res.status(201).json(patient);
    } catch (error) {
        console.error('Error in registerPatient:', error);
        next(error);
    }
};

module.exports = { getPatients, getPatientById, updatePatient, registerPatient, deletePatient };
