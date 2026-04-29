import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://expenseuser:expensepassword@localhost:5432/expensedb',
});

export async function initDB(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id        SERIAL PRIMARY KEY,
        email     VARCHAR(255) UNIQUE NOT NULL,
        name      VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id        SERIAL PRIMARY KEY,
        user_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title     VARCHAR(255) NOT NULL,
        amount    DECIMAL(10,2) NOT NULL,
        type      VARCHAR(10) NOT NULL CHECK (type IN ('income','expense')),
        category  VARCHAR(100) NOT NULL,
        date      DATE NOT NULL DEFAULT CURRENT_DATE,
        note      TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Database initialised');
  } finally {
    client.release();
  }
}
