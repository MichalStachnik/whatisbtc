/**
 * Procedural audio manager for the game.
 * Generates all sounds via Web Audio API — no external files needed.
 * Singleton that persists across Phaser scene switches.
 */

class AudioManagerClass {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private initialized = false;
  private muted = false;

  // Music nodes
  private musicGain: GainNode | null = null;
  private musicOscillators: OscillatorNode[] = [];
  private musicInterval: ReturnType<typeof setInterval> | null = null;

  // Rain nodes
  private rainSource: AudioBufferSourceNode | null = null;
  private rainGain: GainNode | null = null;
  private rainFilter: BiquadFilterNode | null = null;

  // State
  private isIndoor = false;
  private readonly OUTDOOR_RAIN_VOL = 0.15;
  private readonly INDOOR_RAIN_VOL = 0.03;
  private readonly OUTDOOR_RAIN_FREQ = 5000;
  private readonly INDOOR_RAIN_FREQ = 600;

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);
      this.startMusic();
      this.startRain();
      this.initialized = true;
    } catch {
      // Web Audio not available
    }
  }

  // ── Background Music ──────────────────────────────────
  // Slow, moody cyberpunk arpeggio in C minor using soft sine waves

  private startMusic() {
    if (!this.ctx || !this.masterGain) return;

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.04;

    // Reverb-like effect via feedback delay
    const delay = this.ctx.createDelay();
    delay.delayTime.value = 0.3;
    const feedback = this.ctx.createGain();
    feedback.gain.value = 0.3;
    const delayFilter = this.ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.value = 1200;

    // Dry path
    this.musicGain.connect(this.masterGain);
    // Wet path (delay → filter → feedback → delay, and also to master)
    this.musicGain.connect(delay);
    delay.connect(delayFilter);
    delayFilter.connect(feedback);
    feedback.connect(delay);
    delayFilter.connect(this.masterGain);

    // C minor pentatonic notes across octaves for cyberpunk feel
    const notes = [
      130.81, // C3
      155.56, // Eb3
      196.00, // G3
      233.08, // Bb3
      261.63, // C4
      311.13, // Eb4
      392.00, // G4
      233.08, // Bb3
      196.00, // G3
      155.56, // Eb3
      130.81, // C3
      98.00,  // G2
    ];

    let noteIndex = 0;

    const playNote = () => {
      if (!this.ctx || !this.musicGain) return;

      const freq = notes[noteIndex % notes.length];
      noteIndex++;

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const noteGain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      // Soft attack, long decay
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.6, now + 0.08);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      osc.connect(noteGain);
      noteGain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 2.5);

      // Also play a quiet octave-up harmonic
      const harm = this.ctx.createOscillator();
      harm.type = 'sine';
      harm.frequency.value = freq * 2;

      const harmGain = this.ctx.createGain();
      harmGain.gain.setValueAtTime(0, now);
      harmGain.gain.linearRampToValueAtTime(0.15, now + 0.12);
      harmGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      harm.connect(harmGain);
      harmGain.connect(this.musicGain);

      harm.start(now);
      harm.stop(now + 1.8);
    };

    // Play first note immediately, then every 1.6 seconds
    playNote();
    this.musicInterval = setInterval(playNote, 1600);
  }

  // ── Rain ──────────────────────────────────────────────

  private startRain() {
    if (!this.ctx || !this.masterGain) return;

    // Generate noise buffer (3 seconds, looped)
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Brown noise — natural rain sound
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }

    this.rainSource = this.ctx.createBufferSource();
    this.rainSource.buffer = buffer;
    this.rainSource.loop = true;

    this.rainFilter = this.ctx.createBiquadFilter();
    this.rainFilter.type = 'bandpass';
    this.rainFilter.frequency.value = this.OUTDOOR_RAIN_FREQ;
    this.rainFilter.Q.value = 0.5;

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.value = this.OUTDOOR_RAIN_VOL;

    this.rainSource.connect(this.rainFilter);
    this.rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);
    this.rainSource.start();
  }

  // ── Outdoor / Indoor Transition ───────────────────────

  setOutdoor() {
    if (!this.ctx || !this.rainGain || !this.rainFilter) return;
    this.isIndoor = false;
    const t = this.ctx.currentTime;
    this.rainGain.gain.cancelScheduledValues(t);
    this.rainFilter.frequency.cancelScheduledValues(t);
    this.rainGain.gain.setValueAtTime(this.rainGain.gain.value, t);
    this.rainFilter.frequency.setValueAtTime(this.rainFilter.frequency.value, t);
    this.rainGain.gain.linearRampToValueAtTime(this.OUTDOOR_RAIN_VOL, t + 0.8);
    this.rainFilter.frequency.linearRampToValueAtTime(this.OUTDOOR_RAIN_FREQ, t + 0.8);
  }

  setIndoor() {
    if (!this.ctx || !this.rainGain || !this.rainFilter) return;
    this.isIndoor = true;
    const t = this.ctx.currentTime;
    this.rainGain.gain.cancelScheduledValues(t);
    this.rainFilter.frequency.cancelScheduledValues(t);
    this.rainGain.gain.setValueAtTime(this.rainGain.gain.value, t);
    this.rainFilter.frequency.setValueAtTime(this.rainFilter.frequency.value, t);
    this.rainGain.gain.linearRampToValueAtTime(this.INDOOR_RAIN_VOL, t + 0.8);
    this.rainFilter.frequency.linearRampToValueAtTime(this.INDOOR_RAIN_FREQ, t + 0.8);
  }

  // ── Footstep SFX ──────────────────────────────────────

  playFootstep() {
    if (!this.ctx || !this.masterGain || this.muted) return;

    const now = this.ctx.currentTime;

    // Longer, punchier footstep
    const duration = 0.1;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Sharp attack, medium decay
      const env = Math.exp(-i / (bufferSize * 0.12));
      data[i] = (Math.random() * 2 - 1) * env;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    // Bandpass filter — lower freq for a heavier step feel
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400 + Math.random() * 300;
    filter.Q.value = 1.5;

    const gain = this.ctx.createGain();
    // Much louder — audible over rain
    gain.gain.value = this.isIndoor ? 0.35 : 0.25;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(now);
    source.stop(now + duration);
  }

  // ── Lesson Complete SFX ────────────────────────────────

  playLessonComplete() {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;

    // Ascending 3-note chime: C5 → E5 → G5
    const freqs = [523.25, 659.25, 783.99];
    freqs.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = this.ctx!.createGain();
      const start = now + i * 0.12;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(start);
      osc.stop(start + 0.6);
    });
  }

  // ── Dialogue Advance SFX ──────────────────────────────

  playDialogueAdvance() {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;

    // Quick soft "blip" — short sine chirp
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(900, now + 0.04);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // ── Terminal Open SFX ────────────────────────────────

  playTerminalOpen() {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;

    // Electronic "power on" — rising tone with digital buzz
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);

    // Secondary confirmation beep
    const beep = this.ctx.createOscillator();
    beep.type = 'sine';
    beep.frequency.value = 1200;

    const beepGain = this.ctx.createGain();
    beepGain.gain.setValueAtTime(0, now + 0.12);
    beepGain.gain.linearRampToValueAtTime(0.1, now + 0.14);
    beepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    beep.connect(beepGain);
    beepGain.connect(this.masterGain);
    beep.start(now + 0.12);
    beep.stop(now + 0.3);
  }

  // ── Terminal Close SFX ──────────────────────────────

  playTerminalClose() {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;

    // Electronic "power down" — falling tone
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1500;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // ── NPC Greeting SFX ────────────────────────────────

  playNpcGreeting() {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;

    // "Huh?" vocal-like sound — two-tone pitch bend with formant filter
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    // Rising inflection like a questioning "Hm?"
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.08);
    osc.frequency.linearRampToValueAtTime(320, now + 0.18);

    const formant = this.ctx.createBiquadFilter();
    formant.type = 'bandpass';
    formant.frequency.value = 800;
    formant.Q.value = 2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.03);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(formant);
    formant.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);

    // Nasal harmonic for vocal character
    const harm = this.ctx.createOscillator();
    harm.type = 'sine';
    harm.frequency.setValueAtTime(360, now);
    harm.frequency.linearRampToValueAtTime(440, now + 0.08);
    harm.frequency.linearRampToValueAtTime(640, now + 0.18);

    const harmGain = this.ctx.createGain();
    harmGain.gain.setValueAtTime(0, now);
    harmGain.gain.linearRampToValueAtTime(0.06, now + 0.03);
    harmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    harm.connect(harmGain);
    harmGain.connect(this.masterGain);
    harm.start(now);
    harm.stop(now + 0.2);
  }

  // ── Mute Control ──────────────────────────────────────

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      const t = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(t);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, t);
      this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : 1, t + 0.1);
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  // ── Lifecycle ─────────────────────────────────────────

  dispose() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    try {
      this.rainSource?.stop();
      this.musicOscillators.forEach((o) => { try { o.stop(); } catch { /* */ } });
    } catch {
      // Already stopped
    }
    this.ctx?.close();
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.musicOscillators = [];
    this.rainSource = null;
    this.rainGain = null;
    this.rainFilter = null;
    this.initialized = false;
  }
}

export const AudioManager = new AudioManagerClass();
