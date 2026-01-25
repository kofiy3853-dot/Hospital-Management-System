const { User, Appointment, Inventory, Prescription, LabTest, Billing, MedicalRecord } = require('../models');
const { Op } = require('sequelize');

// @desc    Get role-specific dashboard summary
// @route   GET /api/dashboard
// @access  Private
const getDashboardSummary = async (req, res, next) => {
    try {
        const role = req.user.role;
        const userId = req.user.id;
        console.log(`[Dashboard] User: ${req.user.email} (ID: ${userId}), Role: ${role}`);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let summary = { role };

        if (['admin', 'super_admin'].includes(role)) {
            console.log('[Dashboard] Admin stats requested');
            try {
                const [patients, staff, revenue, lowStock] = await Promise.all([
                    User.count({ where: { role: 'patient' } }),
                    User.count({ where: { role: { [Op.ne]: 'patient' } } }),
                    Billing.sum('amount', { where: { status: 'paid' } }).catch(e => { console.error('Sum error:', e); return 0; }),
                    Inventory.count({ where: { quantity: { [Op.lte]: 10 } } })
                ]);
                summary = { ...summary, patients, staff, revenue: Number(revenue) || 0, lowStock };
            } catch (queryErr) {
                console.error('[Dashboard] Admin query block failed:', queryErr);
                throw queryErr;
            }
        }

        else if (role === 'doctor') {
            console.log('[Dashboard] Doctor stats requested');
            try {
                const [appointments, pendingRecords] = await Promise.all([
                    Appointment.findAll({
                        where: {
                            doctorId: userId,
                            dateTime: { [Op.gte]: today }
                        },
                        include: [{ model: User, as: 'patient', attributes: ['firstName', 'lastName'] }],
                        order: [['dateTime', 'ASC']]
                    }),
                    MedicalRecord.count({
                        where: {
                            doctorId: userId,
                            [Op.or]: [{ diagnosis: null }, { diagnosis: '' }]
                        }
                    })
                ]);
                summary = { ...summary, todayAppointments: appointments, pendingRecordsCount: pendingRecords };
            } catch (queryErr) {
                console.error('[Dashboard] Doctor query block failed:', queryErr);
                throw queryErr;
            }
        }

        else if (role === 'pharmacist') {
            console.log('[Dashboard] Pharmacist stats requested');
            const [pendingPrescriptions, lowStockItems] = await Promise.all([
                Prescription.count({ where: { status: 'Pending' } }),
                Inventory.findAll({
                    where: { quantity: { [Op.lte]: 10 } },
                    attributes: ['id', 'name', 'quantity', 'unit']
                })
            ]);
            summary = { ...summary, pendingPrescriptions, lowStockItems };
        }

        else if (role === 'lab_tech') {
            console.log('[Dashboard] Lab Tech stats requested');
            const [pendingTests, inProgressTests] = await Promise.all([
                LabTest.count({ where: { status: 'Pending' } }),
                LabTest.findAll({
                    where: { status: 'In Progress' },
                    include: [
                        { model: User, as: 'patient', attributes: ['firstName', 'lastName'] },
                        { model: User, as: 'doctor', attributes: ['firstName', 'lastName'] }
                    ]
                })
            ]);
            summary = { ...summary, pendingTestsCount: pendingTests, inProgressTests };
        }

        console.log('[Dashboard] Successfully generated summary for', role);
        res.json(summary);
    } catch (error) {
        console.error('[Dashboard] CRITICAL ERROR:', error);
        next(error);
    }
};

module.exports = { getDashboardSummary };
