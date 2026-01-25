const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Inventory = sequelize.define('Inventory', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    itemName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('Medication', 'Supply', 'Equipment')
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    unit: {
        type: DataTypes.STRING
    },
    reorderLevel: {
        type: DataTypes.INTEGER
    },
    expiryDate: {
        type: DataTypes.DATE
    },
    price: {
        type: DataTypes.DECIMAL(10, 2)
    },
    isNHISCovered: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true
});

module.exports = Inventory;
