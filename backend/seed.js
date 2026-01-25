const dotenv = require('dotenv');
dotenv.config();
const { connectDB, sequelize } = require('./src/config/db');
const { User } = require('./src/models');

const seedAdmin = async () => {
    try {
        await connectDB();
        console.log('PostgreSQL Connected for seeding...');

        const adminExists = await User.findOne({ where: { email: 'admin@hms.com' } });
        if (adminExists) {
            console.log('Admin user already exists.');
            process.exit();
        }

        const adminUser = await User.create({
            firstName: 'Super',
            lastName: 'Admin',
            email: 'admin@hms.com',
            password: 'AdminPassword123',
            role: 'admin'
        });

        console.log('✅ Default Admin User Created Successfully!');
        console.log('Email: admin@hms.com');
        console.log('Password: AdminPassword123');
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
