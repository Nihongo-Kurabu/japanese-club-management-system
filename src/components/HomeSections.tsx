
import {
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  Heart,
  BookOpen,
  Film,
  Flame,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';

import { NavSection } from './Navbar';
import {
  LEADERSHIP_TEAM,
  UPCOMING_EVENTS,
  ClubEvent
} from '../data/clubData';

import { useState } from 'react';
import LeadershipProfileModal from './LeadershipProfileModal';
import type { TeamMember } from '../data/clubData';

interface HomeSectionsProps {
  onNavigate: (section: NavSection) => void;
  onSelectEvent: (event: ClubEvent) => void;
}

export default function HomeSections({
  onNavigate,
  onSelectEvent
}: HomeSectionsProps) {

  const [selectedMember, setSelectedMember] =
    useState<TeamMember | null>(null);

  return (
    <div className="relative z-10 w-full overflow-hidden bg-[#080A12]">

      {/* =========================================================
          SECTION A: OUR WORLD
          ========================================================= */}

      <section
        id="our-world-section"
        className="py-24 sm:py-32 relative border-t border-white/5"
      >

        <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#7652D6]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Visual Cinematic Landscape Frame */}

            <div className="lg:col-span-6 relative">

              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">

                <img
                  src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80"
                  alt="Traditional Japanese Pagoda and Kyoto scenery"
                  className="w-full h-[400px] sm:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#080A12] via-transparent to-transparent opacity-80" />

                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#171C2B]/85 backdrop-blur-md border border-white/10">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="w-9 h-9 rounded-lg bg-[#E63946]/20 border border-[#E63946]/40 flex items-center justify-center text-[#E63946] font-serif font-bold">
                        和
                      </div>

                      <div>
                        <h4 className="text-white font-semibold text-sm">
                          Wa (和) — Harmony & Unity
                        </h4>

                        <p className="text-xs text-[#A6ADBD]">
                          Our foundational guiding principle
                        </p>
                      </div>

                    </div>

                    <span className="text-xs font-mono text-[#53D8F0] px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      千年の絆
                    </span>

                  </div>
                </div>

              </div>

              {/* Decorative Japanese stamps */}

              <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full border border-[#E63946]/50 bg-[#E63946]/10 flex items-center justify-center text-[#E63946] font-serif text-lg font-bold shadow-lg shadow-[#E63946]/30 hidden sm:flex">
                桜
              </div>

            </div>

            {/* Editorial Storytelling */}

            <div className="lg:col-span-6 flex flex-col justify-center">

              <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#53D8F0] uppercase mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#53D8F0]" />
                Section 01 • 私たちの世界
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white uppercase leading-[1.1]">
                MORE THAN A CLUB. <br />

                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] via-[#F5EBDD] to-[#53D8F0]">
                  IT'S A CULTURE.
                </span>
              </h2>

              <p className="mt-6 text-base sm:text-lg text-[#A6ADBD] leading-relaxed font-light">
                Founded to bridge the rich heritage of Japan with our college community, the{' '}
                <strong className="text-white font-semibold">
                  Komorebi Japanese Club
                </strong>{' '}
                is a dynamic sanctuary for students passionate about Japanese language, traditional arts,
                anime storytelling, technology, and mutual cultural exchange.
              </p>

              <p className="mt-4 text-sm sm:text-base text-[#A6ADBD]/90 leading-relaxed font-light">
                Whether deciphering ancient Kanji brushstrokes, analyzing sakuga frame rates in
                masterpiece anime, wearing a Yukata at our campus matsuri, or sharing warm matcha tea,
                you belong here.
              </p>

              {/* Three Pillars Stat Badges */}

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">

                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                    10+
                  </p>
                  <p className="text-xs text-[#A6ADBD] mt-1 font-sans">
                    Active Members (部員)
                  </p>
                </div>

                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold font-mono text-[#E63946]">
                    24+
                  </p>
                  <p className="text-xs text-[#A6ADBD] mt-1 font-sans">
                    Annual Events (行事)
                  </p>
                </div>

                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold font-mono text-[#53D8F0]">
                    100%
                  </p>
                  <p className="text-xs text-[#A6ADBD] mt-1 font-sans">
                    Welcome to All (歓迎)
                  </p>
                </div>

              </div>

              <div className="mt-8 flex items-center gap-4">

                <button
                  onClick={() => onNavigate('about')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white group hover:text-[#53D8F0] transition-colors"
                >
                  <span>Read our full club story & vision</span>

                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

              </div>

            </div>

          </div>
        </div>
      </section>


      {/* =========================================================
          SECTION B: EXPLORE JAPAN
          ========================================================= */}

      <section className="py-24 bg-[#111522] relative border-t border-white/5">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16">

            <span className="text-xs font-mono tracking-widest text-[#E63946] uppercase">
              Core Pillars • 日本の四大探求
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-white mt-2 uppercase tracking-tight">
              EXPLORE JAPAN WITH US
            </h2>

            <p className="mt-4 text-[#A6ADBD] text-sm sm:text-base font-light">
              Four curated avenues connecting timeless tradition with modern Japanese creative passion.
            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Card 1: Japanese Culture */}

            <div
              onClick={() => onNavigate('culture')}
              className="group relative rounded-2xl overflow-hidden bg-[#171C2B] border border-white/10 hover:border-[#E63946]/50 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer shadow-xl flex flex-col"
            >

              <div className="h-48 overflow-hidden relative">

                <img
                  src="https://civilisable.com/wp-content/uploads/2024/06/Japanese-Costume-8.6.2024-1080x605.jpg"
                  alt="Japanese Culture"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#171C2B] via-transparent to-transparent" />

                <span className="absolute top-4 right-4 text-xs font-serif text-[#F5EBDD] px-2.5 py-1 rounded bg-[#080A12]/80 backdrop-blur-md border border-white/10">
                  伝統文化
                </span>

              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">

                <div>

                  <div className="w-8 h-8 rounded-lg bg-[#E63946]/10 text-[#E63946] flex items-center justify-center mb-3">
                    <Heart className="w-4 h-4" />
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#E63946] transition-colors">
                    1. Japanese Culture
                  </h3>

                  <p className="text-xs text-[#A6ADBD] mt-2 line-clamp-3 leading-relaxed">
                    Festivals (Matsuri), tea ceremony, yukata, washoku cuisine, and sacred Torii shrines honoring centuries of aesthetic harmony.
                  </p>

                </div>

                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-[#E63946]">
                  <span>Discover traditions</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>

              </div>
            </div>


            {/* Card 2: Anime Universe */}

            <div
              onClick={() => onNavigate('events')}
              className="group relative rounded-2xl overflow-hidden bg-[#171C2B] border border-white/10 hover:border-[#7652D6]/70 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer shadow-xl flex flex-col"
            >

              <div className="h-48 overflow-hidden relative">

                <img
                  src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80"
                  alt="Anime Universe"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#171C2B] via-transparent to-transparent" />

                <span className="absolute top-4 right-4 text-xs font-serif text-[#F5EBDD] px-2.5 py-1 rounded bg-[#080A12]/80 backdrop-blur-md border border-white/10">
                  アニメの世界
                </span>

              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">

                <div>

                  <div className="w-8 h-8 rounded-lg bg-[#7652D6]/20 text-[#53D8F0] flex items-center justify-center mb-3">
                    <Film className="w-4 h-4" />
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#53D8F0] transition-colors">
                    2. Anime Universe
                  </h3>

                  <p className="text-xs text-[#A6ADBD] mt-2 line-clamp-3 leading-relaxed">
                    Analytical screenings, manga storyboarding, sakuga appreciation, cosplay showcases, and soundtrack orchestral appreciation.
                  </p>

                </div>

                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-[#53D8F0]">
                  <span>Explore anime nights</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>

              </div>
            </div>


            {/* Card 3: Language & Learning */}

            <div
              onClick={() => onNavigate('language')}
              className="group relative rounded-2xl overflow-hidden bg-[#171C2B] border border-white/10 hover:border-[#53D8F0]/60 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer shadow-xl flex flex-col"
            >

              <div className="h-48 overflow-hidden relative">

                <img
                  src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"
                  alt="Language and Calligraphy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#171C2B] via-transparent to-transparent" />

                <span className="absolute top-4 right-4 text-xs font-serif text-[#F5EBDD] px-2.5 py-1 rounded bg-[#080A12]/80 backdrop-blur-md border border-white/10">
                  日本語学習
                </span>

              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">

                <div>

                  <div className="w-8 h-8 rounded-lg bg-[#53D8F0]/10 text-[#53D8F0] flex items-center justify-center mb-3">
                    <BookOpen className="w-4 h-4" />
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#53D8F0] transition-colors">
                    3. Language & Learning
                  </h3>

                  <p className="text-xs text-[#A6ADBD] mt-2 line-clamp-3 leading-relaxed">
                    Interactive Hiragana, Katakana, essential N5 Kanji, native speech audio drills, JLPT study circles, and peer speaking practice.
                  </p>

                </div>

                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-[#53D8F0]">
                  <span>Open language portal</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>

              </div>
            </div>


            {/* Card 4: Events & Experiences */}

            <div
              onClick={() => onNavigate('events')}
              className="group relative rounded-2xl overflow-hidden bg-[#171C2B] border border-white/10 hover:border-[#E63946]/50 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer shadow-xl flex flex-col"
            >

              <div className="h-48 overflow-hidden relative">

                <img
                  src="https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80"
                  alt="Events and Experiences"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#171C2B] via-transparent to-transparent" />

                <span className="absolute top-4 right-4 text-xs font-serif text-[#F5EBDD] px-2.5 py-1 rounded bg-[#080A12]/80 backdrop-blur-md border border-white/10">
                  体験・行事
                </span>

              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">

                <div>

                  <div className="w-8 h-8 rounded-lg bg-[#E63946]/10 text-[#E63946] flex items-center justify-center mb-3">
                    <Flame className="w-4 h-4" />
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#E63946] transition-colors">
                    4. Events & Experiences
                  </h3>

                  <p className="text-xs text-[#A6ADBD] mt-2 line-clamp-3 leading-relaxed">
                    Campus Bunkasai festivals, handmade ramen workshops, calligraphy sessions, and Japanese culinary masterclasses.
                  </p>

                </div>

                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-[#E63946]">
                  <span>View upcoming lineup</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================
          SECTION C: UPCOMING EVENTS
          ========================================================= */}

      <section className="py-24 sm:py-32 relative border-t border-white/5">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">

            <div>

              <span className="text-xs font-mono tracking-widest text-[#53D8F0] uppercase">
                Gatherings & Sessions • 近日開催イベント
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-white mt-2 uppercase tracking-tight">
                UPCOMING CLUB EVENTS
              </h2>

            </div>

            <button
              onClick={() => onNavigate('events')}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#E63946] hover:text-white transition-colors"
            >
              <span>View all scheduled events</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {UPCOMING_EVENTS.slice(0, 2).map((event) => (

              <div
                key={event.id}
                className="group rounded-2xl bg-[#171C2B] border border-white/10 overflow-hidden shadow-2xl hover:border-[#E63946]/50 transition-all duration-300 flex flex-col sm:flex-row"
              >

                <div className="sm:w-2/5 h-64 sm:h-auto relative overflow-hidden">

                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-transparent to-[#171C2B]/80" />

                  <span className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#E63946] text-white">
                    {event.category}
                  </span>

                </div>

                <div className="sm:w-3/5 p-6 flex flex-col justify-between">

                  <div>

                    <span className="text-xs font-serif text-[#7652D6] font-medium block mb-1">
                      {event.japaneseTitle}
                    </span>

                    <h3 className="text-xl font-bold text-white group-hover:text-[#53D8F0] transition-colors leading-snug">
                      {event.title}
                    </h3>

                    <div className="mt-3 space-y-1.5 text-xs text-[#A6ADBD]">

                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#E63946]" />
                        <span>{event.date} • {event.time}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#53D8F0]" />
                        <span className="line-clamp-1">{event.venue}</span>
                      </div>

                    </div>

                    <p className="mt-3 text-xs text-[#A6ADBD] line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">

                    <span className="text-xs font-mono text-white/60">
                      {event.registeredCount}/{event.capacity} registered
                    </span>

                    <button
                      onClick={() => onSelectEvent(event)}
                      className="px-4 py-2 rounded-lg bg-[#E63946] hover:bg-[#E63946]/90 text-white text-xs font-semibold tracking-wider transition-colors shadow-md shadow-[#E63946]/30"
                    >
                      REGISTER SEAT (席予約)
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>
        </div>
      </section>


      {/* =========================================================
          SECTION D: MEET OUR TEAM
          INTERACTIVE LEADERSHIP CARDS
          ========================================================= */}

      <section className="py-24 bg-[#111522] relative border-t border-white/5">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16">

            <span className="text-xs font-mono tracking-widest text-[#53D8F0] uppercase">
              Leadership & Mentors • 幹部と先輩
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-white mt-2 uppercase tracking-tight">
              MEET OUR LEADERSHIP
            </h2>

            <p className="mt-4 text-[#A6ADBD] text-sm sm:text-base font-light">
              Guided by dedicated student officers and esteemed Senpai mentors fostering a vibrant, inclusive community.
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {LEADERSHIP_TEAM.map((member) => {

              const isSenpai = member.category === 'senpai';
              const isPranav = member.name === 'Pranav';

              return (

                <div
                  key={member.name}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${member.name}'s full profile`}
                  onClick={() => setSelectedMember(member)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedMember(member);
                    }
                  }}
                  className={`group rounded-2xl p-5 border transition-all duration-300 relative flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#53D8F0] ${
                    isSenpai
                      ? 'bg-gradient-to-b from-[#171C2B] to-[#1a172e] border-[#7652D6]/40 hover:border-[#7652D6]'
                      : 'bg-[#171C2B] border-white/10 hover:border-[#E63946]/50'
                  }`}
                >

                  {/* Avatar / Portrait */}

                  <div>

                    <div className="relative w-full h-56 rounded-xl overflow-hidden mb-4">

                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-[#171C2B] via-transparent to-transparent opacity-70" />

                      {/* Mentor Badge */}

                      {isSenpai && (
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#7652D6] text-white text-[10px] font-mono tracking-wider font-semibold shadow-lg flex items-center gap-1">
                          <Award className="w-3 h-3 text-[#53D8F0]" />
                          <span>SENPAI MENTOR (先輩)</span>
                        </div>
                      )}

                      {/* Pranav Designation */}

                      {isPranav && (
                        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-[#53D8F0]/20 border border-[#53D8F0]/60 text-[#53D8F0] text-[10px] font-mono font-medium backdrop-blur-md">
                          Dual Role (二重役職)
                        </div>
                      )}

                      <div className="absolute bottom-2 right-3 font-serif text-lg text-white/50 tracking-wider">
                        {member.japaneseName}
                      </div>

                    </div>

                    {/* Member Details */}

                    <div>

                      <h3 className="text-lg font-bold text-white group-hover:text-[#53D8F0] transition-colors flex items-center justify-between">
                        <span>{member.name}</span>

                        <span className="text-xs font-serif text-[#A6ADBD]">
                          {member.japaneseName}
                        </span>
                      </h3>

                      {/* Designations */}

                      <div className="mt-1 space-y-0.5">

                        {member.roles.map((role, idx) => (

                          <p
                            key={idx}
                            className={`text-xs font-semibold ${
                              isSenpai
                                ? 'text-[#53D8F0]'
                                : 'text-[#E63946]'
                            }`}
                          >
                            {role}
                          </p>

                        ))}

                      </div>

                      <p className="mt-3 text-xs text-[#A6ADBD] leading-relaxed line-clamp-3">
                        {member.bio}
                      </p>

                    </div>

                  </div>

                  {/* Skill / Interest Tags */}

                  <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-1.5">

                    {member.tags.map((tag) => (

                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#A6ADBD] border border-white/5"
                      >
                        {tag}
                      </span>

                    ))}

                  </div>

                </div>

              );

            })}

          </div>
        </div>
      </section>


      {/* =========================================================
          SECTION E: JAPANESE QUOTE
          ========================================================= */}

      <section className="relative py-28 overflow-hidden flex items-center justify-center text-center">

        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=2000&q=80')`,
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[#080A12] via-[#080A12]/80 to-[#080A12]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">

          <div className="w-12 h-1 bg-[#E63946] mx-auto mb-6" />

          {/* Japanese Proverb */}

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black tracking-widest text-[#F5EBDD] drop-shadow-2xl">
            七転び八起き
          </h2>

          <p className="mt-2 text-sm sm:text-base font-mono text-[#53D8F0] tracking-widest uppercase">
            Nana korobi ya oki
          </p>

          <p className="mt-4 text-xl sm:text-2xl font-serif italic text-white font-medium">
            "Fall seven times, stand up eight."
          </p>

          <p className="mt-4 max-w-xl mx-auto text-xs sm:text-sm text-[#A6ADBD] leading-relaxed font-light">
            An age-old Japanese philosophy reminding us that resilience, camaraderie, and dedication
            will always carry us forward through every challenge in learning and life.
          </p>

        </div>
      </section>


      {/* =========================================================
          SECTION F: FINAL CTA
          ========================================================= */}

      <section className="py-24 relative bg-gradient-to-b from-[#080A12] to-[#111522] border-t border-white/5">

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] text-xs font-mono mb-6">
            <span>入部登録案内</span>
            <span>•</span>
            <span>All Departments Welcome</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display text-white uppercase tracking-tight">
            YOUR JAPANESE JOURNEY <br />
            <span className="text-[#E63946]">STARTS HERE.</span>
          </h2>

          <p className="mt-4 text-base sm:text-xl font-mono text-[#53D8F0] tracking-wider uppercase">
            Discover. Learn. Explore. Connect.
          </p>

          <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-[#A6ADBD] font-light">
            Join hundreds of fellow students exploring Japanese traditions, language, anime art, and lifelong friendships.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">

            <button
              onClick={() => onNavigate('join')}
              className="relative group overflow-hidden w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-[#E63946] via-[#d62839] to-[#7652D6] text-white font-extrabold text-sm sm:text-base tracking-widest uppercase transition-all duration-300 shadow-[0_0_35px_rgba(230,57,70,0.55),0_0_12px_rgba(83,216,240,0.35)] hover:shadow-[0_0_55px_rgba(230,57,70,0.85),0_0_25px_rgba(83,216,240,0.6)] hover:scale-105 active:scale-95 flex items-center justify-center gap-3 border border-white/30 hover:border-[#53D8F0]"
            >

              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

              <Sparkles className="w-4 h-4 text-[#53D8F0] animate-pulse" />

              <span className="relative z-10 drop-shadow-md">
                JOIN THE CLUB
              </span>

              <span className="relative z-10 px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-white font-serif text-xs font-black tracking-normal backdrop-blur-sm">
                入部申込
              </span>

            </button>

            <button
              onClick={() => onNavigate('contact')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#111522]/90 hover:bg-[#171C2B] text-white font-semibold text-sm tracking-wider uppercase border border-white/15 hover:border-white/30 transition-all shadow-lg hover:scale-102"
            >
              <span>CONTACT OFFICERS (相談)</span>
            </button>

          </div>
        </div>
      </section>


      {/* =========================================================
          LEADERSHIP PROFILE MODAL
          ========================================================= */}

      <LeadershipProfileModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />

    </div>
  );
}
