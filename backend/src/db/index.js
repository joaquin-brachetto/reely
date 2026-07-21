import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    })
    : new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    })
export const runMigrations = async () => {
    try {
        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
            
            CREATE TABLE IF NOT EXISTS verification_codes (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                code VARCHAR(10) NOT NULL,
                type VARCHAR(20) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Migraciones de DB completadas');
    } catch (e) {
        console.error('Error en migraciones:', e);
    }
}

export default pool