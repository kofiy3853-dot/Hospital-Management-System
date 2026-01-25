const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Prescription = sequelize.define('Prescription', {
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
    medicalRecordId: {
        type: DataTypes.UUID
    },
    medications: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Dispensed', 'Cancelled'),
        defaultValue: 'Pending'
    }
}, {
    timestamps: true
});

module.exports = Prescription;
