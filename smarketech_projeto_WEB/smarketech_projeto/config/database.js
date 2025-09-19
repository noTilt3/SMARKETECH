const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool de conexões:', err.message);
});

pool.connect()
  .then(() => console.log('✅ Conectado ao Supabase PostgreSQL'))
  .catch(err => console.error('❌ Erro ao conectar com o Supabase:', err.message));
 
  module.exports = { pool };