const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MedicalRecord = sequelize.define('MedicalRecord', {
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
    appointmentId: {
        type: DataTypes.UUID
    },
    vitals: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    symptoms: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    diagnosis: {
        type: DataTypes.TEXT
    },
    treatmentPlan: {
        type: DataTypes.TEXT
    },
    soapNotes: {
        type: DataTypes.JSONB,
        defaultValue: {
            subjective: '',
            objective: '',
            assessment: '',
            plan: ''
        }
    },
    attachments: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    }
}, {
    timestamps: true
});

module.exports = MedicalRecord;
