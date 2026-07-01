require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcryptjs');
const path = require('path');
const os = require('os');
const fs = require('fs');
const db = require('./db');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase Storage Client
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  console.log('  ☁️  Supabase Storage: Aktif');
}

app.set('trust proxy', 1);

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER;

app.use(session({
  store: new pgSession({
    pool: db.pool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'kpss-dashboard-local-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
  },
}));

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Giriş yapmanız gerekiyor' });
  next();
}

async function requireAdmin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Giriş yapmanız gerekiyor' });
  const user = await db.getUserById(req.session.userId);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Yetkiniz yok' });
  next();
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
}

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function localTime() {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

/* ─── Auth ─── */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı, e-posta ve şifre zorunludur' });
    }
    if (username.length < 3) return res.status(400).json({ error: 'Kullanıcı adı en az 3 karakter olmalı' });
    if (password.length < 6) return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Geçerli bir e-posta girin' });
    }
    if (await db.getUserByUsername(username)) return res.status(409).json({ error: 'Bu kullanıcı adı alınmış' });
    if (await db.getUserByEmail(email)) return res.status(409).json({ error: 'Bu e-posta kayıtlı' });

    const hash = await bcrypt.hash(password, 10);
    const user = await db.createUser({ username: username.trim(), email: email.trim().toLowerCase(), passwordHash: hash, fullName: (fullName || '').trim() });
    req.session.userId = user.id;
    res.json({ user: sanitizeUser(user), message: 'Kayıt başarılı' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Kayıt sırasında hata oluştu' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
    const user = await db.getUserByUsername(username.trim());
    if (!user) return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    req.session.userId = user.id;
    res.json({ user: sanitizeUser(await db.getUserById(user.id)), message: 'Giriş başarılı' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Giriş sırasında hata oluştu' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Çıkış yapıldı' }));
});

app.get('/api/auth/me', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Oturum yok' });
  const user = await db.getUserById(req.session.userId);
  if (!user) return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
  res.json({ user: sanitizeUser(user) });
});

/* ─── Settings ─── */
app.get('/api/settings', requireAuth, async (req, res) => {
  res.json({ user: sanitizeUser(await db.getUserById(req.session.userId)) });
});

app.put('/api/settings', requireAuth, async (req, res) => {
  const user = await db.updateUserSettings(req.session.userId, req.body);
  res.json({ user: sanitizeUser(user) });
});

/* ─── Dashboard ─── */
app.get('/api/dashboard', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const user = await db.getUserById(userId);
  const today = localToday();
  const stats = await db.ensureDailyStats(userId, today);
  const todos = await db.getTodos(userId, today);
  const dailyStatsRaw = await db.getDailyStats(userId, 7);
  const dailyStats = dailyStatsRaw.reverse();
  const summary = await db.getDashboardStats(userId);
  const curriculum = await db.getCurriculum(userId);

  res.json({
    user: sanitizeUser(user),
    today,
    todayStats: stats,
    todos,
    dailyStats,
    summary,
    curriculum,
  });
});

/* ─── Study ─── */
app.post('/api/study/session', requireAuth, async (req, res) => {
  const { date, mode, duration, timeStr, breakType, subject } = req.body;
  if (!date || !mode || !duration) return res.status(400).json({ error: 'Eksik oturum verisi' });
  if (!['work', 'break'].includes(mode)) return res.status(400).json({ error: 'Geçersiz mod' });
  
  const id = await db.addSession(req.session.userId, {
    date, mode, duration: Math.max(0, parseInt(duration)),
    timeStr: timeStr || localTime(),
    breakType: breakType || null,
    subject: subject || null,
  });
  const user = await db.getUserById(req.session.userId);

  if (mode === 'work' && duration >= 60) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    let streak = user.streak_count || 0;
    let lastDate = user.streak_last_date || '';
    if (lastDate !== date) {
      if (lastDate === yKey) streak++;
      else streak = 1;
      await db.updateUserSettings(req.session.userId, { streakCount: streak, streakLastDate: date });
    }
  }

  res.json({ id, stats: await db.ensureDailyStats(req.session.userId, date) });
});

app.get('/api/study/daily', requireAuth, async (req, res) => {
  res.json({ dailyStats: await db.getDailyStats(req.session.userId, parseInt(req.query.limit) || 60) });
});

app.get('/api/study/sessions', requireAuth, async (req, res) => {
  res.json({ sessions: await db.getSessions(req.session.userId, req.query.date, parseInt(req.query.limit) || 50) });
});

app.put('/api/study/active-timer', requireAuth, async (req, res) => {
  const user = await db.updateUserSettings(req.session.userId, { activeTimer: req.body.activeTimer ?? null });
  res.json({ user: sanitizeUser(user) });
});

/* ─── Study Compare ─── */
app.get('/api/study/compare', requireAuth, async (req, res) => {
  const { date1, date2 } = req.query;
  if (!date1 || !date2) return res.status(400).json({ error: 'İki tarih gerekli' });
  const data = await db.getComparisonData(req.session.userId, date1, date2);
  res.json(data);
});

app.get('/api/study/range', requireAuth, async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ error: 'Başlangıç ve bitiş tarihi gerekli' });
  const data = await db.getStudyRange(req.session.userId, start, end);
  res.json({ data });
});

/* ─── Break Stats ─── */
app.get('/api/break/stats', requireAuth, async (req, res) => {
  res.json(await db.getBreakStats(req.session.userId));
});

/* ─── Net ─── */
app.put('/api/net/inputs', requireAuth, async (req, res) => {
  const fields = {};
  if (req.body.netInputs !== undefined) fields.netInputs = req.body.netInputs;
  if (req.body.lastSimulation !== undefined) fields.lastSimulation = req.body.lastSimulation;
  const user = await db.updateUserSettings(req.session.userId, fields);
  res.json({ user: sanitizeUser(user) });
});

app.get('/api/net/records', requireAuth, async (req, res) => {
  res.json({ records: await db.getNetRecords(req.session.userId) });
});

app.post('/api/net/records', requireAuth, async (req, res) => {
  const { date, timeStr, subjects, totalNet, simulation } = req.body;
  if (!subjects || totalNet == null) return res.status(400).json({ error: 'Eksik net verisi' });
  const id = await db.addNetRecord(req.session.userId, {
    date: date || localToday(),
    timeStr: timeStr || localTime(),
    subjects,
    totalNet,
    simulation,
  });
  res.json({ id, records: await db.getNetRecords(req.session.userId) });
});

/* ─── Curriculum ─── */
app.get('/api/curriculum', requireAuth, async (req, res) => {
  res.json({ curriculum: await db.getCurriculum(req.session.userId) });
});

app.put('/api/curriculum/:key', requireAuth, async (req, res) => {
  try {
    await db.toggleCurriculum(req.session.userId, req.params.key, !!req.body.completed, req.body.completedDate);
    res.json({ curriculum: await db.getCurriculum(req.session.userId) });
  } catch (err) {
    console.error('Curriculum update error:', err);
    res.status(500).json({ error: 'Müfredat güncellenirken bir hata oluştu' });
  }
});

/* ─── Notes ─── */
app.get('/api/notes', requireAuth, async (req, res) => {
  res.json({ notes: await db.getNotes(req.session.userId) });
});

app.post('/api/notes', requireAuth, async (req, res) => {
  const { title, content, subject, image } = req.body;
  if (!content?.trim() && !image) return res.status(400).json({ error: 'Not içeriği veya fotoğraf gerekli' });
  
  let imageUrl = null;
  if (image) {
    if (supabase) {
      // Upload to Supabase Storage (kalıcı, Render restart'a dayanıklı)
      try {
        const matches = image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          const filename = `note_${req.session.userId}_${Date.now()}.${ext}`;
          
          const { data, error } = await supabase.storage
            .from('notes')
            .upload(filename, buffer, {
              contentType: `image/${matches[1]}`,
              cacheControl: '3600',
              upsert: false
            });
            
          if (error) {
            console.error('Supabase Storage upload error:', error.message);
          } else {
            const { data: publicUrlData } = supabase.storage
              .from('notes')
              .getPublicUrl(filename);
            imageUrl = publicUrlData.publicUrl;
          }
        }
      } catch (e) {
        console.error('Image upload error:', e);
      }
    } else {
      // Fallback: save to local disk (only for local dev)
      try {
        const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        const matches = image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          const filename = `note_${req.session.userId}_${Date.now()}.${ext}`;
          fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
          imageUrl = `/uploads/${filename}`;
        }
      } catch (e) {
        console.error('Image upload error:', e);
      }
    }
  }

  const id = await db.addNote(req.session.userId, {
    title: (title || 'Not').trim(),
    content: (content || '').trim(),
    subject: subject || 'genel',
    imageUrl: imageUrl,
    date: localToday(),
    timeStr: localTime(),
  });
  res.json({ id, notes: await db.getNotes(req.session.userId) });
});

app.delete('/api/notes/:id', requireAuth, async (req, res) => {
  await db.deleteNote(req.session.userId, parseInt(req.params.id));
  res.json({ notes: await db.getNotes(req.session.userId) });
});

/* ─── Todos ─── */
app.get('/api/todos', requireAuth, async (req, res) => {
  const date = req.query.date || localToday();
  res.json({ todos: await db.getTodos(req.session.userId, date), date });
});

app.post('/api/todos', requireAuth, async (req, res) => {
  const { text, date } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'Görev metni gerekli' });
  const d = date || localToday();
  const id = await db.addTodo(req.session.userId, { date: d, text: text.trim() });
  res.json({ id, todos: await db.getTodos(req.session.userId, d) });
});

app.patch('/api/todos/:id', requireAuth, async (req, res) => {
  await db.updateTodo(req.session.userId, parseInt(req.params.id), !!req.body.done);
  res.json({ todos: await db.getTodos(req.session.userId, req.body.date || localToday()) });
});

app.delete('/api/todos/:id', requireAuth, async (req, res) => {
  const date = req.query.date || localToday();
  await db.deleteTodo(req.session.userId, parseInt(req.params.id));
  res.json({ todos: await db.getTodos(req.session.userId, date) });
});

/* ═══ ADMIN ═══ */
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  const date = req.query.date || localToday();
  res.json({ users: await db.getAllUsersWithStats(date) });
});

app.get('/api/admin/leaderboard', requireAdmin, async (req, res) => {
  const period = req.query.period || 'today';
  const date = req.query.date || localToday();
  res.json({ leaderboard: await db.getLeaderboard(period, date) });
});

app.put('/api/admin/users/:id/role', requireAdmin, async (req, res) => {
  const { role } = req.body;
  const targetId = parseInt(req.params.id);
  if (targetId === req.session.userId) return res.status(400).json({ error: 'Kendi rolünüzü değiştiremezsiniz' });
  const user = await db.setUserRole(targetId, role);
  if (!user) return res.status(400).json({ error: 'Geçersiz rol' });
  res.json({ user: sanitizeUser(user) });
});

app.get('/api/admin/users/:id/details', requireAdmin, async (req, res) => {
  const targetId = parseInt(req.params.id);
  const details = await db.getUserDetailedStats(targetId);
  if (!details.user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  res.json(details);
});

/* ─── Export / Reset ─── */
app.get('/api/export', requireAuth, async (req, res) => {
  const data = await db.exportUserData(req.session.userId);
  res.setHeader('Content-Disposition', `attachment; filename="kpss-yedek-${localToday()}.json"`);
  res.json(data);
});

app.delete('/api/account/data', requireAuth, async (req, res) => {
  await db.resetUserData(req.session.userId);
  res.json({ message: 'Tüm verileriniz silindi' });
});

app.get('/api/server/info', (_req, res) => {
  const nets = os.networkInterfaces();
  const ips = [];
  Object.values(nets).forEach(list => {
    list?.forEach(i => {
      if (i.family === 'IPv4' && !i.internal) ips.push(i.address);
    });
  });
  res.json({
    port: PORT,
    localUrl: `http://localhost:${PORT}`,
    networkUrls: ips.map(ip => `http://${ip}:${PORT}`),
    examDateDefault: '2026-10-25',
    examInfo: 'KPSS Ortaöğretim 2026 — 25 Ekim 2026 Pazar (ÖSYM resmi takvim)',
  });
});

app.get('/api/health', async (_req, res) => {
  const checks = { server: 'OK', database: 'FAIL', dbUrl: '???', error: null };
  try {
    checks.dbUrl = process.env.DATABASE_URL ? 'SET (' + process.env.DATABASE_URL.substring(0, 30) + '...)' : 'NOT SET!';
    const { rows } = await db.pool.query('SELECT COUNT(*) as c FROM users');
    checks.database = 'OK';
    checks.userCount = rows[0].c;
  } catch (e) {
    checks.error = e.message;
  }
  res.json(checks);
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function getLocalIPs() {
  const nets = os.networkInterfaces();
  const ips = [];
  Object.values(nets).forEach(list => {
    list?.forEach(i => {
      if (i.family === 'IPv4' && !i.internal) ips.push(i.address);
    });
  });
  return ips;
}

app.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIPs();
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║     KPSS Hazırlık Dashboard — Sunucu Çalışıyor      ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');
  console.log(`  💻 Senin bilgisayarından:  http://localhost:${PORT}`);
  if (ips.length) {
    console.log('  📱 Arkadaşların için (aynı Wi-Fi/ağ):');
    ips.forEach(ip => console.log(`     → http://${ip}:${PORT}`));
  } else {
    console.log('  📱 Ağ IP bulunamadı — sadece localhost kullanılabilir');
  }
  console.log(`\n  🗄️  Veritabanı: PostgreSQL (Supabase)`);
  console.log('  📅 Varsayılan sınav: 25 Ekim 2026, 10:00 (ÖSYM)\n');
  console.log('  Durdurmak için: Ctrl+C\n');
});
