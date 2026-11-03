import pg from 'pg';

const { Pool } = pg;
if (!process.env.DATABASE_URL) {
  // Keep module import safe for health checks, but database routes will fail clearly.
  console.warn('DATABASE_URL is not configured.');
}
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});
pool.on('error', (error) => console.error('Unexpected PostgreSQL pool error:', error));