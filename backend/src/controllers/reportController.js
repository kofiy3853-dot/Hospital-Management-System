const { User, Appointment, Inventory, Prescription, Billing, MedicalRecord, sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Get dashboard summary statistics
const getDashboardStats = async (req, res, next) => {
    try {
        const [patientCount, doctorCount, appointmentCount, lowStockCount] = await Promise.all([
            User.count({ where: { role: 'patient' } }),
            User.count({ where: { role: 'doctor' } }),
            Appointment.count(),
            Inventory.count({ where: { quantity: { [Op.lte]: 10 } } })
        ]);

        res.json({
            patients: patientCount,
            doctors: doctorCount,
            appointments: appointmentCount,
            lowStock: lowStockCount
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get financial analytics (last 30 days)
const getFinancialAnalytics = async (req, res, next) => {
    try {
        const revenueData = await Billing.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('paidDate')), 'date'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'revenue']
            ],
            where: {
                status: 'paid',
                paidDate: {
                    [Op.gte]: sequelize.literal("CURRENT_DATE - INTERVAL '30 days'")
                }
            },
            group: [sequelize.fn('DATE', sequelize.col('paidDate'))],
            order: [[sequelize.fn('DATE', sequelize.col('paidDate')), 'ASC']]
        });
        res.json(revenueData);
    } catch (error) {
        next(error);
    }
};

// @desc    Get clinical analytics (Top Illnesses & Drug Stats)
const getClinicalAnalytics = async (req, res, next) => {
    try {
        // Top 5 Diagnoses
        const diagnoses = await MedicalRecord.findAll({
            attributes: [
                'diagnosis',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                diagnosis: { [Op.ne]: null }
            },
            group: ['diagnosis'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            limit: 5
        });

        // Top 5 Drugs Prescribed
        // Note: medications is JSONB array: [{drugName: '...', ...}]
        const prescriptions = await Prescription.findAll({
            attributes: ['medications']
        });

        const drugCounts = {};
        prescriptions.forEach(p => {
            p.medications.forEach(m => {
                drugCounts[m.drugName] = (drugCounts[m.drugName] || 0) + 1;
            });
        });

        const topDrugs = Object.entries(drugCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        res.json({ diagnoses, topDrugs });
    } catch (error) {
        next(error);
    }
};

// @desc    Get patient registration trends
const getPatientAnalytics = async (req, res, next) => {
    try {
        const trends = await User.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                role: 'patient',
                createdAt: {
                    [Op.gte]: sequelize.literal("CURRENT_DATE - INTERVAL '30 days'")
                }
            },
            group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        });
        res.json(trends);
    } catch (error) {
        next(error);
    }
};

// @desc    Get inventory distribution
const getInventoryAnalytics = async (req, res, next) => {
    try {
        const distribution = await Inventory.findAll({
            attributes: [
                'category',
                [sequelize.fn('COUNT', sequelize.col('id')), 'itemCount'],
                [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity']
            ],
            group: ['category']
        });
        res.json(distribution);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getFinancialAnalytics,
    getClinicalAnalytics,
    getPatientAnalytics,
    getInventoryAnalytics
};
