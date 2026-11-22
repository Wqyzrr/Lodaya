/**
 * transition-manager.js
 * Pengelola tunggal seluruh transisi sinematik (tirai, intro Joglo, masuk pintu,
 * kembali ke Joglo) dengan kepemilikan GSAP yang bersih agar bebas glitch.
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

    // Pembungkus slot terluar untuk animasi keluar/masuk foreground
    this.slotLanternLeft = document.getElementById('slot-lantern-left');
    this.slotLanternRight = document.getElementById('slot-lantern-right');
    this.slotFoliageLeft = document.getElementById('slot-foliage-left');
    this.slotFoliageRight = document.getElementById('slot-foliage-right');

    // Elemen gambar terdalam khusus ayunan ambient (rotasi saja)
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

    // Opening Kipas Batik (Pengganti Tirai)
    this.openingStage = document.getElementById('opening-stage');
    this.opFanRig = document.getElementById('op-fan-rig');
    this.opFanLeft = document.querySelector('.op-fan.fan-left');
    this.opFanRight = document.querySelector('.op-fan.fan-right');
    this.opWingsLeft = document.querySelector('.op-wing.wing-left');
    this.opWingsRight = document.querySelector('.op-wing.wing-right');
    this.opOrnaments = document.querySelectorAll('.op-ornament');
    this.opCenterContent = document.getElementById('op-center-content');
    this.opCta = document.getElementById('op-cta');
  }

  init() {
    this.initAmbientLife();
    this.playOpeningIntro();

    const triggerEnter = () => this.openCurtain();
    if (this.openingStage) {
      this.openingStage.addEventListener('click', triggerEnter);
      this.openingStage.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerEnter();
        }
      });
    }
  }

  /**
   * Animasi pembuka kipas batik (meniru video referensi) saat loading berjalan.
   */
  playOpeningIntro() {
    if (!this.openingStage || !window.gsap) return;
    const gsap = window.gsap;

    const tl = gsap.timeline();

    // 1. Kipas masuk berputar cepat dari besar ke tengah
    tl.fromTo(this.opFanRig, {
      scale: 2.2,
      rotation: -90,
      opacity: 0,
    }, {
      scale: 1,
      rotation: 0,
      opacity: 1,
      duration: 1.0,
      ease: 'power3.out',
      force3D: true,
    }, 0)
    // 2. Ornamen sayap mekar keluar dari belakang kipas
    .fromTo(this.opWingsLeft, {
      xPercent: 40,
      scale: 0.4,
      opacity: 0,
    }, {
      xPercent: -68,
      scale: 1,
      opacity: 1,
      duration: 0.9,
      ease: 'back.out(1.4)',
    }, 0.55)
    .fromTo(this.opWingsRight, {
      xPercent: -40,
      scale: 0.4,
      opacity: 0,
    }, {
      xPercent: 68,
      scale: 1,
      opacity: 1,
      duration: 0.9,
      ease: 'back.out(1.4)',
    }, 0.55)
    // 3. Ornamen 4 sudut muncul perlahan
    .fromTo(this.opOrnaments, {
      scale: 0.5,
      opacity: 0,
    }, {
      scale: 1,
      opacity: 1,
      stagger: 0.08,
      duration: 0.75,
      ease: 'power2.out',
    }, 0.65)
    // 4. Kipas berputar pelan lalu menyingkir/memudar untuk menampilkan judul
    .to(this.opFanRig, {
      rotation: 180,
      scale: 0.65,
      opacity: 0,
      duration: 0.85,
      ease: 'power2.inOut',
    }, 1.8)
    .to([this.opWingsLeft, this.opWingsRight], {
      opacity: 0,
      scale: 0.8,
      duration: 0.55,
      ease: 'power2.in',
    }, 1.85)
    // 5. Judul Pesona Jawa Timur & Progress Loading tampil di tengah
    .fromTo(this.opCenterContent, {
      scale: 0.86,
      y: 14,
      opacity: 0,
    }, {
      scale: 1,
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: 'power3.out',
    }, 2.15);

    // Denyut halus pada tombol CTA saat sudah siap
    if (!appState.get('reducedMotion') && this.opCta) {
      this.ctaPulseTween = gsap.to(this.opCta, {
        scale: 1.05,
        duration: 1.1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
  }

  /**
   * Transisi keluar dari Opening Kipas Batik menuju Rumah Adat Joglo.
   */
  openCurtain() {
    if (appState.get('curtainOpened') || !appState.get('landingReady')) return;
    appState.set('curtainOpened', true);
    appState.set('isTransitioning', true);

    if (this.ctaPulseTween) {
      this.ctaPulseTween.kill();
      this.ctaPulseTween = null;
    }

    orientationManager.requestFullscreenAndLock();
    audioManager.playAmbient();

    const gsap = window.gsap;
    const tl = gsap.timeline({
      onComplete: () => {
        this.openingStage.style.display = 'none';
        appState.set('isTransitioning', false);
        this.startHintPulse();
      },
    });
    this.activeTimeline = tl;

    // 1. Judul memudar, kipas kembali muncul berputar lalu membesar menembus layar
    tl.to(this.opCenterContent, {
      scale: 0.9,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    }, 0)
    .fromTo(this.opFanRig, {
      scale: 0.5,
      rotation: 0,
      opacity: 0,
    }, {
      scale: 1.15,
      rotation: 120,
      opacity: 1,
      duration: 0.55,
      ease: 'power2.out',
      force3D: true,
    }, 0.1)
    // 2. Kipas membelah & membesar penuh sambil seluruh opening stage memudar
    .to(this.opFanRig, {
      scale: 3.4,
      rotation: 240,
      opacity: 0,
      duration: 0.75,
      ease: 'power3.in',
      force3D: true,
    }, 0.62)
    .to(this.opOrnaments, {
      scale: 1.35,
      opacity: 0,
      duration: 0.55,
      ease: 'power2.in',
    }, 0.55)
    .to(this.openingStage, {
      opacity: 0,
      duration: 0.55,
      ease: 'power2.inOut',
    }, 0.75)
    // 3. Rumah Joglo masuk dengan halus
    .fromTo(this.jogloWorld, {
      scale: 0.94,
      y: 18,
      opacity: 0,
    }, {
      scale: 1,
      y: 0,
      opacity: 1,
      duration: 0.95,
      ease: 'power3.out',
      force3D: true,
    }, 0.78)
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
    }, 1.15);
  }

  initAmbientLife() {
    if (appState.get('reducedMotion')) return;

    const addAmbient = (tween) => {
      this.ambientTweens.push(tween);
      return tween;
    };

    addAmbient(window.gsap.to(this.lanternLeft, {
      rotation: 2.1,
      duration: 3.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      force3D: true,
    }));

    addAmbient(window.gsap.to(this.lanternRight, {
      rotation: -2.3,
      duration: 3.9,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 0.6,
      force3D: true,
    }));

    addAmbient(window.gsap.to(this.foliageLeft, {
      rotation: 1.3,
      duration: 4.6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      force3D: true,
    }));

    addAmbient(window.gsap.to(this.foliageRight, {
      rotation: -1.5,
      duration: 5.1,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 0.8,
      force3D: true,
    }));

    // 10 partikel cahaya hangat (ringan untuk GPU ponsel)
    if (this.particleContainer && this.particleContainer.children.length === 0) {
      for (let i = 0; i < 10; i += 1) {
        const dot = document.createElement('span');
        dot.className = 'particle';
        window.gsap.set(dot, {
          left: `${window.gsap.utils.random(10, 90)}%`,
          top: `${window.gsap.utils.random(18, 76)}%`,
          scale: window.gsap.utils.random(0.45, 1.0),
        });
        this.particleContainer.appendChild(dot);

        addAmbient(window.gsap.to(dot, {
          y: window.gsap.utils.random(-24, 24),
          x: window.gsap.utils.random(-16, 16),
          opacity: window.gsap.utils.random(0.22, 0.7),
          duration: window.gsap.utils.random(3.4, 6.2),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: window.gsap.utils.random(0, 2.5),
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

  /**
   * Menjamin seluruh lapisan Joglo & 4 pintu kembali ke keadaan kanonis.
   * Mencegah akumulasi transform atau elemen hilang pasca keluar ruangan.
   */
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
    gsap.set(this.landingTitle, {
      x: 0,
      y: 0,
      opacity: 1,
    });
    gsap.set([this.landingHint, '.door-plaque'], {
      clearProps: 'transform',
      opacity: 1,
    });

    this.doorUnits.forEach((door) => {
      const leftLeaf = door.querySelector('.door-leaf.left');
      const rightLeaf = door.querySelector('.door-leaf.right');
      const glow = door.querySelector('.door-interior-glow');
      gsap.killTweensOf([leftLeaf, rightLeaf, glow]);
      gsap.set([leftLeaf, rightLeaf], { rotateY: 0, force3D: true });
      gsap.set(glow, { opacity: 0.12 });
    });
  }

  openCurtain() {
    if (appState.get('curtainOpened') || !appState.get('landingReady')) return;
    appState.set('curtainOpened', true);
    appState.set('isTransitioning', true);
    

    if (this.ctaPulseTween) {
      this.ctaPulseTween.kill();
      this.ctaPulseTween = null;
    }

    orientationManager.requestFullscreenAndLock();
    audioManager.playAmbient();

    const reduced = appState.get('reducedMotion');
    const gsap = window.gsap;

    if (reduced) {
      gsap.to(this.curtainOverlay, {
        opacity: 0,
        duration: 0.35,
        onComplete: () => {
          this.curtainOverlay.style.display = 'none';
          this.resetLandingState();
          appState.set('isTransitioning', false);
        },
      });
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        this.curtainOverlay.style.display = 'none';
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
    // ------------------------
    .fromTo(this.landingHint, {
      opacity: 0,
    }, {
      opacity: 1,
      duration: 0.55,
    }, 0.85);
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

  /**
   * Transisi masuk ke salah satu ruangan.
   */
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

      // Pastikan Joglo pada posisi kanonis sebelum mengukur posisi pintu
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
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
      }, 0)
      .to(leftLeaf, {
        rotateY: -108,
        duration: 0.68,
        ease: 'power2.inOut',
        force3D: true,
      }, 0.05)
      .to(rightLeaf, {
        rotateY: 108,
        duration: 0.68,
        ease: 'power2.inOut',
        force3D: true,
      }, 0.05)
      .to(doorGlow, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.in',
      }, 0.1)
      .to(this.slotFoliageLeft, {
        xPercent: -45,
        yPercent: 20,
        scale: 1.3,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.in',
        force3D: true,
      }, 0.2)
      .to(this.slotFoliageRight, {
        xPercent: 45,
        yPercent: 20,
        scale: 1.3,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.in',
        force3D: true,
      }, 0.2)
      .to([this.slotLanternLeft, this.slotLanternRight], {
        yPercent: -55,
        scale: 1.25,
        opacity: 0,
        duration: 0.78,
        ease: 'power3.in',
        force3D: true,
      }, 0.2)
      .to(this.jogloWorld, {
        x: moveX,
        y: moveY,
        scale: targetScale,
        duration: 1.0,
        ease: 'power3.inOut',
        force3D: true,
      }, 0.26)
      .to(this.layerMountains, {
        scale: 1.2,
        duration: 1.0,
        ease: 'power3.inOut',
        force3D: true,
      }, 0.26)
      .to(this.layerSky, {
        scale: 1.08,
        duration: 1.0,
        ease: 'power3.inOut',
        force3D: true,
      }, 0.26)
      .to(this.transitionVeil, {
        opacity: 1,
        duration: 0.32,
        ease: 'power2.in',
      }, 0.86)
      .add(() => {
        this.sceneLanding.classList.remove('is-active');
        // Langsung kembalikan skala Joglo di balik layar saat tersembunyi
        // agar GPU tidak menanggung layer scale(4.6) saat keluar ruangan
        this.resetLandingState();
        gsap.set([this.landingTitle, this.landingHint, '.door-plaque'], { opacity: 0 });
        targetSection.classList.add('is-active');
        gsap.set(targetSection, { opacity: 1, scale: 1.04, force3D: true });
        if (onBeforeReveal) onBeforeReveal();
      })
      .to(this.transitionVeil, {
        opacity: 0,
        duration: 0.45,
        ease: 'power2.out',
      })
      .to(targetSection, {
        scale: 1,
        duration: 0.55,
        ease: 'power3.out',
        force3D: true,
      }, '<')
      .to(this.btnBack, {
        autoAlpha: 1,
        y: 0,
        duration: 0.35,
        ease: 'power2.out',
      }, '-=0.25');
    });
  }

  /**
   * Transisi kembali ke Rumah Joglo — terjamin bebas glitch di mobile & desktop.
   */
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

      tl.to(this.btnBack, {
        autoAlpha: 0,
        y: -8,
        duration: 0.22,
        ease: 'power2.in',
      }, 0)
      .to(currentSection, {
        scale: 1.03,
        opacity: 0.2,
        duration: 0.34,
        ease: 'power2.in',
        force3D: true,
      }, 0)
      .to(this.transitionVeil, {
        opacity: 1,
        duration: 0.28,
        ease: 'power2.in',
      }, 0.06)
      .add(() => {
        currentSection.classList.remove('is-active');
        gsap.set(currentSection, { clearProps: 'transform,opacity' });
        if (onAfterLeaveRoom) onAfterLeaveRoom();

        // Siapkan posisi awal lembut untuk efek mundur keluar Joglo
        this.resetLandingState();
        gsap.set(this.jogloWorld, { scale: 1.14, force3D: true });
        gsap.set([this.layerMountains, this.layerSky], { scale: 1.06, force3D: true });
        gsap.set([this.slotFoliageLeft, this.slotFoliageRight], { scale: 1.12, opacity: 0 });
        gsap.set([this.slotLanternLeft, this.slotLanternRight], { yPercent: -25, opacity: 0 });
        gsap.set([this.landingTitle, this.landingHint, '.door-plaque'], { opacity: 0 });

        this.sceneLanding.classList.add('is-active');
      })
      .to(this.transitionVeil, {
        opacity: 0,
        duration: 0.42,
        ease: 'power2.out',
      })
      .to(this.jogloWorld, {
        scale: 1,
        duration: 0.72,
        ease: 'power3.out',
        force3D: true,
      }, '<')
      .to([this.layerMountains, this.layerSky], {
        scale: 1,
        duration: 0.72,
        ease: 'power3.out',
        force3D: true,
      }, '<')
      .to([this.slotFoliageLeft, this.slotFoliageRight], {
        scale: 1,
        opacity: 1,
        duration: 0.65,
        ease: 'power3.out',
        force3D: true,
      }, '<0.08')
      .to([this.slotLanternLeft, this.slotLanternRight], {
        yPercent: 0,
        opacity: 1,
        duration: 0.65,
        ease: 'power3.out',
        force3D: true,
      }, '<0.08')
      .to([this.landingTitle, this.landingHint, '.door-plaque'], {
        opacity: 1,
        duration: 0.38,
        ease: 'power2.out',
      }, '-=0.28');
    });
  }
}

export const transitionManager = new TransitionManager();
