const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  connectionString: env.databaseUrl,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL connection error:', error);
});

async function testDatabaseConnection() {
  const result = await pool.query(`
    SELECT
      current_database() AS database_name,
      NOW() AS connected_at
  `);

  console.log('Database connection successful:', result.rows[0]);

  return result.rows[0];
}

module.exports = {
  pool,
  testDatabaseConnection,
};
