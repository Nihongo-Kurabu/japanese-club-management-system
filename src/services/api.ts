/**
 * API Service for Komorebi Japanese Club Full-Stack Platform
 */

const API_BASE = '/api';

export function getStoredToken(): string | null {
  return localStorage.getItem('komorebi_auth_token');
}

export function setStoredToken(token: string): void {
  localStorage.setItem('komorebi_auth_token', token);
}

export function clearStoredToken(): void {
  localStorage.removeItem('komorebi_auth_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: 'Network error or invalid response' }));
    throw new Error(errorBody.error || `HTTP error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // System Status
  getSystemStatus: () => request<any>('/system/status'),

  // Faculty Auth
  facultyLogin: (email: string, password: string) =>
    request<any>('/auth/faculty/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  facultyVerifyMfa: (email: string, mfaCode: string) =>
    request<any>('/auth/faculty/verify-mfa', { method: 'POST', body: JSON.stringify({ email, mfaCode }) }),

  // Admin Auth
  adminRegister: (data: any) =>
    request<any>('/auth/admin/register', { method: 'POST', body: JSON.stringify(data) }),
  adminVerifyEmail: (email: string, code: string) =>
    request<any>('/auth/admin/verify-email', { method: 'POST', body: JSON.stringify({ email, code }) }),
  adminLogin: (email: string, password: string) =>
    request<any>('/auth/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // User Profile
  getMe: () => request<any>('/auth/me'),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),

  // Faculty Management Endpoints
  getAdminApplications: () => request<any[]>('/faculty/applications'),
  approveApplication: (id: string, assignedRoleId?: string) =>
    request<any>(`/faculty/applications/${id}/approve`, { method: 'POST', body: JSON.stringify({ assignedRoleId }) }),
  rejectApplication: (id: string, reason?: string) =>
    request<any>(`/faculty/applications/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  blockApplicationEmail: (id: string, reason?: string) =>
    request<any>(`/faculty/applications/${id}/block`, { method: 'POST', body: JSON.stringify({ reason }) }),

  getAdministrators: () => request<any[]>('/faculty/administrators'),
  updateAdminRole: (id: string, roleId: string) =>
    request<any>(`/faculty/administrators/${id}/role`, { method: 'PATCH', body: JSON.stringify({ roleId }) }),
  updateAdminStatus: (id: string, status: string) =>
    request<any>(`/faculty/administrators/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  getBlockedEmails: () => request<any[]>('/faculty/blocked-emails'),
  unblockEmail: (id: string) =>
    request<any>(`/faculty/blocked-emails/${id}`, { method: 'DELETE' }),

  getRoles: () => request<any[]>('/faculty/roles'),
  createRole: (role: any) =>
    request<any>('/faculty/roles', { method: 'POST', body: JSON.stringify(role) }),

  // JLPT Settings & Registration
  getJlptSettings: () => request<any>('/jlpt/settings'),
  updateJlptSettings: (settings: any) =>
    request<any>('/jlpt/settings', { method: 'POST', body: JSON.stringify(settings) }),
  registerStudentJlpt: (studentData: any) =>
    request<any>('/jlpt/register', { method: 'POST', body: JSON.stringify(studentData) }),
  checkStudentStatus: (usn: string, collegeEmail: string) =>
    request<any>('/jlpt/status-check', { method: 'POST', body: JSON.stringify({ usn, collegeEmail }) }),

  // Student Records Management
  getStudents: (params: { search?: string; branch?: string; year?: string; level?: string; status?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.branch) query.set('branch', params.branch);
    if (params.year) query.set('year', params.year);
    if (params.level) query.set('level', params.level);
    if (params.status) query.set('status', params.status);
    return request<any[]>(`/jlpt/students?${query.toString()}`);
  },
  updateStudent: (id: string, data: { applicationStatus?: string; internalNotes?: string }) =>
    request<any>(`/jlpt/students/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  simulateBulkStudents: (targetCount = 200) =>
    request<any>('/jlpt/simulate-bulk', { method: 'POST', body: JSON.stringify({ targetCount }) }),
  getExportCsvUrl: () => `${API_BASE}/jlpt/export-csv`,

  // Events & QR Attendance
  getEvents: () => request<any[]>('/events'),
  createEvent: (eventData: any) =>
    request<any>('/events', { method: 'POST', body: JSON.stringify(eventData) }),
  registerForEvent: (eventId: string, data: { fullName: string; collegeEmail: string; usn: string }) =>
    request<any>(`/events/${eventId}/register`, { method: 'POST', body: JSON.stringify(data) }),
  checkInAttendee: (data: { ticketCode?: string; usn?: string }) =>
    request<any>('/events/check-in', { method: 'POST', body: JSON.stringify(data) }),
  getEventAttendees: (eventId: string) =>
    request<any[]>(`/events/${eventId}/attendees`),

  // Anime & Manga Discovery
  getAnimeManga: () => request<any[]>('/anime-manga'),
  submitAnimeManga: (data: any) =>
    request<any>('/anime-manga', { method: 'POST', body: JSON.stringify(data) }),
  moderateAnimeManga: (id: string, isApproved: boolean) =>
    request<any>(`/anime-manga/${id}/moderate`, { method: 'PATCH', body: JSON.stringify({ isApproved }) }),

  // Audit & Email Logs
  getAuditLogs: () => request<any[]>('/audit-logs'),
  getEmailLogs: () => request<any[]>('/email-logs')
};
