/**
 * orientation-manager.js
 * Deteksi orientasi portrait/landscape non-destruktif (tidak mereset progres),
 * permintaan fullscreen + kunci orientasi yang aman, dan siaran resize.
 */
import { appState } from './state-manager.js';

class OrientationManager {
  constructor() {
    this.lockEl = document.getElementById('orientation-lock');
    this.resizeCallbacks = new Set();
    this.resizeTimer = null;
  }

  init() {
    this.evaluateOrientation();

    const handleChange = () => {
      this.evaluateOrientation();
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.resizeCallbacks.forEach((cb) => cb());
      }, 140);
    };

    window.addEventListener('resize', handleChange, { passive: true });
    window.addEventListener('orientationchange', handleChange, { passive: true });
    if (screen.orientation && typeof screen.orientation.addEventListener === 'function') {
      screen.orientation.addEventListener('change', handleChange);
    }
  }

  evaluateOrientation() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isPortrait = h > w && w <= 960;
    appState.set('isPortrait', isPortrait);

    if (this.lockEl) {
      this.lockEl.classList.toggle('is-visible', isPortrait);
    }
  }

  onLayoutRecalc(callback) {
    this.resizeCallbacks.add(callback);
    return () => this.resizeCallbacks.delete(callback);
  }

  /**
   * Dipanggil dari interaksi pengguna (ketuk tirai).
   * Tidak pernah memaksa atau melempar error bila browser menolak.
   */
  async requestFullscreenAndLock() {
    const el = document.documentElement;
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          el.webkitRequestFullscreen();
        }
      }
    } catch {
      // Browser/iOS Safari dapat menolak fullscreen — abaikan dengan halus
    }

    try {
      if (screen.orientation && typeof screen.orientation.lock === 'function') {
        await screen.orientation.lock('landscape');
      }
    } catch {
      // Kunci orientasi hanya didukung di sebagian browser mobile
    }
  }
}

export const orientationManager = new OrientationManager();
