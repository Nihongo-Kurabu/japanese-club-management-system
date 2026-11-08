import { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  User,
  Mail,
  GraduationCap,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { JLPT_LEVEL_INFO } from '../utils/jlptValidation';

interface JlptStudentPortalProps {
  onNavigateHome: () => void;
}

export default function JlptStudentPortal({ onNavigateHome }: JlptStudentPortalProps) {
  const [activeTab, setActiveTab] = useState<'register' | 'status-check' | 'level-guide'>('register');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    collegeEmail: '',
    usn: '',
    phone: '',
    branch: 'Computer Science & Engineering',
    academicYear: '2nd Year',
    jlptLevel: 'N5',
    previousExperience: 'None (First time taking JLPT)',
    motivationReason: 'Career opportunities with Japanese engineering companies and passion for language',
    consentDeclaration: true
  });

  // Successful Registration Slip
  const [registrationSlip, setRegistrationSlip] = useState<any | null>(null);

  // Status Lookup State
  const [statusUsn, setStatusUsn] = useState('');
  const [statusEmail, setStatusEmail] = useState('');
  const [lookedUpStudent, setLookedUpStudent] = useState<any | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [setRes, sysRes] = await Promise.all([
        api.getJlptSettings().catch(() => null),
        api.getSystemStatus().catch(() => null)
      ]);
      setSettings(setRes);
      setSystemStatus(sysRes);
    } catch (err) {
      console.error('Failed to load JLPT portal settings', err);
    }
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.registerStudentJlpt(formData);
      setRegistrationSlip(res.student);
      fetchSettings(); // Refresh capacity count
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please review your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleLookupStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setLookedUpStudent(null);
    setLoading(true);

    try {
      const res = await api.checkStudentStatus(statusUsn.trim(), statusEmail.trim());
      setLookedUpStudent(res.student);
    } catch (err: any) {
      setLookupError(err.message || 'No registration record found matching this USN and email.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const isClosed = settings && (settings.isRegistrationOpen === false || settings.isEnabled === false || settings.status === 'CLOSED');
  const isFull = settings && systemStatus && (systemStatus.totalStudents >= settings.maxCapacity || systemStatus.capacityRemaining <= 0);

  return (
    <div className="min-h-screen bg-[#080A12] text-[#F5EBDD] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#111522] via-[#171C2B] to-[#0F131F] border border-white/10 p-8 sm:p-12 shadow-2xl">
          {/* Japanese Watermark Kanji */}
          <div className="absolute right-6 top-6 text-8xl sm:text-9xl font-serif text-white/[0.03] select-none pointer-events-none">
            試験
          </div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30 uppercase tracking-widest font-bold">
                OFFICIAL COLLEGE JLPT PORTAL
              </span>
              <span className="text-xs font-serif text-[#A6ADBD]">日本語能力試験 2026</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Japanese Language Proficiency Test
            </h1>

            <p className="text-sm sm:text-base text-[#A6ADBD] leading-relaxed">
              Official institutional registration for college students taking the JLPT examination.
              Administered in coordination with the Japan Foundation and college faculty advisory.
            </p>

            {/* Live Registration Status & Capacity Indicator */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <div
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 ${
                  isClosed
                    ? 'bg-red-950/40 border-red-500/40 text-red-300'
                    : isFull
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isClosed ? 'bg-red-500' : isFull ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                  }`}
                />
                <span>
                  {isClosed
                    ? 'REGISTRATION CLOSED (受付終了)'
                    : isFull
                    ? 'MAX CAPACITY REACHED (満員)'
                    : 'REGISTRATION OPEN (受付中)'}
                </span>
              </div>

              {settings && (
                <div className="text-xs text-[#A6ADBD] font-mono flex items-center gap-2">
                  <span>Seats:</span>
                  <span className="text-white font-bold">
                    {systemStatus?.totalStudents || 0} / {settings.maxCapacity || 1000}
                  </span>
                  <span className="text-[11px] text-[#53D8F0]">
                    ({settings.maxCapacity - (systemStatus?.totalStudents || 0)} available)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/10 gap-2 text-sm">
          <button
            onClick={() => setActiveTab('register')}
            className={`pb-3 px-4 font-medium transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'register'
                ? 'border-[#E63946] text-white font-bold'
                : 'border-transparent text-[#A6ADBD] hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#E63946]" />
            <span>Candidate Registration (申込)</span>
          </button>

          <button
            onClick={() => setActiveTab('status-check')}
            className={`pb-3 px-4 font-medium transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'status-check'
                ? 'border-[#53D8F0] text-white font-bold'
                : 'border-transparent text-[#A6ADBD] hover:text-white'
            }`}
          >
            <Search className="w-4 h-4 text-[#53D8F0]" />
            <span>Check Application Status (受付確認)</span>
          </button>

          <button
            onClick={() => setActiveTab('level-guide')}
            className={`pb-3 px-4 font-medium transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'level-guide'
                ? 'border-[#7652D6] text-white font-bold'
                : 'border-transparent text-[#A6ADBD] hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-[#7652D6]" />
            <span>JLPT Level Syllabus (試験案内)</span>
          </button>
        </div>

        {/* TAB 1: REGISTRATION FORM */}
        {activeTab === 'register' && (
          <div className="space-y-6">
            {/* If Closed Notice */}
            {isClosed && (
              <div className="p-6 rounded-2xl bg-red-950/30 border border-red-500/40 text-center space-y-2">
                <AlertCircle className="w-10 h-10 text-[#E63946] mx-auto" />
                <h3 className="text-lg font-bold text-white">Online Registration Is Currently Closed</h3>
                <p className="text-xs text-[#A6ADBD] max-w-lg mx-auto">
                  The college Faculty Coordinator has closed new student submissions for this examination window.
                  If you have already registered, you may use the "Check Application Status" tab to verify your reference slip.
                </p>
              </div>
            )}

            {/* If Successful Registration Slip View */}
            {registrationSlip && (
              <div className="p-8 rounded-3xl bg-[#0F131F] border border-emerald-500/50 shadow-2xl space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                        REGISTRATION CONFIRMED
                      </span>
                      <h3 className="text-xl font-bold text-white">
                        Official JLPT Candidate Admission Pass
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrintSlip}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#53D8F0]" />
                      <span>Print Slip</span>
                    </button>

                    <button
                      onClick={() => setRegistrationSlip(null)}
                      className="px-4 py-2 rounded-xl bg-[#E63946] text-white text-xs font-semibold"
                    >
                      Done
                    </button>
                  </div>
                </div>

                {/* Candidate Pass Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#080A12] p-6 rounded-2xl border border-white/5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#A6ADBD]">
                      Official Reference ID
                    </span>
                    <div className="text-xl font-mono font-bold text-[#53D8F0]">
                      {registrationSlip.referenceId}
                    </div>
                    <span className="text-[11px] text-[#A6ADBD]">Keep this for test hall entry</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#A6ADBD]">
                      Target Examination
                    </span>
                    <div className="text-xl font-mono font-bold text-[#E63946]">
                      JLPT {registrationSlip.jlptLevel}
                    </div>
                    <span className="text-[11px] text-[#A6ADBD]">Session: November / December 2026</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#A6ADBD]">
                      Status
                    </span>
                    <div>
                      <span className="inline-block px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {registrationSlip.applicationStatus}
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2 border-t border-white/5 pt-4">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[#A6ADBD] block">Candidate Name:</span>
                        <strong className="text-white text-sm">{registrationSlip.fullName}</strong>
                      </div>
                      <div>
                        <span className="text-[#A6ADBD] block">University USN:</span>
                        <strong className="text-white font-mono">{registrationSlip.usn}</strong>
                      </div>
                      <div>
                        <span className="text-[#A6ADBD] block">College Email:</span>
                        <span className="text-[#F5EBDD] font-mono">{registrationSlip.collegeEmail}</span>
                      </div>
                      <div>
                        <span className="text-[#A6ADBD] block">Branch & Year:</span>
                        <span className="text-[#F5EBDD]">
                          {registrationSlip.branch} • {registrationSlip.academicYear}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0">
                    <div className="w-16 h-16 rounded-2xl border-2 border-[#E63946] bg-[#E63946]/10 flex flex-col items-center justify-center text-[#E63946] font-serif font-black text-base shadow-lg shadow-[#E63946]/20">
                      <span>木漏</span>
                      <span className="text-xs">認印</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#A6ADBD] mt-2">
                      Verified by Faculty Advisory
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-[#A6ADBD] space-y-1 leading-relaxed">
                  <strong className="text-white block font-mono text-[11px] uppercase">
                    Important Instructions for Test Day:
                  </strong>
                  <p>1. Please carry a printed copy of this pass along with your College ID card.</p>
                  <p>2. Report to the examination hall at least 30 minutes prior to scheduled listening & reading modules.</p>
                  <p>3. Pencils (HB/No. 2) and erasers are mandatory for the OMR answer sheets.</p>
                </div>
              </div>
            )}

            {/* Main Form */}
            {!isClosed && !registrationSlip && (
              <form
                onSubmit={handleSubmitRegistration}
                className="p-8 rounded-3xl bg-[#0F131F] border border-white/10 shadow-2xl space-y-6"
              >
                {/* Form Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">Student Registration Form</h3>
                    <p className="text-xs text-[#A6ADBD]">
                      Please verify your official university registration data carefully.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        fullName: 'Rohan Sharma',
                        collegeEmail: 'rohan.sharma@college.edu',
                        usn: '1MS23CS142',
                        phone: '+91 98450 12345',
                        branch: 'Computer Science',
                        academicYear: '2nd Year',
                        jlptLevel: 'N5',
                        previousExperience: 'Self-studied Hiragana and Katakana via club lab',
                        motivationReason: 'Aspiring software engineer interested in Tokyo tech internships',
                        consentDeclaration: true
                      });
                    }}
                    className="text-xs text-[#53D8F0] hover:underline flex items-center gap-1 self-start sm:self-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Auto-Fill Student Sample
                  </button>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-[#E63946] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Registration Error:</strong>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                {/* Section 1: Personal & College Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-[#53D8F0]">
                    01 • Candidate Identification
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-[#A6ADBD] uppercase mb-1">
                        Full Legal Name (as per College ID)
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-3 text-[#A6ADBD]" />
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="e.g. Rohan Sharma"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#080A12] border border-white/10 text-white text-sm focus:outline-none focus:border-[#E63946]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-[#A6ADBD] uppercase mb-1">
                        University USN (Unique Serial Number)
                      </label>
                      <div className="relative">
                        <GraduationCap className="w-4 h-4 absolute left-3 top-3 text-[#A6ADBD]" />
                        <input
                          type="text"
                          required
                          value={formData.usn}
                          onChange={(e) => setFormData({ ...formData, usn: e.target.value.toUpperCase() })}
                          placeholder="e.g. 1MS23CS142"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#080A12] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-[#E63946]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-[#A6ADBD] uppercase mb-1">
                        College Email Address (@college.edu)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-3 text-[#A6ADBD]" />
                        <input
                          type="email"
                          required
                          value={formData.collegeEmail}
                          onChange={(e) => setFormData({ ...formData, collegeEmail: e.target.value })}
                          placeholder="username@college.edu"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#080A12] border border-white/10 text-white text-sm focus:outline-none focus:border-[#E63946]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-[#A6ADBD] uppercase mb-1">
                        Contact Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98450 12345"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#080A12] border border-white/10 text-white text-sm focus:outline-none focus:border-[#E63946]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-[#A6ADBD] uppercase mb-1">
                        Academic Department / Branch
                      </label>
                      <select
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#080A12] border border-white/10 text-white text-sm focus:outline-none focus:border-[#E63946]"
                      >
                        <option value="Computer Science">Computer Science & Engineering</option>
                        <option value="Information Science">Information Science & Engineering</option>
                        <option value="Electronics & Communication">Electronics & Communication</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Biotechnology">Biotechnology</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-[#A6ADBD] uppercase mb-1">
                        Current Academic Year
                      </label>
                      <select
                        value={formData.academicYear}
                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#080A12] border border-white/10 text-white text-sm focus:outline-none focus:border-[#E63946]"
                      >
                        <option value="1st Year">1st Year (Freshman)</option>
                        <option value="2nd Year">2nd Year (Sophomore)</option>
                        <option value="3rd Year">3rd Year (Junior)</option>
                        <option value="4th Year">4th Year (Senior)</option>
                        <option value="Postgraduate">Postgraduate (Masters/PhD)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: JLPT Level Selection */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-[#53D8F0]">
                      02 • Choose Target JLPT Level
                    </h4>
                    <span className="text-xs text-[#A6ADBD] font-serif">受験レベル選択</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map((lvl) => {
                      const isSelected = formData.jlptLevel === lvl;
                      const info = JLPT_LEVEL_INFO[lvl];
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setFormData({ ...formData, jlptLevel: lvl })}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? 'bg-[#E63946]/20 border-[#E63946] shadow-lg shadow-[#E63946]/30 text-white'
                              : 'bg-[#080A12] border-white/10 text-[#A6ADBD] hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xl font-black text-white">{lvl}</span>
                            <span className="font-serif text-xs text-[#53D8F0]">{info.kanji}</span>
                          </div>
                          <div className="text-xs font-semibold mt-1 text-white">{info.title}</div>
                          <div className="text-[10px] text-[#A6ADBD] mt-2 font-mono">
                            ~{info.kanjiCount} Kanji
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Motivation & Consent */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-[#53D8F0]">
                    03 • Experience & Declaration
                  </h4>

                  <div>
                    <label className="block text-xs font-mono text-[#A6ADBD] uppercase mb-1">
                      Prior Japanese Learning / Exam Experience
                    </label>
                    <input
                      type="text"
                      value={formData.previousExperience}
                      onChange={(e) => setFormData({ ...formData, previousExperience: e.target.value })}
                      placeholder="e.g. Attended Komorebi club beginner sessions, Duolingo, Genki I..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#080A12] border border-white/10 text-white text-sm focus:outline-none focus:border-[#E63946]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#A6ADBD] uppercase mb-1">
                      Motivation for Taking JLPT
                    </label>
                    <textarea
                      rows={2}
                      value={formData.motivationReason}
                      onChange={(e) => setFormData({ ...formData, motivationReason: e.target.value })}
                      placeholder="Why do you wish to earn JLPT certification?..."
                      className="w-full p-3 rounded-xl bg-[#080A12] border border-white/10 text-white text-sm focus:outline-none focus:border-[#E63946]"
                    />
                  </div>

                  <label className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer text-xs text-[#A6ADBD]">
                    <input
                      type="checkbox"
                      required
                      checked={formData.consentDeclaration}
                      onChange={(e) => setFormData({ ...formData, consentDeclaration: e.target.checked })}
                      className="mt-0.5 rounded border-white/20 text-[#E63946] focus:ring-0"
                    />
                    <span>
                      I hereby certify that all information submitted is true to my academic record.
                      I agree to adhere to the Japan Foundation JLPT examination conduct regulations and college code of ethics.
                    </span>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !formData.consentDeclaration}
                    className="w-full py-4 rounded-2xl bg-[#E63946] hover:bg-[#d62839] text-white font-bold text-sm sm:text-base tracking-wider transition-all shadow-xl shadow-[#E63946]/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Processing Registration...</span>
                    ) : (
                      <>
                        <span>Submit Registration & Generate Admission Slip</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: STATUS LOOKUP */}
        {activeTab === 'status-check' && (
          <div className="space-y-6">
            <div className="p-8 rounded-3xl bg-[#0F131F] border border-white/10 shadow-2xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Check Your JLPT Registration Status</h3>
                <p className="text-xs text-[#A6ADBD]">
                  Enter your registered USN and college email to view your reference slip, hall allocation, and review status.
                </p>
              </div>

              <form onSubmit={handleLookupStatus} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#A6ADBD] uppercase mb-1">
                    University USN
                  </label>
                  <input
                    type="text"
                    required
                    value={statusUsn}
                    onChange={(e) => setStatusUsn(e.target.value.toUpperCase())}
                    placeholder="e.g. 1MS23CS142"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#080A12] border border-white/10 text-white text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#A6ADBD] uppercase mb-1">
                    College Email
                  </label>
                  <input
                    type="email"
                    required
                    value={statusEmail}
                    onChange={(e) => setStatusEmail(e.target.value)}
                    placeholder="username@college.edu"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#080A12] border border-white/10 text-white text-sm"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-[#53D8F0] hover:bg-[#3ec4dc] text-[#080A12] font-bold text-sm tracking-wide transition-all shadow-lg shadow-[#53D8F0]/20"
                  >
                    {loading ? 'Searching...' : 'Lookup Application'}
                  </button>
                </div>
              </form>

              {lookupError && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#E63946] shrink-0" />
                  <span>{lookupError}</span>
                </div>
              )}

              {lookedUpStudent && (
                <div className="p-6 rounded-2xl bg-[#080A12] border border-white/10 space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
                    <div>
                      <span className="text-[11px] font-mono text-[#53D8F0]">
                        REF: {lookedUpStudent.referenceId}
                      </span>
                      <h4 className="text-lg font-bold text-white">{lookedUpStudent.fullName}</h4>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold self-start sm:self-auto ${
                        lookedUpStudent.applicationStatus === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : lookedUpStudent.applicationStatus === 'WAITLIST'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : lookedUpStudent.applicationStatus === 'REJECTED'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      STATUS: {lookedUpStudent.applicationStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[#A6ADBD] block">Target Level:</span>
                      <strong className="text-white font-mono text-sm">
                        JLPT {lookedUpStudent.jlptLevel}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#A6ADBD] block">Branch:</span>
                      <strong className="text-white">{lookedUpStudent.branch}</strong>
                    </div>
                    <div>
                      <span className="text-[#A6ADBD] block">Registered Date:</span>
                      <span className="text-white font-mono">
                        {new Date(lookedUpStudent.registeredAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#A6ADBD] block">Exam Session:</span>
                      <span className="text-[#53D8F0]">November / December 2026</span>
                    </div>
                  </div>

                  {lookedUpStudent.internalNotes && (
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-[#F5EBDD]">
                      <span className="font-mono text-[10px] text-[#53D8F0] uppercase block">
                        Advisory Note / Hall Assignment:
                      </span>
                      {lookedUpStudent.internalNotes}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: LEVEL SYLLABUS & GUIDE */}
        {activeTab === 'level-guide' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map((lvl) => {
              const info = JLPT_LEVEL_INFO[lvl];
              return (
                <div
                  key={lvl}
                  className="p-6 rounded-2xl bg-[#0F131F] border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-2xl font-black text-[#E63946]">{lvl}</span>
                      <span className="text-sm font-bold text-white">{info.title}</span>
                    </div>
                    <span className="font-serif text-lg text-[#53D8F0]">{info.kanji}</span>
                  </div>

                  <p className="text-xs text-[#A6ADBD] leading-relaxed">{info.desc}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 font-mono">
                    <div className="p-2.5 rounded-lg bg-[#080A12] border border-white/5">
                      <span className="text-[#A6ADBD] text-[10px] block">Kanji Requirement:</span>
                      <strong className="text-white">~{info.kanjiCount} Kanji</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#080A12] border border-white/5">
                      <span className="text-[#A6ADBD] text-[10px] block">Vocabulary:</span>
                      <strong className="text-white">~{info.vocabCount} Words</strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-[11px] text-[#A6ADBD]">
                    <span className="text-[#53D8F0] block font-mono text-[10px] uppercase">
                      Target Audience:
                    </span>
                    {info.target}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
