/**
 * js/rooms/musik/saron-audio.js
 * Mesin suara Saron hibrida:
 * 1) Jika assets/audio/saron-base.mp3 tersedia -> pitch-shifting dengan playbackRate.
 * 2) Jika belum tersedia -> sintesis logam perunggu Saron via Web Audio API.
 */
import { appState } from '../../core/state-manager.js';

const BASE_SAMPLE_URL = 'assets/audio/saron-base.mp3';

// 6 nada pentatonik (Laras Slendro / C Mayor Pentatonik: 1, 2, 3, 5, 6, i)
export const SARON_NOTES = [
  { index: 0, cipher: '1', name: 'Ji',  freq: 261.63, rate: 1.0000 }, // C4
  { index: 1, cipher: '2', name: 'Ro',  freq: 293.66, rate: 1.1225 }, // D4
  { index: 2, cipher: '3', name: 'Lu',  freq: 329.63, rate: 1.2599 }, // E4
  { index: 3, cipher: '5', name: 'Ma',  freq: 392.00, rate: 1.4983 }, // G4
  { index: 4, cipher: '6', name: 'Nem', freq: 440.00, rate: 1.6818 }, // A4
  { index: 5, cipher: '1̇', name: 'Ji+', freq: 523.25, rate: 2.0000 }, // C5
];

class SaronAudioEngine {
  constructor() {
    this.ctx = null;
    this.sampleBuffer = null;
    this.sampleAttempted = false;
  }

  ensureContext() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  async preloadSample() {
    if (this.sampleAttempted) return;
    this.sampleAttempted = true;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const res = await fetch(BASE_SAMPLE_URL);
      if (!res.ok) return;
      const arrayBuf = await res.arrayBuffer();
      this.sampleBuffer = await ctx.decodeAudioData(arrayBuf);
    } catch {
      // Fallback mulus ke sintesis Web Audio
      this.sampleBuffer = null;
    }
  }

  getEffectiveVolume() {
    if (appState.get('audioMuted')) return 0;
    const globalVol = appState.get('audioVolume');
    return Math.max(0, Math.min(1, Number.isFinite(globalVol) ? globalVol : 0.65));
  }

  /**
   * Bunyikan satu bilah saron (index 0..5).
   */
  playNote(bilahIndex, velocity = 1) {
    const vol = this.getEffectiveVolume() * velocity;
    if (vol <= 0.001) return;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const note = SARON_NOTES[bilahIndex];
    if (!note) return;

    if (this.sampleBuffer) {
      this.playFromSample(ctx, note.rate, vol);
    } else {
      this.playSynthesizedSaron(ctx, note.freq, vol);
    }
  }

  playFromSample(ctx, rate, vol) {
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = this.sampleBuffer;
    src.playbackRate.value = rate;

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(vol * 0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

    src.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
  }

  /**
   * Sintesis karakter bilah perunggu Saron:
   * - Nada dasar sine + triangle hangat
   * - Overtone metalik khas gamelan (rasio 2.76x & 5.4x)
   * - Pukulan awal tabuh kayu singkat (percussive transient)
   */
  playSynthesizedSaron(ctx, freq, vol) {
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(vol * 1.0, now);
    master.connect(ctx.destination);

    // 1. Resonansi nada dasar (perunggu utama)
    const oscFund = ctx.createOscillator();
    const gainFund = ctx.createGain();
    oscFund.type = 'sine';
    oscFund.frequency.setValueAtTime(freq, now);
    gainFund.gain.setValueAtTime(0.001, now);
    gainFund.gain.linearRampToValueAtTime(0.9, now + 0.006);
    gainFund.gain.exponentialRampToValueAtTime(0.001, now + 1.45);
    oscFund.connect(gainFund);
    gainFund.connect(master);
    oscFund.start(now);
    oscFund.stop(now + 1.5);

    // 2. Kehangatan tubuh bilah (detune tipis untuk efek ombak/ombak gamelan)
    const oscWarm = ctx.createOscillator();
    const gainWarm = ctx.createGain();
    oscWarm.type = 'triangle';
    oscWarm.frequency.setValueAtTime(freq * 1.003, now);
    gainWarm.gain.setValueAtTime(0.001, now);
    gainWarm.gain.linearRampToValueAtTime(0.32, now + 0.008);
    gainWarm.gain.exponentialRampToValueAtTime(0.001, now + 1.05);
    oscWarm.connect(gainWarm);
    gainWarm.connect(master);
    oscWarm.start(now);
    oscWarm.stop(now + 1.1);

    // 3. Harmonik logam (inharmonic metallophone overtone)
    const oscMetal = ctx.createOscillator();
    const gainMetal = ctx.createGain();
    oscMetal.type = 'sine';
    oscMetal.frequency.setValueAtTime(freq * 2.76, now);
    gainMetal.gain.setValueAtTime(0.001, now);
    gainMetal.gain.linearRampToValueAtTime(0.24, now + 0.003);
    gainMetal.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
    oscMetal.connect(gainMetal);
    gainMetal.connect(master);
    oscMetal.start(now);
    oscMetal.stop(now + 0.38);

    // 4. Sentakan ketukan tabuh kayu (transient sangat singkat)
    const oscStrike = ctx.createOscillator();
    const gainStrike = ctx.createGain();
    oscStrike.type = 'sine';
    oscStrike.frequency.setValueAtTime(freq * 5.4, now);
    gainStrike.gain.setValueAtTime(0.18, now);
    gainStrike.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    oscStrike.connect(gainStrike);
    gainStrike.connect(master);
    oscStrike.start(now);
    oscStrike.stop(now + 0.05);
  }

  /**
   * Efek suara halus saat urutan salah (ketukan kayu tumpul, tidak bikin kaget).
   */
  playMissFeedback() {
    const vol = this.getEffectiveVolume();
    if (vol <= 0.001) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(165, now);
    osc.frequency.exponentialRampToValueAtTime(115, now + 0.18);

    gain.gain.setValueAtTime(vol * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  /**
   * Dentuman gong lembut saat menyelesaikan babak atau menamatkan lagu.
   */
  playGongAccent() {
    const vol = this.getEffectiveVolume();
    if (vol <= 0.001) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(130.81, now); // C3 rendah hangat

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol * 0.32, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 2.3);
  }
}

export const saronAudio = new SaronAudioEngine();