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
   * Koreografi GSAP Opening 2 Tahap:
   * 1. 4 kipas (kiri lawan jarum jam, kanan searah jarum jam) membuka layar
   * 2. 2 kipas membentuk lingkaran penuh -> berputar sedikit -> lubang terbuka di tengah + zoom masuk ke Tirai
   */
  prepareOpeningIntro() {
    if (!this.openingStage || !window.gsap) return;

    if (appState.get('reducedMotion')) {
      this.openingStage.style.display = 'none';
      return;
    }

    // Set posisi awal kipas agar layar sudah tertutup rapi saat portrait lock hilang
    const gsap = window.gsap;
    gsap.set(this.fanLeftFront,  { rotation: 92,  scale: 1.05, opacity: 1 });
    gsap.set(this.fanLeftBack,   { rotation: 48,  scale: 1.12, opacity: 1 });
    gsap.set(this.fanRightFront, { rotation: -92, scale: 1.05, opacity: 1 });
    gsap.set(this.fanRightBack,  { rotation: -48, scale: 1.12, opacity: 1 });
    if (this.curtainCenter) {
      gsap.set(this.curtainCenter, { scale: 0.86, opacity: 0.55 });
    }

    // Jika sejak awal sudah landscape, langsung jalankan animasi
    if (!appState.get('isPortrait')) {
      this.playOpeningIntro();
      return;
    }

    // Jika masih portrait, tunggu sampai berubah ke landscape + jeda 1 detik
    this.unsubscribeOrientation = appState.subscribe('isPortrait', (isPortrait) => {
      if (this.openingStarted) return;

      if (!isPortrait) {
        clearTimeout(this.openingDelayTimer);
        this.openingDelayTimer = setTimeout(() => {
          if (!appState.get('isPortrait') && !this.openingStarted) {
            this.playOpeningIntro();
          }
        }, 1000);
      } else {
        clearTimeout(this.openingDelayTimer);
        this.openingDelayTimer = null;
      }
    });
  }

  playOpeningIntro() {
    if (this.openingStarted || !this.openingStage || !window.gsap) return;
    this.openingStarted = true;

    clearTimeout(this.openingDelayTimer);
    if (this.unsubscribeOrientation) {
      this.unsubscribeOrientation();
      this.unsubscribeOrientation = null;
    }

    const gsap = window.gsap;

    if (appState.get('reducedMotion')) {
      this.openingStage.style.display = 'none';
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
    const tl = gsap.timeline({
      onComplete: () => {
        this.openingStage.style.display = 'none';
      },
    });
    this.openingTimeline = tl;

    // Frame 0: Posisikan 4 kipas raksasa menutup 100% layar (kiri menghadap kanan, kanan menghadap kiri)
    gsap.set(this.fanLeftFront,  { rotation: 92,  scale: 1.05, opacity: 1 });
    gsap.set(this.fanLeftBack,   { rotation: 48,  scale: 1.12, opacity: 1 });
    gsap.set(this.fanRightFront, { rotation: -92, scale: 1.05, opacity: 1 });
    gsap.set(this.fanRightBack,  { rotation: -48, scale: 1.12, opacity: 1 });

    // Siapkan emblem tirai di belakang sedikit lebih kecil agar terasa efek zoom masuk
    if (this.curtainCenter) {
      gsap.set(this.curtainCenter, { scale: 0.86, opacity: 0.55 });
    }

    // --- TAHAP 1: 4 KIPAS RAKSASA BERPUTAR MEMBUKA LAYAR ---
    // Kiri: berputar berlawanan arah jarum jam (minus) & menyapu keluar ke kiri
    tl.to(this.fanLeftFront, {
      rotation: -75,
      xPercent: -35,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.inOut',
      force3D: true,
    }, 0.25)
    .to(this.fanLeftBack, {
      rotation: -120,
      xPercent: -45,
      opacity: 0,
      duration: 1.3,
      ease: 'power3.inOut',
      force3D: true,
    }, 0.32)
    // Kanan: berputar searah jarum jam (positif) & menyapu keluar ke kanan
    .to(this.fanRightFront, {
      rotation: 75,
      xPercent: 35,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.inOut',
      force3D: true,
    }, 0.25)
    .to(this.fanRightBack, {
      rotation: 120,
      xPercent: 45,
      opacity: 0,
      duration: 1.3,
      ease: 'power3.inOut',
      force3D: true,
    }, 0.32);
    
    // Set rotasi dasar sudut sebelum mekar (flip horizontal wayang dihandle di scaleX)
    gsap.set('.op-bl', { rotation: 45 });
    gsap.set('.op-tr', { rotation: -45 }); // ubah ke 45 jika ingin kemiringan searah jarum jam
    gsap.set('.op-br', { rotation: -45 });

    // Ornamen sudut mekar halus (pertahankan flip horizontal pada .op-tr)
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
    }, 0.65)

    // --- TAHAP 2: 4 KIPAS LINGKARAN 360° + ORBITAL RING + TIPOGRAFI KIRI/KANAN ---
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
    }, 0.85)
    // Orbital ring muncul & berputar berlawanan arah jarum jam (kontras dengan kipas)
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
    }, 0.9)
    // Tipografi kiri & kanan muncul meluncur keluar dari balik kipas
    .fromTo(this.opTypoLeft, {
      x: 42,
      opacity: 0,
    }, {
      x: 0,
      opacity: 1,
      duration: 0.75,
      ease: 'power3.out',
      force3D: true,
    }, 0.98)
    .fromTo(this.opTypoRight, {
      x: -42,
      opacity: 0,
    }, {
      x: 0,
      opacity: 1,
      duration: 0.75,
      ease: 'power3.out',
      force3D: true,
    }, 0.98)
    // Putaran halus kipas (searah jarum jam) & orbital text (lawan arah jarum jam)
    .to(this.opFanRig, {
      rotation: 55,
      duration: 0.75,
      ease: 'power1.inOut',
      force3D: true,
    }, 1.7)
    .to(this.opOrbitRing, {
      rotation: -38,
      duration: 0.75,
      ease: 'power1.inOut',
      force3D: true,
    }, 1.7)

    // --- TAHAP 3: LUBANG TERBUKA DI TENGAH + ZOOM MASUK KE TIRAI MERAH ---
    .to(holeState, {
      radius: 118,
      duration: 1.05,
      ease: 'power3.in',
      onUpdate: applyHoleMask,
    }, 2.4)
    .to(this.opFanRig, {
      scale: 5.2,
      rotation: 135,
      duration: 1.05,
      ease: 'power3.in',
      force3D: true,
    }, 2.4)
    .to(this.opOrbitRing, {
      scale: 3.4,
      rotation: -95,
      opacity: 0,
      duration: 0.85,
      ease: 'power3.in',
      force3D: true,
    }, 2.4)
    // Tipografi kiri & kanan membelah ke tepi saat kamera meluncur masuk
    .to(this.opTypoLeft, {
      x: -56,
      opacity: 0,
      duration: 0.55,
      ease: 'power2.in',
      force3D: true,
    }, 2.4)
    .to(this.opTypoRight, {
      x: 56,
      opacity: 0,
      duration: 0.55,
      ease: 'power2.in',
      force3D: true,
    }, 2.4)
    .to(ornaments, {
      scaleX: (i, el) => (el.classList.contains('op-tr') ? -1.4 : 1.4),
      scaleY: 1.4,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in',
    }, 2.45)
    // Tirai di belakang maju menyambut kamera
    .to(this.curtainCenter, {
      scale: 1,
      opacity: 1,
      duration: 0.85,
      ease: 'power2.out',
    }, 2.55);
  }

  /**
   * Membuka Tirai Merah menuju Rumah Adat Joglo.
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
      audioManager.playAmbient();
    } catch {
      // Abaikan jika browser membatasi fullscreen/audio
    }

    const gsap = window.gsap;
    if (!gsap || appState.get('reducedMotion')) {
      if (this.curtainOverlay) this.curtainOverlay.style.display = 'none';
      this.resetLandingState();
      appState.set('isTransitioning', false);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        if (this.curtainOverlay) this.curtainOverlay.style.display = 'none';
        appState.set('isTransitioning', false);
        this.startHintPulse();
      },
    });
    this.activeTimeline = tl;

    tl.to(this.curtainCenter, {
      scale: 1.06,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      force3D: true,
    }, 0)
    .to(this.curtainLeft, {
      xPercent: -102,
      skewX: -2.5,
      duration: 1.15,
      ease: 'power3.inOut',
      force3D: true,
    }, 0.18)
    .to(this.curtainRight, {
      xPercent: 102,
      skewX: 2.5,
      duration: 1.15,
      ease: 'power3.inOut',
      force3D: true,
    }, 0.18)
    .fromTo(this.jogloWorld, {
      scale: 0.95,
      y: 18,
      opacity: 0,
    }, {
      scale: 1,
      y: 0,
      opacity: 1,
      duration: 1.0,
      ease: 'power3.out',
      force3D: true,
    }, 0.32)
    .fromTo([this.slotFoliageLeft, this.slotFoliageRight], {
      scale: 1.1,
      opacity: 0,
    }, {
      scale: 1,
      opacity: 1,
      duration: 0.95,
      ease: 'power3.out',
      force3D: true,
    }, 0.38)
    .fromTo([this.slotLanternLeft, this.slotLanternRight], {
      y: -28,
      opacity: 0,
    }, {
      y: 0,
      opacity: 1,
      stagger: 0.1,
      duration: 0.85,
      ease: 'power2.out',
      force3D: true,
    }, 0.44)
    .fromTo(this.landingTitle, {
      y: -12,
      opacity: 0,
    }, {
      y: 0,
      opacity: 1,
      duration: 0.65,
      ease: 'power2.out',
    }, 0.65)
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
    }, 0.72)
    .fromTo(this.landingHint, {
      opacity: 0,
    }, {
      opacity: 1,
      duration: 0.55,
    }, 0.85);
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

    gsap.set(this.jogloWorld, { x: 0, y: 0, scale: 1, opacity: 1, force3D: true });
    gsap.set([this.layerMountains, this.layerSky], { x: 0, y: 0, scale: 1, force3D: true });
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
      if (this.activeTimeline) {
        this.activeTimeline.kill();
        this.activeTimeline = null;
      }

      appState.set('isTransitioning', true);
      parallaxSystem.pauseAndCenter();
      if (this.hintPulseTween) this.hintPulseTween.pause();

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

      tl.to(this.btnBack, { autoAlpha: 0, y: -8, duration: 0.22, ease: 'power2.in' }, 0)
      .to(currentSection, { scale: 1.03, opacity: 0.2, duration: 0.34, ease: 'power2.in', force3D: true }, 0)
      .to(this.transitionVeil, { opacity: 1, duration: 0.28, ease: 'power2.in' }, 0.06)
      .add(() => {
        currentSection.classList.remove('is-active');
        gsap.set(currentSection, { clearProps: 'transform,opacity' });
        if (onAfterLeaveRoom) onAfterLeaveRoom();

        this.resetLandingState();
        gsap.set(this.jogloWorld, { scale: 1.14, force3D: true });
        gsap.set([this.layerMountains, this.layerSky], { scale: 1.06, force3D: true });
        gsap.set([this.slotFoliageLeft, this.slotFoliageRight], { scale: 1.12, opacity: 0 });
        gsap.set([this.slotLanternLeft, this.slotLanternRight], { yPercent: -25, opacity: 0 });
        gsap.set([this.landingTitle, this.landingHint, '.door-plaque'], { opacity: 0 });

        this.sceneLanding.classList.add('is-active');
      })
      .to(this.transitionVeil, { opacity: 0, duration: 0.42, ease: 'power2.out' })
      .to(this.jogloWorld, { scale: 1, duration: 0.72, ease: 'power3.out', force3D: true }, '<')
      .to([this.layerMountains, this.layerSky], { scale: 1, duration: 0.72, ease: 'power3.out', force3D: true }, '<')
      .to([this.slotFoliageLeft, this.slotFoliageRight], { scale: 1, opacity: 1, duration: 0.65, ease: 'power3.out', force3D: true }, '<0.08')
      .to([this.slotLanternLeft, this.slotLanternRight], { yPercent: 0, opacity: 1, duration: 0.65, ease: 'power3.out', force3D: true }, '<0.08')
      .to([this.landingTitle, this.landingHint, '.door-plaque'], { opacity: 1, duration: 0.38, ease: 'power2.out' }, '-=0.28');
    });
  }
}

export const transitionManager = new TransitionManager();