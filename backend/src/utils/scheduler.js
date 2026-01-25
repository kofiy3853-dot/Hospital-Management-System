const cron = require('node-cron');
const { createBackup } = require('../controllers/backupController');

const initScheduler = () => {
    // Run backup every midnight
    cron.schedule('0 0 * * *', () => {
        console.log('[SCHEDULER] Triggering Automated Midnight Backup...');
        createBackup(null, null, null);
    });

    console.log('[SCHEDULER] Automatic Backup Task Initialized (Midnight)');
};

module.exports = { initScheduler };
