const { AuditLog, User } = require('../models');

// @desc    Get all audit logs
// @route   GET /api/audit
// @access  Private (Admin)
const getLogs = async (req, res, next) => {
    try {
        const { limit = 50, offset = 0, action, resourceType, userId } = req.query;
        const where = {};

        if (action) where.action = action;
        if (resourceType) where.resourceType = resourceType;
        if (userId) where.userId = userId;

        const { count, rows } = await AuditLog.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'role'] }],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            total: count,
            logs: rows,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('Error in getLogs:', error);
        next(error);
    }
};

module.exports = { getLogs };
