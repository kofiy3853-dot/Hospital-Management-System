const { LabTest, User } = require('../models');
const { sendNotification } = require('../utils/notificationService');

// @desc    Create lab test request
// @route   POST /api/lab/request
// @access  Private (Doctor)
const requestTest = async (req, res, next) => {
    try {
        const { patientId, appointmentId, testName, testCategory, notes } = req.body;

        const labTest = await LabTest.create({
            patientId,
            doctorId: req.user.id,
            appointmentId,
            testName,
            testCategory,
            notes
        });

        // Notify Lab Techs
        const labTechs = await User.findAll({ where: { role: 'lab_tech' } });
        for (const tech of labTechs) {
            await sendNotification(tech.id, {
                title: 'New Lab Request',
                message: `New test requested: ${testName} for Patient ID: ${patientId}`,
                type: 'INFO',
                link: '/laboratory'
            });
        }

        res.status(201).json(labTest);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all lab tests
// @route   GET /api/lab/tests
// @access  Private (Lab Tech, Doctor, Admin)
const getTests = async (req, res, next) => {
    try {
        const tests = await LabTest.findAll({
            include: [
                { model: User, as: 'patient', attributes: ['firstName', 'lastName', 'dateOfBirth', 'gender'] },
                { model: User, as: 'doctor', attributes: ['firstName', 'lastName'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(tests);
    } catch (error) {
        console.error('FETCH LAB TESTS ERROR:', error);
        next(error);
    }
};

// @desc    Update lab test result
// @route   PUT /api/lab/result/:id
// @access  Private (Lab Tech)
const updateResult = async (req, res, next) => {
    try {
        const { status, result, notes } = req.body;
        const test = await LabTest.findByPk(req.params.id);

        if (!test) return res.status(404).json({ message: 'Lab test not found' });

        const updateData = { status, result, notes };
        if (status === 'Completed') {
            updateData.resultDate = new Date();
        }

        await test.update(updateData);

        if (status === 'Completed') {
            // Notify Doctor
            await sendNotification(test.doctorId, {
                title: 'Lab Result Ready',
                message: `Results for ${test.testName} are now available.`,
                type: 'SUCCESS',
                link: '/laboratory'
            });

            // Notify Patient
            await sendNotification(test.patientId, {
                title: 'Lab Results Available',
                message: `Your lab results for ${test.testName} have been uploaded.`,
                type: 'INFO',
                link: '/patient-portal',
                email: true
            });
        }

        res.json(test);
    } catch (error) {
        next(error);
    }
};

// @desc    Get patient lab history
// @route   GET /api/lab/patient/:patientId
// @access  Private
const getPatientHistory = async (req, res, next) => {
    try {
        const tests = await LabTest.findAll({
            where: { patientId: req.params.patientId },
            include: [{ model: User, as: 'doctor', attributes: ['firstName', 'lastName'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(tests);
    } catch (error) {
        next(error);
    }
};

module.exports = { requestTest, getTests, updateResult, getPatientHistory };
