/* KPSS Dashboard — Frontend Application (SQLite backend) — v2.0 Modern */

const SUBJECTS = [
  { id: 'turkce', name: 'Türkçe', max: 30, group: 'gy' },
  { id: 'matematik', name: 'Matematik', max: 27, group: 'gy' },
  { id: 'tarih', name: 'Tarih', max: 27, group: 'gk' },
  { id: 'cografya', name: 'Coğrafya', max: 18, group: 'gk' },
  { id: 'vatandaslik', name: 'Vatandaşlık', max: 9, group: 'gk' },
  { id: 'guncel', name: 'Güncel Bilgiler', max: 6, group: 'gk' },
];

const YEAR_PROFILES = {
  2024: { gyMean: 28.5, gyStd: 12.8, gkMean: 27.2, gkStd: 11.5, label: '2024 (Son sınav)' },
  2022: { gyMean: 27.8, gyStd: 12.2, gkMean: 26.5, gkStd: 11.0, label: '2022' },
  2020: { gyMean: 26.9, gyStd: 11.8, gkMean: 25.8, gkStd: 10.8, label: '2020' },
  2018: { gyMean: 27.5, gyStd: 12.0, gkMean: 26.0, gkStd: 10.9, label: '2018' },
};

const MOTIVATION_QUOTES = [
  '"Başarı, her gün tekrarlanan küçük çabaların toplamıdır." — Robert Collier',
  '"Bugünün acısı, yarının gücüdür."',
  '"KPSS bir maraton, sprint değil. Sabırlı ol, istikrarlı kal."',
  '"Her çözdüğün soru, seni hedefine bir adım daha yaklaştırır."',
  '"Disiplin, motivasyon bittiğinde devreye giren şeydir."',
  '"Memur olmak bir hayal değil; doğru plan + çalışma = gerçek."',
  '"Her net, bir kadro kapısını aralar."',
  '"120 soru, 130 dakika — sen buna hazırsın!"',
  '"P94 puanın senin emeğinin aynasıdır. Emeğini artır."',
  '"Kendine inan. Binlerce kişi bu yolu yürüdü, sen de yürüyeceksin."',
];

const CURRICULUM = {
  turkce: ['Sözcükte Anlam','Cümlede Anlam','Paragraf','Ses Bilgisi','Yapı Bilgisi','İsim Soylu Sözcükler','Zamirler','Sıfatlar','Zarflar','Edat-Bağlaç-Ünlem','Fiiller','Fiilimsiler','Cümle Ögeleri','Cümle Türleri','Yazım Kuralları','Noktalama İşaretleri','Anlatım Bozuklukları','Sözel Mantık'],
  matematik: ['Temel Kavramlar','Sayı Basamakları','Ardışık Sayılar','Asal Sayılar ve Faktöriyel','Bölme ve Bölünebilme','Asal Çarpanlara Ayırma','EBOB-EKOK','Rasyonel Sayılar','Ondalık Sayılar','Basit Eşitsizlikler','Mutlak Değer','Üslü Sayılar','Köklü Sayılar','Çarpanlara Ayırma','Oran-Orantı','Denklem Çözme','Sayı Problemleri','Kesir Problemleri','Yaş Problemleri','İşçi Problemleri','Yüzde-Kar-Zarar Problemleri','Karışım Problemleri','Hareket Problemleri','Grafik Problemleri','Kümeler','Fonksiyonlar','İşlem ve Modüler Aritmetik','Permütasyon','Kombinasyon','Olasılık','Sayısal Mantık', 'Geometrik Kavramlar ve Doğruda Açılar', 'Üçgende Açılar', 'Özel Üçgenler', 'Üçgende Açıortay', 'Üçgende Kenarortay', 'Üçgende Eşlik ve Benzerlik', 'Üçgende Alan', 'Açı - Kenar Bağıntıları', 'Çokgenler', 'Özel Dörtgenler', 'Çemberde Açı', 'Çemberde Uzunluk', 'Daire', 'Noktanın Analitik İncelenmesi', 'Doğrunun Analitik İncelenmesi', 'Dönüşüm Geometrisi', 'Prizmalar', 'Piramitler', 'Küre'],
  tarih: ['İslamiyet Öncesi Türk Tarihi','İlk Türk-İslam Devletleri','Osmanlı Siyaset (Kuruluş-Yükselme)','Osmanlı Kültür ve Medeniyeti','17. Yüzyıl Osmanlı (Duraklama)','18. Yüzyıl Osmanlı (Gerileme)','19. Yüzyıl Osmanlı (Dağılma)','20. Yüzyıl Başlarında Osmanlı','I. Dünya Savaşı','Milli Mücadele Hazırlık Dönemi','I. TBMM Dönemi','Milli Mücadele Muharebeler','Lozan Barış Antlaşması','Atatürk İlke ve İnkılapları','Atatürk Dönemi İç ve Dış Politika','Çağdaş Türk ve Dünya Tarihi'],
  cografya: ['Coğrafi Konum','Türkiye\'nin Yer Şekilleri','Türkiye\'nin İklimi ve Bitki Örtüsü','Türkiye\'de Nüfus ve Yerleşme','Tarım','Hayvancılık','Madenler ve Enerji Kaynakları','Sanayi','Ulaşım','Ticaret ve Turizm','Bölgesel Kalkınma Projeleri','Doğal Afetler'],
  vatandaslik: ['Hukukun Temel Kavramları','Devlet Biçimleri ve Demokrasi','Anayasa Hukukuna Giriş ve Türk Anayasa Tarihi','1982 Anayasası Temel İlkeleri','Temel Hak ve Ödevler','Yasama','Yürütme','Yargı','İdare Hukuku','Ulusal ve Uluslararası Kuruluşlar','Güncel Gelişmeler'],
};

const CURRICULUM_NAMES = { turkce: 'Türkçe', matematik: 'Matematik', tarih: 'Tarih', cografya: 'Coğrafya', vatandaslik: 'Vatandaşlık' };
const CURRICULUM_ICONS = { turkce: '📖', matematik: '🔢', tarih: '🏛️', cografya: '🌍', vatandaslik: '⚖️' };
const CURRICULUM_COLORS = { turkce: '#6366f1', matematik: '#8b5cf6', tarih: '#f59e0b', cografya: '#10b981', vatandaslik: '#f43f5e' };

const BREAK_TYPES = {
  short: { name: 'Kısa Mola', icon: '☕', duration: 5, color: 'var(--mint)' },
  long: { name: 'Uzun Mola', icon: '🧘', duration: 15, color: 'var(--violet)' },
  eye: { name: 'Göz Dinlendirme', icon: '👁️', duration: 3, color: 'var(--accent)' },
  exercise: { name: 'Egzersiz', icon: '🏃', duration: 10, color: 'var(--amber)' },
};

const BREAK_SUGGESTIONS = {
  short: [
    'Bir bardak su iç ve derin nefes al.',
    'Pencereden dışarı bak, gözlerini dinlendir.',
    'Yerinden kalk, biraz germe hareketi yap.',
    'Yüzüne soğuk su çarp, tazelendir.',
  ],
  long: [
    'Hafif bir yürüyüş yap, kan dolaşımını hızlandır.',
    'Meditasyon yap: Gözlerini kapat ve nefesine odaklan.',
    'Sağlıklı bir atıştırmalık ye (meyve, kuruyemiş).',
    'Sevdiğin bir müzik parçası dinle.',
  ],
  eye: [
    '20-20-20 kuralı: 20 saniye uzağa bak. Gözlerini dinlendir.',
    'Avuçlarını ovuştur ve sıcak avuçlarını göz kapaklarına koy.',
    'Gözlerini yavaşça saat yönünde, sonra ters yönde çevir.',
    'Sıkıca gözlerini kapat, 5 saniye bekle ve aç. 5 kez tekrarla.',
  ],
  exercise: [
    '10 squat + 10 lunge yaparak bacaklarını çalıştır.',
    '1 dakika plank pozisyonunda dur.',
    '15 jumping jack yap, enerjini artır.',
    'Omuz ve boyun germe egzersizleri yap.',
  ],
};

const NAV_ITEMS = [
  { id: 'dashboard', icon: '🏠', label: 'Genel Bakış' },
  { id: 'pomodoro', icon: '⏱️', label: 'Çalışma Takibi' },
  { id: 'net', icon: '🎯', label: 'Net & Puan' },
  { id: 'curriculum', icon: '📚', label: 'Müfredat' },
  { id: 'notes', icon: '📝', label: 'Not Defteri' },
  { id: 'todo', icon: '✅', label: 'Yapılacaklar' },
  { id: 'compare', icon: '📊', label: 'Karşılaştırma' },
  { id: 'profile', icon: '👤', label: 'Profil & Veri' },
];

const ADMIN_NAV = { id: 'admin', icon: '👑', label: 'Admin Paneli' };

/* ─── State ─── */
let user = null;
let state = {
  dailyStats: {},
  sessions: [],
  curriculum: {},
  notes: [],
  todos: [],
  netRecords: [],
  netInputs: {},
  lastSimulation: null,
};
let timerInterval = null;
let timerSeconds = 0;
let timerTargetSeconds = 0;
let timerMode = 'idle';
let sessionStart = null;
let pausedWorkSec = 0;
let noteFilter = 'all';
let saveNetDebounce = null;
let selectedBreakType = 'short';
let timerSubject = null;
let currentCurrKey = null;

let isPaused = false;
let pauseStartTime = null;

/* ─── Helpers ─── */
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateShort(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

function formatDuration(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (h > 0) return `${h}s ${m}dk`;
  if (m > 0) return `${m}dk ${s}sn`;
  return `${s}sn`;
}

function formatMinutes(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h} saat ${m} dk`;
  return `${m} dakika`;
}

function formatMinShort(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}s ${m}dk`;
  return `${m}dk`;
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function toast(msg, icon = '✓') {
  const el = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  document.getElementById('toastIcon').textContent = icon;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2800);
}

function showAuth() {
  document.getElementById('authScreen').classList.remove('hidden');
  document.getElementById('appShell').classList.add('hidden');
}

function showApp() {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');
}

/* ─── Auth ─── */
function switchAuthTab(tab) {
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
  const loginBtn = document.getElementById('tabLogin');
  const regBtn = document.getElementById('tabRegister');
  if (tab === 'login') {
    loginBtn.className = 'btn btn-primary flex-1'; loginBtn.style.padding = '10px';
    regBtn.className = 'btn btn-outline flex-1'; regBtn.style.padding = '10px';
  } else {
    regBtn.className = 'btn btn-primary flex-1'; regBtn.style.padding = '10px';
    loginBtn.className = 'btn btn-outline flex-1'; loginBtn.style.padding = '10px';
  }
  document.getElementById('authError').classList.add('hidden');
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  btn.disabled = true;
  try {
    const data = await API.login({
      username: document.getElementById('loginUsername').value.trim(),
      password: document.getElementById('loginPassword').value,
    });
    user = data.user;
    await bootstrapApp();
    toast('Hoş geldin, ' + (user.full_name || user.username) + '!', '👋');
  } catch (err) {
    document.getElementById('authError').textContent = err.message;
    document.getElementById('authError').classList.remove('hidden');
  } finally { btn.disabled = false; }
}

async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('registerBtn');
  btn.disabled = true;
  try {
    const data = await API.register({
      username: document.getElementById('regUsername').value.trim(),
      email: document.getElementById('regEmail').value.trim(),
      password: document.getElementById('regPassword').value,
      fullName: document.getElementById('regFullName').value.trim(),
    });
    user = data.user;
    await bootstrapApp();
    toast('Hesabın oluşturuldu!', '🎉');
  } catch (err) {
    document.getElementById('authError').textContent = err.message;
    document.getElementById('authError').classList.remove('hidden');
  } finally { btn.disabled = false; }
}

async function handleLogout() {
  if (!confirm('Çıkış yapmak istediğinize emin misiniz?')) return;
  clearInterval(timerInterval);
  await API.logout();
  user = null;
  showAuth();
  toast('Çıkış yapıldı');
}

async function loadDashboardData() {
  const data = await API.dashboard();
  user = data.user;
  state.curriculum = data.curriculum || {};
  state.todos = data.todos || [];
  state.dailyStats = {};
  (data.dailyStats || []).forEach(s => {
    state.dailyStats[s.date] = { work: s.work_seconds, break: s.break_seconds, sessions: s.sessions_count };
  });
  state.netInputs = user.net_inputs || {};
  state.lastSimulation = user.last_simulation;
  return data;
}

async function bootstrapApp() {
  showApp();
  buildNav();
  updateUserUI();
  await loadDashboardData();
  const [sessionsRes, notesRes, netRes] = await Promise.all([
    API.getSessions(todayKey()),
    API.getNotes(),
    API.getNetRecords(),
  ]);
  state.sessions = sessionsRes.sessions || [];
  state.notes = notesRes.notes || [];
  state.netRecords = netRes.records || [];
  document.getElementById('examDateInput').value = user.exam_date || '2026-10-25';
  document.getElementById('pomWorkMin').value = user.pom_work_min || 25;
  document.getElementById('pomBreakMin').value = user.pom_break_min || 5;
  showSection('dashboard');
  restoreActiveTimer();
  updateCountdown();
  loadServerInfo();
}

function updateUserUI() {
  document.getElementById('userDisplayName').textContent = user.full_name || user.username;
  document.getElementById('userDisplayHandle').textContent = '@' + user.username;
  document.getElementById('streakDisplay').textContent = (user.streak_count || 0) + ' gün';
  
  // Badge logic
  const totalHours = (user.total_work_seconds || 0) / 3600;
  let badgeLabel = 'Çırak'; let badgeClass = 'badge-amber';
  if (totalHours >= 200) { badgeLabel = 'KPSS Canavarı'; badgeClass = 'badge-coral'; }
  else if (totalHours >= 50) { badgeLabel = 'Odak Ustası'; badgeClass = 'badge-violet'; }
  else if (totalHours >= 10) { badgeLabel = 'İstikrarlı'; badgeClass = 'badge-mint'; }
  const badgeEl = document.getElementById('userBadge');
  if (badgeEl) {
    badgeEl.textContent = badgeLabel;
    badgeEl.className = 'badge ' + badgeClass;
  }

  document.getElementById('profileUsername').textContent = user.username;
  document.getElementById('profileEmail').textContent = user.email;
  document.getElementById('profileFullName').value = user.full_name || '';
  document.getElementById('profileExamDate').value = user.exam_date || '2026-10-25';
  document.getElementById('profileDailyGoal').value = user.daily_goal_minutes || 120;
}

async function loadServerInfo() {
  try {
    const info = await API.serverInfo();
    const urls = info.networkUrls?.length ? info.networkUrls.join(' · ') : info.localUrl;
    document.getElementById('serverInfoBar').innerHTML =
      `<span style="color:var(--mint-light);">● Sunucu aktif</span> · Veritabanı bilgisayarında · Arkadaşların: <code style="color:var(--accent-light);">${urls}</code>`;
  } catch { /* offline */ }
}

function buildNav() {
  const items = [...NAV_ITEMS];
  if (user?.role === 'admin') items.splice(items.length - 1, 0, ADMIN_NAV);
  const html = items.map(n => `
    <button onclick="showSection('${n.id}')" data-sec="${n.id}" class="nav-btn">
      <span class="nav-icon">${n.icon}</span> ${n.label}
    </button>`).join('');
  document.getElementById('sidebarNav').innerHTML = html;
  document.getElementById('mobileSidebarNav').innerHTML = html + `
    <button onclick="handleLogout()" class="nav-btn" style="color:var(--coral);margin-top:16px;border:1px solid rgba(244,63,94,0.2);">
      <span class="nav-icon">🚪</span> Çıkış Yap
    </button>`;
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  const sec = document.getElementById('sec-' + id);
  if (sec) sec.classList.remove('hidden');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.sec === id));
  toggleMobileNav(false);
  const renderers = {
    dashboard: renderDashboard, pomodoro: renderPomodoro, net: renderNet,
    curriculum: renderCurriculum, notes: loadAndRenderNotes, todo: renderTodos,
    profile: renderProfile, admin: renderAdmin, compare: renderCompare,
  };
  renderers[id]?.();
}

function toggleMobileNav(show) {
  const el = document.getElementById('mobileNav');
  if (show === undefined) { el.classList.toggle('hidden'); return; }
  el.classList.toggle('hidden', !show);
}

/* ─── Countdown ─── */
async function saveExamDate() {
  const examDate = document.getElementById('examDateInput').value;
  const data = await API.updateSettings({ examDate });
  user = data.user;
  updateCountdown();
  toast('Sınav tarihi kaydedildi');
}

function updateCountdown() {
  const examDate = user?.exam_date || document.getElementById('examDateInput')?.value || '2026-10-25';
  const examTime = user?.exam_time || '10:00';
  const target = new Date(`${examDate}T${examTime}:00`);
  const now = new Date();
  const diff = target - now;
  const boxes = document.getElementById('countdownBoxes');
  const label = document.getElementById('countdownLabel');
  if (label) {
    label.textContent = target.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ` · ${examTime} (ÖSYM)`;
  }
  if (diff <= 0) {
    if (boxes) boxes.innerHTML = '<div style="grid-column:span 4;text-align:center;padding:16px;color:var(--mint-light);font-weight:700;">🎉 Sınav günü geldi! Başarılar dileriz!</div>';
    return;
  }
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  if (boxes) boxes.innerHTML = ['Gün', 'Saat', 'Dakika', 'Saniye'].map((l, i) => {
    const v = [days, hours, mins, secs][i];
    const colors = ['var(--accent-light)', 'var(--violet)', 'var(--mint-light)', 'var(--amber)'];
    return `<div style="background:var(--bg-tertiary);border-radius:var(--radius-sm);padding:16px;text-align:center;border:1px solid var(--border);">
      <div style="font-size:30px;font-weight:900;color:${colors[i]};font-variant-numeric:tabular-nums;">${String(v).padStart(2, '0')}</div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:4px;font-weight:500;">${l}</div></div>`;
  }).join('');
}

/* ─── Motivation ─── */
async function getDailyQuote() {
  const today = todayKey();
  if (user.motivation_date !== today) {
    const idx = Math.floor(Math.random() * MOTIVATION_QUOTES.length);
    const data = await API.updateSettings({ motivationDate: today, motivationIndex: idx });
    user = data.user;
  }
  return MOTIVATION_QUOTES[user.motivation_index || 0];
}

async function refreshQuote() {
  let idx;
  do { idx = Math.floor(Math.random() * MOTIVATION_QUOTES.length); } while (idx === user.motivation_index && MOTIVATION_QUOTES.length > 1);
  const data = await API.updateSettings({ motivationDate: todayKey(), motivationIndex: idx });
  user = data.user;
  document.getElementById('motivationQuote').textContent = MOTIVATION_QUOTES[idx];
}

/* ─── Pomodoro ─── */
async function savePomSettings() {
  const data = await API.updateSettings({
    pomWorkMin: parseInt(document.getElementById('pomWorkMin').value) || 25,
    pomBreakMin: parseInt(document.getElementById('pomBreakMin').value) || 5,
  });
  user = data.user;
  toast('Pomodoro ayarları kaydedildi');
}

function ensureDailyStats(date) {
  if (!state.dailyStats[date]) state.dailyStats[date] = { work: 0, break: 0, sessions: 0 };
  return state.dailyStats[date];
}

async function startWork() {
  if (timerMode === 'work') return;
  await finalizeCurrentSession();
  timerMode = 'work';
  sessionStart = Date.now();
  timerTargetSeconds = (user.pom_work_min || 25) * 60;
  timerSeconds = timerTargetSeconds;
  
  const subjSelect = document.getElementById('pomSubject');
  timerSubject = subjSelect ? subjSelect.value : null;

  await API.setActiveTimer({ mode: 'work', startedAt: sessionStart, targetSec: timerTargetSeconds, subject: timerSubject });
  runTimer();
  document.getElementById('timerMode').textContent = '📖 Çalışıyorsun';
  document.getElementById('breakMenu').classList.add('hidden');
  document.getElementById('btnStartWork').classList.add('hidden');
  document.getElementById('btnBreakMenu').classList.remove('hidden'); // Çalışırken mola verebilmeli
  document.getElementById('btnEndBreak').classList.add('hidden');
  
  isPaused = false;
  pauseStartTime = null;
  const bp = document.getElementById('btnPause');
  if (bp) { bp.classList.remove('hidden'); bp.innerHTML = '⏸ Duraklat'; bp.className = 'btn btn-amber'; }
  
  toast('Çalışma başladı!', '▶');
}

function openBreakMenu() {
  document.getElementById('breakMenu').classList.toggle('hidden');
  loadBreakStats();
}

function selectBreakType(type) {
  selectedBreakType = type;
  document.querySelectorAll('.break-type-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.type === type);
  });
  const suggestions = BREAK_SUGGESTIONS[type] || BREAK_SUGGESTIONS.short;
  const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
  document.getElementById('breakSuggestion').classList.remove('hidden');
  document.getElementById('breakSuggestionText').textContent = suggestion;
  startBreak(type);
}

async function startBreak(type) {
  type = type || selectedBreakType;
  if (timerMode === 'break') return;
  
  if (timerMode === 'work') {
    pausedWorkSec = timerSeconds;
    await finalizeCurrentSession();
  } else {
    await finalizeCurrentSession();
  }

  timerMode = 'break';
  sessionStart = Date.now();
  const bt = BREAK_TYPES[type] || BREAK_TYPES.short;
  timerTargetSeconds = bt.duration * 60;
  timerSeconds = timerTargetSeconds;
  await API.setActiveTimer({ 
    mode: 'break', 
    startedAt: sessionStart, 
    targetSec: timerTargetSeconds, 
    breakType: type,
    pausedWorkSec: pausedWorkSec 
  });
  
  runTimer();
  document.getElementById('timerMode').textContent = `${bt.icon} ${bt.name}`;
  document.getElementById('breakMenu').classList.add('hidden');
  document.getElementById('btnStartWork').classList.add('hidden');
  document.getElementById('btnBreakMenu').classList.add('hidden');
  document.getElementById('btnEndBreak').classList.remove('hidden');

  isPaused = false;
  pauseStartTime = null;
  const bp = document.getElementById('btnPause');
  if (bp) { bp.classList.remove('hidden'); bp.innerHTML = '⏸ Duraklat'; bp.className = 'btn btn-amber'; }

  toast(`${bt.name} başladı`, bt.icon);
}

async function endBreak() {
  if (timerMode !== 'break') return;
  await finalizeCurrentSession();
  clearInterval(timerInterval);
  
  if (pausedWorkSec > 0) {
    timerMode = 'work';
    sessionStart = Date.now();
    timerTargetSeconds = pausedWorkSec;
    timerSeconds = timerTargetSeconds;
    pausedWorkSec = 0;
    await API.setActiveTimer({ mode: 'work', startedAt: sessionStart, targetSec: timerTargetSeconds });
    runTimer();
    document.getElementById('timerMode').textContent = '📖 Çalışıyorsun (Devam)';
    document.getElementById('btnStartWork').classList.add('hidden');
    document.getElementById('btnBreakMenu').classList.remove('hidden');
    document.getElementById('btnEndBreak').classList.add('hidden');
    document.getElementById('breakSuggestion').classList.add('hidden');

    isPaused = false;
    pauseStartTime = null;
    const bp = document.getElementById('btnPause');
    if (bp) { bp.classList.remove('hidden'); bp.innerHTML = '⏸ Duraklat'; bp.className = 'btn btn-amber'; }

    toast('Çalışmaya kalındığı yerden devam ediliyor!', '▶');
  } else {
    timerMode = 'idle';
    timerSeconds = 0;
    timerTargetSeconds = 0;
    sessionStart = null;
    await API.setActiveTimer(null);
    updateTimerDisplay();
    document.getElementById('timerMode').textContent = 'Hazır';
    document.getElementById('btnStartWork').classList.remove('hidden');
    document.getElementById('btnBreakMenu').classList.remove('hidden');
    document.getElementById('btnEndBreak').classList.add('hidden');
    document.getElementById('breakSuggestion').classList.add('hidden');
    
    const bp = document.getElementById('btnPause');
    if (bp) bp.classList.add('hidden');

    toast('Mola erken bitirildi', '⏭');
  }
  
  renderPomodoro();
  renderDashboard();
}

async function stopSession() {
  await finalizeCurrentSession();
  clearInterval(timerInterval);
  timerMode = 'idle';
  timerSeconds = 0;
  timerTargetSeconds = 0;
  pausedWorkSec = 0;
  sessionStart = null;
  await API.setActiveTimer(null);
  updateTimerDisplay();
  document.getElementById('timerMode').textContent = 'Hazır';
  document.getElementById('breakMenu').classList.add('hidden');
  document.getElementById('breakSuggestion').classList.add('hidden');
  document.getElementById('btnStartWork').classList.remove('hidden');
  document.getElementById('btnBreakMenu').classList.remove('hidden');
  document.getElementById('btnEndBreak').classList.add('hidden');

  const bp = document.getElementById('btnPause');
  if (bp) bp.classList.add('hidden');

  toast('Oturum veritabanına kaydedildi', '💾');
  renderPomodoro();
  renderDashboard();
}

async function finalizeCurrentSession() {
  if (!sessionStart || timerMode === 'idle') return;
  const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
  if (elapsed < 5) { sessionStart = null; return; }
  const today = todayKey();
  const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  await API.addSession({ date: today, mode: timerMode, duration: elapsed, timeStr, breakType: selectedBreakType, subject: timerSubject });
  const stats = ensureDailyStats(today);
  if (timerMode === 'work') stats.work += elapsed; else stats.break += elapsed;
  stats.sessions++;
  state.sessions.unshift({ date: today, mode: timerMode, duration: elapsed, time_str: timeStr, break_type: selectedBreakType, subject: timerSubject });
  sessionStart = null;
  const dash = await loadDashboardData();
  user = dash.user;
  document.getElementById('streakDisplay').textContent = (user.streak_count || 0) + ' gün';
}

function runTimer() {
  clearInterval(timerInterval);
  const tickStart = Date.now();
  const initialSec = timerSeconds;
  updateTimerDisplay();
  timerInterval = setInterval(async () => {
    timerSeconds = Math.max(0, initialSec - Math.floor((Date.now() - tickStart) / 1000));
    updateTimerDisplay();
    if (timerSeconds <= 0) {
      const wasWork = timerMode === 'work';
      const wasBreak = timerMode === 'break';
      if (Notification?.permission === 'granted') {
        new Notification('KPSS Dashboard', { body: wasWork ? 'Çalışma bitti! Mola zamanı.' : 'Mola bitti! Devam et.' });
      }
      
      if (wasWork) {
        await stopSession();
        // Süre bitince otomatik mola menüsünü açma
      } else if (wasBreak) {
        await endBreak();
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  const h = Math.floor(timerSeconds / 3600), m = Math.floor((timerSeconds % 3600) / 60), s = timerSeconds % 60;
  document.getElementById('timerDisplay').textContent =
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  // Update SVG ring
  const ring = document.getElementById('timerProgressRing');
  if (ring) {
    const circumference = 2 * Math.PI * 54; // r=54
    const progress = timerTargetSeconds > 0 ? (1 - timerSeconds / timerTargetSeconds) : 0;
    ring.style.strokeDashoffset = circumference * (1 - progress);
    const color = timerMode === 'work' ? 'url(#timerGrad)' : 'var(--mint)';
    ring.style.stroke = color;
  }
}

function restoreActiveTimer() {
  const t = user?.active_timer;
  if (!t) return;
  
  let elapsed = Math.floor((Date.now() - t.startedAt) / 1000);
  if (t.isPaused && t.pauseStartTime) {
    elapsed = Math.floor((t.pauseStartTime - t.startedAt) / 1000);
  }
  
  timerTargetSeconds = t.targetSec;
  timerSeconds = Math.max(0, t.targetSec - elapsed);
  timerMode = t.mode;
  sessionStart = t.startedAt;
  pausedWorkSec = t.pausedWorkSec || 0;
  if (t.breakType) selectedBreakType = t.breakType;
  if (t.subject) timerSubject = t.subject;
  
  if (t.isPaused) {
    isPaused = true;
    pauseStartTime = t.pauseStartTime;
  } else {
    isPaused = false;
    pauseStartTime = null;
  }
  
  if (timerSeconds > 0) {
    if (!isPaused) runTimer();
    const bt = BREAK_TYPES[t.breakType] || {};
    
    if (isPaused) {
      document.getElementById('timerMode').textContent = '⏸ Duraklatıldı';
      updateTimerDisplay();
    } else {
      document.getElementById('timerMode').textContent = t.mode === 'work' ? '📖 Çalışıyorsun' : `${bt.icon || '☕'} ${bt.name || 'Moladasın'}`;
    }
    
    document.getElementById('btnStartWork').classList.add('hidden');
    document.getElementById('btnBreakMenu').classList.add('hidden');
    if (t.mode === 'break') {
      document.getElementById('btnEndBreak').classList.remove('hidden');
    }
    
    const bp = document.getElementById('btnPause');
    if (bp) { 
      bp.classList.remove('hidden'); 
      if (isPaused) {
        bp.innerHTML = '▶ Devam Et';
        bp.className = 'btn btn-mint';
      } else {
        bp.innerHTML = '⏸ Duraklat'; 
        bp.className = 'btn btn-amber'; 
      }
    }
  } else stopSession();
}

async function togglePause() {
  if (timerMode === 'idle') return;
  const btn = document.getElementById('btnPause');
  
  if (isPaused) {
    isPaused = false;
    if (pauseStartTime) {
      sessionStart += (Date.now() - pauseStartTime);
      pauseStartTime = null;
    }
    
    await API.setActiveTimer({ 
      mode: timerMode, 
      startedAt: sessionStart, 
      targetSec: timerTargetSeconds, 
      breakType: selectedBreakType,
      pausedWorkSec: pausedWorkSec,
      subject: timerSubject
    });
    
    runTimer();
    btn.innerHTML = '⏸ Duraklat';
    btn.className = 'btn btn-amber';
    const bt = timerMode === 'break' ? (BREAK_TYPES[selectedBreakType] || {}) : null;
    document.getElementById('timerMode').textContent = timerMode === 'work' ? '📖 Çalışıyorsun' : `${bt?.icon || '☕'} ${bt?.name || 'Moladasın'}`;
    toast('Süre devam ediyor', '▶');
  } else {
    isPaused = true;
    pauseStartTime = Date.now();
    clearInterval(timerInterval);
    
    await API.setActiveTimer({ 
      mode: timerMode, 
      startedAt: sessionStart, 
      targetSec: timerTargetSeconds, 
      breakType: selectedBreakType,
      pausedWorkSec: pausedWorkSec,
      subject: timerSubject,
      isPaused: true,
      pauseStartTime: pauseStartTime
    });
    
    btn.innerHTML = '▶ Devam Et';
    btn.className = 'btn btn-mint';
    document.getElementById('timerMode').textContent = '⏸ Duraklatıldı';
    toast('Süre duraklatıldı', '⏸');
  }
}

/* ─── Extra Features ─── */
let isZenMode = false;
function toggleZenMode() {
  isZenMode = !isZenMode;
  document.body.classList.toggle('zen-mode', isZenMode);
  toast(isZenMode ? 'Zen Modu Açıldı (Dikkat dağınıklığı gizlendi)' : 'Zen Modu Kapatıldı', '🧘');
}

const AMBIENT_URLS = {
  rain: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_88447e12d2.mp3?filename=rain-and-thunder-16705.mp3',
  cafe: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=restaurant-ambience-15654.mp3',
  lofi: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf7f5.mp3?filename=lofi-study-112191.mp3'
};

function playAmbientSound() {
  const type = document.getElementById('ambientSoundSelect').value;
  const player = document.getElementById('ambientPlayer');
  if (!type) {
    player.pause();
    return;
  }
  player.src = AMBIENT_URLS[type] || '';
  player.volume = 0.4;
  player.play().catch(() => toast('Ses oynatılamadı, tarayıcı izni gerekiyor olabilir', '⚠'));
}

async function loadBreakStats() {
  try {
    const stats = await API.getBreakStats();
    const card = document.getElementById('breakStatsCard');
    card.classList.remove('hidden');
    document.getElementById('breakStatsGrid').innerHTML = `
      <div style="background:var(--bg-tertiary);border-radius:var(--radius-xs);padding:12px;">
        <div style="font-size:11px;color:var(--text-muted);">Toplam Mola</div>
        <div style="font-size:18px;font-weight:700;color:var(--mint-light);">${formatMinShort(stats.totalBreak)}</div>
      </div>
      <div style="background:var(--bg-tertiary);border-radius:var(--radius-xs);padding:12px;">
        <div style="font-size:11px;color:var(--text-muted);">Ortalama Mola</div>
        <div style="font-size:18px;font-weight:700;color:var(--accent-light);">${formatMinShort(stats.avgBreak)}</div>
      </div>
      <div style="background:var(--bg-tertiary);border-radius:var(--radius-xs);padding:12px;">
        <div style="font-size:11px;color:var(--text-muted);">En Uzun</div>
        <div style="font-size:18px;font-weight:700;color:var(--violet);">${formatMinShort(stats.maxBreak)}</div>
      </div>
      <div style="background:var(--bg-tertiary);border-radius:var(--radius-xs);padding:12px;">
        <div style="font-size:11px;color:var(--text-muted);">Mola/Çalışma</div>
        <div style="font-size:18px;font-weight:700;color:var(--amber);">%${stats.ratio}</div>
      </div>`;
  } catch { /* ignore */ }
}

async function renderPomodoro() {
  const daily = await API.getDailyStats();
  state.dailyStats = {};
  daily.dailyStats.forEach(s => { state.dailyStats[s.date] = { work: s.work_seconds, break: s.break_seconds, sessions: s.sessions_count }; });
  const sessionsRes = await API.getSessions(todayKey());
  state.sessions = sessionsRes.sessions || [];
  const stats = ensureDailyStats(todayKey());
  document.getElementById('todayWorkTotal').textContent = formatMinutes(stats.work);
  document.getElementById('todayBreakTotal').textContent = formatMinutes(stats.break);
  document.getElementById('sessionLog').innerHTML = state.sessions.length
    ? state.sessions.map(s => {
        const bt = s.break_type ? BREAK_TYPES[s.break_type] : null;
        const icon = s.mode === 'work' ? '📖' : (bt?.icon || '☕');
        const label = s.mode === 'work' ? 'Çalışma' : (bt?.name || 'Mola');
        return `<div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg-tertiary);border-radius:var(--radius-xs);padding:10px 14px;margin-bottom:6px;">
          <div><span>${icon}</span> <span style="font-weight:500;color:var(--text-primary);">${label}</span> <span style="color:var(--text-muted);margin-left:4px;">${s.time_str}</span></div>
          <span style="color:var(--text-secondary);font-weight:600;">${formatDuration(s.duration)}</span></div>`;
      }).join('')
    : '<p style="text-align:center;padding:24px;color:var(--text-muted);">Henüz oturum yok</p>';

  const dates = Object.keys(state.dailyStats).sort().reverse().slice(0, 30);
  document.getElementById('dailyHistoryTable').innerHTML = dates.length
    ? dates.map(d => { const s = state.dailyStats[d];
      return `<tr><td style="padding:8px 12px;">${formatDate(d)}</td>
        <td class="text-right" style="color:var(--accent-light);font-weight:600;">${formatMinutes(s.work)}</td>
        <td class="text-right" style="color:var(--mint-light);">${formatMinutes(s.break)}</td>
        <td class="text-right">${s.sessions || 0}</td></tr>`; }).join('')
    : '<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--text-muted);">Henüz kayıt yok</td></tr>';
}

/* ─── Net ─── */
function calcNet(d, y) { return Math.max(0, (d || 0) - (y || 0) / 4); }

function renderNetInputs() {
  document.getElementById('netInputTable').innerHTML = SUBJECTS.map(s => {
    const inp = state.netInputs[s.id] || { d: 0, y: 0 };
    return `<tr><td style="padding:8px 12px;">${s.name} <span class="badge badge-${s.group === 'gy' ? 'accent' : 'violet'}" style="margin-left:4px;">${s.group === 'gy' ? 'GY' : 'GK'}</span></td>
      <td class="text-center" style="color:var(--text-muted);">${s.max}</td>
      <td class="text-center"><input type="number" min="0" max="${s.max}" value="${inp.d || 0}" data-subj="${s.id}" data-field="d" class="net-input input input-sm" style="width:64px;text-align:center;" oninput="onNetInput()" /></td>
      <td class="text-center"><input type="number" min="0" max="${s.max}" value="${inp.y || 0}" data-subj="${s.id}" data-field="y" class="net-input input input-sm" style="width:64px;text-align:center;" oninput="onNetInput()" /></td>
      <td class="text-center" style="font-weight:700;color:var(--accent-light);" id="net-${s.id}">${calcNet(inp.d, inp.y).toFixed(2)}</td></tr>`;
  }).join('');
  onNetInput(false);
}

function onNetInput(save = true) {
  let totalD = 0, totalY = 0, totalNet = 0, gyNet = 0, gkNet = 0;
  document.querySelectorAll('.net-input').forEach(inp => {
    const subj = inp.dataset.subj, field = inp.dataset.field;
    if (!state.netInputs[subj]) state.netInputs[subj] = { d: 0, y: 0 };
    state.netInputs[subj][field] = Math.max(0, parseInt(inp.value) || 0);
  });
  SUBJECTS.forEach(s => {
    const inp = state.netInputs[s.id] || { d: 0, y: 0 };
    inp.d = Math.min(inp.d, s.max); inp.y = Math.min(inp.y, s.max);
    const net = calcNet(inp.d, inp.y);
    totalD += inp.d; totalY += inp.y; totalNet += net;
    if (s.group === 'gy') gyNet += net; else gkNet += net;
    const el = document.getElementById('net-' + s.id);
    if (el) el.textContent = net.toFixed(2);
  });
  document.getElementById('totalDogru').textContent = totalD;
  document.getElementById('totalYanlis').textContent = totalY;
  document.getElementById('totalNet').textContent = totalNet.toFixed(2);
  document.getElementById('gyNet').textContent = gyNet.toFixed(2);
  document.getElementById('gkNet').textContent = gkNet.toFixed(2);
  if (save) {
    clearTimeout(saveNetDebounce);
    saveNetDebounce = setTimeout(async () => {
      await API.saveNetInputs(state.netInputs, state.lastSimulation);
    }, 600);
  }
}

function calcASP(net, mean, std) { return 50 + 10 * ((net - mean) / std); }
function calcP94(gyNet, gkNet, p) {
  const asp = 0.5 * calcASP(gyNet, p.gyMean, p.gyStd) + 0.5 * calcASP(gkNet, p.gkMean, p.gkStd);
  return Math.max(0, Math.min(100, Math.round((70 + (30 * (asp - 50)) / 50) * 100) / 100));
}

async function calculateScore() {
  onNetInput(false);
  let gyNet = 0, gkNet = 0, totalNet = 0;
  SUBJECTS.forEach(s => {
    const inp = state.netInputs[s.id] || { d: 0, y: 0 };
    const net = calcNet(inp.d, inp.y);
    totalNet += net;
    if (s.group === 'gy') gyNet += net; else gkNet += net;
  });
  if (gyNet < 0.25 && gkNet < 0.25) { toast('GY ve GK\'den en az 0.25 net gerekli', '⚠'); return; }
  const results = Object.entries(YEAR_PROFILES).map(([year, p]) => ({
    year, label: p.label, gyNet, gkNet, totalNet, p94: calcP94(gyNet, gkNet, p),
  }));
  state.lastSimulation = { date: todayKey(), gyNet, gkNet, totalNet, results };
  await API.saveNetInputs(state.netInputs, state.lastSimulation);
  document.getElementById('simulationTable').innerHTML = results.map(r =>
    `<tr><td style="padding:8px 12px;">${r.label}</td><td class="text-center">${r.gyNet.toFixed(2)}</td>
    <td class="text-center">${r.gkNet.toFixed(2)}</td><td class="text-center" style="font-weight:700;">${r.totalNet.toFixed(2)}</td>
    <td class="text-center" style="font-weight:800;color:var(--accent-light);font-size:16px;">${r.p94.toFixed(2)}</td></tr>`).join('');
  toast('P94 simülasyonu hesaplandı', '🎯');
}

async function saveNetRecord() {
  onNetInput(false);
  const subjects = {}; let totalNet = 0;
  SUBJECTS.forEach(s => {
    const inp = state.netInputs[s.id] || { d: 0, y: 0 };
    subjects[s.id] = { ...inp, net: calcNet(inp.d, inp.y) };
    totalNet += subjects[s.id].net;
  });
  const res = await API.addNetRecord({
    date: todayKey(),
    timeStr: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    subjects, totalNet, simulation: state.lastSimulation,
  });
  state.netRecords = res.records;
  renderNetHistory();
  toast('Net kaydı veritabanına eklendi', '💾');
}

async function clearNetInputs() {
  state.netInputs = {}; state.lastSimulation = null;
  await API.saveNetInputs({}, null);
  renderNetInputs();
  document.getElementById('simulationTable').innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-muted);">Henüz hesaplama yok</td></tr>';
}

function renderNetHistory() {
  const el = document.getElementById('netHistoryList');
  if (!state.netRecords.length) { el.innerHTML = '<p style="text-align:center;padding:24px;color:var(--text-muted);">Henüz kayıt yok</p>'; return; }
  el.innerHTML = state.netRecords.map(r => {
    const p94 = r.simulation?.results?.[0]?.p94;
    return `<div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg-tertiary);border-radius:var(--radius-sm);padding:12px 16px;margin-bottom:6px;">
      <div>
        <div style="font-weight:600;color:var(--text-primary);font-size:13px;">${formatDate(r.date)} · ${r.time_str}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">Net: <span style="color:var(--accent-light);font-weight:600;">${r.total_net.toFixed(2)}</span>${p94 ? ` · P94≈${p94.toFixed(1)}` : ''}</div>
      </div>
      <button onclick="loadNetRecord(${r.id})" class="btn btn-ghost btn-sm">Yükle</button></div>`;
  }).join('');
}

function loadNetRecord(id) {
  const rec = state.netRecords.find(r => r.id === id);
  if (!rec) return;
  state.netInputs = {};
  SUBJECTS.forEach(s => { if (rec.subjects[s.id]) state.netInputs[s.id] = { d: rec.subjects[s.id].d, y: rec.subjects[s.id].y }; });
  state.lastSimulation = rec.simulation;
  renderNetInputs();
  if (rec.simulation?.results) {
    document.getElementById('simulationTable').innerHTML = rec.simulation.results.map(r =>
      `<tr><td style="padding:8px 12px;">${r.label || r.year}</td><td class="text-center">${r.gyNet.toFixed(2)}</td>
      <td class="text-center">${r.gkNet.toFixed(2)}</td><td class="text-center" style="font-weight:700;">${r.totalNet.toFixed(2)}</td>
      <td class="text-center" style="font-weight:800;color:var(--accent-light);">${r.p94.toFixed(2)}</td></tr>`).join('');
  }
  API.saveNetInputs(state.netInputs, state.lastSimulation);
  toast('Kayıt yüklendi');
}

function renderNet() {
  renderNetInputs();
  renderNetHistory();
  if (state.lastSimulation?.results) {
    document.getElementById('simulationTable').innerHTML = state.lastSimulation.results.map(r =>
      `<tr><td style="padding:8px 12px;">${r.label}</td><td class="text-center">${r.gyNet.toFixed(2)}</td>
      <td class="text-center">${r.gkNet.toFixed(2)}</td><td class="text-center" style="font-weight:700;">${r.totalNet.toFixed(2)}</td>
      <td class="text-center" style="font-weight:800;color:var(--accent-light);">${r.p94.toFixed(2)}</td></tr>`).join('');
  }
}

/* ─── Curriculum ─── */
function getCurriculumProgress() {
  let total = 0, done = 0;
  Object.entries(CURRICULUM).forEach(([subj, topics]) => topics.forEach((_, i) => {
    total++; if (state.curriculum[`${subj}-${i}`]) done++;
  }));
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}

function getSubjectProgress(subj) {
  const topics = CURRICULUM[subj] || [];
  let done = 0;
  topics.forEach((_, i) => { if (state.curriculum[`${subj}-${i}`]) done++; });
  return { total: topics.length, done, pct: topics.length ? Math.round((done / topics.length) * 100) : 0 };
}

function toggleTopic(key, element) {
  const isCompleted = !!state.curriculum[key];
  if (isCompleted) {
    saveCurrData(key, false, null);
  } else {
    currentCurrKey = key;
    const [subj, idx] = key.split('-');
    document.getElementById('currModalTopic').textContent = CURRICULUM[subj][idx] || key;
    document.getElementById('currModalDate').value = todayKey();
    document.getElementById('currModal').classList.remove('hidden');
    if (element) element.checked = false;
  }
}

function closeCurrModal() {
  document.getElementById('currModal').classList.add('hidden');
  currentCurrKey = null;
}

async function saveCurrDate() {
  if (!currentCurrKey) return;
  const date = document.getElementById('currModalDate').value || todayKey();
  try {
    await saveCurrData(currentCurrKey, true, date);
    closeCurrModal();
  } catch (err) {
    console.error(err);
  }
}

async function saveCurrData(key, completed, completedDate) {
  try {
    const res = await API.toggleCurriculum(key, completed, completedDate);
    state.curriculum = res.curriculum;
    renderCurriculum();
    renderDashboard();
  } catch (err) {
    toast('Müfredat güncellenemedi: ' + err.message, '⚠');
    throw err;
  }
}

function toggleAccordion(subj) {
  const body = document.getElementById('acc-body-' + subj);
  const chevron = document.getElementById('acc-chev-' + subj);
  if (body) {
    body.classList.toggle('open');
    if (chevron) chevron.style.transform = body.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
  }
}

function renderCurriculum() {
  const { total, done, pct } = getCurriculumProgress();
  document.getElementById('curriculumPercent').textContent = pct + '%';
  document.getElementById('curriculumBar').style.width = pct + '%';
  document.getElementById('curriculumDone').textContent = done;
  document.getElementById('curriculumTotal').textContent = total;

  // Subject progress cards
  document.getElementById('curriculumSubjectCards').innerHTML = Object.keys(CURRICULUM).map(subj => {
    const sp = getSubjectProgress(subj);
    const color = CURRICULUM_COLORS[subj];
    return `<div class="card-static p-4">
      <div class="flex items-center gap-3 mb-3">
        <span style="font-size:22px;">${CURRICULUM_ICONS[subj]}</span>
        <div class="flex-1 min-w-0">
          <div style="font-weight:700;color:var(--text-primary);font-size:13px;">${CURRICULUM_NAMES[subj]}</div>
          <div style="font-size:11px;color:var(--text-muted);">${sp.done}/${sp.total} konu</div>
        </div>
        <div style="font-size:18px;font-weight:800;color:${color};">${sp.pct}%</div>
      </div>
      <div class="progress-track" style="height:6px;"><div class="progress-fill" style="width:${sp.pct}%;background:${color};"></div></div>
    </div>`;
  }).join('');

  // Accordion
  document.getElementById('curriculumContainer').innerHTML = Object.entries(CURRICULUM).map(([subj, topics]) => {
    const sp = getSubjectProgress(subj);
    const color = CURRICULUM_COLORS[subj];
    return `<div class="card-static" style="overflow:hidden;">
      <div class="accordion-header" onclick="toggleAccordion('${subj}')">
        <div class="flex items-center gap-3">
          <span style="font-size:20px;">${CURRICULUM_ICONS[subj]}</span>
          <div>
            <span style="font-weight:700;color:var(--text-primary);font-size:14px;">${CURRICULUM_NAMES[subj]}</span>
            <span style="font-size:12px;color:var(--text-muted);margin-left:8px;">${sp.done}/${sp.total}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="progress-track" style="width:80px;height:6px;"><div class="progress-fill" style="width:${sp.pct}%;background:${color};"></div></div>
          <span style="font-weight:700;color:${color};font-size:13px;">${sp.pct}%</span>
          <span id="acc-chev-${subj}" class="accordion-chevron">▼</span>
        </div>
      </div>
      <div id="acc-body-${subj}" class="accordion-body">
        <div style="padding:0 20px 16px;">
          ${topics.map((t, i) => {
            const key = `${subj}-${i}`, chk = state.curriculum[key];
            const dateStr = chk && chk.completed_date ? formatDateShort(chk.completed_date) : '';
            return `<label style="display:flex;align-items:center;gap:12px;padding:8px 10px;border-radius:var(--radius-xs);cursor:pointer;transition:all 0.2s;${chk ? 'opacity:0.7;' : ''}" onmouseenter="this.style.background='rgba(99,102,241,0.04)'" onmouseleave="this.style.background='transparent'">
              <input type="checkbox" ${chk ? 'checked' : ''} onchange="toggleTopic('${key}', this)" style="width:18px;height:18px;accent-color:${color};cursor:pointer;flex-shrink:0;" />
              <span style="font-size:13px;${chk ? 'text-decoration:line-through;color:var(--text-muted);' : 'color:var(--text-secondary);'}">${t}</span>
              ${chk ? `<div style="margin-left:auto;display:flex;align-items:center;gap:6px;">
                ${dateStr ? `<span style="font-size:11px;color:var(--mint-light);background:rgba(16,185,129,0.1);padding:2px 8px;border-radius:12px;white-space:nowrap;">📅 ${dateStr}</span>` : ''}
                <span style="color:var(--mint-light);font-size:12px;font-weight:bold;">✓</span>
              </div>` : ''}
            </label>`;
          }).join('')}
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ─── Notes ─── */
async function addNote() {
  const title = document.getElementById('noteTitle').value.trim();
  const content = document.getElementById('noteContent').value.trim();
  const subject = document.getElementById('noteSubject').value;
  const imageInput = document.getElementById('noteImage');
  
  if (!content && !title && (!imageInput || !imageInput.files[0])) { toast('Not içeriği veya fotoğraf girin', '⚠'); return; }
  
  let imageBase64 = null;
  if (imageInput && imageInput.files[0]) {
    const file = imageInput.files[0];
    imageBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  const res = await API.addNote({ title: title || 'Not', content, subject, image: imageBase64 });
  state.notes = res.notes;
  document.getElementById('noteTitle').value = '';
  document.getElementById('noteContent').value = '';
  if (imageInput) {
    imageInput.value = '';
    const label = document.getElementById('noteImageLabel');
    if (label) label.textContent = '📷 Fotoğraf Seç';
  }
  renderNotes();
  toast('Not kaydedildi');
}

function openImageModal(url) {
  document.getElementById('imageModalImg').src = url;
  document.getElementById('imageModal').classList.remove('hidden');
}

function closeImageModal() {
  document.getElementById('imageModal').classList.add('hidden');
  document.getElementById('imageModalImg').src = '';
}

async function deleteNote(id) {
  const res = await API.deleteNote(id);
  state.notes = res.notes;
  renderNotes();
}

function filterNotes(f) {
  noteFilter = f;
  document.querySelectorAll('.note-filter').forEach(b => {
    const isActive = b.dataset.f === f;
    b.className = `note-filter btn ${isActive ? 'btn-ghost' : 'btn-outline'} btn-sm`;
  });
  renderNotes();
}

async function loadAndRenderNotes() {
  try {
    const res = await API.getNotes();
    state.notes = res.notes || [];
  } catch(e) {}
  renderNotes();
}

function renderNotes() {
  const labels = { genel: 'Genel', turkce: 'Türkçe', matematik: 'Matematik', tarih: 'Tarih', cografya: 'Coğrafya', vatandaslik: 'Vatandaşlık', guncel: 'Güncel' };
  const filtered = noteFilter === 'all' ? state.notes : state.notes.filter(n => n.subject === noteFilter);
  document.getElementById('notesList').innerHTML = filtered.length ? filtered.map(n =>
    `<div class="card p-4 group relative">
      <div style="display:flex;justify-content:space-between;gap:8px;">
        <div style="min-width:0;">
          <span class="badge badge-accent">${labels[n.subject] || n.subject}</span>
          <h4 style="font-weight:700;color:#fff;margin-top:8px;font-size:14px;">${escapeHtml(n.title)}</h4>
          <p style="font-size:13px;color:var(--text-secondary);margin-top:6px;white-space:pre-wrap;line-height:1.6;">${escapeHtml(n.content)}</p>
          ${n.image_url ? `<img src="${n.image_url}" onclick="openImageModal('${n.image_url}')" style="max-width:100%; border-radius:8px; margin-top:8px; max-height:200px; object-fit:cover; cursor:zoom-in; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'" />` : ''}
          <div style="font-size:11px;color:var(--text-muted);margin-top:8px;">${n.date} · ${n.time_str}</div>
        </div>
        <button onclick="deleteNote(${n.id})" class="group-hover-visible btn btn-icon" style="color:var(--coral);flex-shrink:0;">✕</button>
      </div>
    </div>`).join('')
    : '<p style="grid-column:span 2;text-align:center;padding:32px;color:var(--text-muted);">Henüz not yok</p>';
}

/* ─── Todo ─── */
async function addTodo() {
  const text = document.getElementById('todoInput').value.trim();
  if (!text) return;
  const res = await API.addTodo({ text, date: todayKey() });
  state.todos = res.todos;
  document.getElementById('todoInput').value = '';
  renderTodos(); renderDashboard();
  toast('Görev eklendi');
}

async function toggleTodo(id) {
  const t = state.todos.find(x => x.id === id);
  const res = await API.updateTodo(id, !t.done, todayKey());
  state.todos = res.todos;
  renderTodos(); renderDashboard();
}

async function deleteTodoItem(id) {
  const res = await API.deleteTodo(id, todayKey());
  state.todos = res.todos;
  renderTodos(); renderDashboard();
}

function renderTodos() {
  document.getElementById('todoDateLabel').textContent = formatDate(todayKey());
  document.getElementById('todoList').innerHTML = state.todos.length ? state.todos.map(t =>
    `<div class="card-static" style="padding:12px 16px;display:flex;align-items:center;gap:12px;margin-bottom:6px;" class="group">
      <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTodo(${t.id})" style="width:20px;height:20px;accent-color:var(--mint);cursor:pointer;" />
      <span style="flex:1;font-size:13px;${t.done ? 'text-decoration:line-through;color:var(--text-muted);' : 'color:var(--text-secondary);'}">${escapeHtml(t.text)}</span>
      <button onclick="deleteTodoItem(${t.id})" class="btn btn-icon btn-sm" style="color:var(--coral);opacity:0.5;" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='0.5'">✕</button>
    </div>`).join('')
    : '<p style="text-align:center;padding:32px;color:var(--text-muted);">Bugün için görev yok</p>';
}

/* ─── Dashboard ─── */
function renderWeeklyChart() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  const maxWork = Math.max(1, ...days.map(d => state.dailyStats[d]?.work || 0));
  document.getElementById('weeklyChart').innerHTML = days.map(d => {
    const work = state.dailyStats[d]?.work || 0;
    const pct = Math.round((work / maxWork) * 100);
    const label = new Date(d + 'T12:00:00').toLocaleDateString('tr-TR', { weekday: 'short' });
    const isToday = d === todayKey();
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
      <div style="font-size:11px;color:var(--text-muted);font-weight:500;">${Math.round(work / 60)}dk</div>
      <div style="width:100%;background:var(--bg-tertiary);border-radius:8px 8px 0 0;position:relative;height:110px;">
        <div style="position:absolute;bottom:0;width:100%;border-radius:8px 8px 0 0;background:${isToday ? 'linear-gradient(180deg,var(--accent),var(--violet))' : 'rgba(99,102,241,0.3)'};height:${pct}%;transition:height 0.5s ease;"></div>
      </div>
      <div style="font-size:11px;${isToday ? 'color:var(--accent-light);font-weight:700;' : 'color:var(--text-muted);'}">${label}</div>
    </div>`;
  }).join('');
}

async function renderDashboard() {
  document.getElementById('todayLabel').textContent = formatDate(todayKey());
  document.getElementById('motivationQuote').textContent = await getDailyQuote();
  const stats = ensureDailyStats(todayKey());
  document.getElementById('dashTodayWork').textContent = formatMinShort(stats.work);
  document.getElementById('dashTodayBreak').textContent = formatMinShort(stats.break);
  document.getElementById('dashProgress').textContent = getCurriculumProgress().pct + '%';
  const done = state.todos.filter(t => t.done).length;
  document.getElementById('dashTodos').textContent = `${done}/${state.todos.length}`;

  // Daily Goal
  const goalMinutes = user.daily_goal_minutes || 120;
  const workedMinutes = Math.round(stats.work / 60);
  const goalPct = Math.min(100, Math.round((workedMinutes / goalMinutes) * 100));
  document.getElementById('goalLabel').textContent = `${workedMinutes} / ${goalMinutes} dakika`;
  document.getElementById('goalBadge').textContent = goalPct + '%';
  document.getElementById('goalBar').style.width = goalPct + '%';
  if (goalPct >= 100) {
    document.getElementById('goalBadge').className = 'badge badge-mint';
    document.getElementById('goalBar').style.background = 'linear-gradient(90deg, var(--mint), #059669)';
  } else {
    document.getElementById('goalBadge').className = 'badge badge-accent';
    document.getElementById('goalBar').style.background = 'linear-gradient(90deg, var(--accent), var(--violet))';
  }

  renderWeeklyChart();
}

/* ─── Compare ─── */
function renderCompare() {
  const d = new Date();
  const yesterday = new Date(); yesterday.setDate(d.getDate() - 1);
  document.getElementById('compareDate1').value = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  document.getElementById('compareDate2').value = todayKey();
}

async function loadComparison() {
  const date1 = document.getElementById('compareDate1').value;
  const date2 = document.getElementById('compareDate2').value;
  if (!date1 || !date2) { toast('İki tarih seçmelisiniz', '⚠'); return; }
  if (date1 === date2) { toast('Farklı tarihler seçmelisiniz', '⚠'); return; }

  try {
    const data = await API.compareStudy(date1, date2);
    const container = document.getElementById('compareResults');
    container.classList.remove('hidden');

    function diffArrow(v1, v2) {
      if (v1 === v2) return '<span style="color:var(--text-muted);">—</span>';
      const diff = v2 - v1;
      const pct = v1 > 0 ? Math.round((diff / v1) * 100) : (v2 > 0 ? 100 : 0);
      const color = diff > 0 ? 'var(--mint-light)' : 'var(--coral)';
      const arrow = diff > 0 ? '↑' : '↓';
      return `<span style="color:${color};font-weight:700;">${arrow} ${Math.abs(pct)}%</span>`;
    }

    function buildCard(d, label) {
      const s = d.stats;
      const todoDone = d.todos.filter(t => t.done).length;
      return `
        <div class="card-static p-5">
          <h4 style="font-weight:700;color:var(--accent-light);font-size:13px;margin-bottom:12px;">${label}</h4>
          <div style="font-size:16px;font-weight:800;color:#fff;margin-bottom:16px;">${formatDate(d.date)}</div>
          <div class="space-y">
            <div style="display:flex;justify-content:space-between;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-xs);">
              <span style="font-size:13px;color:var(--text-muted);">📖 Çalışma</span>
              <span style="font-weight:700;color:var(--accent-light);">${formatMinShort(s.work_seconds || 0)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-xs);margin-top:6px;">
              <span style="font-size:13px;color:var(--text-muted);">☕ Mola</span>
              <span style="font-weight:700;color:var(--mint-light);">${formatMinShort(s.break_seconds || 0)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-xs);margin-top:6px;">
              <span style="font-size:13px;color:var(--text-muted);">⏱️ Oturum</span>
              <span style="font-weight:700;color:var(--text-primary);">${s.sessions_count || 0}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-xs);margin-top:6px;">
              <span style="font-size:13px;color:var(--text-muted);">✅ Görevler</span>
              <span style="font-weight:700;color:var(--amber);">${todoDone}/${d.todos.length}</span>
            </div>
            ${d.net ? `<div style="display:flex;justify-content:space-between;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-xs);margin-top:6px;">
              <span style="font-size:13px;color:var(--text-muted);">🎯 Net</span>
              <span style="font-weight:700;color:var(--violet);">${d.net.total_net.toFixed(2)}</span>
            </div>` : ''}
          </div>
        </div>`;
    }

    const s1 = data.date1.stats, s2 = data.date2.stats;
    container.innerHTML = `
      <div class="compare-grid">
        ${buildCard(data.date1, '1. Tarih')}
        <div class="compare-vs">
          <div style="text-align:center;">
            <div style="font-size:28px;font-weight:900;color:var(--accent-light);">VS</div>
            <div class="mt-4 space-y" style="font-size:12px;">
              <div class="mt-2">Çalışma: ${diffArrow(s1.work_seconds||0, s2.work_seconds||0)}</div>
              <div class="mt-2">Mola: ${diffArrow(s1.break_seconds||0, s2.break_seconds||0)}</div>
              <div class="mt-2">Oturum: ${diffArrow(s1.sessions_count||0, s2.sessions_count||0)}</div>
            </div>
          </div>
        </div>
        ${buildCard(data.date2, '2. Tarih')}
      </div>`;
    toast('Karşılaştırma yüklendi', '📊');
  } catch (err) {
    toast('Karşılaştırma yüklenemedi: ' + err.message, '⚠');
  }
}

/* ─── Admin ─── */
async function renderAdmin() {
  if (user?.role !== 'admin') return;
  document.getElementById('adminDate').value = todayKey();
  await loadAdminData();
}

async function loadAdminData() {
  const date = document.getElementById('adminDate').value || todayKey();
  try {
    const [usersRes, lbRes] = await Promise.all([
      API.getAdminUsers(date),
      API.getLeaderboard('today', date),
    ]);

    const users = usersRes.users || [];
    const totalWork = users.reduce((s, u) => s + u.todayWork, 0);
    const totalSessions = users.reduce((s, u) => s + u.todaySessions, 0);
    const activeToday = users.filter(u => u.todayWork > 0).length;

    // Stats cards
    document.getElementById('adminStatsCards').innerHTML = `
      <div class="stat-card"><div class="stat-value" style="color:var(--accent-light);">${users.length}</div><div class="stat-label">Toplam Kullanıcı</div></div>
      <div class="stat-card"><div class="stat-value" style="color:var(--mint-light);">${activeToday}</div><div class="stat-label">Bugün Aktif</div></div>
      <div class="stat-card"><div class="stat-value" style="color:var(--violet);">${formatMinShort(totalWork)}</div><div class="stat-label">Toplam Çalışma</div></div>
      <div class="stat-card"><div class="stat-value" style="color:var(--amber);">${totalSessions}</div><div class="stat-label">Toplam Oturum</div></div>`;

    // Leaderboard
    renderLeaderboardList(lbRes.leaderboard || []);

    // Users table
    document.getElementById('adminUsersTable').innerHTML = users.map(u => `
      <tr>
        <td style="padding:10px 12px;cursor:pointer;" onclick="openAdminModal(${u.id})">
          <div style="font-weight:600;color:var(--accent-light);">${escapeHtml(u.full_name || u.username)}</div>
          <div style="font-size:11px;color:var(--text-muted);">@${u.username}</div>
        </td>
        <td><span class="badge ${u.role === 'admin' ? 'badge-amber' : 'badge-accent'}">${u.role === 'admin' ? '👑 Admin' : 'Kullanıcı'}</span></td>
        <td class="text-right" style="font-weight:600;color:var(--accent-light);">${formatMinShort(u.todayWork)}</td>
        <td class="text-right" style="color:var(--text-secondary);">${formatMinShort(u.totalWork)}</td>
        <td class="text-right"><span class="badge badge-mint">${u.streak_count || 0} 🔥</span></td>
        <td class="text-right" style="color:var(--violet);">${u.curriculumDone}</td>
        <td class="text-right" style="font-size:12px;color:var(--text-muted);">${u.lastActive ? formatDateShort(u.lastActive) : '—'}</td>
        <td class="text-right">
          ${u.id !== user.id ? `<button onclick="event.stopPropagation(); toggleUserRole(${u.id},'${u.role === 'admin' ? 'user' : 'admin'}')" class="btn btn-outline btn-sm">${u.role === 'admin' ? 'Admin Kaldır' : 'Admin Yap'}</button>` : ''}
        </td>
      </tr>`).join('');
  } catch (err) {
    toast('Admin verileri yüklenemedi: ' + err.message, '⚠');
  }
}

async function openAdminModal(userId) {
  document.getElementById('adminModal').classList.remove('hidden');
  document.getElementById('adminModalTitle').textContent = 'Yükleniyor...';
  document.getElementById('adminModalSessions').innerHTML = 'Yükleniyor...';
  document.getElementById('adminModalCurr').innerHTML = 'Yükleniyor...';
  
  try {
    const res = await fetch(`/api/admin/users/${userId}/details`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('kpss_token') } });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    
    document.getElementById('adminModalTitle').textContent = (data.user.full_name || data.user.username) + ' - Detay';
    
    document.getElementById('adminModalSessions').innerHTML = data.sessions.length ? data.sessions.map(s => {
      const icon = s.mode === 'work' ? '📖' : '☕';
      return `<div style="display:flex;justify-content:space-between;background:var(--bg-card);padding:8px;border-radius:4px;margin-bottom:4px;">
        <span>${icon} ${s.date} ${s.time_str} ${s.subject ? `(${s.subject})` : ''}</span>
        <span style="font-weight:600;">${formatDuration(s.duration)}</span>
      </div>`;
    }).join('') : '<div style="color:var(--text-muted);">Oturum bulunamadı</div>';

    document.getElementById('adminModalCurr').innerHTML = data.curriculum.length ? data.curriculum.map(c => {
      const [subj, idx] = c.topic_key.split('-');
      const tName = CURRICULUM[subj] ? CURRICULUM[subj][idx] : c.topic_key;
      return `<div style="display:flex;justify-content:space-between;background:var(--bg-card);padding:8px;border-radius:4px;margin-bottom:4px;">
        <span>📚 ${CURRICULUM_NAMES[subj] || subj} - ${tName}</span>
        <span style="color:var(--mint-light);">${c.completed_date || 'Tarih Yok'}</span>
      </div>`;
    }).join('') : '<div style="color:var(--text-muted);">Biten konu yok</div>';
  } catch (e) {
    document.getElementById('adminModalTitle').textContent = 'Hata: ' + e.message;
  }
}

function closeAdminModal() {
  document.getElementById('adminModal').classList.add('hidden');
}

async function loadLeaderboard(period) {
  document.querySelectorAll('.leader-period').forEach(b => {
    b.className = `btn ${b.dataset.p === period ? 'btn-ghost' : 'btn-outline'} btn-sm leader-period`;
  });
  const date = document.getElementById('adminDate').value || todayKey();
  try {
    const res = await API.getLeaderboard(period, date);
    renderLeaderboardList(res.leaderboard || []);
  } catch { /* ignore */ }
}

function renderLeaderboardList(list) {
  const el = document.getElementById('leaderboardList');
  if (!list.length) {
    el.innerHTML = '<p style="text-align:center;padding:24px;color:var(--text-muted);">Henüz veri yok</p>';
    return;
  }
  el.innerHTML = list.map((u, i) => {
    const rank = i + 1;
    const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-other';
    const medals = ['🥇', '🥈', '🥉'];
    return `<div class="leader-row">
      <div class="leader-rank ${rankClass}">${rank <= 3 ? medals[rank - 1] : rank}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:600;color:var(--text-primary);font-size:13px;" class="truncate">${escapeHtml(u.full_name || u.username)}</div>
        <div style="font-size:11px;color:var(--text-muted);">🔥 ${u.streak_count || 0} gün seri</div>
      </div>
      <div style="text-align:right;">
        <div style="font-weight:700;color:var(--accent-light);font-size:14px;">${formatMinShort(u.total_work)}</div>
        <div style="font-size:11px;color:var(--text-muted);">${u.total_sessions} oturum</div>
      </div>
    </div>`;
  }).join('');
}

async function toggleUserRole(userId, newRole) {
  if (!confirm(`Kullanıcıyı ${newRole === 'admin' ? 'admin yapmak' : 'admin rolünden çıkarmak'} istediğinize emin misiniz?`)) return;
  try {
    await API.setUserRole(userId, newRole);
    toast('Rol güncellendi', '👑');
    await loadAdminData();
  } catch (err) {
    toast('Rol değiştirilemedi: ' + err.message, '⚠');
  }
}

/* ─── Profile ─── */
async function saveProfile() {
  const data = await API.updateSettings({
    fullName: document.getElementById('profileFullName').value.trim(),
    examDate: document.getElementById('profileExamDate').value,
    dailyGoalMinutes: parseInt(document.getElementById('profileDailyGoal').value) || 120,
  });
  user = data.user;
  updateUserUI();
  updateCountdown();
  toast('Profil güncellendi');
}

async function exportData() {
  const data = await API.exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `kpss-yedek-${user.username}-${todayKey()}.json`;
  a.click();
  toast('Yedek indirildi', '📥');
}

async function resetAllData() {
  if (!confirm('Tüm verileriniz kalıcı olarak silinecek. Emin misiniz?')) return;
  await API.resetData();
  await bootstrapApp();
  toast('Veriler sıfırlandı', '🗑');
}

async function renderProfile() {
  const summary = (await API.dashboard()).summary;
  document.getElementById('storageSummary').innerHTML = `
    <div style="background:var(--bg-tertiary);border-radius:var(--radius-sm);padding:14px;">
      <div style="font-size:12px;color:var(--text-muted);">Çalışma Günü</div>
      <div style="font-size:22px;font-weight:800;color:var(--text-primary);">${summary.studyDays}</div>
    </div>
    <div style="background:var(--bg-tertiary);border-radius:var(--radius-sm);padding:14px;">
      <div style="font-size:12px;color:var(--text-muted);">Net Kaydı</div>
      <div style="font-size:22px;font-weight:800;color:var(--text-primary);">${summary.netCount}</div>
    </div>
    <div style="background:var(--bg-tertiary);border-radius:var(--radius-sm);padding:14px;">
      <div style="font-size:12px;color:var(--text-muted);">Not</div>
      <div style="font-size:22px;font-weight:800;color:var(--text-primary);">${summary.notesCount}</div>
    </div>
    <div style="background:var(--bg-tertiary);border-radius:var(--radius-sm);padding:14px;">
      <div style="font-size:12px;color:var(--text-muted);">Konu Tamamlanan</div>
      <div style="font-size:22px;font-weight:800;color:var(--text-primary);">${summary.curriculumDone}</div>
    </div>`;
}

/* ─── Init ─── */
async function init() {
  document.getElementById('mobileMenuBtn').onclick = () => toggleMobileNav();
  document.getElementById('loginForm').onsubmit = handleLogin;
  document.getElementById('registerForm').onsubmit = handleRegister;
  setInterval(updateCountdown, 1000);
  if (Notification?.permission === 'default') Notification.requestPermission();
  try {
    const data = await API.me();
    user = data.user;
    await bootstrapApp();
  } catch {
    showAuth();
    switchAuthTab('login');
  }
}

init();

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('PWA ServiceWorker registration failed: ', err);
    });
  });
}
