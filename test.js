require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const { rows } = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND table_schema = 'public'");
  console.log('Columns in public.users:', rows);
  pool.end();
}
run().catch(console.error);
