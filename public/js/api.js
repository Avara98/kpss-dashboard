const API = {
  async request(path, options = {}) {
    const res = await fetch('/api' + path, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
      body: options.body != null ? JSON.stringify(options.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'İstek başarısız');
    return data;
  },

  // Auth
  register: (body) => API.request('/auth/register', { method: 'POST', body }),
  login: (body) => API.request('/auth/login', { method: 'POST', body }),
  logout: () => API.request('/auth/logout', { method: 'POST' }),
  me: () => API.request('/auth/me'),

  // Dashboard
  dashboard: () => API.request('/dashboard'),

  // Settings
  updateSettings: (body) => API.request('/settings', { method: 'PUT', body }),

  // Study
  addSession: (body) => API.request('/study/session', { method: 'POST', body }),
  getDailyStats: () => API.request('/study/daily'),
  getSessions: (date) => API.request('/study/sessions' + (date ? '?date=' + date : '')),
  setActiveTimer: (activeTimer) => API.request('/study/active-timer', { method: 'PUT', body: { activeTimer } }),

  // Study Compare
  compareStudy: (date1, date2) => API.request(`/study/compare?date1=${date1}&date2=${date2}`),
  studyRange: (start, end) => API.request(`/study/range?start=${start}&end=${end}`),

  // Break
  getBreakStats: () => API.request('/break/stats'),

  // Net
  saveNetInputs: (netInputs, lastSimulation) => API.request('/net/inputs', { method: 'PUT', body: { netInputs, lastSimulation } }),
  getNetRecords: () => API.request('/net/records'),
  addNetRecord: (body) => API.request('/net/records', { method: 'POST', body }),

  // Curriculum
  toggleCurriculum: (key, completed, completedDate) => API.request('/curriculum/' + encodeURIComponent(key), { method: 'PUT', body: { completed, completedDate } }),

  // Notes
  getNotes: () => API.request('/notes'),
  addNote: (body) => API.request('/notes', { method: 'POST', body }),
  deleteNote: (id) => API.request('/notes/' + id, { method: 'DELETE' }),

  // Todos
  getTodos: (date) => API.request('/todos' + (date ? '?date=' + date : '')),
  addTodo: (body) => API.request('/todos', { method: 'POST', body }),
  updateTodo: (id, done, date) => API.request('/todos/' + id, { method: 'PATCH', body: { done, date } }),
  deleteTodo: (id, date) => API.request('/todos/' + id + '?date=' + date, { method: 'DELETE' }),

  // Admin
  getAdminUsers: (date) => API.request('/admin/users' + (date ? '?date=' + date : '')),
  getLeaderboard: (period, date) => API.request(`/admin/leaderboard?period=${period || 'today'}&date=${date || ''}`),
  setUserRole: (id, role) => API.request(`/admin/users/${id}/role`, { method: 'PUT', body: { role } }),

  // Export
  exportData: () => API.request('/export'),
  resetData: () => API.request('/account/data', { method: 'DELETE' }),
  serverInfo: () => API.request('/server/info'),
};
