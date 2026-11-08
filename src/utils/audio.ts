/**
 * Japanese Club Web Audio Synthesizer
 * Generates an ethereal Japanese Pentatonic (In-sen / Yo scale) ambiance
 * and provides Web Speech API pronunciation.
 */

class JapaneseAmbienceEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: number | null = null;
  private gainNode: GainNode | null = null;

  // Traditional In-sen / Hirajoshi scale notes in Hz (C, Db, F, G, Bb)
  private readonly notes = [
    261.63, // C4
    277.18, // C#4
    349.23, // F4
    392.0,  // G4
    466.16, // A#4
    523.25, // C5
    554.37, // C#5
    698.46, // F5
    783.99  // G5
  ];

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private start() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.15, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);

      this.isPlaying = true;
      this.playPluck();

      // Ambient rhythm every 2-4 seconds
      this.intervalId = window.setInterval(() => {
        if (this.isPlaying) {
          this.playPluck();
        }
      }, 2600);
    } catch {
      this.isPlaying = false;
    }
  }

  private playPluck() {
    if (!this.ctx || !this.gainNode) return;

    const osc = this.ctx.createOscillator();
    const pluckGain = this.ctx.createGain();

    // Pick random note from In-sen scale
    const note = this.notes[Math.floor(Math.random() * this.notes.length)];
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note, this.ctx.currentTime);

    // Koto-like decay
    const now = this.ctx.currentTime;
    pluckGain.gain.setValueAtTime(0, now);
    pluckGain.gain.linearRampToValueAtTime(0.12, now + 0.05);
    pluckGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

    osc.connect(pluckGain);
    pluckGain.connect(this.gainNode);

    osc.start(now);
    osc.stop(now + 3.3);
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
  }
}

export const ambienceEngine = new JapaneseAmbienceEngine();

/**
 * Native Web Speech API speech synthesis for Japanese pronunciation
 */
export function speakJapanese(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const cleanText = text.split('(')[0].trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85; // Slightly slower for language learners
    utterance.pitch = 1.0;

    // Pick a Japanese voice if available
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find((v) => v.lang.startsWith('ja'));
    if (jaVoice) {
      utterance.voice = jaVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // Graceful fallback
  }
}
