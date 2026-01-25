const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.POSTGRES_URI, {
    dialect: 'postgres',
    logging: console.log, // Set to true if you want to see SQL queries
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL Connected Successfully via Sequelize');

        // Sync models (in development)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('All models were synchronized successfully.');
        }
    } catch (error) {
        console.error(`PostgreSQL Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
