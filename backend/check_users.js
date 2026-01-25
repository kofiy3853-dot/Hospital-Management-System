require('dotenv').config();
const { connectDB } = require('./src/config/db');
const { User } = require('./src/models');

const checkUsers = async () => {
    try {
        await connectDB();
        const users = await User.findAll({
            attributes: ['email', 'role', 'password']
        });
        
        console.log('--- User List ---');
        users.forEach(u => {
            const isHashed = u.password.startsWith('$2');
            console.log(`Email: ${u.email} | Role: ${u.role} | Password Hashed: ${isHashed} (${u.password.substring(0, 10)}...)`);
        });
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
