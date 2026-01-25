const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const createDatabase = async () => {
    // Get the base URI (connect to 'postgres' instead of 'HMS_db')
    const fullUri = process.env.POSTGRES_URI;
    const baseUri = fullUri.substring(0, fullUri.lastIndexOf('/')) + '/postgres';

    const client = new Client({
        connectionString: baseUri,
    });

    try {
        await client.connect();
        console.log('Connected to postgres default database');

        // Check if database exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname='hms_db'"); // Postgres names are typically lowercase

        if (res.rowCount === 0) {
            await client.query('CREATE DATABASE "HMS_db"');
            console.log('✅ Database "HMS_db" created successfully!');
        } else {
            console.log('Database "HMS_db" already exists.');
        }
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await client.end();
    }
};

createDatabase();
