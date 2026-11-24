/**
 * transition-manager.js
 * Pengelola tunggal seluruh transisi sinematik (Opening Kipas Batik 360°,
 * masuk pintu Joglo, dan kembali ke Joglo) dengan GSAP.
 */
import { appState } from './state-manager.js';
import { parallaxSystem } from '../systems/parallax.js';
import { orientationManager } from './orientation-manager.js';
import { audioManager } from './audio-manager.js';

class TransitionManager {
  constructor() {
    this.sceneLanding = document.getElementById('scene-landing');
    this.layerSky = document.getElementById('layer-sky');
    this.layerMountains = document.getElementById('layer-mountains');
    this.jogloWorld = document.getElementById('joglo-world');

    this.slotLanternLeft = document.getElementById('slot-lantern-left');
    this.slotLanternRight = document.getElementById('slot-lantern-right');
    this.slotFoliageLeft = document.getElementById('slot-foliage-left');
    this.slotFoliageRight = document.getElementById('slot-foliage-right');

    this.lanternLeft = document.querySelector('.lantern-left');
    this.lanternRight = document.querySelector('.lantern-right');
    this.foliageLeft = document.querySelector('.foliage-left');
    this.foliageRight = document.querySelector('.foliage-right');

    this.transitionVeil = document.getElementById('transition-veil');
    this.landingTitle = document.getElementById('landing-title');
    this.landingHint = document.getElementById('landing-hint');
    this.btnBack = document.getElementById('btn-back');
    this.particleContainer = document.getElementById('ambient-particles');
    this.doorUnits = Array.from(document.querySelectorAll('.door-unit'));

    // Elemen Opening Kipas
    this.openingStage = document.getElementById('opening-stage');
    this.fanLeftFront = document.querySelector('.fan-left-front');
    this.fanLeftBack = document.querySelector('.fan-left-back');
    this.fanRightFront = document.querySelector('.fan-right-front');
    this.fanRightBack = document.querySelector('.fan-right-back');
    this.opFanRig = document.getElementById('op-fan-rig');
    this.opOrnaments = document.querySelectorAll('.op-ornament');
    this.opOrbitRing = document.getElementById('op-orbit-ring');
    this.opTypoLeft = document.getElementById('op-typo-left');
    this.opTypoRight = document.getElementById('op-typo-right');

    // Elemen Tirai Pembuka
    this.curtainOverlay = document.getElementById('curtain-overlay');
    this.curtainLeft = document.querySelector('.curtain-panel.left');
    this.curtainRight = document.querySelector('.curtain-panel.right');
    this.curtainCenter = document.getElementById('curtain-center');
    this.curtainCta = document.getElementById('op-cta');

    this.activeTimeline = null;
    this.lastDoorUnit = null;
    this.openingTimeline = null;
    this.openingStarted = false;
    this.openingDelayTimer = null;
    this.unsubscribeOrientation = null;
    this.ambientTweens = [];
    this.hintPulseTween = null;
    this.ctaPulseTween = null;
  }

  init() {
    this.initAmbientLife();
    this.prepareOpeningIntro();

    if (!appState.get('reducedMotion') && this.curtainCta) {
      this.ctaPulseTween = window.gsap.to(this.curtainCta, {
        opacity: 0.45,
        duration: 1.3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    const triggerCurtain = () => this.openCurtain();
    if (this.curtainOverlay) {
      this.curtainOverlay.addEventListener('click', triggerCurtain);
      this.curtainOverlay.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerCurtain();
        }
      });
    }
  }

  /**
   * Siapkan posisi awal 4 kipas di balik tirai (TIDAK langsung diputar).
   * Animasi baru berjalan setelah pengguna mengetuk Tirai Merah.
   */
  prepareOpeningIntro() {
    if (!this.openingStage || !window.gsap) return;

    if (appState.get('reducedMotion')) {
      this.openingStage.style.display = 'none';
      return;
    }

    const gsap = window.gsap;
    gsap.set(this.fanLeftFront,  { rotation: 92,  scale: 1.05, opacity: 1 });
    gsap.set(this.fanLeftBack,   { rotation: 48,  scale: 1.12, opacity: 1 });
    gsap.set(this.fanRightFront, { rotation: -92, scale: 1.05, opacity: 1 });
    gsap.set(this.fanRightBack,  { rotation: -48, scale: 1.12, opacity: 1 });
  }

  /**
   * TAHAP 1: Membuka Tirai Merah -> langsung memicu Animasi Opening Kipas.
   */
  openCurtain() {
    if (appState.get('curtainOpened') || !appState.get('landingReady')) return;
    appState.set('curtainOpened', true);
    appState.set('isTransitioning', true);

    if (this.ctaPulseTween) {
      this.ctaPulseTween.kill();
      this.ctaPulseTween = null;
    }

    try {
      orientationManager.requestFullscreenAndLock();
      audioManager.playSfx('curtainsOpen');
      audioManager.playAmbient();
    } catch {
      // Abaikan jika browser membatasi fullscreen/audio
    }

    const gsap = window.gsap;
    if (!gsap || appState.get('reducedMotion')) {
      if (this.curtainOverlay) this.curtainOverlay.style.display = 'none';
      if (this.openingStage) this.openingStage.style.display = 'none';
      this.resetLandingState();
      appState.set('isTransitioning', false);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        if (this.curtainOverlay) this.curtainOverlay.style.display = 'none';
      },
    });
    this.activeTimeline = tl;

    tl.to(this.curtainCenter, {
      scale: 1.06,
      opacity: 0,
      duration: 0.38,
      ease: 'power2.in',
      force3D: true,
    }, 0)
    .to(this.curtainLeft, {
      xPercent: -102,
      skewX: -2.5,
      duration: 1.05,
      ease: 'power3.inOut',
      force3D: true,
    }, 0.15)
    .to(this.curtainRight, {
      xPercent: 102,
      skewX: 2.5,
      duration: 1.05,
      ease: 'power3.inOut',
      force3D: true,
    }, 0.15)
    // Begitu tirai mulai terbuka lebar, langsung jalankan animasi kipas
    .add(() => {
      this.playOpeningIntro();
    }, 0.55);
  }

  /**
   * TAHAP 2: Animasi Opening Kipas -> Lubang terbuka & zoom masuk ke Rumah Joglo.
   */
  playOpeningIntro() {
    if (this.openingStarted || !this.openingStage || !window.gsap) return;
    this.openingStarted = true;

    const gsap = window.gsap;

    if (appState.get('reducedMotion')) {
      this.openingStage.style.display = 'none';
      this.resetLandingState();
      appState.set('isTransitioning', false);
      return;
    }

    const holeState = { radius: 0 };
    const applyHoleMask = () => {
      const r = holeState.radius;
      const maskVal = r <= 0.1
        ? 'none'
        : `radial-gradient(circle at 50% 50%, transparent ${r}%, #000 ${r + 1.8}%)`;
      this.openingStage.style.webkitMaskImage = maskVal;
      this.openingStage.style.maskImage = maskVal;
    };

    const ornaments = Array.from(this.opOrnaments || []);

    // Siapkan Rumah Joglo di belakang sedikit lebih kecil untuk efek zoom masuk
    gsap.set(this.jogloWorld, { scale: 0.93, y: 14, opacity: 0.85, force3D: true });
    gsap.set([this.landingTitle, this.landingHint, '.door-plaque'], { opacity: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        this.openingStage.style.display = 'none';
        appState.set('isTransitioning', false);
        this.startHintPulse();
      },
    });
    this.openingTimeline = tl;

    // --- TAHAP 1: 4 KIPAS RAKSASA BERPUTAR MEMBUKA LAYAR (Langsung jalan di 0s) ---
    tl.to(this.fanLeftFront, {
      rotation: -75,
      xPercent: -35,
      opacity: 0,
      duration: 0.95,
      ease: 'power3.inOut',
      force3D: true,
    }, 0)
    .to(this.fanLeftBack, {
      rotation: -120,
      xPercent: -45,
      opacity: 0,
      duration: 1.05,
      ease: 'power3.inOut',
      force3D: true,
    }, 0.06)
    .to(this.fanRightFront, {
      rotation: 75,
      xPercent: 35,
      opacity: 0,
      duration: 0.95,
      ease: 'power3.inOut',
      force3D: true,
    }, 0)
    .to(this.fanRightBack, {
      rotation: 120,
      xPercent: 45,
      opacity: 0,
      duration: 1.05,
      ease: 'power3.inOut',
      force3D: true,
    }, 0.06);

    gsap.set('.op-bl', { rotation: 45 });
    gsap.set('.op-tr', { rotation: -45 });
    gsap.set('.op-br', { rotation: -45 });

    // UBAH 1 ANGKA INI SAJA kalau mau lebih cepat/lambat (misal: 0.75 atau 1.1)
    const T2 = 0.95;
    const T3 = T2 + 1.55;

    // --- TAHAP 2: ORNAMEN + 4 KIPAS LINGKARAN 360° + ORBITAL RING + TIPOGRAFI ---
    tl.fromTo(ornaments, {
      scaleX: (i, el) => (el.classList.contains('op-tr') ? -0.6 : 0.6),
      scaleY: 0.6,
      opacity: 0,
    }, {
      scaleX: (i, el) => (el.classList.contains('op-tr') ? -1 : 1),
      scaleY: 1,
      opacity: 1,
      stagger: 0.05,
      duration: 0.6,
      ease: 'power2.out',
    }, T2)
    .fromTo(this.opFanRig, {
      scale: 0.5,
      rotation: -45,
      opacity: 0,
    }, {
      scale: 1,
      rotation: 0,
      opacity: 1,
      duration: 0.85,
      ease: 'back.out(1.2)',
      force3D: true,
    }, T2)
    .fromTo(this.opOrbitRing, {
      scale: 0.72,
      rotation: 35,
      opacity: 0,
    }, {
      scale: 1,
      rotation: 0,
      opacity: 1,
      duration: 0.85,
      ease: 'power2.out',
      force3D: true,
    }, T2 + 0.05)
    .fromTo(this.opTypoLeft, {
      x: 42,
      opacity: 0,
    }, {
      x: 0,
      opacity: 1,
      duration: 0.75,
      ease: 'power3.out',
      force3D: true,
    }, T2 + 0.12)
    .fromTo(this.opTypoRight, {
      x: -42,
      opacity: 0,
    }, {
      x: 0,
      opacity: 1,
      duration: 0.75,
      ease: 'power3.out',
      force3D: true,
    }, T2 + 0.12)
    .to(this.opFanRig, {
      rotation: 55,
      duration: 0.75,
      ease: 'power1.inOut',
      force3D: true,
    }, T2 + 0.85)
    .to(this.opOrbitRing, {
      rotation: -38,
      duration: 0.75,
      ease: 'power1.inOut',
      force3D: true,
    }, T2 + 0.85)

    // --- TAHAP 3: LUBANG TERBUKA DI TENGAH + ZOOM MASUK KE RUMAH JOGLO ---
    .to(holeState, {
      radius: 118,
      duration: 1.05,
      ease: 'power3.in',
      onUpdate: applyHoleMask,
    }, T3)
    .to(this.opFanRig, {
      scale: 5.2,
      rotation: 135,
      duration: 1.05,
      ease: 'power3.in',
      force3D: true,
    }, T3)
    .to(this.opOrbitRing, {
      scale: 3.4,
      rotation: -95,
      opacity: 0,
      duration: 0.85,
      ease: 'power3.in',
      force3D: true,
    }, T3)
    .to(this.opTypoLeft, {
      x: -56,
      opacity: 0,
      duration: 0.55,
      ease: 'power2.in',
      force3D: true,
    }, T3)
    .to(this.opTypoRight, {
      x: 56,
      opacity: 0,
      duration: 0.55,
      ease: 'power2.in',
      force3D: true,
    }, T3)
    .to(ornaments, {
      scaleX: (i, el) => (el.classList.contains('op-tr') ? -1.4 : 1.4),
      scaleY: 1.4,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in',
    }, T3 + 0.05)

    // Rumah Joglo maju menyambut kamera
    .to(this.jogloWorld, {
      scale: 1,
      y: 0,
      opacity: 1,
      duration: 0.95,
      ease: 'power3.out',
      force3D: true,
    }, T3 + 0.15)
    .to(this.landingTitle, {
      y: 0,
      opacity: 1,
      duration: 0.55,
      ease: 'power2.out',
    }, T3 + 0.55)
    .fromTo('.door-plaque', {
      xPercent: -50,
      x: 0,
      y: 6,
      opacity: 0,
    }, {
      xPercent: -50,
      x: 0,
      y: 0,
      opacity: 1,
      stagger: 0.06,
      duration: 0.45,
      ease: 'power2.out',
      clearProps: 'transform',
    }, T3 + 0.65)
    .to(this.landingHint, {
      opacity: 1,
      duration: 0.45,
    }, T3 + 0.8);
  }

  initAmbientLife() {
    if (appState.get('reducedMotion') || !window.gsap) return;
    const gsap = window.gsap;

    const addAmbient = (tween) => {
      this.ambientTweens.push(tween);
      return tween;
    };

    if (this.lanternLeft) {
      addAmbient(gsap.to(this.lanternLeft, {
        rotation: 2.1, duration: 3.4, repeat: -1, yoyo: true, ease: 'sine.inOut', force3D: true,
      }));
    }
    if (this.lanternRight) {
      addAmbient(gsap.to(this.lanternRight, {
        rotation: -2.3, duration: 3.9, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.6, force3D: true,
      }));
    }
    if (this.foliageLeft) {
      addAmbient(gsap.to(this.foliageLeft, {
        rotation: 1.3, duration: 4.6, repeat: -1, yoyo: true, ease: 'sine.inOut', force3D: true,
      }));
    }
    if (this.foliageRight) {
      addAmbient(gsap.to(this.foliageRight, {
        rotation: -1.5, duration: 5.1, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.8, force3D: true,
      }));
    }

    if (this.particleContainer && this.particleContainer.children.length === 0) {
      for (let i = 0; i < 10; i += 1) {
        const dot = document.createElement('span');
        dot.className = 'particle';
        gsap.set(dot, {
          left: `${gsap.utils.random(10, 90)}%`,
          top: `${gsap.utils.random(18, 76)}%`,
          scale: gsap.utils.random(0.45, 1.0),
        });
        this.particleContainer.appendChild(dot);

        addAmbient(gsap.to(dot, {
          y: gsap.utils.random(-24, 24),
          x: gsap.utils.random(-16, 16),
          opacity: gsap.utils.random(0.22, 0.7),
          duration: gsap.utils.random(3.4, 6.2),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: gsap.utils.random(0, 2.5),
        }));
      }
    }
  }

  pauseAmbient() {
    this.ambientTweens.forEach((tw) => tw.pause());
    if (this.hintPulseTween) this.hintPulseTween.pause();
  }

  resumeAmbient() {
    if (appState.get('reducedMotion')) return;
    this.ambientTweens.forEach((tw) => tw.resume());
    if (this.hintPulseTween) this.hintPulseTween.resume();
  }

  resetLandingState() {
    const gsap = window.gsap;
    const targets = [
      this.jogloWorld,
      this.layerMountains,
      this.layerSky,
      this.slotLanternLeft,
      this.slotLanternRight,
      this.slotFoliageLeft,
      this.slotFoliageRight,
      this.landingTitle,
      this.landingHint,
      '.door-plaque',
    ];
    gsap.killTweensOf(targets);

    gsap.set(this.jogloWorld, { clearProps: 'transform', opacity: 1 });
    gsap.set([this.layerMountains, this.layerSky], { clearProps: 'transform' });
    gsap.set(
      [this.slotLanternLeft, this.slotLanternRight, this.slotFoliageLeft, this.slotFoliageRight],
      { x: 0, y: 0, xPercent: 0, yPercent: 0, scale: 1, opacity: 1, force3D: true }
    );
    gsap.set(this.landingTitle, { x: 0, y: 0, opacity: 1 });
    gsap.set([this.landingHint, '.door-plaque'], { clearProps: 'transform', opacity: 1 });

    this.doorUnits.forEach((door) => {
      const leftLeaf = door.querySelector('.door-leaf.left');
      const rightLeaf = door.querySelector('.door-leaf.right');
      const glow = door.querySelector('.door-interior-glow');
      gsap.killTweensOf([leftLeaf, rightLeaf, glow]);
      gsap.set([leftLeaf, rightLeaf], { rotateY: 0, force3D: true });
      gsap.set(glow, { opacity: 0.12 });
    });
  }

  startHintPulse() {
    if (appState.get('reducedMotion') || !this.landingHint) return;
    if (this.hintPulseTween) this.hintPulseTween.kill();
    this.hintPulseTween = window.gsap.to(this.landingHint, {
      opacity: 0.48,
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }

  enterRoom(doorUnit, targetSection, onBeforeReveal) {
    return new Promise((resolve) => {
      this.lastDoorUnit = doorUnit;
      
      if (this.activeTimeline) {
        this.activeTimeline.kill();
        this.activeTimeline = null;
      }

      appState.set('isTransitioning', true);
      parallaxSystem.pauseAndCenter();
      if (this.hintPulseTween) this.hintPulseTween.pause();
      audioManager.playSfx('doorOpen');

      const gsap = window.gsap;
      const reduced = appState.get('reducedMotion');

      if (reduced) {
        const tl = gsap.timeline({
          onComplete: () => {
            this.pauseAmbient();
            appState.set('isTransitioning', false);
            resolve();
          },
        });
        this.activeTimeline = tl;

        tl.to(this.transitionVeil, { opacity: 1, duration: 0.2 })
          .add(() => {
            this.sceneLanding.classList.remove('is-active');
            targetSection.classList.add('is-active');
            gsap.set(targetSection, { opacity: 1, scale: 1 });
            gsap.set(this.landingTitle, { opacity: 0 });
            if (onBeforeReveal) onBeforeReveal();
          })
          .to(this.transitionVeil, { opacity: 0, duration: 0.25 })
          .to(this.btnBack, { autoAlpha: 1, y: 0, duration: 0.2 }, '<');
        return;
      }

      gsap.set(this.jogloWorld, { x: 0, y: 0, scale: 1, force3D: true });

      const frame = doorUnit.querySelector('.door-frame');
      const rect = frame.getBoundingClientRect();
      const vpX = window.innerWidth / 2;
      const vpY = window.innerHeight / 2;
      const doorX = rect.left + rect.width / 2;
      const doorY = rect.top + rect.height / 2;

      const targetScale = 4.6;
      const moveX = (vpX - doorX) * targetScale;
      const moveY = (vpY - doorY) * targetScale;

      const leftLeaf = doorUnit.querySelector('.door-leaf.left');
      const rightLeaf = doorUnit.querySelector('.door-leaf.right');
      const doorGlow = doorUnit.querySelector('.door-interior-glow');

      const tl = gsap.timeline({
        onComplete: () => {
          this.pauseAmbient();
          appState.set('isTransitioning', false);
          resolve();
        },
      });
      this.activeTimeline = tl;

      tl.to([this.landingTitle, this.landingHint, '.door-plaque'], {
        opacity: 0, duration: 0.3, ease: 'power2.out',
      }, 0)
      .to(leftLeaf, { rotateY: -108, duration: 0.68, ease: 'power2.inOut', force3D: true }, 0.05)
      .to(rightLeaf, { rotateY: 108, duration: 0.68, ease: 'power2.inOut', force3D: true }, 0.05)
      .to(doorGlow, { opacity: 1, duration: 0.5, ease: 'power2.in' }, 0.1)
      .to(this.slotFoliageLeft, { xPercent: -45, yPercent: 20, scale: 1.3, opacity: 0, duration: 0.85, ease: 'power3.in', force3D: true }, 0.2)
      .to(this.slotFoliageRight, { xPercent: 45, yPercent: 20, scale: 1.3, opacity: 0, duration: 0.85, ease: 'power3.in', force3D: true }, 0.2)
      .to([this.slotLanternLeft, this.slotLanternRight], { yPercent: -55, scale: 1.25, opacity: 0, duration: 0.78, ease: 'power3.in', force3D: true }, 0.2)
      .to(this.jogloWorld, { x: moveX, y: moveY, scale: targetScale, duration: 1.0, ease: 'power3.inOut', force3D: true }, 0.26)
      .to(this.layerMountains, { scale: 1.2, duration: 1.0, ease: 'power3.inOut', force3D: true }, 0.26)
      .to(this.layerSky, { scale: 1.08, duration: 1.0, ease: 'power3.inOut', force3D: true }, 0.26)
      .to(this.transitionVeil, { opacity: 1, duration: 0.32, ease: 'power2.in' }, 0.86)
      .add(() => {
        this.sceneLanding.classList.remove('is-active');
        this.resetLandingState();
        gsap.set([this.landingTitle, this.landingHint, '.door-plaque'], { opacity: 0 });
        targetSection.classList.add('is-active');
        gsap.set(targetSection, { opacity: 1, scale: 1.04, force3D: true });
        if (onBeforeReveal) onBeforeReveal();
      })
      .to(this.transitionVeil, { opacity: 0, duration: 0.45, ease: 'power2.out' })
      .to(targetSection, { scale: 1, duration: 0.55, ease: 'power3.out', force3D: true }, '<')
      .to(this.btnBack, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '-=0.25');
    });
  }

  exitToLanding(currentSection, onAfterLeaveRoom) {
    return new Promise((resolve) => {
      if (this.activeTimeline) {
        this.activeTimeline.kill();
        this.activeTimeline = null;
      }

      appState.set('isTransitioning', true);
      const gsap = window.gsap;
      const reduced = appState.get('reducedMotion');

      const tl = gsap.timeline({
        onComplete: () => {
          this.resetLandingState();
          this.resumeAmbient();
          parallaxSystem.resume();
          appState.set('isTransitioning', false);
          resolve();
        },
      });
      this.activeTimeline = tl;

      if (reduced) {
        tl.to(this.btnBack, { autoAlpha: 0, y: -8, duration: 0.18 }, 0)
          .to(this.transitionVeil, { opacity: 1, duration: 0.2 }, 0)
          .add(() => {
            currentSection.classList.remove('is-active');
            if (onAfterLeaveRoom) onAfterLeaveRoom();
            this.resetLandingState();
            this.sceneLanding.classList.add('is-active');
          })
          .to(this.transitionVeil, { opacity: 0, duration: 0.25 });
        return;
      }

      // 1. Keluar dari dalam ruangan (tarik mundur halus + cahaya hangat pintu)
      tl.to(this.btnBack, { autoAlpha: 0, y: -8, duration: 0.22, ease: 'power2.in' }, 0)
        .to(currentSection, {
          scale: 0.94,
          opacity: 0,
          duration: 0.38,
          ease: 'power2.in',
          force3D: true,
        }, 0)
        .to(this.transitionVeil, {
          opacity: 1,
          duration: 0.32,
          ease: 'power2.in',
        }, 0.08)

        // 2. Siapkan posisi kamera tepat di dalam pintu yang tadi dimasuki
        .add(() => {
          currentSection.classList.remove('is-active');
          gsap.set(currentSection, { clearProps: 'transform,opacity' });
          if (onAfterLeaveRoom) onAfterLeaveRoom();

          this.resetLandingState();

          const doorUnit = this.lastDoorUnit;
          let startX = 0;
          let startY = 0;
          let startScale = 1.25;

          if (doorUnit) {
            const frame = doorUnit.querySelector('.door-frame');
            const rect = frame.getBoundingClientRect();
            const vpX = window.innerWidth / 2;
            const vpY = window.innerHeight / 2;
            const doorX = rect.left + rect.width / 2;
            const doorY = rect.top + rect.height / 2;

            startScale = 4.4;
            startX = (vpX - doorX) * startScale;
            startY = (vpY - doorY) * startScale;

            // Posisikan daun pintu dalam keadaan terbuka & bercahaya
            const leftLeaf = doorUnit.querySelector('.door-leaf.left');
            const rightLeaf = doorUnit.querySelector('.door-leaf.right');
            const doorGlow = doorUnit.querySelector('.door-interior-glow');
            gsap.set(leftLeaf, { rotateY: -108, force3D: true });
            gsap.set(rightLeaf, { rotateY: 108, force3D: true });
            gsap.set(doorGlow, { opacity: 1 });
          }

          gsap.set(this.jogloWorld, { x: startX, y: startY, scale: startScale, force3D: true });
          gsap.set(this.layerMountains, { scale: 1.2, force3D: true });
          gsap.set(this.layerSky, { scale: 1.08, force3D: true });

          // Foreground terlempar keluar layar dulu sebelum masuk kembali
          gsap.set(this.slotFoliageLeft, { xPercent: -45, yPercent: 20, scale: 1.3, opacity: 0, force3D: true });
          gsap.set(this.slotFoliageRight, { xPercent: 45, yPercent: 20, scale: 1.3, opacity: 0, force3D: true });
          gsap.set([this.slotLanternLeft, this.slotLanternRight], { yPercent: -55, scale: 1.25, opacity: 0, force3D: true });
          gsap.set([this.landingTitle, this.landingHint, '.door-plaque'], { opacity: 0 });

          this.sceneLanding.classList.add('is-active');
        })

        // 3. Kamera mundur keluar dari pintu menuju halaman Joglo
        .to(this.transitionVeil, { opacity: 0, duration: 0.42, ease: 'power2.out' })
        .to(this.jogloWorld, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 1.0,
          ease: 'power3.out',
          force3D: true,
        }, '<')
        .to(this.layerMountains, { scale: 1, duration: 1.0, ease: 'power3.out', force3D: true }, '<')
        .to(this.layerSky, { scale: 1, duration: 1.0, ease: 'power3.out', force3D: true }, '<')

        // 4. Dedaunan & lentera kembali masuk membingkai layar
        .to([this.slotFoliageLeft, this.slotFoliageRight], {
          xPercent: 0,
          yPercent: 0,
          scale: 1,
          opacity: 1,
          duration: 0.85,
          ease: 'power3.out',
          force3D: true,
        }, '<0.12')
        .to([this.slotLanternLeft, this.slotLanternRight], {
          yPercent: 0,
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          force3D: true,
        }, '<0.14')

        // 5. Daun pintu kayu menutup perlahan & cahaya dalam meredup
        .add(() => {
          if (!this.lastDoorUnit) return;
          const leftLeaf = this.lastDoorUnit.querySelector('.door-leaf.left');
          const rightLeaf = this.lastDoorUnit.querySelector('.door-leaf.right');
          const doorGlow = this.lastDoorUnit.querySelector('.door-interior-glow');
          gsap.to([leftLeaf, rightLeaf], {
            rotateY: 0,
            duration: 0.65,
            ease: 'power2.inOut',
            force3D: true,
          });
          gsap.to(doorGlow, {
            opacity: 0.12,
            duration: 0.55,
            ease: 'power2.out',
          });
        }, '-=0.55')

        // 6. Judul, plakat pintu, dan petunjuk tampil kembali
        .to([this.landingTitle, this.landingHint, '.door-plaque'], {
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
        }, '-=0.35');
    });
  }
}

export const transitionManager = new TransitionManager();