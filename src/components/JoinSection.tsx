import { useState } from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, Heart, Award, Users, BookOpen, AlertCircle, Download, ArrowRight } from 'lucide-react';
import { validateMembershipForm, generateMemberId, MembershipFormData } from '../utils/validation';

export default function JoinSection() {
  const [formData, setFormData] = useState<MembershipFormData>({
    fullName: '',
    collegeEmail: '',
    department: '',
    yearOfStudy: '',
    interests: [],
    reason: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [memberId, setMemberId] = useState('');

  const interestOptions = [
    'Japanese Language & JLPT (日本語)',
    'Anime & Sakuga Storytelling (アニメ)',
    'Traditional Arts & Calligraphy (書道・茶道)',
    'Japanese Cuisine & Ramen (和食)',
    'Origami & Papercraft (折り紙)',
    'Gaming & Pop Culture (ゲーム)',
    'Cultural Festivals & Stage (文化祭)'
  ];

  const handleInterestToggle = (item: string) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(item);
      if (exists) {
        return { ...prev, interests: prev.interests.filter((i) => i !== item) };
      } else {
        return { ...prev, interests: [...prev.interests, item] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateMembershipForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    const newId = generateMemberId();
    setMemberId(newId);
    setIsSubmitted(true);

    // Save membership state locally
    try {
      localStorage.setItem('komorebi_member', JSON.stringify({ ...formData, memberId: newId }));
    } catch {
      // Graceful
    }
  };

  return (
    <div className="pt-24 pb-24 bg-[#080A12] min-h-screen text-[#F5EBDD]">
      {/* Header */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-b border-white/5 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>入部申込 • OFFICIAL MEMBERSHIP APPLICATION</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-display uppercase tracking-tight text-white">
            START YOUR JOURNEY <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] via-[#F5EBDD] to-[#53D8F0]">
              INTO JAPAN TODAY
            </span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-[#A6ADBD] text-sm sm:text-base font-light leading-relaxed">
            Join an inspiring, inclusive society of fellow students. No prior language skills required.
            Receive your official digital member pass and welcome kit immediately.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Why Join & Member Benefits */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-[#171C2B] border border-white/10 space-y-6 shadow-xl">
              <div>
                <span className="text-xs font-mono text-[#53D8F0] uppercase tracking-widest">
                  Why Join Komorebi? • 特典と経験
                </span>
                <h3 className="text-2xl font-bold font-display text-white mt-1">
                  Membership Privileges
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E63946]/15 text-[#E63946] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Free Language Labs</h4>
                    <p className="text-xs text-[#A6ADBD] mt-0.5">
                      Weekly Hiragana, Katakana, and JLPT N5 conversational workshops with senior mentors.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#7652D6]/20 text-[#53D8F0] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Exclusive Cultural Access</h4>
                    <p className="text-xs text-[#A6ADBD] mt-0.5">
                      Priority spots for Tea Ceremony, calligraphy brushes, and cooking masterclasses.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#53D8F0]/15 text-[#53D8F0] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Senpai Mentorship & Leadership</h4>
                    <p className="text-xs text-[#A6ADBD] mt-0.5">
                      Direct guidance from experienced senior advisors and opportunities to organize campus festivals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E63946]/15 text-[#E63946] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Official Membership Pass</h4>
                    <p className="text-xs text-[#A6ADBD] mt-0.5">
                      Personalized digital ID card with authentic Japanese Hanko seal.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#171C2B] to-[#1a172e] border border-[#7652D6]/30">
              <span className="font-serif text-2xl text-[#E63946]">一期一会</span>
              <p className="text-xs text-[#53D8F0] font-mono mt-1">Ichigo Ichie</p>
              <p className="text-xs text-[#A6ADBD] mt-2 italic">
                "Treasure every encounter, for it will never recur in the exact same way."
              </p>
            </div>
          </div>

          {/* Right Column: Multi-Step Interactive Registration Form OR Pass Card */}
          <div className="lg:col-span-7">
            {isSubmitted ? (
              <div className="space-y-6 animate-fade-in">
                {/* Congratulations Banner */}
                <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-500/40 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500 text-black flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Welcome to the Club!</h3>
                  <p className="text-xs font-serif text-[#E63946] mt-1 font-semibold text-base">
                    木漏れ日へようこそ！
                  </p>
                  <p className="text-xs text-[#A6ADBD] mt-2 max-w-md mx-auto">
                    Your membership application has been approved. Below is your official digital
                    membership pass.
                  </p>
                </div>

                {/* Digital Japanese Membership Card */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#171C2B] via-[#0d101d] to-[#171C2B] border-2 border-[#E63946]/50 shadow-2xl p-6 sm:p-8">
                  {/* Subtle watermarked background logo */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 font-serif text-9xl text-white/[0.03] pointer-events-none select-none">
                    木
                  </div>

                  {/* Card Top Row */}
                  <div className="flex items-center justify-between pb-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E63946] flex items-center justify-center text-white font-serif font-black text-xl shadow-lg shadow-[#E63946]/30">
                        木
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-base tracking-wider">KOMOREBI</h4>
                        <p className="text-[10px] font-mono text-[#53D8F0] uppercase">
                          Official Japanese Club Member Pass
                        </p>
                      </div>
                    </div>

                    {/* Red Japanese Hanko Seal Stamp */}
                    <div className="w-12 h-12 rounded-lg border-2 border-[#E63946] bg-[#E63946]/10 flex flex-col items-center justify-center text-[#E63946] font-serif font-black text-xs shadow-md shadow-[#E63946]/40 rotate-6">
                      <span>木漏</span>
                      <span className="text-[9px]">印</span>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="py-6 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#A6ADBD] block">
                        Member Name (氏名)
                      </span>
                      <span className="text-base font-bold text-white block mt-0.5">
                        {formData.fullName}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#A6ADBD] block">
                        Member ID (会員番号)
                      </span>
                      <span className="text-sm font-mono font-bold text-[#53D8F0] block mt-0.5">
                        {memberId}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#A6ADBD] block">
                        Department & Year
                      </span>
                      <span className="text-xs font-semibold text-white block mt-0.5">
                        {formData.department} • {formData.yearOfStudy}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#A6ADBD] block">
                        Registered Email
                      </span>
                      <span className="text-xs text-[#A6ADBD] block mt-0.5 truncate">
                        {formData.collegeEmail}
                      </span>
                    </div>
                  </div>

                  {/* Chosen interests */}
                  <div className="pt-4 border-t border-white/10">
                    <span className="text-[10px] font-mono uppercase text-[#A6ADBD] block mb-2">
                      Registered Focus Areas:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.interests.map((interest) => (
                        <span
                          key={interest}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#F5EBDD] border border-white/5"
                        >
                          {interest.split(' (')[0]}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom status */}
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#A6ADBD]">
                    <span>STATUS: ACTIVE FELLOW (正規部員)</span>
                    <span className="text-[#E63946]">VALID 2026/2027</span>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        fullName: '',
                        collegeEmail: '',
                        department: '',
                        yearOfStudy: '',
                        interests: [],
                        reason: ''
                      });
                    }}
                    className="text-xs font-mono text-[#53D8F0] hover:underline"
                  >
                    Submit another application
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="p-8 sm:p-10 rounded-3xl bg-[#171C2B] border border-white/10 shadow-2xl space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold font-display text-white">
                    Membership Registration (入部申請書)
                  </h3>
                  <p className="text-xs text-[#A6ADBD] mt-1">
                    Fill in your details below. All fields are required.
                  </p>
                </div>

                {/* Full Name & College Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#F5EBDD] mb-1.5">
                      Full Name (氏名) *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Divyam Sen"
                      className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-xs text-white placeholder-[#A6ADBD] focus:outline-none transition-colors ${
                        errors.fullName ? 'border-red-500' : 'border-white/10 focus:border-[#E63946]'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#F5EBDD] mb-1.5">
                      College Email (学内メール) *
                    </label>
                    <input
                      type="email"
                      value={formData.collegeEmail}
                      onChange={(e) => setFormData({ ...formData, collegeEmail: e.target.value })}
                      placeholder="student@college.edu"
                      className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-xs text-white placeholder-[#A6ADBD] focus:outline-none transition-colors ${
                        errors.collegeEmail ? 'border-red-500' : 'border-white/10 focus:border-[#E63946]'
                      }`}
                    />
                    {errors.collegeEmail && (
                      <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.collegeEmail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Department & Year of Study */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#F5EBDD] mb-1.5">
                      Department / Major (専攻学部) *
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Computer Science, Humanities, Design"
                      className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-xs text-white placeholder-[#A6ADBD] focus:outline-none transition-colors ${
                        errors.department ? 'border-red-500' : 'border-white/10 focus:border-[#E63946]'
                      }`}
                    />
                    {errors.department && (
                      <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.department}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#F5EBDD] mb-1.5">
                      Year of Study (学年) *
                    </label>
                    <select
                      value={formData.yearOfStudy}
                      onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl bg-[#171C2B] border text-xs text-white focus:outline-none transition-colors ${
                        errors.yearOfStudy ? 'border-red-500' : 'border-white/10 focus:border-[#E63946]'
                      }`}
                    >
                      <option value="">Select current year...</option>
                      <option value="1st Year (Freshman)">1st Year (Freshman / 1年次)</option>
                      <option value="2nd Year (Sophomore)">2nd Year (Sophomore / 2年次)</option>
                      <option value="3rd Year (Junior)">3rd Year (Junior / 3年次)</option>
                      <option value="4th Year (Senior)">4th Year (Senior / 4年次)</option>
                      <option value="Postgraduate / Master's">Postgraduate / Master's (大学院)</option>
                    </select>
                    {errors.yearOfStudy && (
                      <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.yearOfStudy}
                      </p>
                    )}
                  </div>
                </div>

                {/* Areas of Interest Checkboxes */}
                <div>
                  <label className="block text-xs font-medium text-[#F5EBDD] mb-2">
                    Areas of Interest (Select at least one) *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {interestOptions.map((opt) => {
                      const isChecked = formData.interests.includes(opt);
                      return (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => handleInterestToggle(opt)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                            isChecked
                              ? 'bg-[#E63946]/20 border-[#E63946] text-white font-semibold'
                              : 'bg-white/5 border-white/5 text-[#A6ADBD] hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <span>{opt}</span>
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center text-[10px] border ${
                              isChecked
                                ? 'bg-[#E63946] border-[#E63946] text-white'
                                : 'border-white/20'
                            }`}
                          >
                            {isChecked && '✓'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.interests && (
                    <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.interests}
                    </p>
                  )}
                </div>

                {/* Reason for joining */}
                <div>
                  <label className="block text-xs font-medium text-[#F5EBDD] mb-1.5">
                    Why do you wish to join the Japanese Club? (志望理由) *
                  </label>
                  <textarea
                    rows={4}
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Tell us what excites you about Japan, whether language, art, anime, culture, or friendship..."
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-xs text-white placeholder-[#A6ADBD] focus:outline-none transition-colors ${
                      errors.reason ? 'border-red-500' : 'border-white/10 focus:border-[#E63946]'
                    }`}
                  />
                  {errors.reason && (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.reason}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-[#E63946] hover:bg-[#d62839] text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#E63946]/40 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>SUBMIT APPLICATION & GET MEMBER PASS (入部申請を送信)</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
