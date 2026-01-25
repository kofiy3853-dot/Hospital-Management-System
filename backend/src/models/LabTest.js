const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LabTest = sequelize.define('LabTest', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    testName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    testCategory: {
        type: DataTypes.STRING,
        defaultValue: 'General'
    },
    status: {
        type: DataTypes.ENUM('Pending', 'In Progress', 'Completed', 'Cancelled'),
        defaultValue: 'Pending'
    },
    sampleType: {
        type: DataTypes.STRING
    },
    result: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    notes: {
        type: DataTypes.TEXT
    },
    resultDate: {
        type: DataTypes.DATE
    },
    isNHISCovered: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    patientId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    doctorId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    appointmentId: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = LabTest;
