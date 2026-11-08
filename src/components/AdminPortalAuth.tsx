import { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  UserPlus,
  Lock,
  Mail,
  User,
  Phone,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  XCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { api, setStoredToken } from '../services/api';

interface AdminPortalAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

type AuthMode = 'admin-login' | 'admin-register' | 'faculty-login';

export default function AdminPortalAuth({ isOpen, onClose, onAuthSuccess }: AdminPortalAuthProps) {
  const [mode, setMode] = useState<AuthMode>('faculty-login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Available Roles
  const [roles, setRoles] = useState<any[]>([]);

  // Admin Registration State
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1); // 1: Form, 2: OTP, 3: Completed
  const [regForm, setRegForm] = useState({
    fullName: '',
    collegeEmail: '',
    phone: '',
    requestedRoleId: 'role-event-manager',
    department: 'Computer Science & Engineering',
    password: '',
    reason: ''
  });
  const [otpCode, setOtpCode] = useState('');

  // Admin Login State
  const [adminLoginForm, setAdminLoginForm] = useState({
    email: '',
    password: ''
  });
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  // Faculty Login State
  const [facultyStep, setFacultyStep] = useState<1 | 2>(1); // 1: Password, 2: MFA
  const [facultyForm, setFacultyForm] = useState({
    email: 'faculty.head@college.edu',
    password: 'Faculty@Komorebi2026!'
  });
  const [facultyMfaCode, setFacultyMfaCode] = useState('');

  // Load Roles for registration dropdown
  useEffect(() => {
    if (isOpen) {
      api.getRoles()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setRoles(data);
            if (!regForm.requestedRoleId) {
              setRegForm(prev => ({ ...prev, requestedRoleId: data[0].id }));
            }
          }
        })
        .catch(() => {
          // fallback default roles if fetch fails
          setRoles([
            { id: 'role-president', name: 'Club President', japanese: '会長' },
            { id: 'role-vp', name: 'Vice President', japanese: '副会長' },
            { id: 'role-secretary', name: 'Secretary', japanese: '書記' },
            { id: 'role-event-manager', name: 'Event Manager', japanese: '行事統括' },
            { id: 'role-tech-admin', name: 'Technical Administrator', japanese: '技術管理者' },
            { id: 'role-anime-mod', name: 'Anime Group Moderator', japanese: 'アニメ部門担当' },
            { id: 'role-learning-coord', name: 'Learning Coordinator', japanese: '学習推進役' },
            { id: 'role-gallery-mgr', name: 'Gallery Manager', japanese: '広報ギャラリー' },
            { id: 'role-general-admin', name: 'General Administrator', japanese: '運営委員' }
          ]);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFacultyLoginStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.facultyLogin(facultyForm.email, facultyForm.password);
      if (res.mfaRequired || res.requiresMfa) {
        setFacultyStep(2);
        setSuccessMessage('Faculty credentials verified. Please enter the 6-digit MFA Security Code.');
      } else if (res.token) {
        setStoredToken(res.token);
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Faculty login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.facultyVerifyMfa(facultyForm.email, facultyMfaCode.trim());
      if (res.token) {
        setStoredToken(res.token);
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired MFA Code');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminRegisterStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.adminRegister(regForm);
      setPendingVerificationEmail(res.email);
      setRegStep(2);
      setSuccessMessage('Registration initiated! Enter the 6-digit OTP code sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const email = pendingVerificationEmail || regForm.collegeEmail;
      await api.adminVerifyEmail(email, otpCode.trim());
      setRegStep(3);
      setSuccessMessage('Email verified successfully! Your application is now pending Faculty Approval.');
    } catch (err: any) {
      setError(err.message || 'Invalid verification OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.adminLogin(adminLoginForm.email, adminLoginForm.password);
      if (res.token) {
        setStoredToken(res.token);
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-portal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-xl bg-[#0F131F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Decorative Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#E63946] via-[#7652D6] to-[#53D8F0]" />

        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#E63946]/20 border border-[#E63946]/40 flex items-center justify-center text-[#E63946]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="admin-portal-title" className="text-lg font-bold text-white tracking-wide">
                  Club Management Portal
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#53D8F0]">
                  管理棟
                </span>
              </div>
              <p className="text-xs text-[#A6ADBD]">
                Official Faculty & Administrator Access Gate
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close portal"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Mode Tabs */}
        <div className="grid grid-cols-3 border-b border-white/10 bg-[#080A12]/60 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setMode('faculty-login');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`py-3 px-2 text-center transition-all flex items-center justify-center gap-1.5 border-b-2 ${
              mode === 'faculty-login'
                ? 'border-[#E63946] text-white bg-white/5 font-semibold'
                : 'border-transparent text-[#A6ADBD] hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#E63946]" />
            <span>Faculty Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('admin-login');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`py-3 px-2 text-center transition-all flex items-center justify-center gap-1.5 border-b-2 ${
              mode === 'admin-login'
                ? 'border-[#7652D6] text-white bg-white/5 font-semibold'
                : 'border-transparent text-[#A6ADBD] hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-[#7652D6]" />
            <span>Admin Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('admin-register');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`py-3 px-2 text-center transition-all flex items-center justify-center gap-1.5 border-b-2 ${
              mode === 'admin-register'
                ? 'border-[#53D8F0] text-white bg-white/5 font-semibold'
                : 'border-transparent text-[#A6ADBD] hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-[#53D8F0]" />
            <span>Apply as Admin</span>
          </button>
        </div>

        {/* Status Alerts */}
        <div className="px-6 pt-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-[#E63946] shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {successMessage && !error && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">{successMessage}</div>
            </div>
          )}
        </div>

        {/* Tab 1: Faculty Login */}
        {mode === 'faculty-login' && (
          <div className="p-6 space-y-5">
            {facultyStep === 1 ? (
              <form onSubmit={handleFacultyLoginStep1} className="space-y-4">
                <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-[#A6ADBD] flex items-center justify-between">
                  <span>Faculty Head Credentials</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFacultyForm({
                        email: 'faculty.head@college.edu',
                        password: 'Faculty@Komorebi2026!'
                      });
                    }}
                    className="text-[#53D8F0] hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-Fill Default
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#A6ADBD] uppercase mb-1">
                    Faculty College Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-[#A6ADBD]" />
                    <input
                      type="email"
                      required
                      value={facultyForm.email}
                      onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                      placeholder="faculty.head@college.edu"
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#080A12] border border-white/10 text-white text-sm focus:outline-none focus:border-[#E63946]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#A6ADBD] uppercase mb-1">
                    Faculty Security Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-[#A6ADBD]" />
                    <input
                      type="password"
                      required
                      value={facultyForm.password}
                      onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#080A12] border border-white/10 text-white text-sm focus:outline-none focus:border-[#E63946]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-[#E63946] hover:bg-[#d62839] text-white font-semibold text-sm tracking-wide transition-all shadow-lg shadow-[#E63946]/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <span>Proceed to 2FA Authentication</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleFacultyVerifyMfa} className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#E63946]/20 border border-[#E63946]/40 flex items-center justify-center text-[#E63946]">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="text-white font-bold text-base">Two-Factor Authentication</h4>
                  <p className="text-xs text-[#A6ADBD]">
                    Enter the 6-digit MFA security verification code for faculty verification.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#080A12] border border-white/10 text-center">
                  <span className="text-[11px] text-[#A6ADBD] font-mono">Demo Faculty MFA Code: </span>
                  <span className="text-xs font-mono text-[#53D8F0] font-bold">654321</span>
                  <button
                    type="button"
                    onClick={() => setFacultyMfaCode('654321')}
                    className="ml-3 text-[11px] text-[#E63946] hover:underline"
                  >
                    Use Code
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#A6ADBD] uppercase mb-1 text-center">
                    6-Digit Security MFA Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={facultyMfaCode}
                    onChange={(e) => setFacultyMfaCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="654321"
                    className="w-full py-3 text-center tracking-[0.5em] font-mono text-2xl rounded-lg bg-[#080A12] border border-[#E63946]/50 text-white focus:outline-none focus:border-[#E63946]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFacultyStep(1)}
                    className="py-2.5 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-[#A6ADBD] text-xs flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || facultyMfaCode.length !== 6}
                    className="flex-1 py-2.5 rounded-lg bg-[#E63946] hover:bg-[#d62839] text-white font-semibold text-sm transition-all shadow-lg shadow-[#E63946]/30 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Authenticating...' : 'Confirm & Open Faculty Portal'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Admin Login */}
        {mode === 'admin-login' && (
          <div className="p-6 space-y-4">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-[#A6ADBD] flex items-center justify-between">
                <span>Default Seed Admin</span>
                <button
                  type="button"
                  onClick={() => {
                    setAdminLoginForm({
                      email: 'pranavanand350@college.edu',
                      password: 'Admin@Komorebi2026!'
                    });
                  }}
                  className="text-[#53D8F0] hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Sparkles className="w-3 h-3" /> Auto-Fill Default
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A6ADBD] uppercase mb-1">
                  Registered College Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-[#A6ADBD]" />
                  <input
                    type="email"
                    required
                    value={adminLoginForm.email}
                    onChange={(e) => setAdminLoginForm({ ...adminLoginForm, email: e.target.value })}
                    placeholder="pranav@college.edu"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#080A12] border border-white/10 text-white text-sm focus:outline-none focus:border-[#7652D6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A6ADBD] uppercase mb-1">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-[#A6ADBD]" />
                  <input
                    type="password"
                    required
                    value={adminLoginForm.password}
                    onChange={(e) => setAdminLoginForm({ ...adminLoginForm, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#080A12] border border-white/10 text-white text-sm focus:outline-none focus:border-[#7652D6]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-[#7652D6] hover:bg-[#6843c9] text-white font-semibold text-sm tracking-wide transition-all shadow-lg shadow-[#7652D6]/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In as Administrator'}
              </button>
            </form>

            <div className="pt-2 text-center">
              <p className="text-xs text-[#A6ADBD]">
                Not yet registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('admin-register')}
                  className="text-[#53D8F0] hover:underline"
                >
                  Submit an Admin Self-Registration
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Admin Self-Registration Flow */}
        {mode === 'admin-register' && (
          <div className="p-6">
            {regStep === 1 && (
              <form onSubmit={handleAdminRegisterStep1} className="space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <p className="text-xs text-[#A6ADBD]">
                    Fill in your university details to request club administrative access.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setRegForm({
                        fullName: 'Aoi Tanaka',
                        collegeEmail: 'aoi.tanaka@college.edu',
                        phone: '+91 98765 43210',
                        requestedRoleId: 'role-event-manager',
                        department: 'Information Science & Engineering',
                        password: 'Pass@Komorebi2026',
                        reason: 'I have organized cultural fests and want to manage Japanese workshops and JLPT coordination.'
                      });
                    }}
                    className="text-[11px] text-[#53D8F0] hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Quick Sample
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-1">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-3 text-[#A6ADBD]" />
                      <input
                        type="text"
                        required
                        value={regForm.fullName}
                        onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                        placeholder="e.g. Aoi Tanaka"
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs focus:outline-none focus:border-[#53D8F0]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-1">
                      College Email (@college.edu)
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-[#A6ADBD]" />
                      <input
                        type="email"
                        required
                        value={regForm.collegeEmail}
                        onChange={(e) => setRegForm({ ...regForm, collegeEmail: e.target.value })}
                        placeholder="username@college.edu"
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs focus:outline-none focus:border-[#53D8F0]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-[#A6ADBD]" />
                      <input
                        type="tel"
                        required
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs focus:outline-none focus:border-[#53D8F0]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-1">
                      Department / Major
                    </label>
                    <div className="relative">
                      <BookOpen className="w-3.5 h-3.5 absolute left-3 top-3 text-[#A6ADBD]" />
                      <input
                        type="text"
                        required
                        value={regForm.department}
                        onChange={(e) => setRegForm({ ...regForm, department: e.target.value })}
                        placeholder="Computer Science & Eng."
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs focus:outline-none focus:border-[#53D8F0]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-1">
                      Requested Role
                    </label>
                    <select
                      value={regForm.requestedRoleId}
                      onChange={(e) => setRegForm({ ...regForm, requestedRoleId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs focus:outline-none focus:border-[#53D8F0]"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.japanese || ''})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-1">
                      Desired Password (min 8 chars)
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-[#A6ADBD]" />
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        placeholder="••••••••••••"
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs focus:outline-none focus:border-[#53D8F0]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#A6ADBD] uppercase mb-1">
                    Statement of Reason / Prior Experience
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={regForm.reason}
                    onChange={(e) => setRegForm({ ...regForm, reason: e.target.value })}
                    placeholder="Describe your motivation, Japanese cultural interest, or relevant event/tech experience..."
                    className="w-full p-2.5 rounded-lg bg-[#080A12] border border-white/10 text-white text-xs focus:outline-none focus:border-[#53D8F0]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-[#53D8F0] hover:bg-[#3ec4dc] text-[#080A12] font-bold text-xs tracking-wider transition-all shadow-lg shadow-[#53D8F0]/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? 'Submitting Application...' : 'Submit Application & Send Verification OTP'}
                </button>
              </form>
            )}

            {regStep === 2 && (
              <form onSubmit={handleAdminVerifyOtp} className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#53D8F0]/20 border border-[#53D8F0]/40 flex items-center justify-center text-[#53D8F0]">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h4 className="text-white font-bold text-base">Verify Email Address</h4>
                  <p className="text-xs text-[#A6ADBD]">
                    We sent a 6-digit confirmation code to{' '}
                    <span className="text-white font-mono">{pendingVerificationEmail || regForm.collegeEmail}</span>
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#080A12] border border-white/10 text-center">
                  <span className="text-[11px] text-[#A6ADBD] font-mono">Simulated OTP Code: </span>
                  <span className="text-xs font-mono text-[#53D8F0] font-bold">123456</span>
                  <button
                    type="button"
                    onClick={() => setOtpCode('123456')}
                    className="ml-3 text-[11px] text-[#53D8F0] hover:underline font-semibold"
                  >
                    Auto-Fill OTP
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#A6ADBD] uppercase mb-1 text-center">
                    Enter 6-Digit Email OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full py-3 text-center tracking-[0.5em] font-mono text-2xl rounded-lg bg-[#080A12] border border-[#53D8F0]/50 text-white focus:outline-none focus:border-[#53D8F0]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRegStep(1)}
                    className="py-2.5 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-[#A6ADBD] text-xs flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="flex-1 py-2.5 rounded-lg bg-[#53D8F0] hover:bg-[#3ec4dc] text-[#080A12] font-bold text-xs transition-all shadow-lg shadow-[#53D8F0]/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP & Submit to Faculty Queue'}
                  </button>
                </div>
              </form>
            )}

            {regStep === 3 && (
              <div className="text-center space-y-4 py-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Clock className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    STATUS: PENDING_FACULTY_APPROVAL
                  </span>
                  <h4 className="text-lg font-bold text-white">Application Successfully Submitted</h4>
                </div>

                <p className="text-xs text-[#A6ADBD] max-w-md mx-auto leading-relaxed">
                  Your identity has been verified via college email OTP. Your application has been logged into the
                  <strong className="text-white"> Faculty Review Queue</strong>. The Faculty Advisor will review your profile,
                  statement of motivation, and assign appropriate leadership permissions.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('admin-login');
                      setRegStep(1);
                    }}
                    className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                  >
                    Go to Admin Login Screen
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="px-6 py-3 bg-[#080A12] border-t border-white/5 flex items-center justify-between text-[11px] text-[#A6ADBD]">
          <span className="flex items-center gap-1.5 font-mono">
            <Lock className="w-3 h-3 text-[#E63946]" />
            AES-Scrypt Encrypted Session
          </span>
          <span className="font-serif text-[#F5EBDD]/60">木漏れ日 日本クラブ 2026</span>
        </div>
      </div>
    </div>
  );
}
