require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

// Apenas para confirmar no terminal que a ligação foi bem sucedida
pool.on('connect', () => {
  console.log('Ligação à base de dados estabelecida com sucesso!');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};