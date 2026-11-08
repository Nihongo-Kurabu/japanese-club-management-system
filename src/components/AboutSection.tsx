import { Compass, Target, Sparkles, Shield, Heart, Award, ArrowRight } from 'lucide-react';
import { NavSection } from './Navbar';
import { LEADERSHIP_TEAM } from '../data/clubData';

interface AboutSectionProps {
  onNavigate: (section: NavSection) => void;
}

export default function AboutSection({ onNavigate }: AboutSectionProps) {
  return (
    <div className="pt-24 pb-20 bg-[#080A12] min-h-screen text-[#F5EBDD]">
      {/* Header Banner */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-white/5">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2000&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080A12] via-[#080A12]/80 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] text-xs font-mono mb-4">
            <span>クラブについて</span>
            <span>•</span>
            <span>ABOUT KOMOREBI</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-display uppercase tracking-tight text-white">
            WEAVING TRADITION, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] via-[#F5EBDD] to-[#53D8F0]">
              PASSION & COMMUNITY
            </span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-[#A6ADBD] font-light leading-relaxed">
            "Komorebi" (木漏れ日) expresses the gentle sunlight filtering through the trees.
            We are our university's official student society uniting minds fascinated by Japan's
            timeless arts, language, and contemporary storytelling.
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision */}
          <div className="p-8 sm:p-10 rounded-2xl bg-[#171C2B] border border-white/10 relative overflow-hidden group hover:border-[#53D8F0]/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#53D8F0]/10 text-[#53D8F0] flex items-center justify-center mb-6">
              <Compass className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono text-[#53D8F0] uppercase tracking-widest block mb-2">
              Our Vision • 志 (Kokorozashi)
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-4">
              A Global Window to Japanese Culture
            </h2>
            <p className="text-[#A6ADBD] leading-relaxed text-sm sm:text-base font-light">
              To be the premier university student hub for cultural understanding and cross-cultural
              dialogue, giving students genuine immersion into Japanese language fluency, heritage
              preservation, and creative media analysis.
            </p>
          </div>

          {/* Mission */}
          <div className="p-8 sm:p-10 rounded-2xl bg-[#171C2B] border border-white/10 relative overflow-hidden group hover:border-[#E63946]/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center mb-6">
              <Target className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono text-[#E63946] uppercase tracking-widest block mb-2">
              Our Mission • 使命 (Shimei)
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-4">
              Empowerment Through Authentic Practice
            </h2>
            <p className="text-[#A6ADBD] leading-relaxed text-sm sm:text-base font-light">
              To organize experiential workshops, certified JLPT peer study circles, festive matsuri
              celebrations, and analytical anime forums that enrich student life and nurture mutual
              respect (思いやり) and enduring bonds.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values: 和・誠・絆 */}
      <section className="py-16 bg-[#111522] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono text-[#7652D6] tracking-widest uppercase">
              Club Philosophy • 三大精神
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-1">
              OUR GUIDING VALUES
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#171C2B] border border-white/5 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#E63946]/15 border border-[#E63946]/30 flex items-center justify-center text-[#E63946] font-serif text-3xl font-black mb-4">
                和
              </div>
              <h3 className="text-lg font-bold text-white">Wa (和) — Harmony</h3>
              <p className="mt-2 text-xs text-[#A6ADBD] leading-relaxed">
                Prioritizing collective warmth, respectful communication, and collaborative unity above all.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#171C2B] border border-white/5 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#7652D6]/20 border border-[#7652D6]/40 flex items-center justify-center text-[#7652D6] font-serif text-3xl font-black mb-4">
                誠
              </div>
              <h3 className="text-lg font-bold text-white">Makoto (誠) — Sincerity</h3>
              <p className="mt-2 text-xs text-[#A6ADBD] leading-relaxed">
                Approaching traditional arts and language study with genuine diligence, honesty, and pure heart.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#171C2B] border border-white/5 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#53D8F0]/15 border border-[#53D8F0]/30 flex items-center justify-center text-[#53D8F0] font-serif text-3xl font-black mb-4">
                絆
              </div>
              <h3 className="text-lg font-bold text-white">Kizuna (絆) — Enduring Bonds</h3>
              <p className="mt-2 text-xs text-[#A6ADBD] leading-relaxed">
                Forging lifelong friendships that transcend college semesters and extend into global careers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Senpai-Kohai Mentorship Heritage */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#171C2B] via-[#1a172e] to-[#171C2B] border border-[#7652D6]/30 p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7652D6]/20 border border-[#7652D6]/40 text-[#53D8F0] text-xs font-mono mb-4">
                <Award className="w-3.5 h-3.5" />
                <span>先輩後輩の伝統 (Senpai-Kohai Mentorship)</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-white">
                LEARNING FROM EXPERIENCED SENPAI
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#A6ADBD] leading-relaxed font-light">
                In Japanese tradition, the <em>Senpai-Kohai</em> (senior-junior) relationship is not
                hierarchical; it is a sacred mentorship of stewardship and encouragement. Our senior
                mentors, <strong className="text-white">Ankitha Didi</strong> and{' '}
                <strong className="text-white">Sameer Bhaiya</strong>, work alongside the core
                officers to guide new members, offer academic advice on Japanese scholarships, and
                ensure an uplifting environment for all.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono text-[#F5EBDD]/80">
                <span className="px-3 py-1 rounded bg-white/5 border border-white/10">
                  ✓ 1-on-1 JLPT Guidance
                </span>
                <span className="px-3 py-1 rounded bg-white/5 border border-white/10">
                  ✓ Cultural Workshop Co-hosting
                </span>
                <span className="px-3 py-1 rounded bg-white/5 border border-white/10">
                  ✓ Alumni Career Sharing
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="w-32 h-32 rounded-full border-2 border-[#E63946] flex flex-col items-center justify-center p-2 bg-[#080A12] shadow-xl shadow-[#E63946]/30">
                <span className="font-serif text-3xl font-black text-[#E63946]">先輩</span>
                <span className="text-[10px] font-mono tracking-widest text-[#53D8F0] uppercase mt-1">
                  SENPAI CARE
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <div className="text-center pt-8">
        <button
          onClick={() => onNavigate('join')}
          className="px-8 py-3.5 rounded-full bg-[#E63946] hover:bg-[#d62839] text-white font-bold text-sm tracking-wider uppercase transition-all shadow-xl shadow-[#E63946]/40 inline-flex items-center gap-2"
        >
          <span>BECOME PART OF OUR TRADITION</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
