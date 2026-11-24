/**
 * audio-manager.js
 * Pengelola audio terpusat: musik latar ambient, transisi audio per ruangan,
 * kontrol volume & senyap, kepatuhan kebijakan autoplay browser, dan fallback
 * halus bila berkas MP3 belum tersedia.
 */
import { appState } from './state-manager.js';

export const AUDIO_TRACKS = {
  ambient: 'assets/audio/ambient-jatim.mp3',
  peran: 'assets/audio/reog-story.mp3',
  tari: 'assets/audio/gandrung-banyuwangi.mp3',
  musik: 'assets/audio/rek-ayo-rek.mp3',
};

export const AUDIO_SFX = {
  curtainsOpen: 'assets/audio/curtains-open.mp3',
  doorOpen: 'assets/audio/door-open.mp3',
};

class AudioManager {
  constructor() {
    this.tracks = new Map();
    this.sfx = new Map();
    this.unavailable = new Set();
    this.activeRoomKey = null;
    this.ambientWanted = true;
    this.unlocked = false;

    this.btnToggle = document.getElementById('btn-audio-toggle');
    this.volumeSlider = document.getElementById('audio-volume-slider');
    this.statusLabel = document.getElementById('audio-status-label');
  }

  init() {
    Object.entries(AUDIO_TRACKS).forEach(([key, src]) => {
      const audio = new Audio();
      audio.src = src;
      audio.preload = 'auto';
      audio.loop = key === 'ambient' || key === 'peran' || key === 'tari';
      audio.volume = appState.get('audioVolume');

      audio.addEventListener('error', () => {
        console.warn(`[Audio] Gagal memuat track "${key}" dari: ${src}`);
        this.unavailable.add(key);
        this.updateUI();
      });

      audio.load();
      this.tracks.set(key, audio);
    });

    Object.entries(AUDIO_SFX).forEach(([key, src]) => {
      const audio = new Audio();
      audio.src = src;
      audio.preload = 'auto';
      audio.loop = false;
      audio.volume = appState.get('audioVolume');

      audio.addEventListener('error', () => {
        console.warn(`[Audio] Gagal memuat SFX "${key}" dari: ${src}`);
        this.unavailable.add(`sfx:${key}`);
      });

      audio.load();
      this.sfx.set(key, audio);
    });

    this.bindUI();
    this.attemptAutoplayAmbient();
  }

  bindUI() {
    if (this.btnToggle) {
      this.btnToggle.addEventListener('click', () => {
        this.toggleMute();
      });
    }

    if (this.volumeSlider) {
      this.volumeSlider.value = String(appState.get('audioVolume'));
      this.volumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.setVolume(val);
      });
    }

    // Buka kunci audio otomatis pada interaksi sah pertama bila autoplay diblokir
    const unlockHandler = () => {
      if (this.unlocked) return;
      this.unlocked = true;
      window.removeEventListener('pointerdown', unlockHandler);
      window.removeEventListener('keydown', unlockHandler);

      if (!appState.get('audioMuted') && this.ambientWanted && !this.activeRoomKey) {
        this.playAmbient();
      }
    };

    window.addEventListener('pointerdown', unlockHandler, { passive: true });
    window.addEventListener('keydown', unlockHandler, { passive: true });
    this.updateUI();
  }

  attemptAutoplayAmbient() {
    if (appState.get('audioMuted') || this.unavailable.has('ambient')) return;
    const ambient = this.tracks.get('ambient');
    if (!ambient) return;

    ambient.volume = appState.get('audioVolume');
    const playPromise = ambient.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => {
          this.unlocked = true;
          this.updateUI();
        })
        .catch(() => {
          // Diblokir kebijakan autoplay — akan aktif otomatis setelah interaksi pertama
          this.updateUI();
        });
    }
  }

  isTrackAvailable(key) {
    return this.tracks.has(key) && !this.unavailable.has(key);
  }

  getTrackElement(key) {
    return this.tracks.get(key) || null;
  }

  fadeVolume(audio, targetVolume, duration = 0.55, onComplete = null) {
    if (!audio) return;
    if (window.gsap) {
      window.gsap.killTweensOf(audio);
      window.gsap.to(audio, {
        volume: Math.max(0, Math.min(1, targetVolume)),
        duration,
        ease: 'power1.out',
        onComplete: () => {
          if (onComplete) onComplete();
        },
      });
    } else {
      audio.volume = Math.max(0, Math.min(1, targetVolume));
      if (onComplete) onComplete();
    }
  }

  playAmbient() {
    this.ambientWanted = true;
    if (appState.get('audioMuted') || this.unavailable.has('ambient')) return;
    const ambient = this.tracks.get('ambient');
    if (!ambient) return;

    const targetVol = appState.get('audioVolume');
    if (ambient.paused) {
      ambient.volume = 0;
      ambient.play().then(() => {
        this.unlocked = true;
        this.fadeVolume(ambient, targetVol, 0.7);
      }).catch((err) => {
        console.warn('[Audio] Ambient ditahan browser:', err.message);
      });
    } else {
      this.fadeVolume(ambient, targetVol, 0.5);
    }
  }

  pauseAmbient() {
    const ambient = this.tracks.get('ambient');
    if (!ambient || ambient.paused) return;
    this.fadeVolume(ambient, 0, 0.4, () => {
      ambient.pause();
    });
  }

  duckAmbient(ratio = 0.25) {
    const ambient = this.tracks.get('ambient');
    if (!ambient || ambient.paused) return;
    this.fadeVolume(ambient, appState.get('audioVolume') * ratio, 0.4);
  }

  async playRoomTrack(key, { loop = true, reset = false } = {}) {
    this.stopRoomTrack(false);

    if (!this.isTrackAvailable(key)) {
      this.activeRoomKey = null;
      return false;
    }

    const track = this.tracks.get(key);
    this.activeRoomKey = key;
    track.loop = loop;
    if (reset) track.currentTime = 0;

    // Hentikan musik latar agar tidak bertumpuk
    this.pauseAmbient();

    if (appState.get('audioMuted')) {
      track.volume = 0;
      return true;
    }

    try {
      track.volume = 0;
      await track.play();
      this.fadeVolume(track, appState.get('audioVolume'), 0.5);
      return true;
    } catch {
      return false;
    }
  }

  stopRoomTrack(restoreAmbient = true) {
    if (this.activeRoomKey) {
      const prev = this.tracks.get(this.activeRoomKey);
      if (prev && !prev.paused) {
        this.fadeVolume(prev, 0, 0.35, () => {
          prev.pause();
        });
      }
      this.activeRoomKey = null;
    }

    if (restoreAmbient && !appState.get('audioMuted')) {
      this.playAmbient();
    }
  }

  playSfx(key, volumeMultiplier = 1) {
    if (appState.get('audioMuted') || this.unavailable.has(`sfx:${key}`)) return;
    const sfx = this.sfx.get(key);
    if (!sfx) return;

    sfx.currentTime = 0;
    sfx.volume = Math.max(0, Math.min(1, appState.get('audioVolume') * volumeMultiplier));
    sfx.play().catch(() => {});
  }

  toggleMute() {
    const nextMuted = !appState.get('audioMuted');
    appState.set('audioMuted', nextMuted);

    this.tracks.forEach((audio) => {
      audio.muted = nextMuted;
    });

    if (!nextMuted) {
      if (this.activeRoomKey && this.isTrackAvailable(this.activeRoomKey)) {
        const roomAudio = this.tracks.get(this.activeRoomKey);
        roomAudio.volume = appState.get('audioVolume');
        roomAudio.play().catch(() => {});
      } else if (this.ambientWanted) {
        this.playAmbient();
      }
    }

    this.updateUI();
  }

  setVolume(value) {
    const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0.65));
    appState.set('audioVolume', clamped);

    if (clamped === 0 && !appState.get('audioMuted')) {
      appState.set('audioMuted', true);
    } else if (clamped > 0 && appState.get('audioMuted')) {
      appState.set('audioMuted', false);
    }

    const muted = appState.get('audioMuted');
    this.tracks.forEach((audio) => {
      audio.muted = muted;
      if (!audio.paused) {
        audio.volume = clamped;
      }
    });

    this.updateUI();
  }

  updateUI() {
    const muted = appState.get('audioMuted');
    if (this.btnToggle) {
      this.btnToggle.classList.toggle('is-muted', muted);
      this.btnToggle.setAttribute('aria-pressed', String(muted));
    }
    if (this.statusLabel) {
      this.statusLabel.textContent = muted ? 'Senyap' : 'Suara';
    }
  }
}

export const audioManager = new AudioManager();
