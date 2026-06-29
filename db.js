const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* ─── Helpers ─── */
function parseJson(val, fallback = null) {
  if (val == null || val === '') return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

/* ─── Users ─── */
async function getUserById(id) {
  const { rows } = await pool.query(`
    SELECT id, username, email, full_name, role, exam_date, exam_time,
           pom_work_min, pom_break_min, pom_long_break_min, daily_goal_minutes,
           streak_count, streak_last_date, motivation_date, motivation_index,
           net_inputs, last_simulation, active_timer, created_at
    FROM users WHERE id = $1
  `, [id]);
  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    ...row,
    net_inputs: parseJson(row.net_inputs, {}),
    last_simulation: parseJson(row.last_simulation),
    active_timer: parseJson(row.active_timer),
  };
}

async function getUserByUsername(username) {
  const { rows } = await pool.query('SELECT * FROM users WHERE username ILIKE $1', [username]);
  return rows[0] || null;
}

async function getUserByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email ILIKE $1', [email]);
  return rows[0] || null;
}

async function createUser({ username, email, passwordHash, fullName }) {
  const { rows: countRows } = await pool.query('SELECT COUNT(*) as c FROM users');
  const role = parseInt(countRows[0].c) === 0 ? 'admin' : 'user';
  
  const { rows } = await pool.query(`
    INSERT INTO users (username, email, password_hash, full_name, role)
    VALUES ($1, $2, $3, $4, $5) RETURNING id
  `, [username, email, passwordHash, fullName || '', role]);
  
  return await getUserById(rows[0].id);
}

async function updateUserSettings(userId, fields) {
  const allowed = [
    'exam_date', 'exam_time', 'pom_work_min', 'pom_break_min', 'pom_long_break_min',
    'daily_goal_minutes', 'streak_count', 'streak_last_date', 'motivation_date',
    'motivation_index', 'net_inputs', 'last_simulation', 'active_timer', 'full_name'
  ];
  const sets = [];
  const vals = [];
  let i = 1;
  for (const [k, v] of Object.entries(fields)) {
    const col = k.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
    if (!allowed.includes(col)) continue;
    sets.push(`${col} = $${i++}`);
    vals.push(typeof v === 'object' && v !== null ? JSON.stringify(v) : v);
  }
  if (!sets.length) return await getUserById(userId);
  vals.push(userId);
  await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${i}`, vals);
  return await getUserById(userId);
}

/* ─── Daily Stats ─── */
async function ensureDailyStats(userId, date) {
  await pool.query(`
    INSERT INTO daily_stats (user_id, date, work_seconds, break_seconds, sessions_count)
    VALUES ($1, $2, 0, 0, 0)
    ON CONFLICT (user_id, date) DO NOTHING
  `, [userId, date]);
  const { rows } = await pool.query('SELECT * FROM daily_stats WHERE user_id = $1 AND date = $2', [userId, date]);
  return rows[0];
}

async function addSession(userId, { date, mode, duration, timeStr, breakType, subject }) {
  await ensureDailyStats(userId, date);
  const col = mode === 'work' ? 'work_seconds' : 'break_seconds';
  await pool.query(`
    UPDATE daily_stats SET ${col} = ${col} + $1, sessions_count = sessions_count + 1
    WHERE user_id = $2 AND date = $3
  `, [duration, userId, date]);
  
  const { rows } = await pool.query(`
    INSERT INTO study_sessions (user_id, date, mode, duration, time_str, break_type, subject)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
  `, [userId, date, mode, duration, timeStr, breakType || null, subject || null]);
  return rows[0].id;
}

async function getDailyStats(userId, limit = 60) {
  const { rows } = await pool.query(`
    SELECT date, work_seconds, break_seconds, sessions_count
    FROM daily_stats WHERE user_id = $1 ORDER BY date DESC LIMIT $2
  `, [userId, limit]);
  return rows;
}

async function getSessions(userId, date, limit = 50) {
  if (date) {
    const { rows } = await pool.query(`
      SELECT id, date, mode, duration, time_str, break_type, subject, created_at
      FROM study_sessions WHERE user_id = $1 AND date = $2 ORDER BY id DESC LIMIT $3
    `, [userId, date, limit]);
    return rows;
  }
  const { rows } = await pool.query(`
    SELECT id, date, mode, duration, time_str, break_type, subject, created_at
    FROM study_sessions WHERE user_id = $1 ORDER BY id DESC LIMIT $2
  `, [userId, limit]);
  return rows;
}

/* ─── Net Records ─── */
async function addNetRecord(userId, record) {
  const { rows } = await pool.query(`
    INSERT INTO net_records (user_id, date, time_str, subjects, total_net, simulation)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [userId, record.date, record.timeStr, JSON.stringify(record.subjects), record.totalNet, JSON.stringify(record.simulation || null)]);
  return rows[0].id;
}

async function getNetRecords(userId, limit = 100) {
  const { rows } = await pool.query(`
    SELECT id, date, time_str, subjects, total_net, simulation, created_at
    FROM net_records WHERE user_id = $1 ORDER BY id DESC LIMIT $2
  `, [userId, limit]);
  
  return rows.map(r => ({
    ...r,
    subjects: parseJson(r.subjects, {}),
    simulation: parseJson(r.simulation),
  }));
}

/* ─── Curriculum ─── */
async function getCurriculum(userId) {
  const { rows } = await pool.query('SELECT topic_key, completed, completed_date FROM curriculum WHERE user_id = $1', [userId]);
  const map = {};
  rows.forEach(r => { map[r.topic_key] = { completed: !!r.completed, completed_date: r.completed_date }; });
  return map;
}

async function toggleCurriculum(userId, topicKey, completed, completedDate) {
  if (completed) {
    await pool.query(`
      INSERT INTO curriculum (user_id, topic_key, completed, completed_date) VALUES ($1, $2, 1, $3)
      ON CONFLICT (user_id, topic_key) DO UPDATE SET completed = 1, completed_date = $3, updated_at = CURRENT_TIMESTAMP
    `, [userId, topicKey, completedDate || null]);
  } else {
    await pool.query('DELETE FROM curriculum WHERE user_id = $1 AND topic_key = $2', [userId, topicKey]);
  }
}

/* ─── Notes ─── */
async function getNotes(userId) {
  const { rows } = await pool.query(`
    SELECT id, title, content, subject, image_url, date, time_str, created_at
    FROM notes WHERE user_id = $1 ORDER BY id DESC
  `, [userId]);
  return rows;
}

async function addNote(userId, note) {
  const { rows } = await pool.query(`
    INSERT INTO notes (user_id, title, content, subject, image_url, date, time_str)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
  `, [userId, note.title, note.content, note.subject, note.imageUrl || null, note.date, note.timeStr]);
  return rows[0].id;
}

async function deleteNote(userId, noteId) {
  await pool.query('DELETE FROM notes WHERE id = $1 AND user_id = $2', [noteId, userId]);
}

/* ─── Todos ─── */
async function getTodos(userId, date) {
  const { rows } = await pool.query(`
    SELECT id, text, done, date FROM todos WHERE user_id = $1 AND date = $2 ORDER BY id ASC
  `, [userId, date]);
  return rows;
}

async function addTodo(userId, { date, text }) {
  const { rows } = await pool.query(`
    INSERT INTO todos (user_id, date, text, done) VALUES ($1, $2, $3, 0) RETURNING id
  `, [userId, date, text]);
  return rows[0].id;
}

async function updateTodo(userId, todoId, done) {
  await pool.query('UPDATE todos SET done = $1 WHERE id = $2 AND user_id = $3', [done ? 1 : 0, todoId, userId]);
}

async function deleteTodo(userId, todoId) {
  await pool.query('DELETE FROM todos WHERE id = $1 AND user_id = $2', [todoId, userId]);
}

/* ─── Dashboard Stats ─── */
async function getDashboardStats(userId) {
  const notesCount = (await pool.query('SELECT COUNT(*) as c FROM notes WHERE user_id = $1', [userId])).rows[0].c;
  const netCount = (await pool.query('SELECT COUNT(*) as c FROM net_records WHERE user_id = $1', [userId])).rows[0].c;
  const studyDays = (await pool.query('SELECT COUNT(*) as c FROM daily_stats WHERE user_id = $1 AND work_seconds > 0', [userId])).rows[0].c;
  const curriculumDone = (await pool.query('SELECT COUNT(*) as c FROM curriculum WHERE user_id = $1 AND completed = 1', [userId])).rows[0].c;
  const totalWorkSeconds = (await pool.query('SELECT COALESCE(SUM(work_seconds),0) as s FROM daily_stats WHERE user_id = $1', [userId])).rows[0].s;
  const totalBreakSeconds = (await pool.query('SELECT COALESCE(SUM(break_seconds),0) as s FROM daily_stats WHERE user_id = $1', [userId])).rows[0].s;
  
  return { 
    notesCount: parseInt(notesCount), 
    netCount: parseInt(netCount), 
    studyDays: parseInt(studyDays), 
    curriculumDone: parseInt(curriculumDone), 
    totalWorkSeconds: parseInt(totalWorkSeconds), 
    totalBreakSeconds: parseInt(totalBreakSeconds) 
  };
}

/* ═══ ADMIN FUNCTIONS ═══ */

async function getAllUsers() {
  const { rows } = await pool.query(`
    SELECT id, username, email, full_name, role, daily_goal_minutes, streak_count, created_at
    FROM users ORDER BY id ASC
  `);
  return rows;
}

async function getAllUsersWithStats(date) {
  const users = await getAllUsers();
  const result = [];
  for (const u of users) {
    const todayStats = (await pool.query('SELECT work_seconds, break_seconds, sessions_count FROM daily_stats WHERE user_id = $1 AND date = $2', [u.id, date])).rows[0];
    const totalWork = (await pool.query('SELECT COALESCE(SUM(work_seconds),0) as s FROM daily_stats WHERE user_id = $1', [u.id])).rows[0].s;
    const totalSessions = (await pool.query('SELECT COALESCE(SUM(sessions_count),0) as s FROM daily_stats WHERE user_id = $1', [u.id])).rows[0].s;
    const lastActive = (await pool.query('SELECT date FROM daily_stats WHERE user_id = $1 AND work_seconds > 0 ORDER BY date DESC LIMIT 1', [u.id])).rows[0];
    const currDone = (await pool.query('SELECT COUNT(*) as c FROM curriculum WHERE user_id = $1 AND completed = 1', [u.id])).rows[0].c;
    result.push({
      ...u,
      todayWork: todayStats?.work_seconds || 0,
      todayBreak: todayStats?.break_seconds || 0,
      todaySessions: todayStats?.sessions_count || 0,
      totalWork: parseInt(totalWork),
      totalSessions: parseInt(totalSessions),
      lastActive: lastActive?.date || null,
      curriculumDone: parseInt(currDone),
    });
  }
  return result;
}

async function getLeaderboard(period = 'today', date) {
  let dateCondition;
  let params = [];
  if (period === 'today') {
    dateCondition = `date = $1`;
    params.push(date);
  } else if (period === 'week') {
    const d = new Date(date);
    d.setDate(d.getDate() - 7);
    const weekAgo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    dateCondition = `date >= $1 AND date <= $2`;
    params.push(weekAgo, date);
  } else {
    const d = new Date(date);
    d.setDate(d.getDate() - 30);
    const monthAgo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    dateCondition = `date >= $1 AND date <= $2`;
    params.push(monthAgo, date);
  }

  const { rows } = await pool.query(`
    SELECT u.id, u.username, u.full_name, u.streak_count,
           COALESCE(SUM(ds.work_seconds), 0) as total_work,
           COALESCE(SUM(ds.break_seconds), 0) as total_break,
           COALESCE(SUM(ds.sessions_count), 0) as total_sessions
    FROM users u
    LEFT JOIN daily_stats ds ON u.id = ds.user_id AND ${dateCondition}
    GROUP BY u.id
    ORDER BY total_work DESC
  `, params);
  
  return rows.map(r => ({
    ...r,
    total_work: parseInt(r.total_work),
    total_break: parseInt(r.total_break),
    total_sessions: parseInt(r.total_sessions)
  }));
}

async function setUserRole(targetUserId, role) {
  if (!['admin', 'user'].includes(role)) return null;
  await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, targetUserId]);
  return await getUserById(targetUserId);
}

async function getUserDetailedStats(targetUserId) {
  const user = await getUserById(targetUserId);
  const { rows: sessions } = await pool.query(`
    SELECT id, date, mode, duration, time_str, break_type, subject, created_at
    FROM study_sessions WHERE user_id = $1 ORDER BY id DESC LIMIT 500
  `, [targetUserId]);
  const curriculum = await getCurriculum(targetUserId);
  
  return { user, sessions, curriculum };
}

/* ═══ COMPARISON FUNCTIONS ═══ */

async function getComparisonData(userId, date1, date2) {
  const stats1 = (await pool.query('SELECT * FROM daily_stats WHERE user_id = $1 AND date = $2', [userId, date1])).rows[0] || { work_seconds: 0, break_seconds: 0, sessions_count: 0 };
  const stats2 = (await pool.query('SELECT * FROM daily_stats WHERE user_id = $1 AND date = $2', [userId, date2])).rows[0] || { work_seconds: 0, break_seconds: 0, sessions_count: 0 };

  const sessions1 = (await pool.query('SELECT mode, duration, time_str, break_type FROM study_sessions WHERE user_id = $1 AND date = $2 ORDER BY id ASC', [userId, date1])).rows;
  const sessions2 = (await pool.query('SELECT mode, duration, time_str, break_type FROM study_sessions WHERE user_id = $1 AND date = $2 ORDER BY id ASC', [userId, date2])).rows;

  const todos1 = (await pool.query('SELECT text, done FROM todos WHERE user_id = $1 AND date = $2', [userId, date1])).rows;
  const todos2 = (await pool.query('SELECT text, done FROM todos WHERE user_id = $1 AND date = $2', [userId, date2])).rows;

  const net1 = (await pool.query('SELECT total_net, subjects FROM net_records WHERE user_id = $1 AND date = $2 ORDER BY id DESC LIMIT 1', [userId, date1])).rows[0];
  const net2 = (await pool.query('SELECT total_net, subjects FROM net_records WHERE user_id = $1 AND date = $2 ORDER BY id DESC LIMIT 1', [userId, date2])).rows[0];

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

async function getStudyRange(userId, startDate, endDate) {
  const { rows } = await pool.query(`
    SELECT date, work_seconds, break_seconds, sessions_count
    FROM daily_stats WHERE user_id = $1 AND date >= $2 AND date <= $3
    ORDER BY date ASC
  `, [userId, startDate, endDate]);
  return rows;
}

/* ═══ BREAK STATS ═══ */

async function getBreakStats(userId) {
  const totalBreak = (await pool.query("SELECT COALESCE(SUM(duration),0) as s FROM study_sessions WHERE user_id = $1 AND mode = 'break'", [userId])).rows[0].s;
  const avgBreak = (await pool.query("SELECT COALESCE(AVG(duration),0) as s FROM study_sessions WHERE user_id = $1 AND mode = 'break'", [userId])).rows[0].s;
  const maxBreak = (await pool.query("SELECT COALESCE(MAX(duration),0) as s FROM study_sessions WHERE user_id = $1 AND mode = 'break'", [userId])).rows[0].s;
  const breakCount = (await pool.query("SELECT COUNT(*) as c FROM study_sessions WHERE user_id = $1 AND mode = 'break'", [userId])).rows[0].c;
  const totalWork = (await pool.query("SELECT COALESCE(SUM(duration),0) as s FROM study_sessions WHERE user_id = $1 AND mode = 'work'", [userId])).rows[0].s;

  const tw = parseInt(totalWork) || 0;
  const tb = parseInt(totalBreak) || 0;

  return {
    totalBreak: tb,
    avgBreak: Math.round(parseFloat(avgBreak) || 0),
    maxBreak: parseInt(maxBreak) || 0,
    breakCount: parseInt(breakCount) || 0,
    totalWork: tw,
    ratio: tw > 0 ? Math.round((tb / tw) * 100) : 0,
  };
}

/* ─── Export / Reset ─── */
async function exportUserData(userId) {
  const user = await getUserById(userId);
  return {
    user,
    dailyStats: await getDailyStats(userId, 9999),
    sessions: await getSessions(userId, null, 9999),
    netRecords: await getNetRecords(userId, 9999),
    curriculum: await getCurriculum(userId),
    notes: await getNotes(userId),
    todos: (await pool.query('SELECT id, text, done, date FROM todos WHERE user_id = $1', [userId])).rows,
  };
}

async function resetUserData(userId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM daily_stats WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM study_sessions WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM net_records WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM curriculum WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM notes WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM todos WHERE user_id = $1', [userId]);
    await client.query(`
      UPDATE users SET net_inputs='{}', last_simulation=NULL, active_timer=NULL,
      streak_count=0, streak_last_date='', motivation_date='', motivation_index=0
      WHERE id = $1
    `, [userId]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
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
