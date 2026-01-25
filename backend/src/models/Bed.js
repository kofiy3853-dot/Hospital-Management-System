const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Bed = sequelize.define('Bed', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    bedNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Available', 'Occupied', 'Maintenance'),
        defaultValue: 'Available'
    },
    wardId: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = Bed;
