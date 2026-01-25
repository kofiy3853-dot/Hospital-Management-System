const { Prescription, Inventory, User } = require('../models');
const { sendNotification } = require('../utils/notificationService');

// @desc    Create prescription
// @route   POST /api/pharmacy/prescriptions
// @access  Private (Doctor)
const createPrescription = async (req, res) => {
    try {
        const { patientId, medications, medicalRecordId } = req.body;

        const prescription = await Prescription.create({
            patientId,
            doctorId: req.user.id,
            medicalRecordId,
            medications
        });

        // Notify Patient
        await sendNotification(patientId, {
            title: 'New Prescription',
            message: 'A new prescription has been added to your record.',
            type: 'INFO',
            link: '/patient-portal'
        });

        // Notify Pharmacist
        const pharmacists = await User.findAll({ where: { role: 'pharmacist' } });
        for (const p of pharmacists) {
            await sendNotification(p.id, {
                title: 'New Prescription Request',
                message: 'A new prescription is pending dispensing.',
                type: 'INFO',
                link: '/pharmacy'
            });
        }

        res.status(201).json(prescription);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Dispense medication (Update inventory)
// @route   PUT /api/pharmacy/dispense/:id
// @access  Private (Pharmacist)
const dispenseMedication = async (req, res) => {
    try {
        const prescription = await Prescription.findByPk(req.params.id);

        if (prescription) {
            // Logic to deduct from Inventory
            for (const med of prescription.medications) {
                const item = await Inventory.findOne({ where: { itemName: med.drugName } });
                if (item) {
                    item.quantity -= 1; // Basic logic, can be improved with actual unit tracking
                    await item.save();

                    // Alert if stock is low after dispensing
                    if (item.quantity <= 10) {
                        const staff = await User.findAll({ where: { role: ['admin', 'pharmacist'] } });
                        for (const member of staff) {
                            await sendNotification(member.id, {
                                title: 'Low Drug Stock Alert',
                                message: `CRITICAL: ${item.itemName} is low on stock after dispensing. Only ${item.quantity} left.`,
                                type: 'WARNING',
                                link: '/inventory'
                            });
                        }
                    }
                }
            }

            prescription.status = 'Dispensed';
            await prescription.save();
            res.json({ message: 'Medication dispensed successfully', prescription });
        } else {
            res.status(404).json({ message: 'Prescription not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all prescriptions (filtered or all)
// @route   GET /api/pharmacy/prescriptions
// @access  Private (Doctor, Pharmacist)
const getPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.findAll({
            include: [{ model: User, as: 'patient', attributes: ['firstName', 'lastName'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all inventory items
// @route   GET /api/pharmacy/inventory
// @access  Private
const getInventory = async (req, res) => {
    try {
        const items = await Inventory.findAll();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update/Add inventory item
// @route   POST /api/pharmacy/inventory
// @access  Private (Pharmacist, Admin)
const updateInventoryItem = async (req, res) => {
    try {
        const { itemName, category, quantity, unit, price } = req.body;
        let item = await Inventory.findOne({ where: { itemName } });

        if (item) {
            item.quantity += Number(quantity);
            await item.save();
        } else {
            item = await Inventory.create({ itemName, category, quantity, unit, price });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createPrescription, dispenseMedication, getPrescriptions, getInventory, updateInventoryItem };
