import {
  GraduationCap,
  Award,
  BookOpen,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users
} from 'lucide-react';
import { NavSection } from './Navbar';
import { FACULTY_ADVISOR } from '../data/clubData';

interface FacultySectionProps {
  onNavigate: (section: NavSection) => void;
}

export default function FacultySection({ onNavigate }: FacultySectionProps) {
  const advisor = FACULTY_ADVISOR;

  return (
    <div className="pt-24 pb-24 bg-[#080A12] min-h-screen text-[#F5EBDD]">
      {/* Header Banner */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-white/5">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2000&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080A12] via-[#080A12]/85 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] text-xs font-mono">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>大学教員・顧問紹介 • FACULTY ADVISORY</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-display uppercase tracking-tight text-white leading-tight">
            ACADEMIC PATRONAGE & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] via-[#F5EBDD] to-[#53D8F0]">
              FACULTY LEADERSHIP
            </span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-[#A6ADBD] font-light leading-relaxed">
            Bridging institutional excellence, rigorous Japanese pedagogy, and bilateral academic partnerships
            for our college community.
          </p>
        </div>
      </section>

      {/* Main Faculty In-Depth Profile */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="rounded-3xl bg-[#0F131F] border border-white/10 p-6 sm:p-10 lg:p-14 shadow-2xl relative overflow-hidden">
          {/* Subtle Japanese Watermark */}
          <div className="absolute -right-8 -bottom-10 text-9xl sm:text-[180px] font-serif text-white/[0.02] select-none pointer-events-none">
            顧問
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left: Faculty Portrait & Contact Info */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-sm sm:max-w-md rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl group">
                <img
                  src={advisor.image}
                  alt={advisor.name}
                  className="w-full h-[480px] object-cover object-top group-hover:scale-102 transition-transform duration-700"
                />

                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F131F] via-transparent to-transparent opacity-80" />

                {/* Hanko Official Red Seal */}
                <div className="absolute top-4 right-4 px-3 py-2 rounded-xl border-2 border-[#E63946] bg-[#080A12]/90 backdrop-blur-md flex flex-col items-center justify-center text-[#E63946] font-serif font-black text-xs shadow-lg shadow-[#E63946]/30">
                  <span>田中</span>
                  <span className="text-[10px]">印</span>
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[#080A12]/85 backdrop-blur-md border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-bold text-base">{advisor.name}</h3>
                      <p className="text-xs text-[#53D8F0] font-mono">{advisor.japaneseName}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-[#E63946]/20 border border-[#E63946]/40 text-[#E63946] font-mono text-[10px] font-semibold">
                      FACULTY ADVISOR
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Contact & Office Box */}
              <div className="w-full max-w-sm sm:max-w-md mt-6 p-4 rounded-xl bg-[#080A12] border border-white/5 space-y-2 text-xs text-[#A6ADBD]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#E63946] shrink-0" />
                  <span>{advisor.office}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#53D8F0] shrink-0" />
                  <a href={`mailto:${advisor.email}`} className="text-[#53D8F0] hover:underline">
                    {advisor.email}
                  </a>
                </div>
                <div className="flex items-start gap-2 pt-1">
                  <Clock className="w-4 h-4 text-[#F5EBDD] shrink-0 mt-0.5" />
                  <span>{advisor.consultationHours}</span>
                </div>
              </div>
            </div>

            {/* Right: Detailed Biography, Welcome Message & Credentials */}
            <div className="lg:col-span-7 space-y-8">
              {/* Header Titles */}
              <div className="space-y-2 border-b border-white/10 pb-6">
                <span className="text-xs font-mono text-[#53D8F0] uppercase tracking-wider block">
                  {advisor.department}
                </span>
                <h2 className="text-2xl sm:text-4xl font-black font-display text-white">
                  {advisor.name}
                </h2>
                <p className="text-sm font-semibold text-[#E63946]">
                  {advisor.role} • {advisor.japaneseName}
                </p>
                <p className="text-xs text-[#F5EBDD]/90 flex items-center gap-2 pt-1 font-mono">
                  <GraduationCap className="w-4 h-4 text-[#53D8F0]" />
                  <span>{advisor.education}</span>
                </p>
              </div>

              {/* Academic Credentials Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {advisor.credentials.map((cred, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[#171C2B] border border-white/5 flex items-start gap-2.5 text-xs text-[#F5EBDD]"
                  >
                    <Award className="w-4 h-4 text-[#E63946] shrink-0 mt-0.5" />
                    <span className="leading-snug">{cred}</span>
                  </div>
                ))}
              </div>

              {/* Advisor's Welcome Quote */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#E63946]/10 to-[#7652D6]/10 border border-[#E63946]/30 relative">
                <div className="text-xs font-mono text-[#E63946] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>顧問からのメッセージ • ADVISOR'S MESSAGE TO STUDENTS</span>
                </div>
                <blockquote className="text-xs sm:text-sm text-[#F5EBDD] italic leading-relaxed">
                  "{advisor.welcomeMessage}"
                </blockquote>
              </div>

              {/* In-depth About Narrative */}
              <div className="space-y-3 text-xs sm:text-sm text-[#A6ADBD] leading-relaxed font-light">
                <p>{advisor.about}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('jlpt')}
                  className="px-6 py-3 rounded-xl bg-[#E63946] hover:bg-[#E63946]/90 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#E63946]/30 flex items-center gap-2 transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>JLPT Portal (日本語能力試験)</span>
                </button>
                <a
                  href={`mailto:${advisor.email}?subject=Komorebi%20Japanese%20Club%20-%20Student%20Advisory%20Inquiry`}
                  className="px-6 py-3 rounded-xl bg-[#171C2B] hover:bg-[#20273c] text-white font-semibold text-xs uppercase tracking-wider border border-white/10 flex items-center gap-2 transition-all"
                >
                  <Mail className="w-4 h-4 text-[#53D8F0]" />
                  <span>Request Academic Advisory</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Initiatives Spearheaded by Faculty */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-mono text-[#53D8F0] uppercase tracking-wider">
            Curricular Focus • 指導方針
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-display text-white">
            KEY FACULTY INITIATIVES
          </h2>
          <p className="text-xs sm:text-sm text-[#A6ADBD]">
            Core programs championed by our faculty advisor for student academic advancement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {advisor.initiatives.map((init, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-[#111522] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-mono text-[#E63946]">0{i + 1} • {init.japaneseTitle}</span>
                <h3 className="text-lg font-bold text-white mt-2 mb-3">{init.title}</h3>
                <p className="text-xs text-[#A6ADBD] leading-relaxed">{init.description}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-[11px] text-[#53D8F0]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Institutional Standard</span>
              </div>
            </div>
          ))}
        </div>

        {/* Leadership Alliance Banner */}
        <div className="mt-12 p-8 rounded-2xl bg-[#111522] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-white">
              Student Leadership & Faculty Guidance
            </h3>
            <p className="text-xs text-[#A6ADBD] max-w-xl">
              Prof. Dr. Haruto Tanaka works closely with student leaders Divyam, Ridhi, Pranav, Divyanka, Rishika,
              and club senpais Ankita and Sameer to empower every member.
            </p>
          </div>
          <button
            onClick={() => onNavigate('about')}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#E63946] to-[#7652D6] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#E63946]/30 hover:scale-105 transition-all shrink-0 flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>Meet Our Student Leadership</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
