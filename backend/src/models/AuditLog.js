const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    action: {
        type: DataTypes.STRING, // e.g., 'VIEW', 'CREATE', 'UPDATE', 'DELETE'
        allowNull: false
    },
    resourceType: {
        type: DataTypes.STRING, // e.g., 'Patient', 'MedicalRecord', 'Billing'
        allowNull: false
    },
    resourceId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    details: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true,
    updatedAt: false // Logs are immutable
});

module.exports = AuditLog;
