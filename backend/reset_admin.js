require('dotenv').config();
const { connectDB, sequelize } = require('./src/config/db');
const { User } = require('./src/models');

const resetAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB...');

        const user = await User.findOne({ where: { email: 'admin@hms.com' } });
        if (!user) {
            console.log('Admin user not found. Creating new one...');
            await User.create({
                firstName: 'Super',
                lastName: 'Admin',
                email: 'admin@hms.com',
                password: 'AdminPassword123',
                role: 'admin'
            });
        } else {
            console.log('Admin user found. Resetting password...');
            user.password = 'AdminPassword123';
            await user.save();
        }
        
        console.log('✅ Admin password has been reset to: AdminPassword123');
        process.exit();
    } catch (err) {
        console.error('Reset failed:', err);
        process.exit(1);
    }
};

resetAdmin();
