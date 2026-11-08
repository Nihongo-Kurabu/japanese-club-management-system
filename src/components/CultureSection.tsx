import { useState } from 'react';
import { Volume2, X, Sparkles, BookOpen, Layers, Clock } from 'lucide-react';
import { CULTURAL_TOPICS, CulturalTopic } from '../data/clubData';
import { speakJapanese } from '../utils/audio';

export default function CultureSection() {
  const [selectedTopic, setSelectedTopic] = useState<CulturalTopic | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Culture (全て)' },
    { id: 'festivals', label: 'Festivals (祭)' },
    { id: 'clothing', label: 'Clothing (和服)' },
    { id: 'cuisine', label: 'Cuisine (和食)' },
    { id: 'architecture', label: 'Architecture (建築)' },
    { id: 'sakura', label: 'Sakura (桜)' },
    { id: 'etiquette', label: 'Etiquette (作法)' }
  ];

  const filteredTopics = activeCategory === 'all'
    ? CULTURAL_TOPICS
    : CULTURAL_TOPICS.filter((t) => t.id === activeCategory);

  const HISTORICAL_ERAS = [
    { era: 'Heian Period (平安)', years: '794 – 1185', desc: 'Golden age of court aesthetics, poetry, Waka, and the Tale of Genji.' },
    { era: 'Kamakura & Sengoku (戦国)', years: '1185 – 1603', desc: 'Rise of samurai code (Bushido), Zen Buddhism, and castle fortifications.' },
    { era: 'Edo Period (江戸)', years: '1603 – 1867', desc: '250 years of peaceful isolation (Sakoku), flourishing of Ukiyo-e, Kabuki, and tea culture.' },
    { era: 'Meiji Restoration (明治)', years: '1868 – 1912', desc: 'Rapid modernization, industrial growth, and global cultural synthesis.' },
    { era: 'Contemporary Era (現代)', years: '1945 – Present', desc: 'World capital of technological innovation, anime animation art, and global pop culture.' }
  ];

  return (
    <div className="pt-24 pb-24 bg-[#080A12] min-h-screen text-[#F5EBDD]">
      {/* Hero Header */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-b border-white/5 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>日本文化探求 • Cultural Odyssey</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-display uppercase tracking-tight text-white">
            THE LIVING TAPESTRY <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] via-[#F5EBDD] to-[#53D8F0]">
              OF JAPANESE CULTURE
            </span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-[#A6ADBD] text-sm sm:text-base font-light leading-relaxed">
            Experience the harmony of ancient Shinto rituals, Zen mindfulness, artisan craftsmanship,
            and vibrant community celebrations that define Japanese aesthetics.
          </p>

          {/* Category Filter Tabs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/40 scale-105'
                    : 'bg-[#171C2B] text-[#A6ADBD] border border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Exploration Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className="group rounded-2xl bg-[#171C2B] border border-white/10 overflow-hidden shadow-xl hover:border-[#E63946]/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={topic.image}
                    alt={topic.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#171C2B] via-transparent to-transparent opacity-80" />
                  <span className="absolute top-3 right-3 font-serif text-xs text-[#F5EBDD] px-2.5 py-1 rounded bg-[#080A12]/80 backdrop-blur-md border border-white/10">
                    {topic.japaneseTitle}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white group-hover:text-[#53D8F0] transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-xs font-mono text-[#E63946] mt-1">{topic.subtitle}</p>

                  <p className="mt-3 text-xs text-[#A6ADBD] leading-relaxed line-clamp-3">
                    {topic.summary}
                  </p>

                  {/* Vocabulary preview chips */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-1.5">
                    {topic.keyElements.slice(0, 2).map((elem, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#F5EBDD] border border-white/5"
                      >
                        {elem.term.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => setSelectedTopic(topic)}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-[#E63946] text-white text-xs font-semibold tracking-wider transition-all border border-white/10 hover:border-transparent flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>EXPLORE DEEP DIVE (詳細)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Japanese History Timeline */}
      <section className="py-20 bg-[#111522] border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono text-[#53D8F0] uppercase tracking-widest">
              Historical Chronicles • 日本の歴史
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-1 uppercase">
              THE ERAS OF JAPAN
            </h2>
            <p className="text-xs sm:text-sm text-[#A6ADBD] mt-2">
              From classical court poetry to Edo craftsmanship and modern anime storytelling.
            </p>
          </div>

          <div className="relative border-l border-white/10 ml-4 sm:ml-32 space-y-10">
            {HISTORICAL_ERAS.map((item, idx) => (
              <div key={idx} className="relative pl-6 sm:pl-8 group">
                {/* Timeline node */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#171C2B] border-2 border-[#E63946] group-hover:bg-[#E63946] group-hover:scale-125 transition-all shadow-md shadow-[#E63946]/50" />

                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#53D8F0] transition-colors">
                    {item.era}
                  </h3>
                  <span className="text-xs font-mono text-[#E63946] font-semibold">{item.years}</span>
                </div>

                <p className="mt-2 text-xs sm:text-sm text-[#A6ADBD] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Topic Modal */}
      {selectedTopic && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="topic-modal-title"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="relative w-full max-w-3xl bg-[#171C2B] rounded-3xl border border-white/15 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Image Header */}
            <div className="relative h-64 sm:h-72 w-full flex-shrink-0">
              <img
                src={selectedTopic.image}
                alt={selectedTopic.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171C2B] via-[#171C2B]/40 to-transparent" />
              <button
                onClick={() => setSelectedTopic(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-[#080A12]/80 text-white/80 hover:text-white border border-white/10 hover:border-white/30 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <span className="text-xs font-serif text-[#E63946] tracking-widest font-bold">
                  {selectedTopic.japaneseTitle}
                </span>
                <h2 id="topic-modal-title" className="text-2xl sm:text-3xl font-extrabold text-white">
                  {selectedTopic.title}
                </h2>
                <p className="text-xs text-[#53D8F0] font-mono mt-0.5">{selectedTopic.subtitle}</p>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#A6ADBD] mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#E63946]" />
                  <span>Cultural Overview & Context</span>
                </h4>
                <p className="text-sm sm:text-base text-[#F5EBDD] leading-relaxed font-light">
                  {selectedTopic.fullStory}
                </p>
              </div>

              {/* Key Japanese Terms with Audio Synthesis Button */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#53D8F0] mb-3 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-[#53D8F0]" />
                  <span>Key Terminology & Audio Pronunciation (発音)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedTopic.keyElements.map((elem, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-3 group hover:border-[#53D8F0]/40 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-sm font-bold text-white">
                            {elem.term}
                          </span>
                          <span className="text-xs text-[#A6ADBD] font-mono">({elem.kana})</span>
                        </div>
                        <p className="text-xs text-[#A6ADBD] mt-1 leading-snug">{elem.meaning}</p>
                      </div>

                      <button
                        onClick={() => speakJapanese(elem.kana)}
                        className="p-1.5 rounded-lg bg-[#53D8F0]/10 hover:bg-[#53D8F0]/30 text-[#53D8F0] transition-colors flex-shrink-0"
                        title="Listen to Japanese pronunciation"
                        aria-label={`Listen to ${elem.term} pronunciation`}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 bg-[#111522] border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedTopic(null)}
                className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wider transition-colors"
              >
                CLOSE WINDOW (閉じる)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
