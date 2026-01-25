const { Billing, User, Appointment } = require('../models');
const { logActivity } = require('../utils/logger');

// @desc    Create new bill
// @route   POST /api/billing
// @access  Private (Accountant, Admin)
const createBill = async (req, res, next) => {
    try {
        let { patientId, appointmentId, amount, dueDate, description, items, paymentMethod } = req.body;

        // If amount is not provided, calculate it from items
        if (!amount && items && items.length > 0) {
            amount = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        }

        const bill = await Billing.create({
            patientId,
            appointmentId,
            amount: amount || 0,
            dueDate,
            description,
            items: items || [],
            paymentMethod
        });

        res.status(201).json(bill);
        logActivity(req.user.id, 'CREATE', 'Billing', bill.id, { patientId, amount }, req.ip);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all bills
// @route   GET /api/billing
// @access  Private (Accountant, Admin)
const getAllBills = async (req, res, next) => {
    try {
        const { status, patientId } = req.query;
        const where = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;

        const bills = await Billing.findAll({
            where,
            include: [
                { model: User, as: 'patient', attributes: ['firstName', 'lastName', 'email'] },
                { model: Appointment, as: 'appointment' }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(bills);
    } catch (error) {
        next(error);
    }
};

// @desc    Get bill by ID
// @route   GET /api/billing/:id
// @access  Private
const getBillById = async (req, res, next) => {
    try {
        const bill = await Billing.findByPk(req.params.id, {
            include: [
                { model: User, as: 'patient', attributes: ['firstName', 'lastName', 'email', 'phoneNumber'] },
                { model: Appointment, as: 'appointment' }
            ]
        });

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        res.json(bill);
    } catch (error) {
        next(error);
    }
};

// @desc    Update bill status
// @route   PUT /api/billing/:id/status
// @access  Private (Accountant, Admin)
const updateBillStatus = async (req, res, next) => {
    try {
        const { status, paymentMethod } = req.body;
        const bill = await Billing.findByPk(req.params.id);

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        bill.status = status;
        if (status === 'paid') {
            bill.paidDate = new Date();
            if (paymentMethod) bill.paymentMethod = paymentMethod;
        }

        await bill.save();
        logActivity(req.user.id, 'UPDATE_STATUS', 'Billing', bill.id, { status, paymentMethod }, req.ip);
        res.json(bill);
    } catch (error) {
        next(error);
    }
};

// @desc    Get patient bills
// @route   GET /api/billing/patient/:patientId
// @access  Private
const getPatientBills = async (req, res, next) => {
    try {
        const bills = await Billing.findAll({
            where: { patientId: req.params.patientId },
            include: [{ model: Appointment, as: 'appointment' }],
            order: [['createdAt', 'DESC']]
        });

        res.json(bills);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete bill
// @route   DELETE /api/billing/:id
// @access  Private (Admin)
const deleteBill = async (req, res, next) => {
    try {
        const bill = await Billing.findByPk(req.params.id);

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        const billId = bill.id;
        await bill.destroy();
        logActivity(req.user.id, 'DELETE', 'Billing', billId, {}, req.ip);
        res.json({ message: 'Bill deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBill,
    getAllBills,
    getBillById,
    updateBillStatus,
    getPatientBills,
    deleteBill
};
