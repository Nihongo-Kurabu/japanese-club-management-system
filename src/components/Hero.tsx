
import { useState, useRef } from 'react';
import { ArrowDown, Sparkles, Compass, Play, Pause } from 'lucide-react';
import { NavSection } from './Navbar';

interface HeroProps {
  onNavigate: (section: NavSection) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const scrollToNext = () => {
    const el = document.getElementById('our-world-section');

    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className="
        relative isolate
        min-h-screen min-h-[100svh]
        w-full
        flex items-center justify-center
        overflow-hidden
        bg-[#080A12]
        select-none
      "
    >
      {/* BACKGROUND VIDEO */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=2000&q=80"
          onLoadedData={() => setIsVideoLoaded(true)}
          className={`
            absolute inset-0
            w-full h-full
            object-cover object-center
            scale-[1.03]
            transition-opacity duration-1000
            ${isVideoLoaded ? 'opacity-70' : 'opacity-0'}
          `}
        >
          <source
            src="https://assets.mixkit.co/videos/30148/30148-720.mp4"
            type="video/mp4"
          />
        </video>

        {/* FALLBACK IMAGE */}
        <div
          className={`
            absolute inset-0
            bg-cover bg-center
            transition-opacity duration-1000
            ${isVideoLoaded ? 'opacity-0 pointer-events-none' : 'opacity-80'}
          `}
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=2000&q=80')",
          }}
        />

        {/* ATMOSPHERIC OVERLAYS */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080A12] via-[#080A12]/60 to-[#080A12]/40" />

        <div className="absolute inset-0 bg-gradient-to-r from-[#080A12]/75 via-transparent to-[#080A12]/75" />

        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#7652D6]/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="absolute -bottom-20 -right-20 w-[450px] h-[450px] bg-[#E63946]/15 rounded-full blur-[160px] pointer-events-none" />

        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full h-96 bg-[#53D8F0]/5 rounded-full blur-[150px] pointer-events-none" />
      </div>

      {/* RIGHT JAPANESE DECORATION */}
      <div
        className="
          hidden xl:flex
          absolute right-6 2xl:right-12
          top-1/2 -translate-y-1/2
          z-20 flex-col items-center gap-3
          pointer-events-none
        "
        aria-hidden="true"
      >
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#E63946] to-[#E63946]" />

        <span className="writing-vertical font-serif tracking-[0.35em] text-xs 2xl:text-sm text-[#F5EBDD]/70 font-semibold drop-shadow-md">
          日本への旅はここから始まる
        </span>

        <div className="w-2 h-2 rounded-full bg-[#E63946] shadow-[0_0_10px_#E63946]" />

        <div className="w-px h-16 bg-gradient-to-b from-[#E63946] to-transparent" />
      </div>

      {/* LEFT JAPANESE CLUB SEAL */}
      <div
        className="
          hidden xl:flex
          absolute left-6 2xl:left-12
          top-1/2 -translate-y-1/2
          z-20 flex-col items-center gap-4
          pointer-events-none
        "
        aria-hidden="true"
      >
        <span className="font-mono text-[10px] tracking-widest text-[#53D8F0]/70 uppercase -rotate-90">
          EST.  2026
        </span>

        <div className="w-px h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

        <div className="p-1.5 rounded border border-[#E63946]/50 bg-[#E63946]/10 text-[#E63946] text-xs font-serif font-black">
          木漏
        </div>
      </div>

      {/* MAIN HERO CONTENT */}
      <div
        className="
          relative z-10
          w-full max-w-6xl
          mx-auto
          px-5 sm:px-8 lg:px-12
          pt-28 sm:pt-32 lg:pt-28
          pb-28 sm:pb-32
          flex flex-col items-center
          text-center
        "
      >
        {/* EYEBROW */}
        <div
          className="
            inline-flex items-center justify-center
            gap-2 sm:gap-3
            px-3.5 sm:px-4
            py-1.5 sm:py-2
            rounded-full
            bg-[#171C2B]/85
            border border-white/10
            backdrop-blur-md
            mb-5 sm:mb-7
            shadow-xl
            max-w-full
          "
        >
          <span className="w-2 h-2 rounded-full bg-[#E63946] animate-pulse shrink-0" />

          <span className="text-[11px] sm:text-xs md:text-sm font-jp tracking-wider text-[#F5EBDD] font-medium whitespace-nowrap">
            日本文化へようこそ
          </span>

          <span className="text-white/30 hidden lg:inline">•</span>

          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#53D8F0] whitespace-nowrap hidden lg:inline">
            Welcome to Japanese Culture
          </span>
        </div>

        {/* RESPONSIVE MAIN HEADING */}
        <h1
          className="
            w-full
            font-display font-black
            text-[clamp(2.65rem,7vw,7rem)]
            leading-[0.96]
            tracking-[-0.035em]
            text-white uppercase
            drop-shadow-2xl
          "
        >
          <span className="block whitespace-nowrap">
            DISCOVER THE
          </span>

          <span className="block whitespace-nowrap">
            WORLD
          </span>

          <span
            className="
              block whitespace-nowrap
              text-transparent
              bg-clip-text
              bg-gradient-to-r from-white via-[#F5EBDD] to-[#E63946]
            "
          >
            OF JAPAN
          </span>
        </h1>

        {/* JAPANESE SUBTITLE */}
        <div className="my-4 sm:my-5 md:my-6 flex items-center justify-center gap-2 sm:gap-4 w-full">
          <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent to-[#E63946] hidden sm:block" />

          <span
            className="
              font-serif
              text-[clamp(0.8rem,1.65vw,1.5rem)]
              text-[#E63946]
              tracking-[0.2em] sm:tracking-[0.35em]
              font-medium whitespace-nowrap
            "
          >
            富士・文化・友情・冒険
          </span>

          <div className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent to-[#E63946] hidden sm:block" />
        </div>

        {/* DESCRIPTION */}
        <p
          className="
            mt-2
            w-full max-w-3xl
            text-[clamp(0.85rem,1.2vw,1.125rem)]
            text-[#A6ADBD]
            leading-relaxed
            font-light
            px-1 sm:px-2
          "
        >
          A place where culture, creativity, friendship, and adventure come together.
          Explore Japanese traditions, discover the language, celebrate anime, and
          experience Japan with us.
        </p>

        {/* CALL TO ACTION BUTTONS */}
        <div
          className="
            mt-7 sm:mt-9 lg:mt-10
            flex flex-col sm:flex-row
            items-center justify-center
            gap-3 sm:gap-4
            w-full sm:w-auto
          "
        >
          {/* JOIN THE CLUB */}
          <button
            onClick={() => onNavigate('join')}
            className="
              relative group overflow-hidden
              w-full sm:w-auto
              px-7 sm:px-8 lg:px-9
              py-3.5 sm:py-4
              rounded-full
              bg-gradient-to-r from-[#E63946] via-[#d62839] to-[#7652D6]
              text-white
              font-extrabold
              text-xs sm:text-sm
              tracking-widest uppercase
              transition-all duration-300
              shadow-[0_0_30px_rgba(230,57,70,0.45)]
              hover:shadow-[0_0_45px_rgba(230,57,70,0.7)]
              hover:scale-[1.03]
              active:scale-95
              flex items-center justify-center gap-2.5
              border border-white/30
              hover:border-[#53D8F0]
            "
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

            <Sparkles className="w-4 h-4 text-[#53D8F0] animate-pulse shrink-0" />

            <span className="relative z-10 whitespace-nowrap">
              JOIN THE CLUB
            </span>

            <span className="relative z-10 px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white font-serif text-xs font-black tracking-normal">
              入部
            </span>
          </button>

          {/* EXPLORE */}
          <button
            onClick={() => onNavigate('culture')}
            className="
              w-full sm:w-auto
              px-6 sm:px-7 lg:px-8
              py-3.5 sm:py-4
              rounded-full
              bg-[#111522]/90
              hover:bg-[#171C2B]
              text-[#F5EBDD]
              hover:text-white
              font-semibold
              text-xs sm:text-sm
              tracking-wider uppercase
              transition-all duration-300
              border border-white/15
              hover:border-white/30
              shadow-lg shadow-black/40
              flex items-center justify-center gap-2
              group hover:scale-[1.02]
            "
          >
            <Compass className="w-4 h-4 text-[#E63946] group-hover:rotate-45 transition-transform duration-300 shrink-0" />

            <span className="whitespace-nowrap">
              EXPLORE OUR WORLD
            </span>

            <span className="text-[10px] sm:text-[11px] text-[#A6ADBD] group-hover:text-[#F5EBDD] font-normal">
              探検
            </span>
          </button>
        </div>
      </div>

      {/* VIDEO PLAY / PAUSE CONTROL */}
      <div className="absolute bottom-5 right-4 sm:bottom-6 sm:right-6 z-30 hidden sm:block">
        <button
          onClick={toggleVideoPlayback}
          className="
            flex items-center gap-1.5
            px-3 py-1.5
            rounded-full
            bg-[#080A12]/80
            backdrop-blur-md
            border border-white/10
            hover:border-white/20
            text-[#A6ADBD] hover:text-white
            text-[10px] sm:text-xs
            transition-colors shadow-lg
          "
          title={isPlaying ? 'Pause background video' : 'Play background video'}
        >
          {isPlaying ? (
            <Pause className="w-3 h-3 text-[#53D8F0]" />
          ) : (
            <Play className="w-3 h-3 text-[#E63946]" />
          )}

          <span>
            {isPlaying ? 'Pause Live View' : 'Play Live View'}
          </span>
        </button>
      </div>

      {/* SCROLL INDICATOR */}
      <button
        onClick={scrollToNext}
        className="
          absolute bottom-4 sm:bottom-5
          left-1/2 -translate-x-1/2
          z-20
          hidden sm:flex
          flex-col items-center gap-1.5
          text-white/50
          hover:text-white
          transition-colors
          group focus:outline-none
        "
        aria-label="Scroll down to explore club"
      >
        <span className="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase text-[#A6ADBD] group-hover:text-[#53D8F0]">
          SCROLL TO EXPLORE
        </span>

        <div className="w-5 h-8 sm:h-9 rounded-full border border-white/20 flex items-start justify-center p-1 group-hover:border-[#E63946] transition-colors">
          <div className="w-1.5 h-2 bg-[#E63946] rounded-full animate-bounce" />
        </div>

        <ArrowDown className="w-3.5 h-3.5 text-[#E63946] animate-pulse" />
      </button>
    </section>
  );
}
