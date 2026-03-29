const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://smart-complaint-rcdr.onrender.com/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ============ AUTH ============
export const authAPI = {
  login: (email, password) => request('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: (user) => request('/users/register', {
    method: 'POST',
    body: JSON.stringify(user),
  }),
};

// ============ COMPLAINTS ============
export const complaintsAPI = {
  getAll: () => request('/complaints'),
  getById: (id) => request(`/complaints/${id}`),
  getByUser: (userId) => request(`/complaints/user/${userId}`),
  getByStaff: (staffId) => request(`/complaints/staff/${staffId}`),
  getByStatus: (status) => request(`/complaints/status/${status}`),
  getByDepartment: (dept) => request(`/complaints/department/${dept}`),
  create: (data) => request('/complaints', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, data) => request(`/complaints/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  assign: (id, data) => request(`/complaints/${id}/assign`, { method: 'PUT', body: JSON.stringify(data) }),
  rate: (id, rating) => request(`/complaints/${id}/rate`, { method: 'PUT', body: JSON.stringify({ rating }) }),
  getTimeline: (id) => request(`/complaints/${id}/timeline`),
  getAnalytics: () => request('/complaints/analytics'),
  getReport: () => request('/complaints/report'),
};

// ============ USERS ============
export const usersAPI = {
  getAll: () => request('/users'),
  getById: (id) => request(`/users/${id}`),
  getByRole: (role) => request(`/users/role/${role}`),
  getStaffByDept: (dept) => request(`/users/staff/department/${dept}`),
  update: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ============ NOTIFICATIONS ============
export const notificationsAPI = {
  getByUser: (userId) => request(`/notifications/user/${userId}`),
  getUnread: (userId) => request(`/notifications/user/${userId}/unread`),
  getUnreadCount: (userId) => request(`/notifications/user/${userId}/unread-count`),
  markAsRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllAsRead: (userId) => request(`/notifications/user/${userId}/read-all`, { method: 'PUT' }),
};
