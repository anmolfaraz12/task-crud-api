require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT false
    );
  `);

  const result = await pool.query('SELECT COUNT(*) FROM tasks');
  const count = parseInt(result.rows[0].count, 10);

  if (count === 0) {
    await pool.query(
      `INSERT INTO tasks (title, done) VALUES
        ('Buy groceries', false),
        ('Finish assignment', false),
        ('Read a book', true)`
    );
    console.log('Seeded 3 example tasks.');
  }
}

module.exports = { pool, initDb };