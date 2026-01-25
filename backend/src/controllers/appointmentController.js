const { Appointment, User } = require('../models');
const { sendNotification } = require('../utils/notificationService');

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Receptionist, Patient)
const createAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, dateTime, reason, status } = req.body;

        // Verify doctor exists and is actually a doctor
        const doctor = await User.findByPk(doctorId);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ message: 'Doctor not found or invalid' });
        }

        const appointment = await Appointment.create({
            patientId: patientId || req.user.id, // If patient books themselves
            doctorId,
            dateTime,
            reason,
            status: status || 'Pending'
        });

        // Notify Doctor
        await sendNotification(doctorId, {
            title: 'New Appointment Booked',
            message: `You have a new appointment scheduled for ${new Date(dateTime).toLocaleString()}.`,
            type: 'INFO',
            link: '/appointments'
        });

        // Notify Patient
        await sendNotification(patientId || req.user.id, {
            title: 'Appointment Scheduled',
            message: `Your appointment is confirmed for ${new Date(dateTime).toLocaleString()}.`,
            type: 'SUCCESS',
            link: '/dashboard',
            email: true
        });

        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private (Staff)
const getAppointments = async (req, res) => {
    try {
        let where = {};

        // If user is a doctor, only show their appointments
        if (req.user.role === 'doctor') {
            where.doctorId = req.user.id;
        } else if (req.user.role === 'patient') {
            where.patientId = req.user.id;
        }

        const appointments = await Appointment.findAll({
            where,
            include: [
                { model: User, as: 'patient', attributes: ['firstName', 'lastName'] },
                { model: User, as: 'doctor', attributes: ['firstName', 'lastName'] }
            ]
        });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Staff)
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findByPk(req.params.id);

        if (appointment) {
            appointment.status = status;
            await appointment.save();
            res.json(appointment);
        } else {
            res.status(404).json({ message: 'Appointment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createAppointment, getAppointments, updateAppointmentStatus };
