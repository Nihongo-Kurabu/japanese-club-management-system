import { useState, useEffect } from 'react';
import { Sparkles, Maximize2, X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { GALLERY_PHOTOS, GalleryPhoto } from '../data/clubData';

export default function GallerySection() {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Festivals', 'Workshops', 'Anime & Arts', 'Scenery'];

  const filteredPhotos =
    activeCategory === 'All'
      ? GALLERY_PHOTOS
      : GALLERY_PHOTOS.filter((p) => p.category === activeCategory);

  const currentIndex = selectedPhoto
    ? filteredPhotos.findIndex((p) => p.id === selectedPhoto.id)
    : -1;

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedPhoto(filteredPhotos[currentIndex - 1]);
    } else {
      setSelectedPhoto(filteredPhotos[filteredPhotos.length - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredPhotos.length - 1) {
      setSelectedPhoto(filteredPhotos[currentIndex + 1]);
    } else {
      setSelectedPhoto(filteredPhotos[0]);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;
      if (e.key === 'Escape') setSelectedPhoto(null);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, currentIndex, filteredPhotos]);

  return (
    <div className="pt-24 pb-24 bg-[#080A12] min-h-screen text-[#F5EBDD]">
      {/* Header */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-b border-white/5 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] text-xs font-mono mb-4">
            <Camera className="w-3.5 h-3.5" />
            <span>写真館 • CLUB VISUAL ARCHIVES</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-display uppercase tracking-tight text-white">
            CAPTURING THE MOMENTS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] via-[#F5EBDD] to-[#53D8F0]">
              OF OUR COMMUNITY
            </span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-[#A6ADBD] text-sm sm:text-base font-light leading-relaxed">
            A visual retrospective of campus matsuri festivals, cooking laboratories, anime study
            nights, and breathtaking Japanese landscape photography.
          </p>

          {/* Category Tabs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all ${
                  activeCategory === cat
                    ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/30 scale-105'
                    : 'bg-[#171C2B] text-[#A6ADBD] border border-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative rounded-2xl overflow-hidden bg-[#171C2B] border border-white/10 shadow-xl cursor-pointer hover:border-[#53D8F0]/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-72 overflow-hidden relative">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080A12] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                <span className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-md">
                  {photo.category}
                </span>

                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white/80 group-hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4" />
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[11px] font-serif text-[#E63946] font-semibold block">
                    {photo.japaneseTitle}
                  </span>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#53D8F0] transition-colors leading-tight">
                    {photo.title}
                  </h3>
                  <p className="text-[11px] text-[#A6ADBD] mt-1 font-mono">
                    Photo by {photo.photographer} • {photo.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo Lightbox"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image & Caption Container */}
          <div className="relative max-w-5xl max-h-[85vh] flex flex-col items-center justify-center">
            <img
              src={selectedPhoto.imageUrl}
              alt={selectedPhoto.title}
              className="max-h-[68vh] w-auto max-w-full rounded-2xl object-contain border border-white/10 shadow-2xl"
            />

            <div className="mt-4 text-center max-w-2xl">
              <span className="text-xs font-serif text-[#E63946] font-bold">
                {selectedPhoto.japaneseTitle}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                {selectedPhoto.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#A6ADBD] mt-1">{selectedPhoto.caption}</p>
              <p className="text-[11px] font-mono text-[#53D8F0] mt-1">
                Archived by {selectedPhoto.photographer} • Category: {selectedPhoto.category}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
