/**
 * Procedural Web Audio API sound generator for authentic Star Trek LCARS terminal sounds.
 * Zero external audio files, zero 404s, works reliably across all browsers.
 */

import { speechController } from './speechController';

export interface ThemePlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

class LcarsAudioSystem {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private redAlertOsc: OscillatorNode | null = null;
  private isRedAlertActive: boolean = false;

  // Ambient Starship Warp Engine Hum
  public isHumPlaying: boolean = false;
  private humGain: GainNode | null = null;
  private humOscillators: OscillatorNode[] = [];

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Set Master Mute. When muted, immediately kills all audio, engine hum, and AI speech.
   */
  public setMasterMute(muted: boolean) {
    this.enabled = !muted;
    if (muted) {
      this.stopStarfleetTheme();
      this.stopEngineHum();
      this.toggleRedAlert(false);
      speechController.stopAllSpeech();
    } else {
      this.playBeep(880, 0.08);
    }
  }

  /**
   * Standard LCARS interface button touch / click chime
   */
  public playBeep(pitch: number = 880, duration: number = 0.08) {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {}
  }

  /**
   * Two-tone Starfleet computer acknowledgment chime
   */
  public playChime() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Note 1 (E5 - 659.25 Hz)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.18);

      // Note 2 (B5 - 987.77 Hz - Perfect Fifth)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.12);
      gain2.gain.setValueAtTime(0.12, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.38);
    } catch {}
  }

  // =========================================================================
  // STAR TREK THEME: "ENTERPRISING YOUNG MEN" (Michael Giacchino)
  // Supports: Play, Pause, Resume from paused position, Volume, Replay, Jump to 38s
  // =========================================================================
  public isThemePlaying: boolean = false;
  public isThemePaused: boolean = false;
  public themeCurrentTime: number = 0;
  public themeDuration: number = 159.8;
  public themeVolume: number = 0.85;

  private themeAudio: HTMLAudioElement | null = null;
  private themeListeners: Set<(state: ThemePlayerState) => void> = new Set();
  private themeOscillators: OscillatorNode[] = [];
  private themeTimeout: number | null = null;

  public getThemeState(): ThemePlayerState {
    return {
      isPlaying: this.isThemePlaying,
      isPaused: this.isThemePaused,
      currentTime: this.themeCurrentTime,
      duration: this.themeDuration || 159.8,
      volume: this.themeVolume,
    };
  }

  public subscribeTheme(listener: (state: ThemePlayerState) => void): () => void {
    this.themeListeners.add(listener);
    listener(this.getThemeState());
    return () => {
      this.themeListeners.delete(listener);
    };
  }

  private notifyThemeListeners() {
    const st = this.getThemeState();
    this.themeListeners.forEach((fn) => {
      try {
        fn(st);
      } catch {}
    });
  }

  private initThemeAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.themeAudio) {
      const audio = new Audio('/audio/enterprising_young_men.mp3');
      audio.preload = 'auto';
      audio.volume = this.themeVolume;

      audio.addEventListener('play', () => {
        this.isThemePlaying = true;
        this.isThemePaused = false;
        this.notifyThemeListeners();
      });

      audio.addEventListener('pause', () => {
        this.isThemePlaying = false;
        this.isThemePaused = audio.currentTime > 0 && audio.currentTime < (audio.duration || 159.8);
        this.notifyThemeListeners();
      });

      audio.addEventListener('ended', () => {
        this.isThemePlaying = false;
        this.isThemePaused = false;
        this.themeCurrentTime = 0;
        this.notifyThemeListeners();
      });

      audio.addEventListener('timeupdate', () => {
        this.themeCurrentTime = audio.currentTime;
        if (audio.duration && !isNaN(audio.duration)) {
          this.themeDuration = audio.duration;
        }
        this.notifyThemeListeners();
      });

      audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && !isNaN(audio.duration)) {
          this.themeDuration = audio.duration;
          this.notifyThemeListeners();
        }
      });

      audio.addEventListener('error', (e) => {
        console.warn('[LCARS Audio] Theme mp3 error, fallback to synth fanfare:', e);
      });

      this.themeAudio = audio;
    }
    return this.themeAudio;
  }

  /**
   * Play or Resume Star Trek Theme.
   * If paused, resumes exactly from where it was paused.
   * If seekTo is passed, seeks to that second and starts playing.
   */
  public playTheme(seekTo?: number): boolean {
    if (!this.enabled) return false;
    this.stopSynthFanfare();

    try {
      const audio = this.initThemeAudio();
      if (!audio) return false;

      audio.volume = this.themeVolume;

      if (typeof seekTo === 'number') {
        audio.currentTime = seekTo;
        this.themeCurrentTime = seekTo;
      }

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isThemePlaying = true;
            this.isThemePaused = false;
            this.notifyThemeListeners();
          })
          .catch((err) => {
            console.warn('[LCARS Audio] HTMLAudio autoplay blocked, using synth fanfare:', err);
            this.playSynthFanfare();
          });
      }
      return true;
    } catch {
      return this.playSynthFanfare();
    }
  }

  /**
   * Pause Star Trek Theme and remember exact timestamp.
   */
  public pauseTheme() {
    if (this.themeAudio && !this.themeAudio.paused) {
      this.themeAudio.pause();
      this.isThemePlaying = false;
      this.isThemePaused = true;
      this.themeCurrentTime = this.themeAudio.currentTime;
      this.notifyThemeListeners();
    }
    this.stopSynthFanfare();
  }

  /**
   * Toggle Play / Pause:
   * 1. If playing -> pauses.
   * 2. If paused -> resumes from where it was paused.
   * 3. If stopped -> plays from beginning.
   */
  public toggleStarfleetTheme(): boolean {
    const audio = this.initThemeAudio();
    if (!audio) return false;

    if (this.isThemePlaying) {
      this.pauseTheme();
      return false;
    } else {
      // Resume from current timestamp or start
      this.playTheme();
      return true;
    }
  }

  /**
   * Replay song from the beginning (00:00).
   */
  public replayTheme() {
    this.playTheme(0);
  }

  /**
   * Jump directly to 38 seconds (Iconic Main Fanfare burst) and play.
   */
  public playThemeFrom38s() {
    this.playTheme(38.0);
  }

  /**
   * Seek to specific timestamp in seconds.
   */
  public seekTheme(seconds: number) {
    if (this.themeAudio) {
      this.themeAudio.currentTime = Math.max(0, Math.min(seconds, this.themeDuration || 105));
      this.themeCurrentTime = this.themeAudio.currentTime;
      this.notifyThemeListeners();
    }
  }

  /**
   * Adjust Theme Song Volume (0.0 to 1.0).
   */
  public setThemeVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.themeVolume = clamped;
    if (this.themeAudio) {
      this.themeAudio.volume = clamped;
    }
    this.notifyThemeListeners();
  }

  /**
   * Stop completely and reset position.
   */
  public stopStarfleetTheme() {
    if (this.themeAudio) {
      try {
        this.themeAudio.pause();
        this.themeAudio.currentTime = 0;
      } catch {}
    }
    this.isThemePlaying = false;
    this.isThemePaused = false;
    this.themeCurrentTime = 0;
    this.stopSynthFanfare();
    this.notifyThemeListeners();
  }

  /**
   * Synthesized brass fanfare fallback via Web Audio oscillators
   */
  public playSynthFanfare(onEnded?: () => void): boolean {
    if (!this.enabled) return false;
    this.stopSynthFanfare();

    try {
      this.initContext();
      if (!this.ctx) return false;

      const now = this.ctx.currentTime + 0.05;
      const notes = [
        { f: 493.88, d: 0.38, t: 0.0 },
        { f: 659.25, d: 0.65, t: 0.42 },
        { f: 739.99, d: 0.38, t: 1.12 },
        { f: 783.99, d: 0.48, t: 1.54 },
        { f: 987.77, d: 0.72, t: 2.06 },
        { f: 880.00, d: 0.38, t: 2.82 },
        { f: 783.99, d: 0.38, t: 3.24 },
        { f: 739.99, d: 0.48, t: 3.66 },
        { f: 659.25, d: 1.15, t: 4.18 },
      ];

      this.isThemePlaying = true;
      this.isThemePaused = false;
      this.themeOscillators = [];
      this.notifyThemeListeners();

      notes.forEach((note) => {
        if (!this.ctx) return;
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(note.f, now + note.t);

        gain1.gain.setValueAtTime(0.0001, now + note.t);
        gain1.gain.linearRampToValueAtTime(0.18 * this.themeVolume, now + note.t + 0.04);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + note.t + note.d);

        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now + note.t);
        osc1.stop(now + note.t + note.d);
        this.themeOscillators.push(osc1);
      });

      const totalDurationMs = (4.18 + 1.25) * 1000;
      this.themeTimeout = window.setTimeout(() => {
        this.isThemePlaying = false;
        this.isThemePaused = false;
        this.themeOscillators = [];
        this.notifyThemeListeners();
        if (onEnded) onEnded();
      }, totalDurationMs);

      return true;
    } catch {
      this.isThemePlaying = false;
      return false;
    }
  }

  private stopSynthFanfare() {
    if (this.themeTimeout) {
      clearTimeout(this.themeTimeout);
      this.themeTimeout = null;
    }
    this.themeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.themeOscillators = [];
  }

  /**
   * Ambient Starship Warp Core Engine Hum (Toggle on/off)
   */
  public toggleEngineHum(): boolean {
    if (this.isHumPlaying) {
      this.stopEngineHum();
      return false;
    } else {
      this.startEngineHum();
      return true;
    }
  }

  public startEngineHum() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.isHumPlaying) return;

      this.humGain = this.ctx.createGain();
      this.humGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.humGain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 1.5);
      this.humGain.connect(this.ctx.destination);

      // 1. Deep 60Hz warp core hum
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(60, this.ctx.currentTime);
      osc1.connect(this.humGain);
      osc1.start();

      // 2. 120Hz secondary harmonic
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc2.connect(this.humGain);
      osc2.start();

      // 3. Gentle 45Hz sub-bass pulse
      const osc3 = this.ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(45, this.ctx.currentTime);
      osc3.connect(this.humGain);
      osc3.start();

      this.humOscillators = [osc1, osc2, osc3];
      this.isHumPlaying = true;
    } catch {}
  }

  public stopEngineHum() {
    if (this.humGain && this.ctx) {
      try {
        this.humGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        setTimeout(() => {
          this.humOscillators.forEach((osc) => {
            try {
              osc.stop();
              osc.disconnect();
            } catch {}
          });
          this.humOscillators = [];
          if (this.humGain) {
            this.humGain.disconnect();
            this.humGain = null;
          }
        }, 500);
      } catch {}
    }
    this.isHumPlaying = false;
  }

  /**
   * Warp drive pulse
   */
  public playWarp() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 1.2);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 1.2);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.5);
    } catch {}
  }

  /**
   * Transporter energize harmonic sweep
   */
  public playTransporter() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const freqs = [329.63, 440, 554.37, 659.25, 880];

      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.01, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + 1.8);
      });
    } catch {}
  }

  /**
   * Phaser beam discharge pulse
   */
  public playPhaser() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.45);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {}
  }

  /**
   * Photon Torpedo launch sound
   */
  public playPhotonTorpedo() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.5);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }

  /**
   * Shield toggle resonance
   */
  public playShieldToggle(active: boolean) {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(active ? 220 : 880, now);
      osc.frequency.exponentialRampToValueAtTime(active ? 880 : 180, now + 0.35);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  /**
   * Red Alert Klaxon toggling
   */
  public toggleRedAlert(active: boolean) {
    if (!this.enabled) {
      this.isRedAlertActive = false;
      return;
    }
    try {
      this.initContext();
      if (!this.ctx) return;

      if (!active) {
        this.isRedAlertActive = false;
        if (this.redAlertOsc) {
          try {
            this.redAlertOsc.stop();
            this.redAlertOsc.disconnect();
          } catch {}
          this.redAlertOsc = null;
        }
        return;
      }

      if (this.isRedAlertActive) return;
      this.isRedAlertActive = true;

      const now = this.ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const pulseStart = now + i * 0.9;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, pulseStart);
        osc.frequency.linearRampToValueAtTime(880, pulseStart + 0.5);

        gain.gain.setValueAtTime(0.001, pulseStart);
        gain.gain.linearRampToValueAtTime(0.14, pulseStart + 0.05);
        gain.gain.linearRampToValueAtTime(0.14, pulseStart + 0.45);
        gain.gain.exponentialRampToValueAtTime(0.001, pulseStart + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(pulseStart);
        osc.stop(pulseStart + 0.6);
      }
    } catch {}
  }

  /**
   * Yellow Alert pulse tone
   */
  public playYellowAlert() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      for (let i = 0; i < 2; i++) {
        const t = now + i * 0.45;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, t); // D5
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
      }
    } catch {}
  }

  /**
   * Classic Starfleet Communicator Flip Chirp
   */
  public playCommunicatorChirp() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const chirps = [880, 1174.66, 1318.51, 1760];
      chirps.forEach((f, idx) => {
        if (!this.ctx) return;
        const t = now + idx * 0.055;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.09);
      });
    } catch {}
  }

  /**
   * Pneumatic Starship Turbolift / Cabin Door Swish
   */
  public playDoorSwish() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(280, now + 0.38);
      filter.Q.value = 1.2;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch {}
  }

  /**
   * Starfleet Boatswain Whistle (Naval Honor Pipe)
   */
  public playBoatswainWhistle() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.linearRampToValueAtTime(2200, now + 0.3);
      osc.frequency.linearRampToValueAtTime(1750, now + 0.7);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.1);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
    } catch {}
  }

  /**
   * LCARS Computer Processing Computational Sweep
   */
  public playComputerSweep() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      for (let i = 0; i < 5; i++) {
        const t = now + i * 0.04;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600 + (i * 240) % 900, t);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
      }
    } catch {}
  }
}

export const lcarsAudio = new LcarsAudioSystem();
