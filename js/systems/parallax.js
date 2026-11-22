/**
 * parallax.js
 * Sistem parallax 5-lapis khusus pembungkus .parallax-inner / #px-*
 * sehingga TIDAK PERNAH berkonflik dengan transform zoom kamera di transition-manager.js.
 * Prioritas input: Gyroscope (mobile) -> Pointer (desktop) -> Ayunan otomatis halus (fallback mobile).
 */
import { appState } from '../core/state-manager.js';
import { gyroscopeSystem } from './gyroscope.js';

class ParallaxSystem {
  constructor() {
    this.enabled = true;
    this.hasGyroData = false;
    this.quickSetters = {};
    this.ambientDriftTween = null;
    this.driftState = { phase: 0 };
    this.boundPointerMove = this.handlePointerMove.bind(this);
  }

  init() {
    if (appState.get('reducedMotion')) {
      this.enabled = false;
      return;
    }

    const targets = {
      sky: document.getElementById('px-sky'),
      mountains: document.getElementById('px-mountains'),
      joglo: document.getElementById('px-joglo'),
      lanternLeft: document.getElementById('px-lantern-left'),
      lanternRight: document.getElementById('px-lantern-right'),
      foliageLeft: document.getElementById('px-foliage-left'),
      foliageRight: document.getElementById('px-foliage-right'),
    };

    Object.entries(targets).forEach(([key, el]) => {
      if (!el) return;
      this.quickSetters[key] = {
        x: window.gsap.quickTo(el, 'x', { duration: 0.75, ease: 'power2.out' }),
        y: window.gsap.quickTo(el, 'y', { duration: 0.75, ease: 'power2.out' }),
        el,
      };
    });

    // 1. Input Gyroscope
    gyroscopeSystem.subscribe((nx, ny) => {
      this.hasGyroData = true;
      this.stopAmbientDrift();
      if (!this.enabled) return;
      this.applyDepth(nx, ny);
    });

    // 2. Fallback Pointer (Desktop)
    window.addEventListener('pointermove', this.boundPointerMove, { passive: true });

    // 3. Fallback Gerak Otomatis Halus (Mobile tanpa Gyro / izin ditolak)
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (isCoarse) {
      this.startAmbientDrift();
    }
  }

  handlePointerMove(e) {
    if (!this.enabled || this.hasGyroData) return;
    if (appState.get('currentScene') !== 'landing' || appState.get('isTransitioning')) return;
    if (e.pointerType === 'touch') return;

    const nx = ((e.clientX / window.innerWidth) - 0.5) * 2;
    const ny = ((e.clientY / window.innerHeight) - 0.5) * 2;
    this.applyDepth(nx, ny);
  }

  applyDepth(nx, ny) {
    // Intensitas berbeda tiap lapisan untuk ilusi kedalaman 2.5D
    const s = this.quickSetters;
    if (s.sky) {
      s.sky.x(nx * -8);
      s.sky.y(ny * -5);
    }
    if (s.mountains) {
      s.mountains.x(nx * -18);
      s.mountains.y(ny * -9);
    }
    if (s.joglo) {
      s.joglo.x(nx * -12);
      s.joglo.y(ny * -5);
    }
    if (s.lanternLeft) {
      s.lanternLeft.x(nx * 20);
      s.lanternLeft.y(ny * 8);
    }
    if (s.lanternRight) {
      s.lanternRight.x(nx * 22);
      s.lanternRight.y(ny * 7);
    }
    if (s.foliageLeft) {
      s.foliageLeft.x(nx * 30);
      s.foliageLeft.y(ny * 12);
    }
    if (s.foliageRight) {
      s.foliageRight.x(nx * 32);
      s.foliageRight.y(ny * 12);
    }
  }

  startAmbientDrift() {
    if (this.ambientDriftTween || appState.get('reducedMotion')) return;
    this.ambientDriftTween = window.gsap.to(this.driftState, {
      phase: Math.PI * 2,
      duration: 14,
      repeat: -1,
      ease: 'none',
      onUpdate: () => {
        if (!this.enabled || this.hasGyroData) return;
        if (appState.get('currentScene') !== 'landing' || appState.get('isTransitioning')) return;
        const nx = Math.sin(this.driftState.phase) * 0.28;
        const ny = Math.cos(this.driftState.phase * 0.5) * 0.18;
        this.applyDepth(nx, ny);
      },
    });
  }

  stopAmbientDrift() {
    if (this.ambientDriftTween) {
      this.ambientDriftTween.kill();
      this.ambientDriftTween = null;
    }
  }

  pauseAndCenter() {
    this.enabled = false;
    Object.values(this.quickSetters).forEach(({ el }) => {
      window.gsap.to(el, { x: 0, y: 0, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
    });
  }

  resume() {
    if (appState.get('reducedMotion')) return;
    this.enabled = true;
    gyroscopeSystem.resetCalibration();
  }
}

export const parallaxSystem = new ParallaxSystem();
