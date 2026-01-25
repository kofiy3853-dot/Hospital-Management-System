require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Middleware
app.use(limiter);
app.use(helmet()); // Security headers
app.use(cors({
    origin: (origin, callback) => callback(null, true), // Allow all origins for Desktop App
    credentials: true
}));
app.use(morgan('dev')); // Logging
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const reportRoutes = require('./routes/reportRoutes');
const labRoutes = require('./routes/labRoutes');
// Removed duplicate billingRoutes import line here since it's used in app.use below
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Hospital Management System API' });
});

// Health Check for Electron
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/billing', require('./routes/billingRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));
app.use('/api/wards', require('./routes/wardRoutes'));
app.use('/api/admissions', require('./routes/admissionRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/backups', require('./routes/backupRoutes'));
app.use('/api/emergency', require('./routes/emergencyRoutes'));
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
// Removed duplicates
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);

// Error Handling Middleware
app.use((err, req, res, _next) => {
    console.error('SERVER ERROR:', err.stack);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

module.exports = app;
