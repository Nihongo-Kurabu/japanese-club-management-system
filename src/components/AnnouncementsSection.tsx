import { useState } from 'react';
import { Bell, Pin, Search, Calendar, ChevronRight, X, AlertCircle } from 'lucide-react';
import { ANNOUNCEMENTS, AnnouncementItem } from '../data/clubData';

export default function AnnouncementsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Updates' },
    { id: 'Recruitment', label: 'Recruitment (募集)' },
    { id: 'Cultural', label: 'Cultural (文化)' },
    { id: 'Workshop', label: 'Workshop (講習)' },
    { id: 'Notice', label: 'General Notices (通知)' }
  ];

  const filteredAnnouncements = ANNOUNCEMENTS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.japaneseTitle.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-24 pb-24 bg-[#080A12] min-h-screen text-[#F5EBDD]">
      {/* Header */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-b border-white/5 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] text-xs font-mono mb-4">
            <Bell className="w-3.5 h-3.5" />
            <span>お知らせ • OFFICIAL CLUB BULLETIN</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-display uppercase tracking-tight text-white">
            COMMUNITY ANNOUNCEMENTS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] via-[#F5EBDD] to-[#53D8F0]">
              & OFFICIAL NOTICES
            </span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-[#A6ADBD] text-sm sm:text-base font-light leading-relaxed">
            Stay up to date with registration deadlines, upcoming cultural festivals, room assignments,
            and weekly Japanese conversation tables.
          </p>

          {/* Search & Filters */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#A6ADBD] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bulletin announcements..."
                className="w-full pl-9 pr-4 py-2.5 rounded-full bg-[#171C2B] border border-white/10 text-xs text-white placeholder-[#A6ADBD] focus:outline-none focus:border-[#E63946]"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-[#E63946] text-white'
                    : 'bg-[#171C2B] text-[#A6ADBD] hover:text-white border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements List */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-4">
        {filteredAnnouncements.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedAnnouncement(item)}
            className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group ${
              item.isPinned
                ? 'bg-gradient-to-r from-[#171C2B] via-[#1a172e] to-[#171C2B] border-[#7652D6]/40 hover:border-[#7652D6]'
                : 'bg-[#171C2B] border-white/10 hover:border-[#E63946]/40'
            }`}
          >
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {item.isPinned && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#7652D6] text-white shadow-sm">
                    <Pin className="w-2.5 h-2.5" />
                    <span>PINNED (固定)</span>
                  </span>
                )}
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-[#53D8F0] border border-white/10">
                  {item.category}
                </span>
                <span className="text-xs font-serif text-[#E63946] font-medium">
                  {item.japaneseTitle}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-[#53D8F0] transition-colors leading-snug">
                {item.title}
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-[#A6ADBD] line-clamp-2 leading-relaxed">
                {item.summary}
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5 gap-2">
              <span className="text-[11px] font-mono text-[#A6ADBD] flex items-center gap-1.5 flex-shrink-0">
                <Calendar className="w-3.5 h-3.5 text-[#E63946]" />
                {item.date}
              </span>

              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:text-white group-hover:bg-[#E63946] transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}

        {filteredAnnouncements.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-[#171C2B] border border-white/10">
            <AlertCircle className="w-8 h-8 text-[#A6ADBD] mx-auto mb-2" />
            <p className="text-white font-semibold">No announcements found</p>
            <p className="text-xs text-[#A6ADBD] mt-1">Try another search keyword or filter category.</p>
          </div>
        )}
      </section>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="announcement-modal-title"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-2xl bg-[#171C2B] rounded-3xl border border-white/20 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded bg-[#E63946] text-white">
                {selectedAnnouncement.category}
              </span>
              <span className="text-xs font-serif text-[#A6ADBD]">
                {selectedAnnouncement.japaneseTitle}
              </span>
            </div>

            <h2 id="announcement-modal-title" className="text-2xl font-bold text-white mb-2 leading-snug">
              {selectedAnnouncement.title}
            </h2>

            <p className="text-xs font-mono text-[#53D8F0] mb-6 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#53D8F0]" />
              Posted on {selectedAnnouncement.date}
            </p>

            <div className="space-y-4 text-sm text-[#F5EBDD] leading-relaxed border-t border-white/10 pt-4">
              <p>{selectedAnnouncement.fullContent}</p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
