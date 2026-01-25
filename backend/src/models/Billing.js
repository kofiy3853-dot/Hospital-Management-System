const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Billing = sequelize.define('Billing', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    patientId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    appointmentId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'cancelled', 'overdue'),
        defaultValue: 'pending'
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    paidDate: {
        type: DataTypes.DATE
    },
    description: {
        type: DataTypes.TEXT
    },
    items: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    paymentMethod: {
        type: DataTypes.STRING
    },
    billingType: {
        type: DataTypes.ENUM('Cash', 'Insurance', 'NHIS'),
        defaultValue: 'Cash'
    },
    insuranceCoveragePercentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00
    }
}, {
    timestamps: true
});

module.exports = Billing;
