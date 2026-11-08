import { useState } from 'react';
import { Mail, MapPin, Send, MessageSquare, Instagram, Globe, CheckCircle2, AlertCircle, HelpCircle, ChevronDown } from 'lucide-react';
import { CLUB_FAQS } from '../data/clubData';
import { validateContactForm, ContactFormData } from '../utils/validation';

export default function ContactSection() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSent, setIsSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateContactForm(formData);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    setIsSent(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="pt-24 pb-24 bg-[#080A12] min-h-screen text-[#F5EBDD]">
      {/* Header */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-b border-white/5 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] text-xs font-mono mb-4">
            <Mail className="w-3.5 h-3.5" />
            <span>お問い合わせ • CONNECT WITH US</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-display uppercase tracking-tight text-white">
            WE ARE ALWAYS HERE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] via-[#F5EBDD] to-[#53D8F0]">
              TO WELCOME YOU
            </span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-[#A6ADBD] text-sm sm:text-base font-light leading-relaxed">
            Have questions regarding upcoming workshops, festival registrations, or Japanese exchange
            programs? Drop us a note or visit us at our campus clubroom.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Campus Information & Social Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-[#171C2B] border border-white/10 space-y-6 shadow-xl">
              <div>
                <span className="text-xs font-mono text-[#53D8F0] uppercase tracking-widest">
                  Location & Contact • 所在地
                </span>
                <h3 className="text-2xl font-bold font-display text-white mt-1">
                  Clubroom Headquarters
                </h3>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-[#A6ADBD]">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E63946]/15 text-[#E63946] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Campus Location</h4>
                    <p className="mt-0.5 leading-relaxed">
                      Student Activities Center, Room 304 (Zen Room)<br />
                      College Central Campus
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#53D8F0]/15 text-[#53D8F0] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Official Email</h4>
                    <p className="mt-0.5 font-mono text-white/90">
                      japaneseclub@college.edu
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-4 border-t border-white/10">
                <span className="text-xs font-mono text-[#A6ADBD] uppercase block mb-3">
                  Official Channels (公式SNS)
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <a
                    href="#instagram"
                    onClick={(e) => e.preventDefault()}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-[#E63946]/20 border border-white/10 hover:border-[#E63946] text-white text-xs flex items-center gap-2 transition-colors"
                  >
                    <Instagram className="w-4 h-4 text-[#E63946]" />
                    <span>@komorebi_nihonclub</span>
                  </a>

                  <a
                    href="#discord"
                    onClick={(e) => e.preventDefault()}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-[#7652D6]/20 border border-white/10 hover:border-[#7652D6] text-white text-xs flex items-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-[#7652D6]" />
                    <span>Discord Server (400+ members)</span>
                  </a>
                </div>
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="p-8 rounded-3xl bg-[#171C2B] border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-mono text-[#E63946] uppercase">
                <HelpCircle className="w-4 h-4" />
                <span>Frequently Asked Questions (よくある質問)</span>
              </div>
              <h3 className="text-xl font-bold font-display text-white">Common Queries</h3>

              <div className="space-y-2.5 pt-2">
                {CLUB_FAQS.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl bg-white/5 border border-white/5 overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full p-3.5 text-left text-xs font-semibold text-white flex items-center justify-between gap-2 hover:text-[#53D8F0]"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-[#A6ADBD] transition-transform ${
                            isOpen ? 'rotate-180 text-[#53D8F0]' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-3.5 pb-3.5 text-xs text-[#A6ADBD] leading-relaxed border-t border-white/5 pt-2">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="p-8 sm:p-10 rounded-3xl bg-[#171C2B] border border-white/10 shadow-2xl space-y-6"
            >
              <div>
                <h3 className="text-2xl font-bold font-display text-white">
                  Send an Inquiry (メッセージを送る)
                </h3>
                <p className="text-xs text-[#A6ADBD] mt-1">
                  Our club officers typically reply within 24–48 hours during academic terms.
                </p>
              </div>

              {isSent && (
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2.5 animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                  <span>
                    Thank you! Your inquiry has been dispatched to the club secretary and officers.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#F5EBDD] mb-1.5">
                    Your Name (お名前) *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Kenji Tanaka"
                    className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-xs text-white placeholder-[#A6ADBD] focus:outline-none transition-colors ${
                      errors.name ? 'border-red-500' : 'border-white/10 focus:border-[#E63946]'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F5EBDD] mb-1.5">
                    Email Address (メールアドレス) *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-xs text-white placeholder-[#A6ADBD] focus:outline-none transition-colors ${
                      errors.email ? 'border-red-500' : 'border-white/10 focus:border-[#E63946]'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F5EBDD] mb-1.5">
                  Subject (件名) *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Question about Cultural Festival, Collaboration, or Language Table"
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-xs text-white placeholder-[#A6ADBD] focus:outline-none transition-colors ${
                    errors.subject ? 'border-red-500' : 'border-white/10 focus:border-[#E63946]'
                  }`}
                />
                {errors.subject && (
                  <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.subject}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F5EBDD] mb-1.5">
                  Message (メッセージ本文) *
                </label>
                <textarea
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we assist you with our club events or cultural activities?"
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-xs text-white placeholder-[#A6ADBD] focus:outline-none transition-colors ${
                    errors.message ? 'border-red-500' : 'border-white/10 focus:border-[#E63946]'
                  }`}
                />
                {errors.message && (
                  <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-[#E63946] hover:bg-[#d62839] text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#E63946]/40 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>SEND MESSAGE (送信する)</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
