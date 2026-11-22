// Fun Web Audio Soundboard & Generative Arpeggiator Engine
class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private arpeggioTimer: number | null = null;
  private listeners: Set<(isPlaying: boolean) => void> = new Set();

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public subscribe(fn: (isPlaying: boolean) => void): () => void {
    this.listeners.add(fn);
    fn(!this.isMuted);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(!this.isMuted));
  }

  public toggle(): boolean {
    const ctx = this.getContext();
    if (!ctx) return false;

    if (this.isMuted) {
      this.isMuted = false;
      this.playSfx('powerUp');
      this.startFunArpeggio();
    } else {
      this.playSfx('powerDown');
      this.isMuted = true;
      this.stopFunArpeggio();
    }
    this.notify();
    return !this.isMuted;
  }

  public getIsPlaying(): boolean {
    return !this.isMuted;
  }

  // Playful arpeggiator looping a gentle pentatonic cyberpunk melody
  private startFunArpeggio() {
    this.stopFunArpeggio();
    const ctx = this.getContext();
    if (!ctx) return;

    // Pentatonic scale frequencies in Hz: A3, C4, D4, E4, G4, A4, C5, D5
    const notes = [220, 261.63, 293.66, 329.63, 392.0, 440, 523.25, 587.33];
    let noteIndex = 0;

    const playStep = () => {
      if (this.isMuted) return;
      const now = ctx.currentTime;
      const freq = notes[noteIndex % notes.length];
      noteIndex = (noteIndex + 1) % (notes.length * 2);

      // Play soft bell-like synth pulse
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = noteIndex % 3 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.025, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);

      // Next note in 240ms (upbeat tempo ~125 BPM 8th notes)
      this.arpeggioTimer = window.setTimeout(playStep, 240);
    };

    playStep();
  }

  private stopFunArpeggio() {
    if (this.arpeggioTimer !== null) {
      clearTimeout(this.arpeggioTimer);
      this.arpeggioTimer = null;
    }
  }

  // Tactical / UI Sound Effects
  public playSfx(type: 'powerUp' | 'powerDown' | 'click' | 'warp' | 'key' | 'confetti') {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (type) {
      case 'powerUp': {
        // Upbeat 8-bit game start chime: C4 -> E4 -> G4 -> C5
        const chords = [261.63, 329.63, 392.0, 523.25];
        chords.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + idx * 0.07;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.04, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.2);
        });
        break;
      }

      case 'powerDown': {
        // Descending powered-off chirp
        const chords = [440, 329.63, 220];
        chords.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + idx * 0.08;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.03, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.18);
        });
        break;
      }

      case 'click': {
        // High-tech tactile click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case 'warp': {
        // Sci-fi warp chord
        [300, 600, 900].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.8, now + 0.18);
          gain.gain.setValueAtTime(0.02, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.22);
        });
        break;
      }

      case 'key': {
        // Mechanical keyboard click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200 + Math.random() * 400, now);
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
        break;
      }

      case 'confetti': {
        // Victory fanfare arpeggio
        const fanfare = [523.25, 659.25, 783.99, 1046.5];
        fanfare.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + idx * 0.06;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.03, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.3);
        });
        break;
      }
    }
  }
}

export const audioManager = new AudioManager();
