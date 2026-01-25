const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Admission = sequelize.define('Admission', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    patientId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    bedId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    admissionDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    dischargeDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    diagnosis: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.ENUM('Admitted', 'Discharged'),
        defaultValue: 'Admitted'
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: true
});

module.exports = Admission;
