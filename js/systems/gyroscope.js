/**
 * gyroscope.js
 * Pembaca sensor gerak DeviceOrientationEvent dengan izin iOS yang sopan,
 * perataan sinyal (smoothing), batas gerak aman, dan orientasi landscape.
 */
import { appState } from '../core/state-manager.js';

class GyroscopeSystem {
  constructor() {
    this.btnGyro = document.getElementById('btn-gyro');
    this.listeners = new Set();
    this.active = false;
    this.permissionAsked = false;

    // Nilai terhaluskan dalam rentang [-1, 1]
    this.smoothX = 0;
    this.smoothY = 0;
    this.baseBeta = null;
    this.baseGamma = null;

    this.boundHandler = this.handleOrientation.bind(this);
  }

  init() {
    if (appState.get('reducedMotion')) {
      appState.set('gyroStatus', 'unsupported');
      return;
    }

    const hasSensor = typeof window.DeviceOrientationEvent !== 'undefined';
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

    if (!hasSensor || !isCoarsePointer) {
      appState.set('gyroStatus', 'unsupported');
      return;
    }

    // iOS 13+ membutuhkan izin eksplisit dari interaksi tombol
    if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
      appState.set('gyroStatus', 'needs-permission');
      if (this.btnGyro) {
        this.btnGyro.hidden = false;
        this.btnGyro.addEventListener('click', () => this.requestIOSPermission(), { once: true });
      }
    } else {
      // Android & perangkat yang langsung mengizinkan
      this.startListening();
    }
  }

  async requestIOSPermission() {
    if (this.permissionAsked) return;
    this.permissionAsked = true;

    try {
      const result = await window.DeviceOrientationEvent.requestPermission();
      if (result === 'granted') {
        this.startListening();
      } else {
        appState.set('gyroStatus', 'denied');
      }
    } catch {
      appState.set('gyroStatus', 'denied');
    } finally {
      if (this.btnGyro) this.btnGyro.hidden = true;
    }
  }

  startListening() {
    if (this.active) return;
    this.active = true;
    this.baseBeta = null;
    this.baseGamma = null;
    window.addEventListener('deviceorientation', this.boundHandler, { passive: true });
    appState.set('gyroStatus', 'active');
    if (this.btnGyro) this.btnGyro.hidden = true;
  }

  stopListening() {
    if (!this.active) return;
    this.active = false;
    window.removeEventListener('deviceorientation', this.boundHandler);
  }

  resetCalibration() {
    this.baseBeta = null;
    this.baseGamma = null;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  getScreenAngle() {
    if (screen.orientation && typeof screen.orientation.angle === 'number') {
      return screen.orientation.angle;
    }
    if (typeof window.orientation === 'number') {
      return window.orientation;
    }
    return 90;
  }

  handleOrientation(event) {
    if (event.beta === null || event.gamma === null) return;
    if (appState.get('currentScene') !== 'landing' || appState.get('isTransitioning')) return;

    // Kalibrasi posisi pegang awal pengguna agar netral
    if (this.baseBeta === null || this.baseGamma === null) {
      this.baseBeta = event.beta;
      this.baseGamma = event.gamma;
      return;
    }

    const dBeta = event.beta - this.baseBeta;
    const dGamma = event.gamma - this.baseGamma;
    const angle = this.getScreenAngle();

    // Pemetaan sumbu untuk mode landscape (90° atau 270°/-90°)
    let rawX = dBeta;
    let rawY = dGamma;
    if (angle === 270 || angle === -90) {
      rawX = -dBeta;
      rawY = -dGamma;
    } else if (angle === 0) {
      rawX = dGamma;
      rawY = dBeta;
    }

    // Normalisasi ke rentang [-1, 1] dengan batas aman +/- 22 derajat
    const clamp = (v) => Math.max(-1, Math.min(1, v));
    const normX = clamp(rawX / 22);
    const normY = clamp(rawY / 18);

    // Filter low-pass untuk mencegah getaran (jitter)
    const alpha = 0.14;
    this.smoothX += (normX - this.smoothX) * alpha;
    this.smoothY += (normY - this.smoothY) * alpha;

    this.listeners.forEach((cb) => cb(this.smoothX, this.smoothY));
  }
}

export const gyroscopeSystem = new GyroscopeSystem();
