const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'kpss.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS daily_stats (
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    work_seconds INTEGER DEFAULT 0,
    break_seconds INTEGER DEFAULT 0,
    sessions_count INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    mode TEXT NOT NULL CHECK(mode IN ('work','break')),
    duration INTEGER NOT NULL,
    time_str TEXT,
    break_type TEXT DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS net_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    time_str TEXT,
    subjects TEXT NOT NULL,
    total_net REAL NOT NULL,
    simulation TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS curriculum (
    user_id INTEGER NOT NULL,
    topic_key TEXT NOT NULL,
    completed INTEGER DEFAULT 1,
    updated_at TEXT DEFAULT (datetime('now','localtime')),
    PRIMARY KEY (user_id, topic_key),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    subject TEXT DEFAULT 'genel',
    date TEXT,
    time_str TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    text TEXT NOT NULL,
    done INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON study_sessions(user_id, date);
  CREATE INDEX IF NOT EXISTS idx_net_user ON net_records(user_id);
  CREATE INDEX IF NOT EXISTS idx_todos_user_date ON todos(user_id, date);
  CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
`);

/* ─── Schema Migration ─── */
function safeAddColumn(table, column, definition) {
  try {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
    if (!cols.includes(column)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
  } catch { /* ignore */ }
}
safeAddColumn('users', 'role', "TEXT DEFAULT 'user'");
safeAddColumn('users', 'daily_goal_minutes', 'INTEGER DEFAULT 120');
safeAddColumn('users', 'pom_long_break_min', 'INTEGER DEFAULT 15');
safeAddColumn('study_sessions', 'break_type', 'TEXT DEFAULT NULL');
safeAddColumn('study_sessions', 'subject', "TEXT DEFAULT NULL");
safeAddColumn('curriculum', 'completed_date', "TEXT DEFAULT NULL");
safeAddColumn('notes', 'image_url', "TEXT DEFAULT NULL");

/* ─── Make first user admin ─── */
function ensureFirstAdmin() {
  const first = db.prepare('SELECT id FROM users ORDER BY id ASC LIMIT 1').get();
  if (first) {
    db.prepare("UPDATE users SET role = 'admin' WHERE id = ? AND role = 'user'").run(first.id);
  }
}
try { ensureFirstAdmin(); } catch { /* table might be empty */ }

/* ─── Helpers ─── */
function parseJson(val, fallback = null) {
  if (val == null || val === '') return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

/* ─── Users ─── */
function getUserById(id) {
  const row = db.prepare(`
    SELECT id, username, email, full_name, role, exam_date, exam_time,
           pom_work_min, pom_break_min, pom_long_break_min, daily_goal_minutes,
           streak_count, streak_last_date, motivation_date, motivation_index,
           net_inputs, last_simulation, active_timer, created_at
    FROM users WHERE id = ?
  `).get(id);
  if (!row) return null;
  return {
    ...row,
    net_inputs: parseJson(row.net_inputs, {}),
    last_simulation: parseJson(row.last_simulation),
    active_timer: parseJson(row.active_timer),
  };
}

function getUserByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE').get(username);
}

function getUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(email);
}

function createUser({ username, email, passwordHash, fullName }) {
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const role = count === 0 ? 'admin' : 'user';
  const result = db.prepare(`
    INSERT INTO users (username, email, password_hash, full_name, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(username, email, passwordHash, fullName || '', role);
  return getUserById(result.lastInsertRowid);
}

function updateUserSettings(userId, fields) {
  const allowed = [
    'exam_date', 'exam_time', 'pom_work_min', 'pom_break_min', 'pom_long_break_min',
    'daily_goal_minutes', 'streak_count', 'streak_last_date', 'motivation_date',
    'motivation_index', 'net_inputs', 'last_simulation', 'active_timer', 'full_name'
  ];
  const sets = [];
  const vals = [];
  for (const [k, v] of Object.entries(fields)) {
    const col = k.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
    if (!allowed.includes(col)) continue;
    sets.push(`${col} = ?`);
    vals.push(typeof v === 'object' ? JSON.stringify(v) : v);
  }
  if (!sets.length) return getUserById(userId);
  vals.push(userId);
  db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return getUserById(userId);
}

/* ─── Daily Stats ─── */
function ensureDailyStats(userId, date) {
  db.prepare(`
    INSERT OR IGNORE INTO daily_stats (user_id, date, work_seconds, break_seconds, sessions_count)
    VALUES (?, ?, 0, 0, 0)
  `).run(userId, date);
  return db.prepare('SELECT * FROM daily_stats WHERE user_id = ? AND date = ?').get(userId, date);
}

function addSession(userId, { date, mode, duration, timeStr, breakType, subject }) {
  ensureDailyStats(userId, date);
  const col = mode === 'work' ? 'work_seconds' : 'break_seconds';
  db.prepare(`
    UPDATE daily_stats SET ${col} = ${col} + ?, sessions_count = sessions_count + 1
    WHERE user_id = ? AND date = ?
  `).run(duration, userId, date);
  const result = db.prepare(`
    INSERT INTO study_sessions (user_id, date, mode, duration, time_str, break_type, subject)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, date, mode, duration, timeStr, breakType || null, subject || null);
  return result.lastInsertRowid;
}

function getDailyStats(userId, limit = 60) {
  return db.prepare(`
    SELECT date, work_seconds, break_seconds, sessions_count
    FROM daily_stats WHERE user_id = ? ORDER BY date DESC LIMIT ?
  `).all(userId, limit);
}

function getSessions(userId, date, limit = 50) {
  if (date) {
    return db.prepare(`
      SELECT id, date, mode, duration, time_str, break_type, subject, created_at
      FROM study_sessions WHERE user_id = ? AND date = ? ORDER BY id DESC LIMIT ?
    `).all(userId, date, limit);
  }
  return db.prepare(`
    SELECT id, date, mode, duration, time_str, break_type, subject, created_at
    FROM study_sessions WHERE user_id = ? ORDER BY id DESC LIMIT ?
  `).all(userId, limit);
}

/* ─── Net Records ─── */
function addNetRecord(userId, record) {
  const result = db.prepare(`
    INSERT INTO net_records (user_id, date, time_str, subjects, total_net, simulation)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, record.date, record.timeStr, JSON.stringify(record.subjects), record.totalNet, JSON.stringify(record.simulation || null));
  return result.lastInsertRowid;
}

function getNetRecords(userId, limit = 100) {
  return db.prepare(`
    SELECT id, date, time_str, subjects, total_net, simulation, created_at
    FROM net_records WHERE user_id = ? ORDER BY id DESC LIMIT ?
  `).all(userId, limit).map(r => ({
    ...r,
    subjects: parseJson(r.subjects, {}),
    simulation: parseJson(r.simulation),
  }));
}

/* ─── Curriculum ─── */
function getCurriculum(userId) {
  const rows = db.prepare('SELECT topic_key, completed, completed_date FROM curriculum WHERE user_id = ?').all(userId);
  const map = {};
  rows.forEach(r => { map[r.topic_key] = { completed: !!r.completed, completed_date: r.completed_date }; });
  return map;
}

function toggleCurriculum(userId, topicKey, completed, completedDate) {
  if (completed) {
    db.prepare(`
      INSERT INTO curriculum (user_id, topic_key, completed, completed_date) VALUES (?, ?, 1, ?)
      ON CONFLICT(user_id, topic_key) DO UPDATE SET completed = 1, completed_date = ?, updated_at = datetime('now','localtime')
    `).run(userId, topicKey, completedDate || null, completedDate || null);
  } else {
    db.prepare('DELETE FROM curriculum WHERE user_id = ? AND topic_key = ?').run(userId, topicKey);
  }
}

/* ─── Notes ─── */
function getNotes(userId) {
  return db.prepare(`
    SELECT id, title, content, subject, image_url, date, time_str, created_at
    FROM notes WHERE user_id = ? ORDER BY id DESC
  `).all(userId);
}

function addNote(userId, note) {
  const result = db.prepare(`
    INSERT INTO notes (user_id, title, content, subject, image_url, date, time_str)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, note.title, note.content, note.subject, note.imageUrl || null, note.date, note.timeStr);
  return result.lastInsertRowid;
}

function deleteNote(userId, noteId) {
  return db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(noteId, userId);
}

/* ─── Todos ─── */
function getTodos(userId, date) {
  return db.prepare(`
    SELECT id, text, done, date FROM todos WHERE user_id = ? AND date = ? ORDER BY id ASC
  `).all(userId, date);
}

function addTodo(userId, { date, text }) {
  const result = db.prepare(`
    INSERT INTO todos (user_id, date, text, done) VALUES (?, ?, ?, 0)
  `).run(userId, date, text);
  return result.lastInsertRowid;
}

function updateTodo(userId, todoId, done) {
  db.prepare('UPDATE todos SET done = ? WHERE id = ? AND user_id = ?').run(done ? 1 : 0, todoId, userId);
}

function deleteTodo(userId, todoId) {
  db.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?').run(todoId, userId);
}

/* ─── Dashboard Stats ─── */
function getDashboardStats(userId) {
  const notesCount = db.prepare('SELECT COUNT(*) as c FROM notes WHERE user_id = ?').get(userId).c;
  const netCount = db.prepare('SELECT COUNT(*) as c FROM net_records WHERE user_id = ?').get(userId).c;
  const studyDays = db.prepare('SELECT COUNT(*) as c FROM daily_stats WHERE user_id = ? AND work_seconds > 0').get(userId).c;
  const curriculumDone = db.prepare('SELECT COUNT(*) as c FROM curriculum WHERE user_id = ? AND completed = 1').get(userId).c;
  const totalWorkSeconds = db.prepare('SELECT COALESCE(SUM(work_seconds),0) as s FROM daily_stats WHERE user_id = ?').get(userId).s;
  const totalBreakSeconds = db.prepare('SELECT COALESCE(SUM(break_seconds),0) as s FROM daily_stats WHERE user_id = ?').get(userId).s;
  return { notesCount, netCount, studyDays, curriculumDone, totalWorkSeconds, totalBreakSeconds };
}

/* ═══ ADMIN FUNCTIONS ═══ */

function getAllUsers() {
  return db.prepare(`
    SELECT id, username, email, full_name, role, daily_goal_minutes, streak_count, created_at
    FROM users ORDER BY id ASC
  `).all();
}

function getAllUsersWithStats(date) {
  const users = getAllUsers();
  return users.map(u => {
    const todayStats = db.prepare('SELECT work_seconds, break_seconds, sessions_count FROM daily_stats WHERE user_id = ? AND date = ?').get(u.id, date);
    const totalWork = db.prepare('SELECT COALESCE(SUM(work_seconds),0) as s FROM daily_stats WHERE user_id = ?').get(u.id).s;
    const totalSessions = db.prepare('SELECT COALESCE(SUM(sessions_count),0) as s FROM daily_stats WHERE user_id = ?').get(u.id).s;
    const lastActive = db.prepare('SELECT date FROM daily_stats WHERE user_id = ? AND work_seconds > 0 ORDER BY date DESC LIMIT 1').get(u.id);
    const currDone = db.prepare('SELECT COUNT(*) as c FROM curriculum WHERE user_id = ? AND completed = 1').get(u.id).c;
    return {
      ...u,
      todayWork: todayStats?.work_seconds || 0,
      todayBreak: todayStats?.break_seconds || 0,
      todaySessions: todayStats?.sessions_count || 0,
      totalWork,
      totalSessions,
      lastActive: lastActive?.date || null,
      curriculumDone: currDone,
    };
  });
}

function getLeaderboard(period = 'today', date) {
  let dateCondition;
  if (period === 'today') {
    dateCondition = `date = '${date}'`;
  } else if (period === 'week') {
    const d = new Date(date);
    d.setDate(d.getDate() - 7);
    const weekAgo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    dateCondition = `date >= '${weekAgo}' AND date <= '${date}'`;
  } else {
    const d = new Date(date);
    d.setDate(d.getDate() - 30);
    const monthAgo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    dateCondition = `date >= '${monthAgo}' AND date <= '${date}'`;
  }

  return db.prepare(`
    SELECT u.id, u.username, u.full_name, u.streak_count,
           COALESCE(SUM(ds.work_seconds), 0) as total_work,
           COALESCE(SUM(ds.break_seconds), 0) as total_break,
           COALESCE(SUM(ds.sessions_count), 0) as total_sessions
    FROM users u
    LEFT JOIN daily_stats ds ON u.id = ds.user_id AND ${dateCondition}
    GROUP BY u.id
    ORDER BY total_work DESC
  `).all();
}

function setUserRole(targetUserId, role) {
  if (!['admin', 'user'].includes(role)) return null;
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, targetUserId);
  return getUserById(targetUserId);
}

function getUserDetailedStats(targetUserId) {
  return {
    user: getUserById(targetUserId),
    sessions: db.prepare(`
      SELECT id, date, mode, duration, time_str, break_type, subject, created_at
      FROM study_sessions WHERE user_id = ? ORDER BY id DESC LIMIT 500
    `).all(targetUserId),
    curriculum: getCurriculum(targetUserId),
  };
}

/* ═══ COMPARISON FUNCTIONS ═══ */

function getComparisonData(userId, date1, date2) {
  const stats1 = db.prepare('SELECT * FROM daily_stats WHERE user_id = ? AND date = ?').get(userId, date1) || { work_seconds: 0, break_seconds: 0, sessions_count: 0 };
  const stats2 = db.prepare('SELECT * FROM daily_stats WHERE user_id = ? AND date = ?').get(userId, date2) || { work_seconds: 0, break_seconds: 0, sessions_count: 0 };

  const sessions1 = db.prepare('SELECT mode, duration, time_str, break_type FROM study_sessions WHERE user_id = ? AND date = ? ORDER BY id ASC').all(userId, date1);
  const sessions2 = db.prepare('SELECT mode, duration, time_str, break_type FROM study_sessions WHERE user_id = ? AND date = ? ORDER BY id ASC').all(userId, date2);

  const todos1 = db.prepare('SELECT text, done FROM todos WHERE user_id = ? AND date = ?').all(userId, date1);
  const todos2 = db.prepare('SELECT text, done FROM todos WHERE user_id = ? AND date = ?').all(userId, date2);

  const net1 = db.prepare('SELECT total_net, subjects FROM net_records WHERE user_id = ? AND date = ? ORDER BY id DESC LIMIT 1').get(userId, date1);
  const net2 = db.prepare('SELECT total_net, subjects FROM net_records WHERE user_id = ? AND date = ? ORDER BY id DESC LIMIT 1').get(userId, date2);

  return {
    date1: {
      date: date1, stats: stats1, sessions: sessions1, todos: todos1,
      net: net1 ? { ...net1, subjects: parseJson(net1.subjects, {}) } : null,
    },
    date2: {
      date: date2, stats: stats2, sessions: sessions2, todos: todos2,
      net: net2 ? { ...net2, subjects: parseJson(net2.subjects, {}) } : null,
    },
  };
}

function getStudyRange(userId, startDate, endDate) {
  return db.prepare(`
    SELECT date, work_seconds, break_seconds, sessions_count
    FROM daily_stats WHERE user_id = ? AND date >= ? AND date <= ?
    ORDER BY date ASC
  `).all(userId, startDate, endDate);
}

/* ═══ BREAK STATS ═══ */

function getBreakStats(userId) {
  const totalBreak = db.prepare("SELECT COALESCE(SUM(duration),0) as s FROM study_sessions WHERE user_id = ? AND mode = 'break'").get(userId).s;
  const avgBreak = db.prepare("SELECT COALESCE(AVG(duration),0) as s FROM study_sessions WHERE user_id = ? AND mode = 'break'").get(userId).s;
  const maxBreak = db.prepare("SELECT COALESCE(MAX(duration),0) as s FROM study_sessions WHERE user_id = ? AND mode = 'break'").get(userId).s;
  const breakCount = db.prepare("SELECT COUNT(*) as c FROM study_sessions WHERE user_id = ? AND mode = 'break'").get(userId).c;
  const totalWork = db.prepare("SELECT COALESCE(SUM(duration),0) as s FROM study_sessions WHERE user_id = ? AND mode = 'work'").get(userId).s;

  return {
    totalBreak,
    avgBreak: Math.round(avgBreak),
    maxBreak,
    breakCount,
    totalWork,
    ratio: totalWork > 0 ? Math.round((totalBreak / totalWork) * 100) : 0,
  };
}

/* ─── Export / Reset ─── */
function exportUserData(userId) {
  const user = getUserById(userId);
  return {
    user,
    dailyStats: getDailyStats(userId, 9999),
    sessions: getSessions(userId, null, 9999),
    netRecords: getNetRecords(userId, 9999),
    curriculum: getCurriculum(userId),
    notes: getNotes(userId),
    todos: db.prepare('SELECT id, text, done, date FROM todos WHERE user_id = ?').all(userId),
  };
}

function resetUserData(userId) {
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM daily_stats WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM study_sessions WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM net_records WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM curriculum WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM notes WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM todos WHERE user_id = ?').run(userId);
    db.prepare(`
      UPDATE users SET net_inputs='{}', last_simulation=NULL, active_timer=NULL,
      streak_count=0, streak_last_date='', motivation_date='', motivation_index=0
      WHERE id = ?
    `).run(userId);
  });
  tx();
}

module.exports = {
  db,
  parseJson,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  createUser,
  updateUserSettings,
  ensureDailyStats,
  addSession,
  getDailyStats,
  getSessions,
  addNetRecord,
  getNetRecords,
  getCurriculum,
  toggleCurriculum,
  getNotes,
  addNote,
  deleteNote,
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  getDashboardStats,
  exportUserData,
  resetUserData,
  // Admin
  getAllUsers,
  getAllUsersWithStats,
  getLeaderboard,
  setUserRole,
  getUserDetailedStats,
  // Comparison
  getComparisonData,
  getStudyRange,
  // Break
  getBreakStats,
};
