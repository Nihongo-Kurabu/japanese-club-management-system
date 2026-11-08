import { useState } from 'react';
import { Volume2, Sparkles, BookOpen, Check, RotateCcw, HelpCircle, Award, Search, ChevronRight } from 'lucide-react';
import {
  HIRAGANA_CHARACTERS,
  KATAKANA_CHARACTERS,
  KANJI_ESSENTIALS,
  ESSENTIAL_PHRASES,
  JAPANESE_NUMBERS,
  SAMPLE_QUIZ_QUESTIONS,
  searchKanji,
  calculateQuizScore,
  KanaCharacter,
  KanjiItem
} from '../utils/language';
import { speakJapanese } from '../utils/audio';

export default function LanguageSection() {
  const [activeTab, setActiveTab] = useState<'hiragana' | 'katakana' | 'kanji' | 'phrases' | 'numbers' | 'quiz' | 'flashcards'>('hiragana');
  const [selectedKana, setSelectedKana] = useState<KanaCharacter | null>(HIRAGANA_CHARACTERS[0]);
  const [kanjiSearchQuery, setKanjiSearchQuery] = useState('');

  // Flashcards state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedCount, setLearnedCount] = useState(0);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<{ correctCount: number; total: number; percentage: number } | null>(null);

  const handlePlayVoice = (text: string) => {
    speakJapanese(text);
  };

  const handleSelectAnswer = (qId: string, option: string) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleSubmitQuiz = () => {
    const results = calculateQuizScore(quizAnswers, SAMPLE_QUIZ_QUESTIONS);
    setQuizResults(results);
    setQuizSubmitted(true);
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResults(null);
  };

  const filteredKanji = searchKanji(kanjiSearchQuery);

  return (
    <div className="pt-24 pb-24 bg-[#080A12] min-h-screen text-[#F5EBDD]">
      {/* Header */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-b border-white/5 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#53D8F0]/10 border border-[#53D8F0]/30 text-[#53D8F0] text-xs font-mono mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>日本語初級道場 • BEGINNER LANGUAGE PORTAL</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-display uppercase tracking-tight text-white">
            MASTER THE SOUNDS & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#53D8F0] via-[#F5EBDD] to-[#E63946]">
              CHARACTERS OF JAPAN
            </span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-[#A6ADBD] text-sm sm:text-base font-light leading-relaxed">
            Zero experience required. Tap any character or phrase to listen to authentic Japanese pronunciation,
            test your memory with flashcards, and challenge yourself with our interactive quizzes.
          </p>

          {/* Navigation Sub-Tabs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'hiragana', label: 'Hiragana (ひらがな)' },
              { id: 'katakana', label: 'Katakana (カタカナ)' },
              { id: 'kanji', label: 'Essential Kanji (漢字)' },
              { id: 'phrases', label: 'Greetings (挨拶)' },
              { id: 'numbers', label: 'Numbers (数字)' },
              { id: 'flashcards', label: 'Flashcards (単語カード)' },
              { id: 'quiz', label: 'Interactive Quiz (確認テスト)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#53D8F0] text-[#080A12] font-bold shadow-lg shadow-[#53D8F0]/30 scale-105'
                    : 'bg-[#171C2B] text-[#A6ADBD] border border-white/10 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Learning Canvas */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* ================= HIRAGANA TAB ================= */}
        {activeTab === 'hiragana' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                  Hiragana Chart (46 Characters)
                </h2>
                <p className="text-xs text-[#A6ADBD] mt-1">
                  The foundational Japanese phonetic syllabary used for native words, grammar particles, and furigana.
                </p>
              </div>
              <div className="text-xs font-mono text-[#53D8F0] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span>Click any character to hear pronunciation</span>
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2.5">
              {HIRAGANA_CHARACTERS.map((char) => (
                <button
                  key={char.kana}
                  onClick={() => {
                    setSelectedKana(char);
                    handlePlayVoice(char.kana);
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all group ${
                    selectedKana?.kana === char.kana
                      ? 'bg-[#E63946] border-white text-white shadow-lg shadow-[#E63946]/40 scale-105'
                      : 'bg-[#171C2B] border-white/10 text-white hover:border-[#53D8F0] hover:bg-[#1f263b]'
                  }`}
                  title={`Pronounce ${char.kana} (${char.romaji})`}
                >
                  <span className="font-serif text-2xl font-bold group-hover:scale-110 transition-transform">
                    {char.kana}
                  </span>
                  <span className="text-[11px] font-mono text-[#A6ADBD] mt-1 group-hover:text-white">
                    {char.romaji}
                  </span>
                </button>
              ))}
            </div>

            {/* Kana Inspector Details */}
            {selectedKana && (
              <div className="mt-8 p-6 rounded-2xl bg-[#171C2B] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-[#080A12] border border-[#E63946]/50 flex items-center justify-center font-serif text-4xl text-[#E63946] font-bold shadow-lg">
                    {selectedKana.kana}
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase text-[#53D8F0]">Selected Syllable</span>
                    <h3 className="text-2xl font-bold text-white">
                      {selectedKana.kana} — Romaji: <span className="font-mono text-[#E63946]">{selectedKana.romaji}</span>
                    </h3>
                    <p className="text-xs text-[#A6ADBD] mt-1">
                      Example Word: <strong className="text-white">{selectedKana.exampleWord}</strong> ({selectedKana.exampleMeaning})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handlePlayVoice(selectedKana.kana)}
                  className="px-6 py-3 rounded-full bg-[#E63946] hover:bg-[#d62839] text-white text-xs font-bold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-[#E63946]/30"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>PLAY VOICE (発音を聞く)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= KATAKANA TAB ================= */}
        {activeTab === 'katakana' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                  Katakana Chart (46 Characters)
                </h2>
                <p className="text-xs text-[#A6ADBD] mt-1">
                  The angular syllabary used for foreign loanwords, anime character names, scientific terms, and onomatopoeia.
                </p>
              </div>
              <div className="text-xs font-mono text-[#53D8F0] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span>Click any character to hear pronunciation</span>
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2.5">
              {KATAKANA_CHARACTERS.map((char) => (
                <button
                  key={char.kana}
                  onClick={() => {
                    setSelectedKana(char);
                    handlePlayVoice(char.kana);
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all group ${
                    selectedKana?.kana === char.kana
                      ? 'bg-[#7652D6] border-white text-white shadow-lg shadow-[#7652D6]/40 scale-105'
                      : 'bg-[#171C2B] border-white/10 text-white hover:border-[#7652D6] hover:bg-[#1f263b]'
                  }`}
                  title={`Pronounce ${char.kana} (${char.romaji})`}
                >
                  <span className="font-serif text-2xl font-bold group-hover:scale-110 transition-transform">
                    {char.kana}
                  </span>
                  <span className="text-[11px] font-mono text-[#A6ADBD] mt-1 group-hover:text-white">
                    {char.romaji}
                  </span>
                </button>
              ))}
            </div>

            {/* Katakana Inspector */}
            {selectedKana && (
              <div className="mt-8 p-6 rounded-2xl bg-[#171C2B] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-[#080A12] border border-[#7652D6]/60 flex items-center justify-center font-serif text-4xl text-[#7652D6] font-bold shadow-lg">
                    {selectedKana.kana}
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase text-[#7652D6]">Selected Katakana</span>
                    <h3 className="text-2xl font-bold text-white">
                      {selectedKana.kana} — Romaji: <span className="font-mono text-[#53D8F0]">{selectedKana.romaji}</span>
                    </h3>
                    <p className="text-xs text-[#A6ADBD] mt-1">
                      Loanword: <strong className="text-white">{selectedKana.exampleWord}</strong> ({selectedKana.exampleMeaning})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handlePlayVoice(selectedKana.kana)}
                  className="px-6 py-3 rounded-full bg-[#7652D6] hover:bg-[#6844c8] text-white text-xs font-bold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-[#7652D6]/30"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>PLAY VOICE (発音を聞く)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= KANJI TAB ================= */}
        {activeTab === 'kanji' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                  Essential JLPT N5 Kanji (漢字)
                </h2>
                <p className="text-xs text-[#A6ADBD] mt-1">
                  Logographic characters representing ideas, origins, readings (Onyomi & Kunyomi), and stroke counts.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-[#A6ADBD] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={kanjiSearchQuery}
                  onChange={(e) => setKanjiSearchQuery(e.target.value)}
                  placeholder="Search Kanji, meaning or reading..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#171C2B] border border-white/10 text-xs text-white placeholder-[#A6ADBD] focus:outline-none focus:border-[#53D8F0]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredKanji.map((item) => (
                <div
                  key={item.kanji}
                  className="p-6 rounded-2xl bg-[#171C2B] border border-white/10 hover:border-[#53D8F0]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#53D8F0] border border-white/5">
                        {item.level} • {item.strokes} Strokes
                      </span>
                      <button
                        onClick={() => handlePlayVoice(item.kanji)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#53D8F0] transition-colors"
                        title="Pronounce Kanji"
                        aria-label={`Pronounce ${item.kanji}`}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-center my-3">
                      <span className="font-serif text-6xl font-black text-white hover:text-[#E63946] transition-colors cursor-pointer inline-block" onClick={() => handlePlayVoice(item.kanji)}>
                        {item.kanji}
                      </span>
                      <p className="text-sm font-semibold text-[#53D8F0] mt-2">{item.meaning}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 space-y-1 text-xs">
                      <div>
                        <span className="text-[#A6ADBD]">Onyomi (音):</span>{' '}
                        <span className="font-mono text-white">{item.onyomi}</span>
                      </div>
                      <div>
                        <span className="text-[#A6ADBD]">Kunyomi (訓):</span>{' '}
                        <span className="font-mono text-white">{item.kunyomi}</span>
                      </div>
                    </div>
                  </div>

                  {/* Example Compounds */}
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-1 text-[11px] text-[#A6ADBD]">
                    <span className="text-[10px] uppercase font-mono text-[#E63946] block mb-1">
                      Example Words:
                    </span>
                    {item.examples.map((ex, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="font-medium text-white">{ex.word}</span>
                        <span className="text-[#A6ADBD]">{ex.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= GREETINGS & PHRASES ================= */}
        {activeTab === 'phrases' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                Essential Daily Greetings & Phrases (挨拶)
              </h2>
              <p className="text-xs text-[#A6ADBD] mt-1">
                Polite daily conversational openers used in Japan. Tap the speaker icon to hear native pronunciation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ESSENTIAL_PHRASES.map((phrase, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#171C2B] border border-white/10 hover:border-[#E63946]/40 transition-all flex items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white">{phrase.japanese}</h3>
                    <p className="text-xs font-mono text-[#E63946] mt-0.5">{phrase.romaji}</p>
                    <p className="text-xs text-[#F5EBDD] font-medium mt-1">{phrase.english}</p>
                    <span className="text-[11px] text-[#A6ADBD] block mt-0.5">{phrase.usage}</span>
                  </div>

                  <button
                    onClick={() => handlePlayVoice(phrase.japanese)}
                    className="p-3 rounded-full bg-[#E63946]/10 hover:bg-[#E63946] text-[#E63946] hover:text-white transition-all flex-shrink-0"
                    title="Pronounce phrase"
                    aria-label={`Pronounce ${phrase.japanese}`}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= NUMBERS & COUNTERS ================= */}
        {activeTab === 'numbers' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                Japanese Numbers 1 to 10,000 (数字)
              </h2>
              <p className="text-xs text-[#A6ADBD] mt-1">
                Understanding counting systems and Kanji representation.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {JAPANESE_NUMBERS.map((num) => (
                <div
                  key={num.number}
                  className="p-4 rounded-xl bg-[#171C2B] border border-white/10 text-center flex flex-col items-center justify-between group hover:border-[#53D8F0]/40 transition-colors"
                >
                  <span className="text-xs font-mono text-[#53D8F0]">{num.number.toLocaleString()}</span>
                  <div className="my-2">
                    <span className="font-serif text-3xl font-bold text-white group-hover:text-[#E63946] transition-colors">
                      {num.kanji}
                    </span>
                    <p className="text-xs text-[#A6ADBD] mt-1 font-jp">{num.kana}</p>
                    <p className="text-[11px] font-mono text-[#53D8F0]">{num.romaji}</p>
                  </div>
                  <button
                    onClick={() => handlePlayVoice(num.kana)}
                    className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    title="Pronounce number"
                    aria-label={`Pronounce ${num.number}`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= FLASHCARDS MODE ================= */}
        {activeTab === 'flashcards' && (
          <div className="max-w-xl mx-auto text-center">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                Interactive Kana Flashcards
              </h2>
              <p className="text-xs text-[#A6ADBD] mt-1">
                Test your recognition. Click the card to flip and check pronunciation.
              </p>
            </div>

            {/* Flashcard Component */}
            {(() => {
              const currentCard = HIRAGANA_CHARACTERS[flashcardIndex];
              return (
                <div>
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="w-full h-80 rounded-3xl bg-gradient-to-br from-[#171C2B] to-[#111522] border-2 border-white/15 hover:border-[#53D8F0] shadow-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform"
                  >
                    {!isFlipped ? (
                      <div>
                        <span className="text-xs font-mono text-[#53D8F0] uppercase tracking-widest block mb-4">
                          Guess the Romaji
                        </span>
                        <span className="font-serif text-8xl font-black text-white">
                          {currentCard.kana}
                        </span>
                        <span className="text-xs text-[#A6ADBD] block mt-6">
                          (Click to flip and reveal)
                        </span>
                      </div>
                    ) : (
                      <div className="animate-fade-in">
                        <span className="text-xs font-mono text-[#E63946] uppercase tracking-widest block mb-2">
                          Answer
                        </span>
                        <span className="font-mono text-5xl font-black text-[#53D8F0]">
                          "{currentCard.romaji}"
                        </span>
                        <p className="text-sm text-white mt-4 font-semibold">
                          Example: {currentCard.exampleWord}
                        </p>
                        <p className="text-xs text-[#A6ADBD]">Meaning: {currentCard.exampleMeaning}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayVoice(currentCard.kana);
                          }}
                          className="mt-4 px-4 py-1.5 rounded-full bg-[#E63946] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Hear Sound</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Navigation controls */}
                  <div className="mt-8 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setFlashcardIndex((prev) => (prev > 0 ? prev - 1 : HIRAGANA_CHARACTERS.length - 1));
                      }}
                      className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-semibold"
                    >
                      ← Previous Card
                    </button>

                    <span className="text-xs font-mono text-[#A6ADBD]">
                      Card {flashcardIndex + 1} of {HIRAGANA_CHARACTERS.length}
                    </span>

                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setFlashcardIndex((prev) => (prev + 1) % HIRAGANA_CHARACTERS.length);
                      }}
                      className="px-5 py-2.5 rounded-full bg-[#53D8F0] text-[#080A12] text-xs font-bold hover:bg-[#3fc9e2]"
                    >
                      Next Card →
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ================= QUIZ MODE ================= */}
        {activeTab === 'quiz' && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-xs font-mono text-[#E63946] tracking-widest uppercase">
                Knowledge Check • 理解度クイズ
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
                Japanese Language & Culture Quiz
              </h2>
              <p className="text-xs text-[#A6ADBD] mt-1">
                Answer these 5 questions to test your recognition of characters and vocabulary.
              </p>
            </div>

            {/* Results Banner */}
            {quizSubmitted && quizResults && (
              <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#171C2B] to-[#1f263b] border-2 border-[#53D8F0] text-center shadow-2xl animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-[#53D8F0]/20 text-[#53D8F0] border border-[#53D8F0] flex items-center justify-center mx-auto mb-3">
                  <Award className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">Quiz Score: {quizResults.percentage}%</h3>
                <p className="text-sm text-[#A6ADBD] mt-1">
                  You scored <strong className="text-white">{quizResults.correctCount}</strong> out of{' '}
                  <strong className="text-white">{quizResults.total}</strong> correct!
                </p>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={handleResetQuiz}
                    className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz (再挑戦)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-6">
              {SAMPLE_QUIZ_QUESTIONS.map((q, idx) => {
                const selected = quizAnswers[q.id];
                const isCorrect = selected === q.correctAnswer;

                return (
                  <div
                    key={q.id}
                    className={`p-6 rounded-2xl bg-[#171C2B] border transition-all ${
                      quizSubmitted
                        ? isCorrect
                          ? 'border-emerald-500/60 bg-emerald-950/10'
                          : 'border-red-500/60 bg-red-950/10'
                        : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-mono text-[#53D8F0]">Question {idx + 1}</span>
                        <h4 className="text-base font-semibold text-white mt-1">{q.prompt}</h4>
                      </div>
                      <div className="font-serif text-3xl font-bold text-[#E63946] flex-shrink-0">
                        {q.japanese}
                      </div>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                      {q.options.map((opt) => {
                        const isChosen = selected === opt;
                        const isThisCorrect = opt === q.correctAnswer;

                        let btnStyle = 'bg-white/5 border-white/10 text-white hover:bg-white/10';
                        if (isChosen && !quizSubmitted) {
                          btnStyle = 'bg-[#53D8F0]/20 border-[#53D8F0] text-[#53D8F0] font-semibold';
                        }
                        if (quizSubmitted) {
                          if (isThisCorrect) {
                            btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                          } else if (isChosen && !isThisCorrect) {
                            btnStyle = 'bg-red-500/20 border-red-500 text-red-300';
                          }
                        }

                        return (
                          <button
                            key={opt}
                            disabled={quizSubmitted}
                            onClick={() => handleSelectAnswer(q.id, opt)}
                            className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && isThisCorrect && (
                              <Check className="w-4 h-4 text-emerald-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {quizSubmitted && (
                      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-[#A6ADBD]">
                        <strong className="text-white">Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz Submit Button */}
            {!quizSubmitted && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(quizAnswers).length < SAMPLE_QUIZ_QUESTIONS.length}
                  className={`px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-xl ${
                    Object.keys(quizAnswers).length === SAMPLE_QUIZ_QUESTIONS.length
                      ? 'bg-[#E63946] text-white hover:bg-[#d62839] shadow-[#E63946]/40 cursor-pointer'
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }`}
                >
                  SUBMIT ANSWERS & EVALUATE (採点する)
                </button>
                {Object.keys(quizAnswers).length < SAMPLE_QUIZ_QUESTIONS.length && (
                  <p className="text-[11px] text-[#A6ADBD] mt-2">
                    Please answer all 5 questions before submitting.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
