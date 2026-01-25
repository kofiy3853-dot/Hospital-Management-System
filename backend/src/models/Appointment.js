const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Appointment = sequelize.define('Appointment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    patientId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    doctorId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    dateTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Confirmed', 'Checked-in', 'In-consultation', 'Completed', 'Cancelled'),
        defaultValue: 'Pending'
    },
    reason: {
        type: DataTypes.STRING
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: true
});

module.exports = Appointment;
