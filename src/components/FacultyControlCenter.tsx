import { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  FileText,
  Settings,
  Calendar,
  Film,
  ListOrdered,
  Mail,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Ban,
  UserCheck,
  UserX,
  RefreshCw,
  LogOut,
  ExternalLink,
  QrCode,
  Sparkles,
  ChevronRight,
  Filter,
  Eye,
  Check,
  Clock,
  Layers,
  Database
} from 'lucide-react';
import { api, clearStoredToken } from '../services/api';

interface FacultyControlCenterProps {
  user: any;
  onLogout: () => void;
  onReturnToSite: () => void;
}

type TabType =
  | 'overview'
  | 'applications'
  | 'administrators'
  | 'blocked'
  | 'jlpt-students'
  | 'jlpt-settings'
  | 'events-attendance'
  | 'anime-manga'
  | 'audit-logs'
  | 'email-logs';

export default function FacultyControlCenter({
  user,
  onLogout,
  onReturnToSite
}: FacultyControlCenterProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Data states
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [administrators, setAdministrators] = useState<any[]>([]);
  const [blockedEmails, setBlockedEmails] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [jlptSettings, setJlptSettings] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [eventAttendees, setEventAttendees] = useState<any[]>([]);
  const [animeMangaList, setAnimeMangaList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);

  // Search & Filter for JLPT Students
  const [studentSearch, setStudentSearch] = useState('');
  const [studentBranchFilter, setStudentBranchFilter] = useState('');
  const [studentYearFilter, setStudentYearFilter] = useState('');
  const [studentLevelFilter, setStudentLevelFilter] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('');

  // Modals
  const [selectedAppForAction, setSelectedAppForAction] = useState<any | null>(null);
  const [actionModalType, setActionModalType] = useState<'approve' | 'reject' | 'block' | null>(null);
  const [assignedRoleId, setAssignedRoleId] = useState<string>('');
  const [actionReason, setActionReason] = useState<string>('');

  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<any | null>(null);
  const [newStudentStatus, setNewStudentStatus] = useState<string>('APPROVED');
  const [studentInternalNotes, setStudentInternalNotes] = useState<string>('');

  // Attendance scanner input
  const [checkInCode, setCheckInCode] = useState('');
  const [checkInResult, setCheckInResult] = useState<any | null>(null);

  // New Event Form
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    japaneseTitle: '',
    date: '2026-11-20',
    time: '17:30 - 20:00',
    venue: 'Main Auditorium & Cultural Plaza',
    category: 'CULTURAL',
    description: '',
    capacity: 250
  });

  const notify = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Initial Data Fetch
  const refreshAllData = async () => {
    setLoading(true);
    try {
      const [
        sysRes,
        appsRes,
        adminsRes,
        blockedRes,
        rolesRes,
        settingsRes,
        eventsRes,
        animeRes,
        auditRes,
        emailRes
      ] = await Promise.all([
        api.getSystemStatus().catch(() => null),
        api.getAdminApplications().catch(() => []),
        api.getAdministrators().catch(() => []),
        api.getBlockedEmails().catch(() => []),
        api.getRoles().catch(() => []),
        api.getJlptSettings().catch(() => null),
        api.getEvents().catch(() => []),
        api.getAnimeManga().catch(() => []),
        api.getAuditLogs().catch(() => []),
        api.getEmailLogs().catch(() => [])
      ]);

      setSystemStatus(sysRes);
      setApplications(appsRes || []);
      setAdministrators(adminsRes || []);
      setBlockedEmails(blockedRes || []);
      setRoles(rolesRes || []);
      setJlptSettings(settingsRes || {});
      setEvents(eventsRes || []);
      setAnimeMangaList(animeRes || []);
      setAuditLogs(auditRes || []);
      setEmailLogs(emailRes || []);

      if (eventsRes && eventsRes.length > 0 && !selectedEventId) {
        setSelectedEventId(eventsRes[0].id);
      }

      await loadStudents();
    } catch (err: any) {
      notify(err.message || 'Error fetching system data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await api.getStudents({
        search: studentSearch || undefined,
        branch: studentBranchFilter || undefined,
        year: studentYearFilter || undefined,
        level: studentLevelFilter || undefined,
        status: studentStatusFilter || undefined
      });
      setStudents(data || []);
    } catch (err: any) {
      console.error('Failed to load students:', err);
    }
  };

  const loadEventAttendees = async (eventId: string) => {
    if (!eventId) return;
    try {
      const attendees = await api.getEventAttendees(eventId);
      setEventAttendees(attendees || []);
    } catch (err) {
      console.error('Failed to fetch event attendees', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [studentSearch, studentBranchFilter, studentYearFilter, studentLevelFilter, studentStatusFilter]);

  useEffect(() => {
    if (selectedEventId) {
      loadEventAttendees(selectedEventId);
    }
  }, [selectedEventId]);

  // Handle Application Actions
  const handleConfirmAppAction = async () => {
    if (!selectedAppForAction || !actionModalType) return;
    setLoading(true);
    try {
      if (actionModalType === 'approve') {
        await api.approveApplication(selectedAppForAction.id, assignedRoleId || selectedAppForAction.requestedRoleId);
        notify(`Application for ${selectedAppForAction.fullName} approved successfully!`);
      } else if (actionModalType === 'reject') {
        await api.rejectApplication(selectedAppForAction.id, actionReason || 'Does not meet current club leadership requirements');
        notify(`Application for ${selectedAppForAction.fullName} was rejected with notice.`, 'info');
      } else if (actionModalType === 'block') {
        await api.blockApplicationEmail(selectedAppForAction.id, actionReason || 'Violated campus leadership protocol');
        notify(`Email ${selectedAppForAction.collegeEmail} has been permanently blocked.`, 'error');
      }

      setSelectedAppForAction(null);
      setActionModalType(null);
      setActionReason('');
      await refreshAllData();
    } catch (err: any) {
      notify(err.message || 'Failed to execute application action', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Admin Status Update
  const handleUpdateAdminStatus = async (adminId: string, status: string) => {
    setLoading(true);
    try {
      await api.updateAdminStatus(adminId, status);
      notify(`Administrator status changed to ${status}`);
      await refreshAllData();
    } catch (err: any) {
      notify(err.message || 'Failed to update admin status', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Admin Role Update
  const handleUpdateAdminRole = async (adminId: string, roleId: string) => {
    setLoading(true);
    try {
      await api.updateAdminRole(adminId, roleId);
      notify('Administrator role updated successfully');
      await refreshAllData();
    } catch (err: any) {
      notify(err.message || 'Failed to update role', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Unblock Email
  const handleUnblockEmail = async (id: string) => {
    setLoading(true);
    try {
      await api.unblockEmail(id);
      notify('Email unblocked successfully');
      await refreshAllData();
    } catch (err: any) {
      notify(err.message || 'Failed to unblock email', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle JLPT Settings Toggle
  const handleToggleJlptOpen = async () => {
    if (!jlptSettings) return;
    const updated = !jlptSettings.isRegistrationOpen;
    setLoading(true);
    try {
      await api.updateJlptSettings({ isRegistrationOpen: updated });
      setJlptSettings((prev: any) => ({ ...prev, isRegistrationOpen: updated }));
      notify(updated ? 'JLPT Portal is now OPEN for student registrations' : 'JLPT Portal is now CLOSED to public applications', updated ? 'success' : 'info');
      await refreshAllData();
    } catch (err: any) {
      notify(err.message || 'Failed to update JLPT settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJlptSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateJlptSettings(jlptSettings);
      notify('JLPT settings and capacity updated in database');
      await refreshAllData();
    } catch (err: any) {
      notify(err.message || 'Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Student Status Update
  const handleConfirmStudentUpdate = async () => {
    if (!selectedStudentForEdit) return;
    setLoading(true);
    try {
      await api.updateStudent(selectedStudentForEdit.id, {
        applicationStatus: newStudentStatus,
        internalNotes: studentInternalNotes
      });
      notify(`Updated student status to ${newStudentStatus}`);
      setSelectedStudentForEdit(null);
      await loadStudents();
      await refreshAllData();
    } catch (err: any) {
      notify(err.message || 'Failed to update student', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Simulate Bulk Students Trigger
  const handleSimulateBulkStudents = async () => {
    setLoading(true);
    try {
      const res = await api.simulateBulkStudents(250);
      notify(`Bulk simulation complete! Added ${res.added} student records (Total: ${res.totalStudents}).`);
      await loadStudents();
      await refreshAllData();
    } catch (err: any) {
      notify(err.message || 'Simulation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Digital Attendance Check-In
  const handleAttendanceCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInCode.trim()) return;
    setLoading(true);
    setCheckInResult(null);
    try {
      const res = await api.checkInAttendee({
        ticketCode: checkInCode.includes('EVT-') ? checkInCode.trim() : undefined,
        usn: !checkInCode.includes('EVT-') ? checkInCode.trim() : undefined
      });
      setCheckInResult(res);
      notify(`Check-in verified: ${res.attendee.fullName} (${res.attendee.usn})!`);
      setCheckInCode('');
      if (selectedEventId) {
        await loadEventAttendees(selectedEventId);
      }
    } catch (err: any) {
      notify(err.message || 'Check-in failed or ticket invalid', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Create Event
  const handleCreateNewEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createEvent(newEvent);
      notify(`Event "${newEvent.title}" published successfully!`);
      setShowNewEventForm(false);
      setNewEvent({
        title: '',
        japaneseTitle: '',
        date: '2026-11-20',
        time: '17:30 - 20:00',
        venue: 'Main Auditorium & Cultural Plaza',
        category: 'CULTURAL',
        description: '',
        capacity: 250
      });
      await refreshAllData();
    } catch (err: any) {
      notify(err.message || 'Failed to create event', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Anime moderation
  const handleModerateAnime = async (id: string, isApproved: boolean) => {
    setLoading(true);
    try {
      await api.moderateAnimeManga(id, isApproved);
      notify(isApproved ? 'Anime recommendation approved' : 'Recommendation rejected');
      await refreshAllData();
    } catch (err: any) {
      notify(err.message || 'Moderation action failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isFacultyUser = user?.role === 'FACULTY_SUPER_ADMIN' || user?.isSuperAdmin;

  return (
    <div className="min-h-screen bg-[#080A12] text-[#F5EBDD] font-sans">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-40 bg-[#0F131F]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E63946] to-[#7652D6] p-0.5 shadow-lg shadow-[#E63946]/20">
              <div className="w-full h-full bg-[#080A12] rounded-[7px] flex items-center justify-center">
                <span className="font-serif font-black text-lg text-[#E63946]">木</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-wide">
                  KOMOREBI CONTROL CENTER
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/40 uppercase font-bold">
                  {isFacultyUser ? 'FACULTY SUPER ADMIN' : user?.roleName || 'ADMINISTRATOR'}
                </span>
              </div>
              <p className="text-[11px] text-[#A6ADBD]">
                {user?.fullName} • {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={refreshAllData}
              disabled={loading}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#A6ADBD] hover:text-white transition-colors"
              title="Refresh Data"
              aria-label="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#53D8F0]' : ''}`} />
            </button>

            <button
              onClick={onReturnToSite}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#F5EBDD] flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#53D8F0]" />
              <span className="hidden sm:inline">View Public Website</span>
            </button>

            <button
              onClick={() => {
                clearStoredToken();
                onLogout();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#E63946]/20 hover:bg-[#E63946]/30 border border-[#E63946]/40 text-xs text-[#E63946] flex items-center gap-1.5 transition-colors font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Global Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`p-4 rounded-xl shadow-2xl border text-xs max-w-md flex items-center gap-3 backdrop-blur-md ${
              notification.type === 'error'
                ? 'bg-red-950/90 border-red-500/50 text-red-100'
                : notification.type === 'info'
                ? 'bg-blue-950/90 border-blue-500/50 text-blue-100'
                : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100'
            }`}
          >
            {notification.type === 'error' ? (
              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            ) : notification.type === 'info' ? (
              <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Body with Sidebar Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-1">
            <div className="p-3 bg-[#0F131F] border border-white/10 rounded-xl mb-3">
              <div className="text-[10px] font-mono uppercase text-[#A6ADBD] tracking-wider mb-1">
                SYSTEM STATUS
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Database Engine:
                </span>
                <span className="font-mono text-[#53D8F0] font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span>JLPT Portal:</span>
                <span
                  className={`font-mono font-bold ${
                    jlptSettings?.isRegistrationOpen ? 'text-emerald-400' : 'text-[#E63946]'
                  }`}
                >
                  {jlptSettings?.isRegistrationOpen ? 'ACCEPTING ENTRIES' : 'CLOSED'}
                </span>
              </div>
            </div>

            <nav className="space-y-1 bg-[#0F131F] border border-white/10 rounded-xl p-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/30'
                    : 'text-[#A6ADBD] hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4" />
                  <span>Overview & Metrics</span>
                </div>
                <span className="font-serif text-[10px] opacity-80">概要</span>
              </button>

              <button
                onClick={() => setActiveTab('applications')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'applications'
                    ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/30'
                    : 'text-[#A6ADBD] hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>Admin Applications</span>
                </div>
                {applications.filter(a => a.status === 'PENDING_FACULTY_APPROVAL').length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-amber-500 text-black font-bold">
                    {applications.filter(a => a.status === 'PENDING_FACULTY_APPROVAL').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('administrators')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'administrators'
                    ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/30'
                    : 'text-[#A6ADBD] hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4" />
                  <span>Admin Directory</span>
                </div>
                <span className="font-serif text-[10px] opacity-80">役員一覧</span>
              </button>

              <button
                onClick={() => setActiveTab('blocked')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'blocked'
                    ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/30'
                    : 'text-[#A6ADBD] hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Ban className="w-4 h-4" />
                  <span>Blocked Accounts</span>
                </div>
                {blockedEmails.length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-red-600 text-white font-bold">
                    {blockedEmails.length}
                  </span>
                )}
              </button>

              <div className="pt-2 pb-1 px-3 text-[10px] font-mono uppercase text-[#A6ADBD]/60">
                JLPT PORTAL MANAGEMENT
              </div>

              <button
                onClick={() => setActiveTab('jlpt-students')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'jlpt-students'
                    ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/30'
                    : 'text-[#A6ADBD] hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>JLPT Student Records</span>
                </div>
                <span className="text-[10px] font-mono text-[#53D8F0] font-bold">
                  {students.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('jlpt-settings')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'jlpt-settings'
                    ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/30'
                    : 'text-[#A6ADBD] hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4" />
                  <span>JLPT Portal Settings</span>
                </div>
                <span className="font-serif text-[10px] opacity-80">設定</span>
              </button>

              <div className="pt-2 pb-1 px-3 text-[10px] font-mono uppercase text-[#A6ADBD]/60">
                CAMPUS OPERATIONS
              </div>

              <button
                onClick={() => setActiveTab('events-attendance')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'events-attendance'
                    ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/30'
                    : 'text-[#A6ADBD] hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4" />
                  <span>Events & QR Attendance</span>
                </div>
                <span className="font-serif text-[10px] opacity-80">出席</span>
              </button>

              <button
                onClick={() => setActiveTab('anime-manga')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'anime-manga'
                    ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/30'
                    : 'text-[#A6ADBD] hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Film className="w-4 h-4" />
                  <span>Anime Submissions</span>
                </div>
                <span className="font-serif text-[10px] opacity-80">審査</span>
              </button>

              <button
                onClick={() => setActiveTab('audit-logs')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'audit-logs'
                    ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/30'
                    : 'text-[#A6ADBD] hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ListOrdered className="w-4 h-4" />
                  <span>Audit Trail</span>
                </div>
                <span className="font-serif text-[10px] opacity-80">履歴</span>
              </button>

              <button
                onClick={() => setActiveTab('email-logs')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'email-logs'
                    ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/30'
                    : 'text-[#A6ADBD] hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4" />
                  <span>Email Dispatch Logs</span>
                </div>
                <span className="font-serif text-[10px] opacity-80">通知</span>
              </button>
            </nav>
          </div>

          {/* Tab Content Display */}
          <div className="lg:col-span-9 space-y-6">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-[#0F131F] border border-white/10 relative overflow-hidden">
                    <div className="text-[11px] font-mono uppercase text-[#A6ADBD]">
                      JLPT Registered Students
                    </div>
                    <div className="text-3xl font-bold text-white mt-1">
                      {systemStatus?.totalStudents || students.length}
                    </div>
                    <p className="text-[11px] text-[#53D8F0] mt-1">
                      Max Target Capacity: {jlptSettings?.maxCapacity || 1000}
                    </p>
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className="bg-[#53D8F0] h-full"
                        style={{
                          width: `${Math.min(
                            100,
                            ((systemStatus?.totalStudents || students.length) / (jlptSettings?.maxCapacity || 1000)) * 100
                          )}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0F131F] border border-white/10">
                    <div className="text-[11px] font-mono uppercase text-[#A6ADBD]">
                      Available Seats Remaining
                    </div>
                    <div className="text-3xl font-bold text-emerald-400 mt-1">
                      {systemStatus?.seatsRemaining ?? Math.max(0, (jlptSettings?.maxCapacity || 1000) - students.length)}
                    </div>
                    <p className="text-[11px] text-[#A6ADBD] mt-1">
                      Portal Status:{' '}
                      <strong className={jlptSettings?.isRegistrationOpen ? 'text-emerald-400' : 'text-[#E63946]'}>
                        {jlptSettings?.isRegistrationOpen ? 'OPEN' : 'CLOSED'}
                      </strong>
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0F131F] border border-white/10">
                    <div className="text-[11px] font-mono uppercase text-[#A6ADBD]">
                      Pending Admin Applications
                    </div>
                    <div className="text-3xl font-bold text-amber-400 mt-1">
                      {applications.filter(a => a.status === 'PENDING_FACULTY_APPROVAL').length}
                    </div>
                    <button
                      onClick={() => setActiveTab('applications')}
                      className="text-[11px] text-[#53D8F0] hover:underline mt-1 inline-flex items-center gap-1"
                    >
                      Review Queue <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0F131F] border border-white/10">
                    <div className="text-[11px] font-mono uppercase text-[#A6ADBD]">
                      Active Club Administrators
                    </div>
                    <div className="text-3xl font-bold text-[#7652D6] mt-1">
                      {administrators.filter(a => a.accountStatus === 'ACTIVE').length}
                    </div>
                    <p className="text-[11px] text-[#A6ADBD] mt-1">
                      Roles defined: {roles.length}
                    </p>
                  </div>
                </div>

                {/* Quick Action Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0F131F] via-[#171C2B] to-[#0F131F] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#E63946]" />
                      High-Capacity JLPT Stress Testing
                    </h3>
                    <p className="text-xs text-[#A6ADBD] mt-0.5">
                      Test database concurrency and responsiveness with up to 1,000 university candidate records.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSimulateBulkStudents}
                      disabled={loading}
                      className="px-4 py-2 rounded-lg bg-[#53D8F0] hover:bg-[#3ec4dc] text-[#080A12] font-bold text-xs tracking-wide transition-all shadow-lg shadow-[#53D8F0]/20 flex items-center gap-1.5"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>Simulate +250 Students</span>
                    </button>

                    <a
                      href={api.getExportCsvUrl()}
                      download="jlpt_registered_students.csv"
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs tracking-wide transition-all flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#53D8F0]" />
                      <span>Download Master CSV</span>
                    </a>
                  </div>
                </div>

                {/* Level Breakdown & Branch Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* JLPT Levels */}
                  <div className="p-5 rounded-xl bg-[#0F131F] border border-white/10">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-white mb-3">
                      Registration Distribution by JLPT Level
                    </h4>
                    <div className="space-y-3">
                      {['N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => {
                        const count = students.filter(s => s.jlptLevel === lvl).length;
                        const pct = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
                        return (
                          <div key={lvl}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold text-white">JLPT {lvl}</span>
                              <span className="text-[#A6ADBD] font-mono">
                                {count} students ({pct}%)
                              </span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-[#E63946] h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Activity Mini-Feed */}
                  <div className="p-5 rounded-xl bg-[#0F131F] border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-white">
                        Recent Audit Trail Logs
                      </h4>
                      <button
                        onClick={() => setActiveTab('audit-logs')}
                        className="text-[11px] text-[#53D8F0] hover:underline"
                      >
                        View all
                      </button>
                    </div>
                    <div className="space-y-2">
                      {auditLogs.slice(0, 5).map((log) => (
                        <div
                          key={log.id}
                          className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-mono text-[10px] text-[#E63946] font-bold block">
                              {log.action}
                            </span>
                            <span className="text-white text-[11px] truncate block max-w-xs">
                              {log.details}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-[#A6ADBD] shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PENDING ADMIN APPLICATIONS */}
            {activeTab === 'applications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Admin Self-Registration Review Queue
                    </h3>
                    <p className="text-xs text-[#A6ADBD]">
                      Review applicant motivation statements, assign leadership roles, or issue rejections/blocks.
                    </p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded bg-[#0F131F] border border-white/10 text-[#53D8F0]">
                    Total Pending: {applications.filter(a => a.status === 'PENDING_FACULTY_APPROVAL').length}
                  </span>
                </div>

                {applications.length === 0 ? (
                  <div className="p-12 text-center bg-[#0F131F] rounded-xl border border-white/10">
                    <UserCheck className="w-10 h-10 text-white/30 mx-auto mb-2" />
                    <p className="text-sm text-[#A6ADBD]">No pending admin applications at this time.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.map((app) => {
                      const isPending = app.status === 'PENDING_FACULTY_APPROVAL';
                      return (
                        <div
                          key={app.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isPending
                              ? 'bg-[#0F131F] border-amber-500/40 shadow-lg shadow-amber-500/5'
                              : 'bg-[#0F131F]/60 border-white/5 opacity-70'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white text-sm">{app.fullName}</h4>
                                <span
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                    app.status === 'APPROVED'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : app.status === 'REJECTED'
                                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                      : app.status === 'BLOCKED'
                                      ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30'
                                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  }`}
                                >
                                  {app.status}
                                </span>
                              </div>

                              <div className="text-xs text-[#A6ADBD] flex flex-wrap gap-x-4 gap-y-1">
                                <span>📧 {app.collegeEmail}</span>
                                <span>📱 {app.phone}</span>
                                <span>🏛️ {app.department}</span>
                                <span>
                                  Requested Role:{' '}
                                  <strong className="text-white">
                                    {roles.find(r => r.id === app.requestedRoleId)?.name || app.requestedRoleId}
                                  </strong>
                                </span>
                              </div>

                              <div className="mt-2 p-2.5 rounded-lg bg-[#080A12] border border-white/5 text-xs text-[#F5EBDD]/90">
                                <strong className="text-[#53D8F0] font-mono text-[10px] uppercase block mb-0.5">
                                  Statement of Motivation:
                                </strong>
                                {app.reason}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            {isPending && isFacultyUser && (
                              <div className="flex sm:flex-col gap-2 shrink-0">
                                <button
                                  onClick={() => {
                                    setSelectedAppForAction(app);
                                    setActionModalType('approve');
                                    setAssignedRoleId(app.requestedRoleId);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-md shadow-emerald-600/30"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Approve Admin</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedAppForAction(app);
                                    setActionModalType('reject');
                                    setActionReason('');
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Reject Application</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedAppForAction(app);
                                    setActionModalType('block');
                                    setActionReason('');
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center gap-1"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  <span>Block Email</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ADMINISTRATOR DIRECTORY */}
            {activeTab === 'administrators' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div>
                    <h3 className="text-base font-bold text-white">Administrator Directory & Roles</h3>
                    <p className="text-xs text-[#A6ADBD]">
                      Manage active officers, adjust granular role assignments, and revoke access.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0F131F]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#080A12] text-[#A6ADBD] font-mono uppercase text-[10px] border-b border-white/10">
                      <tr>
                        <th className="p-3">Administrator</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">Assigned Role</th>
                        <th className="p-3">Status</th>
                        {isFacultyUser && <th className="p-3 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {administrators.map((admin) => (
                        <tr key={admin.id} className="hover:bg-white/[0.02]">
                          <td className="p-3">
                            <div className="font-bold text-white">{admin.fullName}</div>
                            <div className="text-[11px] text-[#A6ADBD]">{admin.email}</div>
                          </td>
                          <td className="p-3 text-[#A6ADBD]">{admin.department}</td>
                          <td className="p-3">
                            {isFacultyUser ? (
                              <select
                                value={admin.roleId}
                                onChange={(e) => handleUpdateAdminRole(admin.id, e.target.value)}
                                className="px-2 py-1 rounded bg-[#080A12] border border-white/10 text-white text-xs"
                              >
                                {roles.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="font-mono text-white">
                                {roles.find(r => r.id === admin.roleId)?.name || admin.roleId}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                admin.accountStatus === 'ACTIVE'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
                              }`}
                            >
                              {admin.accountStatus}
                            </span>
                          </td>
                          {isFacultyUser && (
                            <td className="p-3 text-right">
                              {admin.accountStatus === 'ACTIVE' ? (
                                <button
                                  onClick={() => handleUpdateAdminStatus(admin.id, 'SUSPENDED')}
                                  className="px-2.5 py-1 rounded bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-600/40 text-[11px]"
                                >
                                  Suspend
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateAdminStatus(admin.id, 'ACTIVE')}
                                  className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-600/40 text-[11px]"
                                >
                                  Reactivate
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: BLOCKED ACCOUNTS */}
            {activeTab === 'blocked' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div>
                    <h3 className="text-base font-bold text-white">Blocked Emails & Security Sanctions</h3>
                    <p className="text-xs text-[#A6ADBD]">
                      Blocked email addresses are automatically rejected across all registration endpoints.
                    </p>
                  </div>
                </div>

                {blockedEmails.length === 0 ? (
                  <div className="p-12 text-center bg-[#0F131F] rounded-xl border border-white/10">
                    <Shield className="w-10 h-10 text-white/30 mx-auto mb-2" />
                    <p className="text-sm text-[#A6ADBD]">No accounts currently sanctioned or blocked.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0F131F]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#080A12] text-[#A6ADBD] font-mono uppercase text-[10px] border-b border-white/10">
                        <tr>
                          <th className="p-3">Blocked Email</th>
                          <th className="p-3">Sanction Reason</th>
                          <th className="p-3">Date Blocked</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {blockedEmails.map((item) => (
                          <tr key={item.id} className="hover:bg-white/[0.02]">
                            <td className="p-3 font-mono text-red-400 font-bold">{item.email}</td>
                            <td className="p-3 text-[#A6ADBD]">{item.reason}</td>
                            <td className="p-3 text-[#A6ADBD] font-mono text-[11px]">
                              {new Date(item.blockedAt).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-right">
                              {isFacultyUser && (
                                <button
                                  onClick={() => handleUnblockEmail(item.id)}
                                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px]"
                                >
                                  Unblock
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: JLPT STUDENT RECORDS (1,000 CAPACITY SUPPORT) */}
            {activeTab === 'jlpt-students' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>JLPT Student Master Records</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#53D8F0]/20 text-[#53D8F0]">
                        {students.length} Candidates
                      </span>
                    </h3>
                    <p className="text-xs text-[#A6ADBD]">
                      Search, inspect, update status, and download officially verified candidate rolls.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSimulateBulkStudents}
                      disabled={loading}
                      className="px-3 py-1.5 rounded-lg bg-[#53D8F0] hover:bg-[#3ec4dc] text-[#080A12] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#53D8F0]/20"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>Simulate +250 Entries</span>
                    </button>

                    <a
                      href={api.getExportCsvUrl()}
                      download="jlpt_registered_students.csv"
                      className="px-3 py-1.5 rounded-lg bg-[#E63946] hover:bg-[#d62839] text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-[#E63946]/30"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </a>
                  </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="p-3 rounded-xl bg-[#0F131F] border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#A6ADBD]" />
                    <input
                      type="text"
                      placeholder="Search Name, USN, Email..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#080A12] border border-white/10 text-white placeholder:text-white/30 text-xs focus:outline-none focus:border-[#53D8F0]"
                    />
                  </div>

                  <select
                    value={studentLevelFilter}
                    onChange={(e) => setStudentLevelFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs"
                  >
                    <option value="">All JLPT Levels (N5 - N1)</option>
                    <option value="N5">JLPT N5 (Beginner)</option>
                    <option value="N4">JLPT N4 (Elementary)</option>
                    <option value="N3">JLPT N3 (Intermediate)</option>
                    <option value="N2">JLPT N2 (Pre-Advanced)</option>
                    <option value="N1">JLPT N1 (Advanced)</option>
                  </select>

                  <select
                    value={studentBranchFilter}
                    onChange={(e) => setStudentBranchFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs"
                  >
                    <option value="">All Branches</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Science">Information Science</option>
                    <option value="Electronics & Communication">Electronics & Comm.</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                    <option value="Biotechnology">Biotechnology</option>
                  </select>

                  <select
                    value={studentYearFilter}
                    onChange={(e) => setStudentYearFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs"
                  >
                    <option value="">All Academic Years</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>

                  <select
                    value={studentStatusFilter}
                    onChange={(e) => setStudentStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs"
                  >
                    <option value="">All Application Statuses</option>
                    <option value="APPROVED">APPROVED (合格・受付済)</option>
                    <option value="PENDING_REVIEW">PENDING_REVIEW (審査中)</option>
                    <option value="WAITLIST">WAITLIST (待機)</option>
                    <option value="REJECTED">REJECTED (却下)</option>
                  </select>
                </div>

                {/* Candidate Table */}
                <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0F131F] max-h-[550px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-[#080A12] text-[#A6ADBD] font-mono uppercase text-[10px] border-b border-white/10 z-10">
                      <tr>
                        <th className="p-3">Reference ID</th>
                        <th className="p-3">Candidate</th>
                        <th className="p-3">USN / Branch</th>
                        <th className="p-3">Target Level</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-white/[0.02]">
                          <td className="p-3 font-mono font-bold text-[#53D8F0]">
                            {student.referenceId}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-white">{student.fullName}</div>
                            <div className="text-[11px] text-[#A6ADBD]">{student.collegeEmail}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-white">{student.usn}</div>
                            <div className="text-[11px] text-[#A6ADBD]">
                              {student.branch} • {student.academicYear}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-bold font-mono px-2 py-0.5 rounded bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30">
                              JLPT {student.jlptLevel}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                student.applicationStatus === 'APPROVED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : student.applicationStatus === 'WAITLIST'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : student.applicationStatus === 'REJECTED'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}
                            >
                              {student.applicationStatus}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedStudentForEdit(student);
                                setNewStudentStatus(student.applicationStatus || 'APPROVED');
                                setStudentInternalNotes(student.internalNotes || '');
                              }}
                              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium"
                            >
                              Edit Status
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: JLPT SETTINGS & PORTAL TOGGLE */}
            {activeTab === 'jlpt-settings' && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-white/10">
                  <h3 className="text-base font-bold text-white">JLPT Portal Configuration</h3>
                  <p className="text-xs text-[#A6ADBD]">
                    Toggle live student registration, adjust seat caps, dates, and JLPT levels.
                  </p>
                </div>

                {/* Master Switch */}
                <div className="p-6 rounded-2xl bg-[#0F131F] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">Master Registration Switch</h4>
                      <span
                        className={`text-xs font-mono px-2.5 py-0.5 rounded font-bold ${
                          jlptSettings?.isRegistrationOpen
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-red-500/20 text-red-300 border border-red-500/40'
                        }`}
                      >
                        {jlptSettings?.isRegistrationOpen ? 'ACCEPTING ENTRIES' : 'SUBMISSIONS CLOSED'}
                      </span>
                    </div>
                    <p className="text-xs text-[#A6ADBD] mt-1 max-w-md">
                      When turned OFF, the public JLPT registration form displays a closed banner and the
                      backend actively rejects incoming POST submissions.
                    </p>
                  </div>

                  <button
                    onClick={handleToggleJlptOpen}
                    disabled={loading}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all shadow-lg ${
                      jlptSettings?.isRegistrationOpen
                        ? 'bg-[#E63946] hover:bg-[#d62839] text-white shadow-[#E63946]/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    }`}
                  >
                    {jlptSettings?.isRegistrationOpen ? 'Close Registration Now' : 'Open Registration to Students'}
                  </button>
                </div>

                {/* Settings Form */}
                <form onSubmit={handleSaveJlptSettings} className="p-6 rounded-2xl bg-[#0F131F] border border-white/10 space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-white">
                    Operational Parameters
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-1">
                        Active Examination Session
                      </label>
                      <input
                        type="text"
                        value={jlptSettings?.activeSessionName || ''}
                        onChange={(e) => setJlptSettings({ ...jlptSettings, activeSessionName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-1">
                        Maximum University Seat Capacity
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={5000}
                        value={jlptSettings?.maxCapacity || 1000}
                        onChange={(e) => setJlptSettings({ ...jlptSettings, maxCapacity: parseInt(e.target.value) || 1000 })}
                        className="w-full px-3 py-2 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-1">
                        Registration Opens Date
                      </label>
                      <input
                        type="date"
                        value={jlptSettings?.registrationStartDate || '2026-11-01'}
                        onChange={(e) => setJlptSettings({ ...jlptSettings, registrationStartDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-1">
                        Registration Deadline Date
                      </label>
                      <input
                        type="date"
                        value={jlptSettings?.registrationEndDate || '2026-12-15'}
                        onChange={(e) => setJlptSettings({ ...jlptSettings, registrationEndDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-2">
                      Offered JLPT Examination Levels
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {['N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => {
                        const isChecked = jlptSettings?.allowedLevels?.includes(lvl);
                        return (
                          <label key={lvl} className="flex items-center gap-2 cursor-pointer bg-[#080A12] px-3 py-1.5 rounded-lg border border-white/10 text-xs">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const current = jlptSettings?.allowedLevels || [];
                                const updated = e.target.checked
                                  ? [...current, lvl]
                                  : current.filter((x: string) => x !== lvl);
                                setJlptSettings({ ...jlptSettings, allowedLevels: updated });
                              }}
                              className="rounded border-white/20 text-[#E63946] focus:ring-0"
                            />
                            <span className="font-mono font-bold text-white">JLPT {lvl}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 rounded-lg bg-[#53D8F0] hover:bg-[#3ec4dc] text-[#080A12] font-bold text-xs tracking-wide shadow-md shadow-[#53D8F0]/20"
                    >
                      Save Configuration
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 7: EVENTS & QR ATTENDANCE */}
            {activeTab === 'events-attendance' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div>
                    <h3 className="text-base font-bold text-white">Events & Digital QR Check-In</h3>
                    <p className="text-xs text-[#A6ADBD]">
                      Generate official event entry passes and perform live attendance verification at the venue doors.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowNewEventForm(!showNewEventForm)}
                    className="px-3 py-1.5 rounded-lg bg-[#E63946] text-white text-xs font-semibold"
                  >
                    {showNewEventForm ? 'Cancel' : '+ Create Event'}
                  </button>
                </div>

                {/* Create Event Form Drawer */}
                {showNewEventForm && (
                  <form onSubmit={handleCreateNewEvent} className="p-5 rounded-xl bg-[#0F131F] border border-[#E63946]/40 space-y-3">
                    <h4 className="text-xs font-mono uppercase text-white font-bold">
                      Add New Japanese Club Campus Event
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-1">
                          Event Title (English)
                        </label>
                        <input
                          type="text"
                          required
                          value={newEvent.title}
                          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                          placeholder="e.g. Anime Screening Night & Trivia"
                          className="w-full px-3 py-1.5 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-1">
                          Japanese Subtitle
                        </label>
                        <input
                          type="text"
                          value={newEvent.japaneseTitle}
                          onChange={(e) => setNewEvent({ ...newEvent, japaneseTitle: e.target.value })}
                          placeholder="e.g. アニメ上映会とクイズ"
                          className="w-full px-3 py-1.5 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-1">
                          Time Window
                        </label>
                        <input
                          type="text"
                          value={newEvent.time}
                          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-1">
                          Max Seat Capacity
                        </label>
                        <input
                          type="number"
                          value={newEvent.capacity}
                          onChange={(e) => setNewEvent({ ...newEvent, capacity: parseInt(e.target.value) || 200 })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-1">
                        Campus Venue
                      </label>
                      <input
                        type="text"
                        value={newEvent.venue}
                        onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 rounded-lg bg-[#E63946] hover:bg-[#d62839] text-white text-xs font-semibold shadow-md shadow-[#E63946]/30"
                    >
                      Publish Event
                    </button>
                  </form>
                )}

                {/* Digital Check-in Scanner Station */}
                <div className="p-5 rounded-xl bg-[#0F131F] border border-white/10 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#53D8F0]/20 border border-[#53D8F0]/40 flex items-center justify-center text-[#53D8F0]">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Event Entrance Scanner Station</h4>
                      <p className="text-[11px] text-[#A6ADBD]">
                        Type or scan candidate Ticket Code (e.g. <span className="font-mono text-white">EVT-2026-7842</span>) or Student USN.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAttendanceCheckIn} className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={checkInCode}
                      onChange={(e) => setCheckInCode(e.target.value)}
                      placeholder="Scan or enter Ticket Code (EVT-...) or USN..."
                      className="flex-1 px-4 py-2.5 rounded-lg bg-[#080A12] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-[#53D8F0]"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 rounded-lg bg-[#53D8F0] hover:bg-[#3ec4dc] text-[#080A12] font-bold text-xs tracking-wider shadow-lg shadow-[#53D8F0]/20"
                    >
                      Mark Check-In
                    </button>
                  </form>

                  {checkInResult && (
                    <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>
                          <strong>{checkInResult.attendee.fullName}</strong> ({checkInResult.attendee.usn}) checked in successfully!
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-300">
                        {checkInResult.event?.title}
                      </span>
                    </div>
                  )}
                </div>

                {/* Event Selector & Registered Attendee Roster */}
                <div className="p-5 rounded-xl bg-[#0F131F] border border-white/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-white">
                      Attendee Roster & Live Door Status
                    </h4>
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs"
                    >
                      {events.map((evt) => (
                        <option key={evt.id} value={evt.id}>
                          {evt.title} ({evt.date})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-white/5">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#080A12] text-[#A6ADBD] font-mono uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Ticket Code</th>
                          <th className="p-2.5">Attendee</th>
                          <th className="p-2.5">USN</th>
                          <th className="p-2.5">Attendance Status</th>
                          <th className="p-2.5">Check-In Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {eventAttendees.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-[#A6ADBD]">
                              No attendees registered for this event yet.
                            </td>
                          </tr>
                        ) : (
                          eventAttendees.map((att) => (
                            <tr key={att.id} className="hover:bg-white/[0.02]">
                              <td className="p-2.5 font-mono text-[#53D8F0] font-bold">
                                {att.ticketCode}
                              </td>
                              <td className="p-2.5 text-white font-medium">{att.fullName}</td>
                              <td className="p-2.5 font-mono text-[#A6ADBD]">{att.usn}</td>
                              <td className="p-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                    att.hasCheckedIn
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-white/5 text-[#A6ADBD] border border-white/10'
                                  }`}
                                >
                                  {att.hasCheckedIn ? 'CHECKED-IN' : 'PENDING'}
                                </span>
                              </td>
                              <td className="p-2.5 font-mono text-[11px] text-[#A6ADBD]">
                                {att.checkedInAt ? new Date(att.checkedInAt).toLocaleTimeString() : '—'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: ANIME & MANGA SUBMISSIONS */}
            {activeTab === 'anime-manga' && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-white/10">
                  <h3 className="text-base font-bold text-white">
                    Anime & Manga Club Discovery Review
                  </h3>
                  <p className="text-xs text-[#A6ADBD]">
                    Approve or curate student recommendations before they appear on the public anime portal.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {animeMangaList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-[#0F131F] border border-white/10 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#53D8F0]">
                            {item.type || 'ANIME'} • {item.genre}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                              item.isApproved
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {item.isApproved ? 'APPROVED' : 'PENDING MODERATION'}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1.5">{item.title}</h4>
                        <p className="text-xs font-serif text-[#A6ADBD]">{item.japaneseTitle}</p>
                        <p className="text-xs text-white/80 mt-2 line-clamp-3">
                          {item.recommendationReason || item.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[11px] text-[#A6ADBD]">
                          By: <strong className="text-white">{item.submittedBy}</strong>
                        </span>

                        <div className="flex gap-2">
                          {!item.isApproved && (
                            <button
                              onClick={() => handleModerateAnime(item.id, true)}
                              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                            >
                              Approve
                            </button>
                          )}
                          {item.isApproved && (
                            <button
                              onClick={() => handleModerateAnime(item.id, false)}
                              className="px-3 py-1 rounded bg-red-800 hover:bg-red-700 text-white text-xs font-semibold"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 9: AUDIT LOGS */}
            {activeTab === 'audit-logs' && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Immutable Security Audit Trail</h3>
                    <p className="text-xs text-[#A6ADBD]">
                      Cryptographically recorded administrator actions, approval decisions, and status updates.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#53D8F0]">
                    {auditLogs.length} Events Logged
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0F131F]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#080A12] text-[#A6ADBD] font-mono uppercase text-[10px] border-b border-white/10">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Action Type</th>
                        <th className="p-3">Actor Email</th>
                        <th className="p-3">Client IP</th>
                        <th className="p-3">Event Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.02]">
                          <td className="p-3 text-[#A6ADBD]">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3 font-bold text-[#E63946]">{log.action}</td>
                          <td className="p-3 text-white">{log.actor}</td>
                          <td className="p-3 text-[#A6ADBD]">{log.ipAddress}</td>
                          <td className="p-3 text-[#F5EBDD] font-sans text-xs">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 10: TRANSACTIONAL EMAIL LOGS */}
            {activeTab === 'email-logs' && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Transactional Email Dispatch Simulator
                    </h3>
                    <p className="text-xs text-[#A6ADBD]">
                      Live delivery stream of registration OTPs, MFA codes, and JLPT confirmation slips.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#53D8F0]">
                    {emailLogs.length} Messages Dispatched
                  </span>
                </div>

                <div className="space-y-2">
                  {emailLogs.map((mail) => (
                    <div
                      key={mail.id}
                      className="p-3.5 rounded-xl bg-[#0F131F] border border-white/10 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-[#53D8F0]" />
                          <span className="font-bold text-white">To: {mail.to}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#A6ADBD]">
                          {new Date(mail.sentAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-[#53D8F0]">
                        Subject: {mail.subject}
                      </div>
                      <div className="p-2 rounded bg-[#080A12] border border-white/5 text-[11px] font-mono text-[#A6ADBD] whitespace-pre-wrap">
                        {mail.body}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Admin Application Approval / Rejection / Block Confirmation */}
      {selectedAppForAction && actionModalType && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="w-full max-w-md bg-[#0F131F] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                {actionModalType === 'approve' && <UserCheck className="w-5 h-5 text-emerald-400" />}
                {actionModalType === 'reject' && <UserX className="w-5 h-5 text-amber-400" />}
                {actionModalType === 'block' && <Ban className="w-5 h-5 text-red-400" />}
                <span>
                  {actionModalType === 'approve' && 'Approve Administrator'}
                  {actionModalType === 'reject' && 'Reject Application'}
                  {actionModalType === 'block' && 'Block Email Sanction'}
                </span>
              </h4>
              <button
                onClick={() => {
                  setSelectedAppForAction(null);
                  setActionModalType(null);
                }}
                className="text-white/50 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#A6ADBD]">
              Candidate: <strong className="text-white">{selectedAppForAction.fullName}</strong> (
              <span className="font-mono text-[#53D8F0]">{selectedAppForAction.collegeEmail}</span>)
            </p>

            {actionModalType === 'approve' && (
              <div>
                <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-1">
                  Assign Officer Role
                </label>
                <select
                  value={assignedRoleId}
                  onChange={(e) => setAssignedRoleId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.japanese || ''})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(actionModalType === 'reject' || actionModalType === 'block') && (
              <div>
                <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-1">
                  Official Statement / Reason
                </label>
                <textarea
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={
                    actionModalType === 'block'
                      ? 'State the code-of-conduct or security policy violation...'
                      : 'Provide constructive feedback for the applicant...'
                  }
                  className="w-full p-2.5 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs"
                />
              </div>
            )}

            {actionModalType === 'block' && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 text-xs">
                ⚠️ <strong>Warning:</strong> Blocking this email will immediately reject all future
                student or admin registrations from this address.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedAppForAction(null);
                  setActionModalType(null);
                }}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#A6ADBD]"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmAppAction}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-white font-semibold text-xs ${
                  actionModalType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : actionModalType === 'reject'
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-red-700 hover:bg-red-600'
                }`}
              >
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Student Status & Internal Notes Edit */}
      {selectedStudentForEdit && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="w-full max-w-md bg-[#0F131F] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="text-base font-bold text-white">Update JLPT Candidate Status</h4>
              <button onClick={() => setSelectedStudentForEdit(null)} className="text-white/50 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1">
              <div>
                Candidate: <strong className="text-white">{selectedStudentForEdit.fullName}</strong>
              </div>
              <div className="text-[#A6ADBD] font-mono">
                USN: {selectedStudentForEdit.usn} • Ref: {selectedStudentForEdit.referenceId}
              </div>
              <div className="text-[#53D8F0]">Level: JLPT {selectedStudentForEdit.jlptLevel}</div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-1">
                Application Status
              </label>
              <select
                value={newStudentStatus}
                onChange={(e) => setNewStudentStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs"
              >
                <option value="APPROVED">APPROVED (合格・受付済)</option>
                <option value="PENDING_REVIEW">PENDING_REVIEW (審査中)</option>
                <option value="WAITLIST">WAITLIST (待機)</option>
                <option value="REJECTED">REJECTED (却下)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-1">
                Internal Administrative Notes / Hall Assignment
              </label>
              <textarea
                rows={3}
                value={studentInternalNotes}
                onChange={(e) => setStudentInternalNotes(e.target.value)}
                placeholder="e.g. Hall 302, Seat B12, Documents verified..."
                className="w-full p-2.5 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedStudentForEdit(null)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#A6ADBD]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStudentUpdate}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-[#53D8F0] hover:bg-[#3ec4dc] text-[#080A12] font-bold text-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
