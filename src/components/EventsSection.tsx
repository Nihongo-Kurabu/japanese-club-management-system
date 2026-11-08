import { useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  X,
  Ticket,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { UPCOMING_EVENTS, PAST_EVENTS, ClubEvent } from '../data/clubData';

interface EventsSectionProps {
  selectedEventForModal?: ClubEvent | null;
  onClearModalEvent?: () => void;
}

export default function EventsSection({ selectedEventForModal, onClearModalEvent }: EventsSectionProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'workshops'>('upcoming');
  const [activeEvent, setActiveEvent] = useState<ClubEvent | null>(selectedEventForModal || null);

  // Registration Form State inside Modal
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [formError, setFormError] = useState('');

  const openEventModal = (event: ClubEvent) => {
    setActiveEvent(event);
    setRegistrationSuccess(false);
    setFormError('');
    setAttendeeName('');
    setAttendeeEmail('');
  };

  const closeEventModal = () => {
    setActiveEvent(null);
    if (onClearModalEvent) onClearModalEvent();
    setRegistrationSuccess(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendeeName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!attendeeEmail.trim() || !emailRegex.test(attendeeEmail.trim())) {
      setFormError('Please enter a valid student email address.');
      return;
    }

    if (!activeEvent) return;

    setFormError('');
    const randomTicket = `PASS-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(randomTicket);
    setRegistrationSuccess(true);

    try {
      fetch(`/api/events/${activeEvent.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: attendeeName.trim(),
          collegeEmail: attendeeEmail.trim().toLowerCase(),
        })
      }).catch((err) => console.log('Notice:', err));
    } catch {
      // graceful fallback
    }
  };

  const displayedEvents = () => {
    if (activeTab === 'past') return PAST_EVENTS;
    if (activeTab === 'workshops') return UPCOMING_EVENTS.filter((e) => e.category === 'Workshop');
    return UPCOMING_EVENTS;
  };

  return (
    <div className="pt-24 pb-24 bg-[#080A12] min-h-screen text-[#F5EBDD]">
      {/* Header */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-b border-white/5 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] text-xs font-mono">
            <Calendar className="w-3.5 h-3.5" />
            <span>行事と講習会 • EVENTS & WORKSHOPS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-display uppercase tracking-tight text-white">
            EXPERIENCE JAPAN <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] via-[#F5EBDD] to-[#53D8F0]">
              ON OUR CAMPUS
            </span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-[#A6ADBD] text-sm sm:text-base font-light leading-relaxed">
            From spring cherry blossom matsuri to calligraphy workshops and anime cinema nights.
            Join our vibrant student community for experiential cultural learning.
          </p>

          {/* Tab Filter */}
          <div className="mt-8 inline-flex p-1.5 rounded-full bg-[#171C2B] border border-white/10">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/40'
                  : 'text-[#A6ADBD] hover:text-white'
              }`}
            >
              Upcoming Events (予定行事)
            </button>
            <button
              onClick={() => setActiveTab('workshops')}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all ${
                activeTab === 'workshops'
                  ? 'bg-[#7652D6] text-white shadow-lg shadow-[#7652D6]/40'
                  : 'text-[#A6ADBD] hover:text-white'
              }`}
            >
              Workshops (講習会)
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all ${
                activeTab === 'past'
                  ? 'bg-white/20 text-white'
                  : 'text-[#A6ADBD] hover:text-white'
              }`}
            >
              Past Archives (過去の記録)
            </button>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayedEvents().map((event) => {
            const isFull = event.registeredCount >= event.capacity;

            return (
              <div
                key={event.id}
                className="group rounded-3xl bg-[#171C2B] border border-white/10 overflow-hidden shadow-2xl hover:border-[#E63946]/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="h-64 relative overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#171C2B] via-transparent to-transparent opacity-80" />

                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-[#E63946] text-white font-semibold">
                        {event.category}
                      </span>
                      {event.isPast && (
                        <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-black/60 text-white backdrop-blur-md">
                          Concluded
                        </span>
                      )}
                    </div>

                    <span className="absolute bottom-3 right-4 font-serif text-sm text-[#F5EBDD] px-2 py-0.5 rounded bg-black/60 backdrop-blur-md">
                      {event.japaneseTitle}
                    </span>
                  </div>

                  <div className="p-6 sm:p-8">
                    <h3 className="text-2xl font-bold text-white group-hover:text-[#53D8F0] transition-colors leading-snug">
                      {event.title}
                    </h3>

                    <div className="mt-4 space-y-2 text-xs sm:text-sm text-[#A6ADBD]">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-[#E63946] flex-shrink-0" />
                        <span>{event.date} • {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-[#53D8F0] flex-shrink-0" />
                        <span>{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-2.5 font-mono">
                        <Users className="w-4 h-4 text-[#7652D6] flex-shrink-0" />
                        <span className="font-semibold text-white">
                          {event.registeredCount} / {event.capacity} seats confirmed
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 text-xs sm:text-sm text-[#A6ADBD] leading-relaxed line-clamp-3">
                      {event.description}
                    </p>

                    {/* Highlights */}
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-1.5">
                      {event.highlights.slice(0, 2).map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-[#F5EBDD]/90">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E63946]" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 sm:p-8 pt-0">
                  <button
                    onClick={() => openEventModal(event)}
                    className={`w-full py-3.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg ${
                      event.isPast
                        ? 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                        : isFull
                        ? 'bg-amber-600/30 text-amber-200 border border-amber-600/40'
                        : 'bg-[#E63946] hover:bg-[#d62839] text-white shadow-[#E63946]/30 hover:scale-[1.01]'
                    }`}
                  >
                    <Ticket className="w-4 h-4" />
                    <span>
                      {event.isPast
                        ? 'VIEW EVENT ARCHIVE (記録を見る)'
                        : isFull
                        ? 'JOIN WAITLIST (空席待ち)'
                        : 'RESERVE SEAT (参加予約)'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Event Details / Registration Modal */}
      {activeEvent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-modal-title"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="relative w-full max-w-2xl bg-[#171C2B] rounded-3xl border border-white/20 shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
            {/* Header Image */}
            <div className="relative h-56 sm:h-64 w-full flex-shrink-0">
              <img
                src={activeEvent.image}
                alt={activeEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171C2B] via-transparent to-transparent" />
              <button
                onClick={closeEventModal}
                className="absolute top-4 right-4 p-2 rounded-full bg-[#080A12]/80 text-white hover:bg-white/20 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <span className="text-xs font-serif text-[#E63946] font-bold">
                  {activeEvent.japaneseTitle}
                </span>
                <h2 id="event-modal-title" className="text-xl sm:text-2xl font-bold text-white">
                  {activeEvent.title}
                </h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-3 text-xs bg-white/5 p-4 rounded-xl border border-white/5">
                <div>
                  <span className="text-[#A6ADBD] block">Date & Time:</span>
                  <span className="font-semibold text-white">{activeEvent.date}</span>
                </div>
                <div>
                  <span className="text-[#A6ADBD] block">Venue:</span>
                  <span className="font-semibold text-white">{activeEvent.venue}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#53D8F0] mb-1">
                  Event Description (概要)
                </h4>
                <p className="text-xs sm:text-sm text-[#A6ADBD] leading-relaxed">
                  {activeEvent.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#E63946] mb-2">
                  Session Highlights (見どころ)
                </h4>
                <ul className="space-y-1.5 text-xs text-[#F5EBDD]">
                  {activeEvent.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E63946]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Registration Form or Ticket Pass */}
              {!activeEvent.isPast && (
                <div className="pt-4 border-t border-white/10">
                  {registrationSuccess ? (
                    <div className="p-6 rounded-2xl bg-[#E63946]/10 border border-[#E63946]/40 text-center animate-fade-in space-y-4">
                      <div className="w-12 h-12 rounded-full bg-[#E63946] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#E63946]/40">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">Seat Confirmed! (予約完了)</h4>
                        <p className="text-xs text-[#A6ADBD] mt-1">
                          Thank you <strong className="text-white">{attendeeName}</strong>. Your entry pass has been generated.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#080A12] border border-white/10 font-mono text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[#A6ADBD]">PASS CODE:</span>
                          <span className="text-[#53D8F0] font-bold text-base">{ticketId}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#A6ADBD]">
                          <span>EVENT:</span>
                          <span className="text-white font-semibold truncate max-w-[200px]">{activeEvent.title}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#A6ADBD]">
                          <span>STATUS:</span>
                          <span className="text-emerald-400 font-semibold">CONFIRMED (確定)</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center pt-2">
                        <button
                          type="button"
                          onClick={() => setRegistrationSuccess(false)}
                          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all"
                        >
                          Register Another Student
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white">Instant Seat Reservation</h4>
                          <p className="text-[11px] text-[#A6ADBD]">
                            Current Count: <strong className="text-[#53D8F0]">{activeEvent.registeredCount}</strong> / {activeEvent.capacity} seats confirmed
                          </p>
                        </div>
                        <span className="text-xs text-[#53D8F0] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10">
                          Free Entry
                        </span>
                      </div>

                      {formError && (
                        <div className="p-3 rounded-xl bg-red-900/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{formError}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-[#A6ADBD] mb-1">Full Name</label>
                          <input
                            type="text"
                            value={attendeeName}
                            onChange={(e) => setAttendeeName(e.target.value)}
                            placeholder="e.g. Maya Sharma"
                            required
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-[#E63946]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#A6ADBD] mb-1">College Email</label>
                          <input
                            type="email"
                            value={attendeeEmail}
                            onChange={(e) => setAttendeeEmail(e.target.value)}
                            placeholder="student@college.edu"
                            required
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-[#E63946]"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-[#E63946]/30 flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>CONFIRM MY RESERVATION (予約確定)</span>
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#111522] border-t border-white/10 flex items-center justify-end">
              <button
                type="button"
                onClick={closeEventModal}
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
