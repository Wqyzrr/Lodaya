/**
 * js/rooms/musik/piano-tiles.js
 * Mesin Piano Tiles tingkat mudah dengan sinkronisasi audio (saat MP3 tersedia)
 * serta mode latihan presisi tinggi + nada pentatonik lembut (saat MP3 belum tersedia).
 */
export class PianoTilesEngine {
  constructor({ config, boardEl, tilesLayerEl, laneEls, audioManager, onStatsUpdate, onFeedback, onFinish }) {
    this.config = config;
    this.boardEl = boardEl;
    this.tilesLayerEl = tilesLayerEl;
    this.laneEls = laneEls;
    this.audioManager = audioManager;
    this.onStatsUpdate = onStatsUpdate;
    this.onFeedback = onFeedback;
    this.onFinish = onFinish;

    this.state = 'idle'; // 'idle' | 'playing' | 'paused' | 'finished'
    this.useAudioClock = false;
    this.songTime = 0;
    this.lastFrameTs = 0;
    this.rafId = null;

    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.hits = 0;
    this.misses = 0;
    this.activeNotes = [];

    this.audioCtx = null;
    this.pentatonicHz = [261.63, 293.66, 329.63, 392.0]; // C4, D4, E4, G4 (lembut)
    this.tick = this.tick.bind(this);
  }

  playSoftChime(laneIndex) {
    if (this.useAudioClock) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = this.pentatonicHz[laneIndex % 4];
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.3);
    } catch {
      // Abaikan jika Web Audio dibatasi
    }
  }

  reset() {
    this.stopLoop();
    this.tilesLayerEl.innerHTML = '';
    this.songTime = 0;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.hits = 0;
    this.misses = 0;
    this.state = 'idle';

    this.activeNotes = this.config.notes.map((n, idx) => ({
      id: idx,
      time: n.time + (this.config.offset || 0),
      lane: n.lane,
      status: 'pending', // 'pending' | 'active' | 'hit' | 'missed'
      el: null,
    }));

    this.emitStats();
  }

  async start() {
    this.reset();
    this.state = 'playing';

    const audioOk = await this.audioManager.playRoomTrack('musik', { loop: false, reset: true });
    this.useAudioClock = audioOk && this.audioManager.isTrackAvailable('musik');
    this.lastFrameTs = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
    return this.useAudioClock;
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.stopLoop();
    if (this.useAudioClock) {
      const el = this.audioManager.getTrackElement('musik');
      if (el && !el.paused) el.pause();
    }
  }

  resume() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    if (this.useAudioClock) {
      const el = this.audioManager.getTrackElement('musik');
      if (el) el.play().catch(() => {});
    }
    this.lastFrameTs = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stopLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  destroy() {
    this.stopLoop();
    this.tilesLayerEl.innerHTML = '';
    this.state = 'idle';
  }

  tapLane(laneIndex) {
    if (this.state !== 'playing') return;

    const laneEl = this.laneEls[laneIndex];
    if (laneEl) {
      laneEl.classList.add('is-flash');
      setTimeout(() => laneEl.classList.remove('is-flash'), 120);
    }

    // Cari bilah aktif terdekat di lajur ini dalam jendela waktu
    let bestNote = null;
    let bestDiff = Infinity;
    for (const note of this.activeNotes) {
      if (note.lane !== laneIndex || note.status !== 'active') continue;
      const diff = Math.abs(note.time - this.songTime);
      if (diff <= this.config.goodWindow && diff < bestDiff) {
        bestDiff = diff;
        bestNote = note;
      }
    }

    if (!bestNote) return;

    bestNote.status = 'hit';
    if (bestNote.el) bestNote.el.classList.add('is-hit');

    this.hits += 1;
    this.combo += 1;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    const isPerfect = bestDiff <= this.config.perfectWindow;
    this.score += isPerfect ? 100 : 70;
    this.playSoftChime(laneIndex);
    this.onFeedback(isPerfect ? 'Sempurna' : 'Bagus');
    this.emitStats();
  }

  tick(now) {
    if (this.state !== 'playing') return;
    const dt = Math.min(0.06, (now - this.lastFrameTs) / 1000);
    this.lastFrameTs = now;

    if (this.useAudioClock) {
      const audioEl = this.audioManager.getTrackElement('musik');
      if (audioEl && !audioEl.paused) {
        this.songTime = audioEl.currentTime;
      } else {
        this.songTime += dt;
      }
    } else {
      this.songTime += dt;
    }

    const boardH = this.boardEl.clientHeight || 360;
    const hitLineY = boardH * 0.79;
    const fallDur = this.config.fallDuration;

    for (const note of this.activeNotes) {
      const timeUntilHit = note.time - this.songTime;

      if (note.status === 'pending' && timeUntilHit <= fallDur) {
        note.status = 'active';
        const el = document.createElement('div');
        el.className = 'rhythm-tile';
        el.style.left = `calc(${note.lane * 25}% + 7px)`;
        this.tilesLayerEl.appendChild(el);
        note.el = el;
      }

      if (note.status === 'active' && note.el) {
        const progress = 1 - timeUntilHit / fallDur;
        const y = progress * hitLineY - 32;
        note.el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;

        if (timeUntilHit < -this.config.goodWindow) {
          note.status = 'missed';
          note.el.classList.add('is-missed');
          this.misses += 1;
          this.combo = 0;
          this.onFeedback('Terlewat');
          this.emitStats();
        }
      }

      if ((note.status === 'hit' || note.status === 'missed') && note.el && timeUntilHit < -0.75) {
        note.el.remove();
        note.el = null;
      }
    }

    this.emitStats();

    const totalDuration = this.getTotalDuration();
    if (this.songTime >= totalDuration) {
      this.state = 'finished';
      this.stopLoop();
      this.onFinish(this.getStats());
      return;
    }

    this.rafId = requestAnimationFrame(this.tick);
  }

  getTotalDuration() {
    if (this.useAudioClock) {
      const audioEl = this.audioManager.getTrackElement('musik');
      if (audioEl && Number.isFinite(audioEl.duration) && audioEl.duration > 0) {
        return audioEl.duration;
      }
    }
    return this.config.duration;
  }

  getStats() {
    const processed = this.hits + this.misses;
    const accuracy = processed > 0 ? Math.round((this.hits / processed) * 100) : 100;
    const progress = Math.min(100, Math.round((this.songTime / this.getTotalDuration()) * 100));
    return {
      score: this.score,
      combo: this.combo,
      maxCombo: this.maxCombo,
      accuracy,
      progress,
    };
  }

  emitStats() {
    if (this.onStatsUpdate) this.onStatsUpdate(this.getStats());
  }
}
