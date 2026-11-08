import { Compass, Heart, Instagram, MessageSquare, ArrowUp } from 'lucide-react';
import { NavSection } from './Navbar';

interface FooterProps {
  onNavigate: (section: NavSection) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#05060B] border-t border-white/10 text-[#A6ADBD] pt-16 pb-12 overflow-hidden">
      {/* Background Japanese Watermark Pattern */}
      <div className="absolute right-0 bottom-0 text-[180px] font-serif text-white/[0.015] pointer-events-none select-none leading-none">
        日本
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/5">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E63946] flex items-center justify-center text-white font-serif font-black text-xl shadow-lg shadow-[#E63946]/30">
                木
              </div>
              <div>
                <h3 className="text-white font-bold tracking-wider text-lg">JAPANESE CLUB</h3>
                <p className="text-xs font-mono text-[#53D8F0]">Official </p>
              </div>
            </div>

            <p className="text-xs text-[#A6ADBD] max-w-sm leading-relaxed font-light">
              Connecting university students with the captivating depth of traditional Japanese arts,
              language mastery, anime visual storytelling, and heartfelt friendships.
            </p>

            {/* Motto */}
            <div className="pt-2">
              <p className="font-serif text-sm text-[#F5EBDD] font-medium tracking-wider">
                日本への旅はここから始まる。
              </p>
              <p className="text-[11px] font-mono text-[#E63946] uppercase mt-0.5">
                The journey to Japan begins here.
              </p>
            </div>
          </div>

          {/* Quick Nav 1 */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-white mb-4">
              Explore • 探求
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors"
                >
                  Home (ホーム)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors"
                >
                  About the Club (クラブ紹介)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('culture')}
                  className="hover:text-white transition-colors"
                >
                  Japanese Culture (伝統文化)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faculty')}
                  className="text-[#53D8F0] hover:text-white transition-colors"
                >
                  Faculty Advisory (教員・顧問紹介)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('events')}
                  className="hover:text-white transition-colors"
                >
                  Events & Workshops (催し物)
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Nav 2 */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-white mb-4">
              Learning & Media • 学習
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('language')}
                  className="hover:text-white transition-colors"
                >
                  Language Portal (日本語学習)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('jlpt')}
                  className="text-[#53D8F0] font-medium hover:text-white transition-colors"
                >
                  JLPT Registration (日本語能力試験 登録)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-white transition-colors"
                >
                  Photo Gallery (写真館)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('announcements')}
                  className="hover:text-white transition-colors"
                >
                  Announcements (お知らせ)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('join')}
                  className="text-[#E63946] font-semibold hover:text-white transition-colors"
                >
                  Join the Club (入部申込)
                </button>
              </li>
            </ul>
          </div>

          {/* Hanko & Back to Top */}
          <div className="flex flex-col justify-between items-start lg:items-end">
            <div className="w-14 h-14 rounded-xl border-2 border-[#E63946] bg-[#E63946]/10 flex flex-col items-center justify-center text-[#E63946] font-serif font-black text-sm shadow-md shadow-[#E63946]/30">
              <span>木漏</span>
              <span className="text-[10px]">印</span>
            </div>

            <button
              onClick={scrollToTop}
              className="mt-6 lg:mt-0 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-mono flex items-center gap-2 border border-white/10 transition-colors"
              aria-label="Back to top"
            >
              <span>TOP (上へ)</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#53D8F0]" />
            </button>
          </div>
        </div>

        {/* Bottom Credits & Discreet Admin Portal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A6ADBD]/70 gap-4">
          <p>© 2026 Komorebi Japanese Club. All rights reserved.</p>

          {/* Discreet Admin Portal Entry */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('admin')}
              className="font-mono text-[11px] text-[#A6ADBD]/40 hover:text-[#53D8F0] transition-colors flex items-center gap-1.5 focus:outline-none"
              title="Restricted Faculty & Club Officers Portal"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E63946]/50" />
              <span>ADMIN PORTAL</span>
              <span className="opacity-60 font-serif">管理ポータル</span>
            </button>

            <span className="text-white/10">|</span>

            <p className="flex items-center gap-1.5 font-mono">
              <span>Crafted </span>
              
              <span>by Pranav Anand (Techinacal Head)</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
