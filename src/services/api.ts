/**
 * API service for the Komorebi Japanese Club full-stack platform.
 * Keep endpoint paths in sync with server/routes.ts.
 */

const API_BASE = '/api';
const TOKEN_KEY = 'komorebi_auth_token';

type QueryValue = string | number | boolean | null | undefined;

export interface ApiErrorBody {
  error?: string;
  message?: string;
  details?: unknown;
}

export interface EventRegistrationInput {
  fullName: string;
  collegeEmail: string;
  usn: string;
}

export type EventCheckInInput =
  | { ticketCode: string; eventId?: string; usn?: never }
  | { eventId: string; usn: string; ticketCode?: never };

export interface StudentQueryParams {
  search?: string;
  branch?: string;
  year?: string;
  level?: string;
  status?: string;
}

export interface StudentUpdateInput {
  applicationStatus?: 'REGISTERED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WAITLISTED' | 'CANCELLED';
  internalNotes?: string;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);

  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'same-origin'
    });
  } catch {
    throw new Error('Unable to connect to the server. Check your connection and try again.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') || '';

  const payload: unknown = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '');

  if (!response.ok) {
    const body = payload && typeof payload === 'object'
      ? payload as ApiErrorBody
      : undefined;

    const message =
      body?.error ||
      body?.message ||
      (typeof payload === 'string' && payload.trim()) ||
      `Request failed with status ${response.status}.`;

    if (response.status === 401) {
      clearStoredToken();
    }

    throw new Error(message);
  }

  return payload as T;
}

function toQueryString(params: Record<string, QueryValue>): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ''
    ) {
      query.set(key, String(value));
    }
  });

  const value = query.toString();
  return value ? `?${value}` : '';
}

export const api = {
  // System status
  getSystemStatus: () => request<any>('/system/status'),

  // Faculty authentication
  facultyLogin: (email: string, password: string) =>
    request<any>('/auth/faculty/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  facultyVerifyMfa: (email: string, mfaCode: string) =>
    request<any>('/auth/faculty/verify-mfa', {
      method: 'POST',
      body: JSON.stringify({ email, mfaCode })
    }),

  // Administrator authentication
  adminRegister: (data: any) =>
    request<any>('/auth/admin/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  adminVerifyEmail: (email: string, code: string) =>
    request<any>('/auth/admin/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code })
    }),

  adminLogin: (email: string, password: string) =>
    request<any>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  // Current user and session
  getMe: () => request<any>('/auth/me'),

  logout: async () => {
    try {
      return await request<any>('/auth/logout', { method: 'POST' });
    } finally {
      clearStoredToken();
    }
  },

  // Faculty application and administrator management
  getAdminApplications: () =>
    request<any[]>('/faculty/applications'),

  approveApplication: (id: string, assignedRoleId?: string) =>
    request<any>(`/faculty/applications/${encodeURIComponent(id)}/approve`, {
      method: 'POST',
      body: JSON.stringify({ assignedRoleId })
    }),

  rejectApplication: (id: string, reason?: string) =>
    request<any>(`/faculty/applications/${encodeURIComponent(id)}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),

  blockApplicationEmail: (id: string, reason?: string) =>
    request<any>(`/faculty/applications/${encodeURIComponent(id)}/block`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),

  getAdministrators: () =>
    request<any[]>('/faculty/administrators'),

  updateAdminRole: (id: string, roleId: string) =>
    request<any>(`/faculty/administrators/${encodeURIComponent(id)}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ roleId })
    }),

  updateAdminStatus: (id: string, status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED') =>
    request<any>(`/faculty/administrators/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  getBlockedEmails: () =>
    request<any[]>('/faculty/blocked-emails'),

  unblockEmail: (id: string) =>
    request<any>(`/faculty/blocked-emails/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }),

  getRoles: () =>
    request<any[]>('/faculty/roles'),

  createRole: (role: any) =>
    request<any>('/faculty/roles', {
      method: 'POST',
      body: JSON.stringify(role)
    }),

  // JLPT settings and public registration
  getJlptSettings: () =>
    request<any>('/jlpt/settings'),

  updateJlptSettings: (settings: any) =>
    request<any>('/jlpt/settings', {
      method: 'POST',
      body: JSON.stringify(settings)
    }),

  registerStudentJlpt: (studentData: any) =>
    request<any>('/jlpt/register', {
      method: 'POST',
      body: JSON.stringify(studentData)
    }),

  checkStudentStatus: (usn: string, collegeEmail: string) =>
    request<any>('/jlpt/status-check', {
      method: 'POST',
      body: JSON.stringify({ usn, collegeEmail })
    }),

  // Student records
  getStudents: (params: StudentQueryParams = {}) =>
    request<any[]>(`/jlpt/students${toQueryString({ ...params })}`),

  updateStudent: (id: string, data: StudentUpdateInput) =>
    request<any>(`/jlpt/students/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  simulateBulkStudents: (targetCount = 200) =>
    request<any>('/jlpt/simulate-bulk', {
      method: 'POST',
      body: JSON.stringify({ targetCount })
    }),

  getExportCsvUrl: () =>
    `${API_BASE}/jlpt/export-csv`,

  // Events and QR attendance
  getEvents: () =>
    request<any[]>('/events'),

  createEvent: (eventData: any) =>
    request<any>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    }),

  registerForEvent: (eventId: string, data: EventRegistrationInput) =>
    request<any>(`/events/${encodeURIComponent(eventId)}/register`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  checkInAttendee: (data: EventCheckInInput) =>
    request<any>('/events/check-in', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getEventAttendees: (eventId: string) =>
    request<any[]>(`/events/${encodeURIComponent(eventId)}/attendees`),

  // Anime and manga discovery
  getAnimeManga: () =>
    request<any[]>('/anime-manga'),

  submitAnimeManga: (data: any) =>
    request<any>('/anime-manga', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  moderateAnimeManga: (id: string, isApproved: boolean) =>
    request<any>(`/anime-manga/${encodeURIComponent(id)}/moderate`, {
      method: 'PATCH',
      body: JSON.stringify({ isApproved })
    }),

  // Audit and email logs
  getAuditLogs: () =>
    request<any[]>('/audit-logs'),

  getEmailLogs: () =>
    request<any[]>('/email-logs')
};