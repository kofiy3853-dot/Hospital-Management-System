const { AuditLog } = require('../models');

/**
 * Logs a system activity for audit purposes.
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Action performed (e.g., VIEW, CREATE, UPDATE, DELETE)
 * @param {string} resourceType - Type of resource being acted upon
 * @param {string} resourceId - ID of the specific resource
 * @param {object} details - Additional metadata or changes
 * @param {string} ipAddress - IP address of the user
 */
const logActivity = async (userId, action, resourceType, resourceId, details = {}, ipAddress = 'unknown') => {
    try {
        await AuditLog.create({
            userId,
            action,
            resourceType,
            resourceId,
            details,
            ipAddress
        });
    } catch (error) {
        console.error('Audit Log Error:', error);
        // We don't throw here to avoid failing the main request if logging fails
    }
};

module.exports = { logActivity };
