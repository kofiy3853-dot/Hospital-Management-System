const User = require('./User');
const Department = require('./Department');
const Appointment = require('./Appointment');
const MedicalRecord = require('./MedicalRecord');
const Prescription = require('./Prescription');
const Inventory = require('./Inventory');
const LabTest = require('./LabTest');
const Billing = require('./Billing');
const AuditLog = require('./AuditLog');
const Ward = require('./Ward');
const Bed = require('./Bed');
const Admission = require('./Admission');
const Notification = require('./Notification');
const EmergencyRecord = require('./EmergencyRecord');
const { sequelize } = require('../config/db');

// Associations

// Department - User (Staff)
Department.hasMany(User, { foreignKey: 'departmentId', as: 'staff' });
User.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

// Head of Department
Department.belongsTo(User, { foreignKey: 'headId', as: 'head' });

// Appointments
User.hasMany(Appointment, { foreignKey: 'patientId', as: 'patientAppointments' });
User.hasMany(Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
Appointment.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Appointment.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

// Medical Records
User.hasMany(MedicalRecord, { foreignKey: 'patientId', as: 'patientRecords' });
MedicalRecord.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
MedicalRecord.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
MedicalRecord.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

// Prescriptions
User.hasMany(Prescription, { foreignKey: 'patientId', as: 'patientPrescriptions' });
Prescription.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Prescription.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
Prescription.belongsTo(MedicalRecord, { foreignKey: 'medicalRecordId', as: 'medicalRecord' });

// Lab Tests
User.hasMany(LabTest, { foreignKey: 'patientId', as: 'patientLabTests' });
LabTest.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
LabTest.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
LabTest.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

// Billing
User.hasMany(Billing, { foreignKey: 'patientId', as: 'patientBillings' });
Billing.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Appointment.hasMany(Billing, { foreignKey: 'appointmentId', as: 'appointmentBillings' });
Billing.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

// Audit Logs
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'activityLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Ward & Bed Management
Department.hasMany(Ward, { foreignKey: 'departmentId', as: 'wards' });
Ward.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

Ward.hasMany(Bed, { foreignKey: 'wardId', as: 'beds' });
Bed.belongsTo(Ward, { foreignKey: 'wardId', as: 'ward' });

// Admissions
User.hasMany(Admission, { foreignKey: 'patientId', as: 'admissions' });
Admission.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

Bed.hasMany(Admission, { foreignKey: 'bedId', as: 'bedAdmissions' });
Admission.belongsTo(Bed, { foreignKey: 'bedId', as: 'bed' });

// Emergency Records
User.hasMany(EmergencyRecord, { foreignKey: 'patientId', as: 'emergencyCases' });
EmergencyRecord.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
EmergencyRecord.belongsTo(User, { foreignKey: 'assignedDoctorId', as: 'doctor' });

// Notifications
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
    User,
    Department,
    Appointment,
    MedicalRecord,
    Prescription,
    Inventory,
    LabTest,
    Billing,
    AuditLog,
    Ward,
    Bed,
    Admission,
    Notification,
    EmergencyRecord,
    sequelize
};
