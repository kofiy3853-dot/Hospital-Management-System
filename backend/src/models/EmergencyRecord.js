const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const EmergencyRecord = sequelize.define('EmergencyRecord', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    patientId: {
        type: DataTypes.UUID,
        allowNull: true // Can be anonymous/new patient
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING
    },
    triageLevel: {
        type: DataTypes.ENUM('Critical', 'Urgent', 'Normal'),
        defaultValue: 'Normal'
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Triage', 'Active', 'Stable', 'Discharged', 'Admitted'),
        defaultValue: 'Triage'
    },
    assignedDoctorId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    arrivalTimestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true
});

module.exports = EmergencyRecord;
