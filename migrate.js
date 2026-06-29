require('dotenv').config();
const Database = require('better-sqlite3');
const { Pool } = require('pg');
const path = require('path');

async function migrate() {
  const pgUrl = process.env.DATABASE_URL;
  if (!pgUrl) {
    console.error('Lütfen .env dosyasına DATABASE_URL ekleyin!');
    process.exit(1);
  }

  console.log('PostgreSQL bağlantısı kuruluyor...');
  const pool = new Pool({
    connectionString: pgUrl,
    ssl: { rejectUnauthorized: false }
  });

  const sqlite = new Database(path.join(__dirname, 'data', 'kpss.db'), { fileMustExist: true });
  console.log('SQLite veritabanı açıldı.');

  // Supabase şemasını (tabloları) oluştur
  console.log('PostgreSQL tabloları temizleniyor ve yeniden oluşturuluyor...');
  await pool.query(`
    DROP TABLE IF EXISTS "session" CASCADE;
    DROP TABLE IF EXISTS daily_stats CASCADE;
    DROP TABLE IF EXISTS study_sessions CASCADE;
    DROP TABLE IF EXISTS net_records CASCADE;
    DROP TABLE IF EXISTS curriculum CASCADE;
    DROP TABLE IF EXISTS notes CASCADE;
    DROP TABLE IF EXISTS todos CASCADE;
    DROP TABLE IF EXISTS users CASCADE;

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT DEFAULT '',
      role TEXT DEFAULT 'user',
      exam_date TEXT DEFAULT '2026-10-25',
      exam_time TEXT DEFAULT '10:00',
      pom_work_min INTEGER DEFAULT 25,
      pom_break_min INTEGER DEFAULT 5,
      pom_long_break_min INTEGER DEFAULT 15,
      daily_goal_minutes INTEGER DEFAULT 120,
      streak_count INTEGER DEFAULT 0,
      streak_last_date TEXT DEFAULT '',
      motivation_date TEXT DEFAULT '',
      motivation_index INTEGER DEFAULT 0,
      net_inputs TEXT DEFAULT '{}',
      last_simulation TEXT DEFAULT NULL,
      active_timer TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL
    );
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'session_pkey') THEN
        ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
      END IF;
    END
    $$;
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

    CREATE TABLE IF NOT EXISTS daily_stats (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      work_seconds INTEGER DEFAULT 0,
      break_seconds INTEGER DEFAULT 0,
      sessions_count INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, date)
    );

    CREATE TABLE IF NOT EXISTS study_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      mode TEXT NOT NULL,
      duration INTEGER NOT NULL,
      time_str TEXT,
      break_type TEXT DEFAULT NULL,
      subject TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS net_records (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      time_str TEXT,
      subjects TEXT NOT NULL,
      total_net REAL NOT NULL,
      simulation TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS curriculum (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      topic_key TEXT NOT NULL,
      completed INTEGER DEFAULT 1,
      completed_date TEXT DEFAULT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, topic_key)
    );

    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT,
      content TEXT NOT NULL,
      subject TEXT DEFAULT 'genel',
      image_url TEXT DEFAULT NULL,
      date TEXT,
      time_str TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      text TEXT NOT NULL,
      done INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Veriler kopyalanıyor: users...');
  const users = sqlite.prepare('SELECT * FROM users').all();
  for (const u of users) {
    await pool.query(
      `INSERT INTO users (id, username, email, password_hash, full_name, role, exam_date, exam_time, pom_work_min, pom_break_min, pom_long_break_min, daily_goal_minutes, streak_count, streak_last_date, motivation_date, motivation_index, net_inputs, last_simulation, active_timer, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
       ON CONFLICT (id) DO NOTHING`,
      [u.id, u.username, u.email, u.password_hash, u.full_name, u.role, u.exam_date, u.exam_time, u.pom_work_min, u.pom_break_min, u.pom_long_break_min, u.daily_goal_minutes, u.streak_count, u.streak_last_date, u.motivation_date, u.motivation_index, u.net_inputs, u.last_simulation, u.active_timer, u.created_at]
    );
  }
  await pool.query(`SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1), true)`);

  console.log('Veriler kopyalanıyor: daily_stats...');
  const stats = sqlite.prepare('SELECT * FROM daily_stats').all();
  for (const s of stats) {
    await pool.query(
      `INSERT INTO daily_stats (user_id, date, work_seconds, break_seconds, sessions_count)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id, date) DO NOTHING`,
      [s.user_id, s.date, s.work_seconds, s.break_seconds, s.sessions_count]
    );
  }

  console.log('Veriler kopyalanıyor: study_sessions...');
  const sessions = sqlite.prepare('SELECT * FROM study_sessions').all();
  for (const s of sessions) {
    await pool.query(
      `INSERT INTO study_sessions (id, user_id, date, mode, duration, time_str, break_type, subject, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
      [s.id, s.user_id, s.date, s.mode, s.duration, s.time_str, s.break_type, s.subject, s.created_at]
    );
  }
  await pool.query(`SELECT setval('study_sessions_id_seq', COALESCE((SELECT MAX(id) FROM study_sessions), 1), true)`);

  console.log('Veriler kopyalanıyor: net_records...');
  const nets = sqlite.prepare('SELECT * FROM net_records').all();
  for (const n of nets) {
    await pool.query(
      `INSERT INTO net_records (id, user_id, date, time_str, subjects, total_net, simulation, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
      [n.id, n.user_id, n.date, n.time_str, n.subjects, n.total_net, n.simulation, n.created_at]
    );
  }
  await pool.query(`SELECT setval('net_records_id_seq', COALESCE((SELECT MAX(id) FROM net_records), 1), true)`);

  console.log('Veriler kopyalanıyor: curriculum...');
  const curr = sqlite.prepare('SELECT * FROM curriculum').all();
  for (const c of curr) {
    await pool.query(
      `INSERT INTO curriculum (user_id, topic_key, completed, completed_date, updated_at)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id, topic_key) DO NOTHING`,
      [c.user_id, c.topic_key, c.completed, c.completed_date, c.updated_at]
    );
  }

  console.log('Veriler kopyalanıyor: notes...');
  const notes = sqlite.prepare('SELECT * FROM notes').all();
  for (const n of notes) {
    await pool.query(
      `INSERT INTO notes (id, user_id, title, content, subject, image_url, date, time_str, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
      [n.id, n.user_id, n.title, n.content, n.subject, n.image_url, n.date, n.time_str, n.created_at]
    );
  }
  await pool.query(`SELECT setval('notes_id_seq', COALESCE((SELECT MAX(id) FROM notes), 1), true)`);

  console.log('Veriler kopyalanıyor: todos...');
  const todos = sqlite.prepare('SELECT * FROM todos').all();
  for (const t of todos) {
    await pool.query(
      `INSERT INTO todos (id, user_id, date, text, done, created_at)
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
      [t.id, t.user_id, t.date, t.text, t.done, t.created_at]
    );
  }
  await pool.query(`SELECT setval('todos_id_seq', COALESCE((SELECT MAX(id) FROM todos), 1), true)`);

  console.log('✅ Göç işlemi (Migration) BAŞARIYLA TAMAMLANDI!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Hata oluştu:', err);
  process.exit(1);
});
