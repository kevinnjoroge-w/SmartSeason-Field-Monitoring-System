const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host:     !process.env.DATABASE_URL ? (process.env.DB_HOST || 'localhost') : undefined,
  port:     !process.env.DATABASE_URL ? parseInt(process.env.DB_PORT || '5432', 10) : undefined,
  database: !process.env.DATABASE_URL ? (process.env.DB_NAME || 'smartseason') : undefined,
  user:     !process.env.DATABASE_URL ? (process.env.DB_USER || 'postgres') : undefined,
  password: !process.env.DATABASE_URL ? (process.env.DB_PASSWORD || '') : undefined,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle DB client', err);
  process.exit(-1);
});

module.exports = pool;
