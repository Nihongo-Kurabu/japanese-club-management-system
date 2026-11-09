
import { useEffect, useState, type FormEvent } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  X,
  Ticket,
  Sparkles,
  AlertCircle,
  Loader2,
  RefreshCw,
  Download
} from 'lucide-react';

import {
  UPCOMING_EVENTS,
  PAST_EVENTS,
  type ClubEvent
} from '../data/clubData';

import { api } from '../services/api';

interface EventsSectionProps {
  selectedEventForModal?: ClubEvent | null;
  onClearModalEvent?: () => void;
}

interface EventRegistrationResponse {
  success: boolean;
  message?: string;
  ticketCode?: string;
  qrCode?: string;
  attendee?: {
    id?: string;
    ticketCode?: string;
    qrCode?: string;
    fullName?: string;
    collegeEmail?: string;
    usn?: string;
  };
}

type EventTab = 'upcoming' | 'past' | 'workshops';

type DisplayEvent = ClubEvent & {
  source: 'api' | 'static';
};

function normalizeEvent(
  event: Partial<ClubEvent> & Record<string, any>,
  source: 'api' | 'static'
): DisplayEvent {
  const capacity = Number(event.capacity ?? 0);
  const registeredCount = Number(event.registeredCount ?? 0);

  return {
    ...event,
    id: String(event.id ?? ''),
    title: String(event.title ?? 'Untitled Event'),
    japaneseTitle: String(event.japaneseTitle ?? ''),
    description: String(event.description ?? ''),
    date: String(event.date ?? ''),
    time: String(event.time ?? ''),
    venue: String(event.venue ?? ''),
    category: String(event.category ?? 'General'),
    image: String(event.image ?? ''),
    capacity: Number.isFinite(capacity) ? capacity : 0,
    registeredCount: Number.isFinite(registeredCount)
      ? registeredCount
      : 0,
    highlights: Array.isArray(event.highlights)
      ? event.highlights
      : [],
    isPast: Boolean(event.isPast),
    source
  } as DisplayEvent;
}

function getEventDate(event: DisplayEvent): Date | null {
  const date = new Date(event.date);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function isPastEvent(event: DisplayEvent): boolean {
  if (event.isPast) return true;

  const eventDate = getEventDate(event);
  if (!eventDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return eventDate.getTime() < today.getTime();
}

function isEventFull(event: DisplayEvent): boolean {
  return (
    event.capacity > 0 &&
    event.registeredCount >= event.capacity
  );
}

function getEventKey(event: DisplayEvent): string {
  return String(event.id);
}

export default function EventsSection({
  selectedEventForModal,
  onClearModalEvent
}: EventsSectionProps) {
  const [activeTab, setActiveTab] =
    useState<EventTab>('upcoming');

  const [events, setEvents] = useState<DisplayEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState('');

  const [activeEvent, setActiveEvent] =
    useState<DisplayEvent | null>(null);

  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeeUsn, setAttendeeUsn] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] =
    useState(false);

  const [ticketId, setTicketId] = useState('');
  const [ticketQrCode, setTicketQrCode] = useState('');
  const [formError, setFormError] = useState('');

  const loadEvents = async () => {
    setIsLoadingEvents(true);
    setEventsError('');

    try {
      const response = await api.getEvents();

      if (!Array.isArray(response)) {
        throw new Error('Invalid events response from server.');
      }

      const backendEvents = response.map((event) =>
        normalizeEvent(event, 'api')
      );

      setEvents(backendEvents);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to load events.';

      setEventsError(message);
      setEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  useEffect(() => {
    if (!selectedEventForModal) return;

    setActiveEvent(
      normalizeEvent(selectedEventForModal, 'static')
    );

    setRegistrationSuccess(false);
    setFormError('');
    setAttendeeName('');
    setAttendeeEmail('');
    setAttendeeUsn('');
    setTicketId('');
    setTicketQrCode('');
  }, [selectedEventForModal]);

  useEffect(() => {
    if (!activeEvent) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        setActiveEvent(null);
        onClearModalEvent?.();
      }
    };

    document.addEventListener('keydown', handleEscape);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [activeEvent, isSubmitting, onClearModalEvent]);

  const openEventModal = (event: DisplayEvent) => {
    setActiveEvent(event);

    setRegistrationSuccess(false);
    setFormError('');
    setAttendeeName('');
    setAttendeeEmail('');
    setAttendeeUsn('');
    setTicketId('');
    setTicketQrCode('');
  };

  const closeEventModal = () => {
    if (isSubmitting) return;

    setActiveEvent(null);
    setRegistrationSuccess(false);
    setFormError('');

    onClearModalEvent?.();
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!activeEvent || isSubmitting) return;

    if (activeEvent.source !== 'api') {
      setFormError(
        'This event is not available for online registration yet.'
      );
      return;
    }

    if (isPastEvent(activeEvent)) {
      setFormError('Registration for this event has closed.');
      return;
    }

    if (isEventFull(activeEvent)) {
      setFormError(
        'This event is fully booked. Registration is unavailable.'
      );
      return;
    }

    const fullName = attendeeName.trim();
    const collegeEmail = attendeeEmail.trim().toLowerCase();
    const usn = attendeeUsn.trim().toUpperCase();

    if (fullName.length < 2) {
      setFormError('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(collegeEmail)) {
      setFormError('Please enter a valid college email address.');
      return;
    }

    if (!/^[A-Z0-9-]{4,25}$/.test(usn)) {
      setFormError('Please enter a valid student USN.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      const result = await api.registerForEvent(
        String(activeEvent.id),
        {
          fullName,
          collegeEmail,
          usn
        }
      ) as EventRegistrationResponse;

      if (!result.success) {
        throw new Error(
          result.message || 'Event registration was unsuccessful.'
        );
      }

      const confirmedTicket =
        result.ticketCode ||
        result.attendee?.ticketCode;

      if (!confirmedTicket) {
        throw new Error(
          'The server did not return a ticket code. Please contact the event administrator before registering again.'
        );
      }

      setTicketId(confirmedTicket);
      setTicketQrCode(
        result.qrCode || result.attendee?.qrCode || ''
      );

      setRegistrationSuccess(true);

      setEvents((previousEvents) =>
        previousEvents.map((event) =>
          getEventKey(event) === getEventKey(activeEvent)
            ? {
                ...event,
                registeredCount: event.registeredCount + 1
              }
            : event
        )
      );

      setActiveEvent((previousEvent) =>
        previousEvent
          ? {
              ...previousEvent,
              registeredCount: previousEvent.registeredCount + 1
            }
          : null
      );
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Unable to register. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadQr = () => {
    if (!ticketQrCode || !ticketId) return;

    const link = document.createElement('a');
    link.href = ticketQrCode;
    link.download = `Komorebi-Event-Ticket-${ticketId}.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const staticUpcomingEvents = UPCOMING_EVENTS.map((event) =>
    normalizeEvent(event, 'static')
  );

  const staticPastEvents = PAST_EVENTS.map((event) =>
    normalizeEvent(event, 'static')
  );

  const allEvents: DisplayEvent[] =
    events.length > 0
      ? events
      : eventsError
        ? [...staticUpcomingEvents, ...staticPastEvents]
        : [];

  const displayedEvents = allEvents.filter((event) => {
    const past = isPastEvent(event);

    if (activeTab === 'past') return past;

    if (activeTab === 'workshops') {
      return (
        !past &&
        event.category.toLowerCase() === 'workshop'
      );
    }

    return !past;
  });

  const activeEventPast =
    activeEvent ? isPastEvent(activeEvent) : false;

  const activeEventFull =
    activeEvent ? isEventFull(activeEvent) : false;

  const canRegister =
    Boolean(activeEvent) &&
    !activeEventPast &&
    !activeEventFull &&
    activeEvent?.source === 'api';

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
            From spring cherry blossom matsuri to calligraphy workshops
            and anime cinema nights. Join our vibrant student community
            for experiential cultural learning.
          </p>

          {/* Tabs */}
          <div className="mt-8 inline-flex flex-wrap justify-center p-1.5 rounded-2xl sm:rounded-full bg-[#171C2B] border border-white/10 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/40'
                  : 'text-[#A6ADBD] hover:text-white'
              }`}
            >
              Upcoming Events (予定行事)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('workshops')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all ${
                activeTab === 'workshops'
                  ? 'bg-[#7652D6] text-white shadow-lg shadow-[#7652D6]/40'
                  : 'text-[#A6ADBD] hover:text-white'
              }`}
            >
              Workshops (講習会)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('past')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all ${
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

      {/* Events grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {eventsError && (
          <div
            role="alert"
            className="mb-8 p-4 rounded-2xl bg-amber-900/20 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">
                  Live events are temporarily unavailable.
                </p>
                <p className="text-xs mt-1">
                  Showing club event previews. Online registration is
                  disabled until the server is available.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void loadEvents()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {isLoadingEvents ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-9 h-9 text-[#E63946] animate-spin" />
            <p className="text-sm text-[#A6ADBD]">
              Loading Japanese Club events...
            </p>
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="text-center py-24 rounded-3xl bg-[#171C2B] border border-white/10">
            <Calendar className="w-12 h-12 text-[#E63946] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">
              No events available
            </h3>
            <p className="text-sm text-[#A6ADBD] mt-2">
              {activeTab === 'workshops'
                ? 'No upcoming workshops are scheduled yet.'
                : activeTab === 'past'
                  ? 'No past events are available in the archive.'
                  : 'New events will be announced soon.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayedEvents.map((event) => {
              const past = isPastEvent(event);
              const full = isEventFull(event);
              const preview = event.source === 'static';

              return (
                <article
                  key={`${event.source}-${event.id}`}
                  className="group rounded-3xl bg-[#171C2B] border border-white/10 overflow-hidden shadow-2xl hover:border-[#E63946]/40 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="h-64 relative overflow-hidden bg-[#111522]">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="w-16 h-16 text-white/10" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-[#171C2B] via-transparent to-transparent opacity-80" />

                      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-[#E63946] text-white font-semibold">
                          {event.category}
                        </span>

                        {past && (
                          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-black/60 text-white backdrop-blur-md">
                            Concluded
                          </span>
                        )}

                        {preview && !past && (
                          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-amber-600/80 text-white">
                            Preview
                          </span>
                        )}
                      </div>

                      {event.japaneseTitle && (
                        <span className="absolute bottom-3 right-4 font-serif text-sm text-[#F5EBDD] px-2 py-0.5 rounded bg-black/60 backdrop-blur-md">
                          {event.japaneseTitle}
                        </span>
                      )}
                    </div>

                    <div className="p-6 sm:p-8">
                      <h3 className="text-2xl font-bold text-white group-hover:text-[#53D8F0] transition-colors leading-snug">
                        {event.title}
                      </h3>

                      <div className="mt-4 space-y-2 text-xs sm:text-sm text-[#A6ADBD]">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-[#E63946] flex-shrink-0" />
                          <span>
                            {event.date} • {event.time}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 text-[#53D8F0] flex-shrink-0" />
                          <span>{event.venue}</span>
                        </div>

                        <div className="flex items-center gap-2.5 font-mono">
                          <Users className="w-4 h-4 text-[#7652D6] flex-shrink-0" />
                          <span className="font-semibold text-white">
                            {event.capacity > 0
                              ? `${event.registeredCount} / ${event.capacity} seats confirmed`
                              : `${event.registeredCount} registered`}
                          </span>
                        </div>
                      </div>

                      <p className="mt-4 text-xs sm:text-sm text-[#A6ADBD] leading-relaxed line-clamp-3">
                        {event.description}
                      </p>

                      {event.highlights.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10 space-y-1.5">
                          {event.highlights.slice(0, 2).map((highlight, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-xs text-[#F5EBDD]/90"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E63946] flex-shrink-0" />
                              <span>{highlight}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 pt-0">
                    <button
                      type="button"
                      onClick={() => openEventModal(event)}
                      className={`w-full py-3.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg ${
                        past || preview
                          ? 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                          : full
                            ? 'bg-amber-600/30 text-amber-200 border border-amber-600/40'
                            : 'bg-[#E63946] hover:bg-[#d62839] text-white shadow-[#E63946]/30 hover:scale-[1.01]'
                      }`}
                    >
                      <Ticket className="w-4 h-4" />
                      <span>
                        {past
                          ? 'VIEW EVENT ARCHIVE (記録を見る)'
                          : preview
                            ? 'VIEW EVENT DETAILS'
                            : full
                              ? 'EVENT FULL (満席)'
                              : 'RESERVE SEAT (参加予約)'}
                      </span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Event details and registration modal */}
      {activeEvent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-modal-title"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEventModal();
            }
          }}
        >
          <div className="relative w-full max-w-2xl bg-[#171C2B] rounded-3xl border border-white/20 shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
            {/* Modal header */}
            <div className="relative h-56 sm:h-64 w-full flex-shrink-0 bg-[#111522]">
              {activeEvent.image ? (
                <img
                  src={activeEvent.image}
                  alt={activeEvent.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Calendar className="w-16 h-16 text-white/10" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#171C2B] via-transparent to-transparent" />

              <button
                type="button"
                onClick={closeEventModal}
                disabled={isSubmitting}
                className="absolute top-4 right-4 p-2 rounded-full bg-[#080A12]/80 text-white hover:bg-white/20 transition-colors disabled:opacity-50"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                {activeEvent.japaneseTitle && (
                  <span className="text-xs font-serif text-[#E63946] font-bold">
                    {activeEvent.japaneseTitle}
                  </span>
                )}

                <h2
                  id="event-modal-title"
                  className="text-xl sm:text-2xl font-bold text-white"
                >
                  {activeEvent.title}
                </h2>
              </div>
            </div>

            {/* Modal body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-3 text-xs bg-white/5 p-4 rounded-xl border border-white/5">
                <div>
                  <span className="text-[#A6ADBD] block">
                    Date & Time
                  </span>
                  <span className="font-semibold text-white">
                    {activeEvent.date}
                    <br />
                    {activeEvent.time}
                  </span>
                </div>

                <div>
                  <span className="text-[#A6ADBD] block">
                    Venue
                  </span>
                  <span className="font-semibold text-white">
                    {activeEvent.venue}
                  </span>
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

              {activeEvent.highlights.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#E63946] mb-2">
                    Session Highlights (見どころ)
                  </h4>

                  <ul className="space-y-1.5 text-xs text-[#F5EBDD]">
                    {activeEvent.highlights.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E63946] flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Registration */}
              {!activeEventPast && (
                <div className="pt-4 border-t border-white/10">
                  {registrationSuccess ? (
                    <div className="p-6 rounded-2xl bg-[#E63946]/10 border border-[#E63946]/40 text-center animate-fade-in space-y-4">
                      <div className="w-12 h-12 rounded-full bg-[#E63946] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#E63946]/40">
                        <CheckCircle className="w-6 h-6" />
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-white">
                          Seat Confirmed! (予約完了)
                        </h4>

                        <p className="text-xs text-[#A6ADBD] mt-1">
                          Thank you{' '}
                          <strong className="text-white">
                            {attendeeName}
                          </strong>
                          . Your registration has been confirmed by
                          the Japanese Club server.
                        </p>
                      </div>

                      {ticketQrCode && (
                        <div className="bg-white p-4 rounded-xl w-fit mx-auto">
                          <img
                            src={ticketQrCode}
                            alt={`Event entry QR code for ticket ${ticketId}`}
                            className="w-44 h-44 sm:w-52 sm:h-52"
                          />
                        </div>
                      )}

                      <div className="p-4 rounded-xl bg-[#080A12] border border-white/10 font-mono text-xs space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[#A6ADBD]">
                            TICKET CODE
                          </span>
                          <span className="text-[#53D8F0] font-bold text-base break-all">
                            {ticketId}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-[11px]">
                          <span className="text-[#A6ADBD]">
                            EVENT
                          </span>
                          <span className="text-white font-semibold text-right">
                            {activeEvent.title}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-[11px]">
                          <span className="text-[#A6ADBD]">
                            USN
                          </span>
                          <span className="text-white font-semibold">
                            {attendeeUsn.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-[11px]">
                          <span className="text-[#A6ADBD]">
                            STATUS
                          </span>
                          <span className="text-emerald-400 font-semibold">
                            CONFIRMED (確定)
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#A6ADBD]">
                        Save your ticket code and QR code. Present
                        them at the event entrance for attendance
                        verification.
                      </p>

                      {ticketQrCode && (
                        <button
                          type="button"
                          onClick={handleDownloadQr}
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#53D8F0] hover:bg-[#40bfd8] text-[#080A12] font-bold text-xs transition-all"
                        >
                          <Download className="w-4 h-4" />
                          Download QR Ticket
                        </button>
                      )}

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRegistrationSuccess(false);
                            setFormError('');
                            setAttendeeName('');
                            setAttendeeEmail('');
                            setAttendeeUsn('');
                            setTicketId('');
                            setTicketQrCode('');
                          }}
                          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all"
                        >
                          Register Another Student
                        </button>
                      </div>
                    </div>
                  ) : canRegister ? (
                    <form
                      onSubmit={handleRegister}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-white">
                            Instant Seat Reservation
                          </h4>

                          <p className="text-[11px] text-[#A6ADBD]">
                            Current Count:{' '}
                            <strong className="text-[#53D8F0]">
                              {activeEvent.registeredCount}
                            </strong>
                            {activeEvent.capacity > 0
                              ? ` / ${activeEvent.capacity} seats confirmed`
                              : ' registered'}
                          </p>
                        </div>

                        <span className="text-xs text-[#53D8F0] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 whitespace-nowrap">
                          Free Entry
                        </span>
                      </div>

                      {formError && (
                        <div
                          role="alert"
                          className="p-3 rounded-xl bg-red-900/40 border border-red-500/50 text-red-200 text-xs flex items-start gap-2"
                        >
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{formError}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="event-attendee-name"
                            className="block text-xs text-[#A6ADBD] mb-1"
                          >
                            Full Name *
                          </label>

                          <input
                            id="event-attendee-name"
                            type="text"
                            value={attendeeName}
                            onChange={(e) =>
                              setAttendeeName(e.target.value)
                            }
                            placeholder="e.g. Maya Sharma"
                            autoComplete="name"
                            maxLength={100}
                            required
                            disabled={isSubmitting}
                            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-[#E63946] disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="event-attendee-email"
                            className="block text-xs text-[#A6ADBD] mb-1"
                          >
                            College Email *
                          </label>

                          <input
                            id="event-attendee-email"
                            type="email"
                            value={attendeeEmail}
                            onChange={(e) =>
                              setAttendeeEmail(e.target.value)
                            }
                            placeholder="student@college.edu"
                            autoComplete="email"
                            maxLength={150}
                            required
                            disabled={isSubmitting}
                            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-[#E63946] disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="event-attendee-usn"
                          className="block text-xs text-[#A6ADBD] mb-1"
                        >
                          Student USN *
                        </label>

                        <input
                          id="event-attendee-usn"
                          type="text"
                          value={attendeeUsn}
                          onChange={(e) =>
                            setAttendeeUsn(e.target.value.toUpperCase())
                          }
                          placeholder="Enter your college USN"
                          autoCapitalize="characters"
                          maxLength={25}
                          required
                          disabled={isSubmitting}
                          className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white text-xs uppercase focus:outline-none focus:border-[#E63946] disabled:opacity-50"
                        />
                      </div>

                      <p className="text-[11px] text-[#A6ADBD]">
                        Please provide your correct details. Your
                        USN and college email will be used to
                        prevent duplicate event registrations.
                      </p>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-[#E63946]/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>CONFIRMING RESERVATION...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>
                              CONFIRM MY RESERVATION (予約確定)
                            </span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                      <AlertCircle className="w-7 h-7 text-amber-400 mx-auto" />

                      <h4 className="text-sm font-bold text-white">
                        {activeEventFull
                          ? 'Event Fully Booked'
                          : 'Online Registration Unavailable'}
                      </h4>

                      <p className="text-xs text-[#A6ADBD]">
                        {activeEventFull
                          ? 'All available seats have been reserved.'
                          : 'This event is currently available for viewing only. Please check back for registration updates.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeEventPast && (
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <CheckCircle className="w-8 h-8 text-[#53D8F0] mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-white">
                    Event Concluded
                  </h4>
                  <p className="text-xs text-[#A6ADBD] mt-1">
                    Registration is closed. Thank you for your
                    interest in Japanese Club activities.
                  </p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="p-4 bg-[#111522] border-t border-white/10 flex items-center justify-end">
              <button
                type="button"
                onClick={closeEventModal}
                disabled={isSubmitting}
                className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold disabled:opacity-50"
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
