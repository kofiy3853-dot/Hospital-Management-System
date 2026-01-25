require('dotenv').config();
const { createBackup } = require('./src/controllers/backupController');
const { connectDB } = require('./src/config/db');

const run = async () => {
    try {
        await connectDB();
        console.log('Triggering manual backup for verification...');
        await createBackup();
        console.log('Backup verification complete.');
        process.exit(0);
    } catch (err) {
        console.error('Backup verification failed:', err);
        process.exit(1);
    }
};

run();
