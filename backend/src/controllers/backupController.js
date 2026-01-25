const fs = require('fs');
const path = require('path');
const models = require('../models');
const { sequelize } = models;

const BACKUP_DIR = path.join(__dirname, '../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// @desc    Create manual backup
// @route   POST /api/backups
// @access  Private (Admin)
const createBackup = async (req, res, next) => {
    try {
        const backupData = {};
        const modelNames = Object.keys(models).filter(name => name !== 'sequelize' && name !== 'Sequelize');

        // Order of tables matters for restoration (dependencies first)
        // Simplified approach: Serialize all, then restore in specific order
        for (const modelName of modelNames) {
            const data = await models[modelName].findAll({ raw: true });
            backupData[modelName] = data;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `hms_backup_${timestamp}.json`;
        const filePath = path.join(BACKUP_DIR, fileName);

        fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

        if (res) {
            res.status(201).json({ message: 'Backup created successfully', fileName });
        } else {
            console.log(`[AUTO-BACKUP] Created: ${fileName}`);
        }
    } catch (error) {
        if (next) next(error);
        else console.error('Backup Error:', error);
    }
};

// @desc    Get all backups
// @route   GET /api/backups
// @access  Private (Admin)
const getBackups = async (req, res, next) => {
    try {
        const files = fs.readdirSync(BACKUP_DIR)
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const stats = fs.statSync(path.join(BACKUP_DIR, file));
                return {
                    name: file,
                    size: (stats.size / 1024).toFixed(2) + ' KB',
                    createdAt: stats.birthtime
                };
            })
            .sort((a, b) => b.createdAt - a.createdAt);

        res.json(files);
    } catch (error) {
        next(error);
    }
};

// @desc    Restore database from backup
// @route   POST /api/backups/restore/:filename
// @access  Private (Admin)
const restoreBackup = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const fileName = req.params.filename;
        const filePath = path.join(BACKUP_DIR, fileName);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Backup file not found' });
        }

        const backupData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // 1. Disable constraints
        await sequelize.query('SET CONSTRAINTS ALL DEFERRED', { transaction });

        // 2. Clear tables in reverse order of dependencies (Self-referencing tables handled by truncate cascade)
        const modelNames = Object.keys(models).filter(name => name !== 'sequelize' && name !== 'Sequelize');

        // Truncate all tables
        for (const modelName of modelNames) {
            await models[modelName].destroy({ where: {}, truncate: { cascade: true }, transaction });
        }

        // 3. Restore data in specific order to satisfy foreign keys
        // Order: Departments -> Users -> (Wards/Beds/Appointments/etc)
        const orderedModels = [
            'Department', 'User', 'Ward', 'Bed', 'Inventory', 'Appointment',
            'Admission', 'MedicalRecord', 'Prescription', 'LabTest',
            'Billing', 'Notification', 'AuditLog'
        ];

        for (const modelName of orderedModels) {
            if (backupData[modelName] && backupData[modelName].length > 0) {
                await models[modelName].bulkCreate(backupData[modelName], { transaction });
            }
        }

        await transaction.commit();
        res.json({ message: 'Database restored successfully' });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

// @desc    Download backup file
// @route   GET /api/backups/download/:filename
// @access  Private (Admin)
const downloadBackup = async (req, res, next) => {
    try {
        const fileName = req.params.filename;
        const filePath = path.join(BACKUP_DIR, fileName);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Backup file not found' });
        }

        res.download(filePath);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBackup,
    getBackups,
    restoreBackup,
    downloadBackup
};
