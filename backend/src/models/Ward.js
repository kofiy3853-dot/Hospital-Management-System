const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Ward = sequelize.define('Ward', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING, // e.g., 'General', 'ICU', 'Maternity'
        defaultValue: 'General'
    },
    capacity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    departmentId: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = Ward;
