import clubLogo from '../assets/images/Sakura_Themed_Logo.png';
import cmritLogo from '../assets/images/cmrit_logo.png';
import { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Menu,
  X,
  Compass,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { ambienceEngine } from '../utils/audio';

export type NavSection =
  | 'home'
  | 'about'
  | 'culture'
  | 'faculty'
  | 'events'
  | 'language'
  | 'jlpt'
  | 'gallery'
  | 'announcements'
  | 'join'
  | 'contact'
  | 'admin';

interface NavbarProps {
  currentSection: NavSection;
  onNavigate: (section: NavSection) => void;
  isPetalsActive: boolean;
  onTogglePetals: () => void;
}

const NAV_ITEMS: {
  id: NavSection;
  label: string;
  japanese: string;
}[] = [
  { id: 'home', label: 'Home', japanese: 'ホーム' },
  { id: 'about', label: 'About', japanese: 'クラブ紹介' },
  { id: 'culture', label: 'Culture', japanese: '日本文化' },
  { id: 'faculty', label: 'Faculty', japanese: '教員・顧問' },
  { id: 'events', label: 'Events & Workshops', japanese: '催し物' },
  { id: 'language', label: 'Language', japanese: '日本語学習' },
  { id: 'jlpt', label: 'JLPT Exam', japanese: '能力試験' },
  { id: 'gallery', label: 'Gallery', japanese: '写真館' },
  { id: 'announcements', label: 'Announcements', japanese: 'お知らせ' },
  { id: 'contact', label: 'Contact', japanese: 'お問い合わせ' },
];

// Desktop: show the main links and place the remaining links in More.
const PRIMARY_NAV_ITEMS = NAV_ITEMS.slice(0, 6);
const MORE_NAV_ITEMS = NAV_ITEMS.slice(6);

export default function Navbar({
  currentSection,
  onNavigate,
  isPetalsActive,
  onTogglePetals,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the More dropdown when clicking outside or pressing Escape.
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setMoreMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMoreMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleToggleSound = () => {
    const state = ambienceEngine.toggle();
    setIsPlayingAudio(state);
  };

  const handleSelectNav = (id: NavSection) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isMoreActive = MORE_NAV_ITEMS.some(
    (item) => item.id === currentSection
  );

  return (
    <>
      {/* Responsive Floating Header */}
      <header
        className={`cmrit-header
          fixed top-3 sm:top-4 left-1/2 -translate-x-1/2
          w-[calc(100%-16px)] sm:w-[calc(100%-32px)]
          max-w-[1600px] z-50
          rounded-xl sm:rounded-2xl
          !bg-transparent
          !border-transparent
          !shadow-none
          !backdrop-blur-none
          transition-all duration-300
          py-2.5 sm:py-3
        `}
      >
        <div className="cmrit-header-layout w-full px-2.5 sm:px-4 lg:px-5 grid items-center gap-x-2 gap-y-1">
          <img
            src={cmritLogo}
            alt="CMR Institute of Technology 25 Years"
            className="cmrit-header-logo object-contain"
          />

          {/* BRAND */}
          <div className="cmrit-header-brand flex min-w-0 items-center">
            <button
              onClick={() => handleSelectNav('home')}
              className="flex items-center gap-2 sm:gap-3 group text-left focus:outline-none"
              aria-label="Japanese Club Home"
            >
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14
              shrink-0
              rounded-xl
              bg-gradient-to-br from-[#E63946] via-[#7652D6] to-[#53D8F0]
              p-[2px] shadow-lg shadow-[#E63946]/30
              group-hover:shadow-[#E63946]/60
              group-hover:scale-105
              transition-all duration-300">
              <div className="w-full h-full rounded-[10px] bg-[#080A12] overflow-hidden flex items-center justify-center">
                <img
                  src={clubLogo}
                  alt="Japanese Club Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

              <div className="cmrit-brand-copy min-w-0">
                <div className="cmrit-brand-title flex items-center gap-1.5 sm:gap-2">
                  <span className="font-bold tracking-wide sm:tracking-wider text-white text-[11px] sm:text-sm lg:text-lg group-hover:text-[#53D8F0] transition-colors whitespace-nowrap">
                    JAPANESE CLUB
                  </span>

                  <span className="text-[8px] sm:text-[10px] font-mono px-1 sm:px-2 py-0.5 rounded bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30 font-medium whitespace-nowrap">
                    日本語クラブ
                  </span>
                </div>

                <p className="text-[7px] sm:text-[9px] lg:text-[11px] text-[#A6ADBD] tracking-wider uppercase font-medium whitespace-nowrap">
                  Official
                </p>
              </div>
            </button>
          </div>

          {/* DESKTOP NAVIGATION */}
          <nav className="cmrit-header-desktop-nav min-w-0 items-center justify-center gap-0.5 bg-white/5 border border-white/10 rounded-full px-2 py-1.5 backdrop-blur-md">
            {PRIMARY_NAV_ITEMS.map((item) => {
              const isActive = currentSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectNav(item.id)}
                  className={`
                    cmrit-nav-item relative shrink-0 px-2.5 py-2 rounded-full
                    text-[11px] 2xl:text-xs font-medium
                    transition-all duration-200
                    flex items-center gap-1 whitespace-nowrap group
                    ${
                      isActive
                        ? 'text-white bg-[#E63946] shadow-md shadow-[#E63946]/40'
                        : 'text-[#A6ADBD] hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  <span>{item.label}</span>

                  <span
                    className={`cmrit-nav-japanese text-[9px] 2xl:text-[10px] font-jp ${
                      isActive
                        ? 'text-white/90'
                        : 'text-[#53D8F0]/80 group-hover:text-[#53D8F0]'
                    }`}
                  >
                    {item.japanese}
                  </span>
                </button>
              );
            })}

            {/* MORE DROPDOWN */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setMoreMenuOpen((previous) => !previous)}
                className={`
                  cmrit-nav-more flex shrink-0 items-center gap-1 px-2.5 py-2 rounded-full
                  text-[11px] 2xl:text-xs font-medium
                  transition-all duration-200 whitespace-nowrap
                  ${
                    isMoreActive || moreMenuOpen
                      ? 'bg-[#E63946] text-white'
                      : 'text-[#A6ADBD] hover:text-white hover:bg-white/10'
                  }
                `}
                aria-expanded={moreMenuOpen}
                aria-haspopup="true"
              >
                More
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    moreMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {moreMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 rounded-xl border border-white/10 bg-[#101522]/98 backdrop-blur-2xl shadow-2xl p-2 z-[60]">
                  {MORE_NAV_ITEMS.map((item) => {
                    const isActive = currentSection === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectNav(item.id)}
                        className={`
                          w-full flex items-center justify-between
                          px-3 py-3 rounded-lg text-left
                          transition-colors
                          ${
                            isActive
                              ? 'bg-[#E63946]/20 text-white'
                              : 'text-[#A6ADBD] hover:bg-white/10 hover:text-white'
                          }
                        `}
                      >
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                        <span className="text-xs text-[#53D8F0] font-jp">
                          {item.japanese}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* HEADER CONTROLS */}
          <div className="cmrit-header-actions flex shrink-0 items-center gap-1 sm:gap-1.5 lg:gap-2">

            {/* SOUND */}
            <button
              onClick={handleToggleSound}
              className={`
                p-2 sm:p-2.5 rounded-full border transition-all duration-200
                ${
                  isPlayingAudio
                    ? 'bg-[#7652D6]/20 border-[#7652D6] text-[#53D8F0]'
                    : 'bg-white/5 border-white/10 text-[#A6ADBD] hover:text-white hover:border-white/20'
                }
              `}
              title={isPlayingAudio ? 'Mute ambient sound' : 'Play Japanese ambience'}
              aria-label="Toggle ambient Japanese sound"
            >
              {isPlayingAudio ? (
                <Volume2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              ) : (
                <VolumeX className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              )}
            </button>

            {/* SAKURA PETALS */}
            <button
              onClick={onTogglePetals}
              className={`
                p-2 sm:p-2.5 rounded-full border transition-all duration-200
                ${
                  isPetalsActive
                    ? 'bg-[#E63946]/20 border-[#E63946] text-[#E63946]'
                    : 'bg-white/5 border-white/10 text-[#A6ADBD] hover:text-white hover:border-white/20'
                }
              `}
              title={isPetalsActive ? 'Disable falling petals' : 'Enable falling petals'}
              aria-label="Toggle falling cherry blossom petals"
            >
              <Sparkles className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>

            {/* JOIN CTA */}
            <button
              onClick={() => handleSelectNav('join')}
              className="
                cmrit-join-cta hidden items-center justify-center gap-1.5
                px-3 sm:px-4 lg:px-5 py-2
                rounded-full
                bg-gradient-to-r from-[#E63946] via-[#d62839] to-[#7652D6]
                text-white text-[10px] sm:text-xs font-bold tracking-wide
                whitespace-nowrap
                border border-white/25
                shadow-[0_0_18px_rgba(230,57,70,0.35)]
                hover:shadow-[0_0_28px_rgba(230,57,70,0.6)]
                hover:scale-[1.03] active:scale-95
                transition-all duration-300
              "
            >
              JOIN THE CLUB
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20">
                入部
              </span>
            </button>

            {/* TABLET AND MOBILE MENU */}
            <button
              onClick={() => setMobileMenuOpen((previous) => !previous)}
              className="
                cmrit-header-menu p-2 sm:p-2.5
                rounded-lg bg-white/5 border border-white/10
                text-white hover:bg-white/10 transition-colors
              "
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

        </div>
      </header>

      {/* TABLET AND MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Japanese Club Navigation"
          className="
            fixed inset-0 z-40
            bg-[#080A12]/98 backdrop-blur-2xl
            cmrit-header-drawer
            flex flex-col
            pt-24 sm:pt-28
            px-4 sm:px-6
            pb-8
            overflow-y-auto
          "
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <div>
              <p className="text-xs uppercase font-mono text-[#53D8F0]">
                Navigation Menu
              </p>
              <p className="text-sm font-serif text-white">
                目次 (Table of Contents)
              </p>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-white/60 hover:text-white p-2"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {NAV_ITEMS.map((item, idx) => {
              const isActive = currentSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectNav(item.id)}
                  className={`
                    flex items-center justify-between
                    p-3 sm:p-4 rounded-xl border
                    transition-all text-left
                    ${
                      isActive
                        ? 'bg-[#E63946]/20 border-[#E63946] text-white shadow-lg shadow-[#E63946]/20'
                        : 'bg-white/5 border-white/5 text-[#A6ADBD] hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-[#7652D6]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    <span className="font-medium text-sm sm:text-base text-white">
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-serif text-[#A6ADBD]">
                      {item.japanese}
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/40" />
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-3">
            <button
              onClick={() => handleSelectNav('join')}
              className="
                w-full py-3.5 rounded-xl
                bg-gradient-to-r from-[#E63946] to-[#7652D6]
                text-white font-bold text-center
                shadow-lg shadow-[#E63946]/30
                flex items-center justify-center gap-2
              "
            >
              JOIN THE CLUB
              <span className="text-xs opacity-80">(入部申込)</span>
            </button>

            <div className="flex items-center justify-between text-xs text-[#A6ADBD] px-2 pt-2">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#53D8F0]" />
                Komorebi Official Japanese Club
              </span>

              <span className="font-mono text-[#E63946]">
                2026/27
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
