/**
 * state-manager.js
 * Penyimpanan status global terpusat dengan pola pub/sub ringan.
 */
class StateManager {
  constructor() {
    this.state = {
      currentScene: 'landing', // 'landing' | 'peran' | 'tari' | 'musik' | 'makanan'
      isTransitioning: false,
      curtainOpened: false,
      landingReady: false,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      isPortrait: false,
      audioMuted: false,
      audioVolume: 0.65,
      gyroStatus: 'idle', // 'idle' | 'needs-permission' | 'active' | 'denied' | 'unsupported'
    };
    this.listeners = new Map();
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    if (this.state[key] === value) return;
    const prev = this.state[key];
    this.state[key] = value;
    const subs = this.listeners.get(key);
    if (subs) {
      subs.forEach((cb) => cb(value, prev));
    }
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    return () => this.listeners.get(key)?.delete(callback);
  }
}

export const appState = new StateManager();
