const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('super_admin', 'admin', 'doctor', 'nurse', 'pharmacist', 'lab_tech', 'receptionist', 'accountant', 'patient'),
        defaultValue: 'patient'
    },
    phoneNumber: {
        type: DataTypes.STRING
    },
    address: {
        type: DataTypes.TEXT
    },
    gender: {
        type: DataTypes.ENUM('Male', 'Female', 'Other')
    },
    dateOfBirth: {
        type: DataTypes.DATEONLY
    },
    // Insurance & NHIS (Ghana)
    insuranceProvider: {
        type: DataTypes.STRING
    },
    insurancePolicyNumber: {
        type: DataTypes.STRING
    },
    isNHIS: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    nhisNumber: {
        type: DataTypes.STRING
    },
    // Additional role-specific information
    professionalInfo: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    patientInfo: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    medicalHistory: {
        type: DataTypes.TEXT
    },
    emergencyContact: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    timestamps: true,
    hooks: {
        beforeSave: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Instance method to match password
User.prototype.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
