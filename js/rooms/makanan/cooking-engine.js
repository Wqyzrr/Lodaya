/**
 * js/rooms/makanan/cooking-engine.js
 * Mesin memasak imersif untuk Ruang IV — Kuliner.
 * Fitur:
 * - Drag-and-drop berbasis Pointer Events dengan efek kemiringan (tilt) natural
 * - Tap-to-fly fallback (bahan terbang melengkung masuk ke wadah saat diketuk)
 * - Perubahan visual wadah (state transform), VFX GSAP (uap, api, sparkle, sendok aduk)
 * - Sintesis SFX dapur via Web Audio API (otomatis mengikuti volume/senyap global)
 */
import { appState } from '../../core/state-manager.js';
import { KULINER_ASSETS } from './recipes.js';

class KitchenSfx {
  constructor() {
    this.ctx = null;
    this.noiseBuffer = null;
  }

  getVolume() {
    if (appState.get('audioMuted')) return 0;
    const v = appState.get('audioVolume');
    return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.65;
  }

  ensureCtx() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) this.ctx = new AudioCtx();
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  getNoiseBuffer(ctx) {
    if (this.noiseBuffer) return this.noiseBuffer;
    const length = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  playDrop(type = 'plop') {
    const vol = this.getVolume();
    if (vol <= 0.01) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'sizzle' || type === 'pour') {
      const src = ctx.createBufferSource();
      src.buffer = this.getNoiseBuffer(ctx);
      const filter = ctx.createBiquadFilter();
      filter.type = type === 'sizzle' ? 'highpass' : 'bandpass';
      filter.frequency.setValueAtTime(type === 'sizzle' ? 2400 : 850, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(vol * (type === 'sizzle' ? 0.16 : 0.18), now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (type === 'sizzle' ? 0.34 : 0.42));

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start(now);
      src.stop(now + 0.45);
      return;
    }

    if (type === 'sprinkle') {
      [780, 960, 1180].forEach((freq, i) => {
        const t = now + i * 0.045;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(vol * 0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
      });
      return;
    }

    // Default: 'plop' lembut masuk ke panci/mangkuk
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(560, now + 0.11);
    gain.gain.setValueAtTime(vol * 0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playAction(mode = 'stir', isFinalTap = false) {
    const vol = this.getVolume();
    if (vol <= 0.01) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (mode === 'bake' && isFinalTap) {
      // Bunyi "ting!" bel oven saat matang
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1318.5, now); // E6
      gain.gain.setValueAtTime(vol * 0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.68);
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(mode === 'bake' ? 210 : 260, now);
    osc.frequency.exponentialRampToValueAtTime(mode === 'bake' ? 340 : 440, now + 0.14);
    gain.gain.setValueAtTime(vol * 0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  playComplete() {
    const vol = this.getVolume();
    if (vol <= 0.01) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(vol * 0.2, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.46);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.48);
    });
  }
}

export class CookingEngine {
  constructor(dom, callbacks) {
    this.dom = dom;
    this.callbacks = callbacks;
    this.sfx = new KitchenSfx();

    this.recipe = null;
    this.stepIndex = 0;
    this.completedItems = new Set();
    this.actionTaps = 0;
    this.isStepTransitioning = false;

    this.timers = new Set();
    this.vfxTweens = [];
    this.toastTimer = null;
    this.dragState = null;

    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);
    this.boundVesselClick = this.onVesselClick.bind(this);
  }

  startRecipe(recipe) {
    this.stop();
    this.recipe = recipe;
    this.stepIndex = 0;
    this.isStepTransitioning = false;

    this.dom.vesselZone.addEventListener('click', this.boundVesselClick);
    this.renderStep();
  }

  stop() {
    this.cleanupDrag(true);
    this.clearTimers();
    this.killVfxTweens();
    if (this.dom.vesselZone) {
      this.dom.vesselZone.removeEventListener('click', this.boundVesselClick);
    }
    if (this.dom.toast) {
      this.dom.toast.classList.remove('is-visible');
    }
    this.recipe = null;
  }

  renderStep() {
    if (!this.recipe) return;
    const steps = this.recipe.steps;

    if (this.stepIndex >= steps.length) {
      this.sfx.playComplete();
      this.callbacks.onComplete(this.recipe);
      return;
    }

    const step = steps[this.stepIndex];
    this.completedItems.clear();
    this.actionTaps = 0;
    this.isStepTransitioning = false;

    // 1. Perbarui Kartu Resep
    this.dom.recipeBadge.textContent = step.title;
    this.dom.recipeInstruction.textContent = step.instruction;
    this.dom.recipeDots.innerHTML = steps
      .map((_, idx) => {
        const cls = idx < this.stepIndex ? 'is-done' : idx === this.stepIndex ? 'is-current' : '';
        return `<span class="kl-step-dot ${cls}"></span>`;
      })
      .join('');

    // 2. Perbarui Wadah Masak & VFX
    this.setVesselImage(step.vesselImg, true);
    this.dom.vesselLabel.textContent = step.vesselLabel;
    this.dom.vesselZone.classList.toggle('is-drop-step', step.type === 'drag-drop');
    this.dom.vesselZone.classList.toggle('is-action-step', step.type === 'action');

    this.toggleFire(Boolean(step.showFire));
    this.toggleSteam(Boolean(step.showSteam));

    if (step.toolImg) {
      this.dom.toolImg.src = step.toolImg;
      this.dom.toolImg.hidden = false;
      if (window.gsap && !appState.get('reducedMotion')) {
        window.gsap.fromTo(
          this.dom.toolImg,
          { y: -16, opacity: 0, rotation: -12 },
          { y: 0, opacity: 1, rotation: 0, duration: 0.35, ease: 'power2.out' }
        );
      }
    } else {
      this.dom.toolImg.hidden = true;
    }

    // 3. Render Nampan Bahan atau Panel Aksi
    this.dom.trayItems.innerHTML = '';

    if (step.type === 'drag-drop') {
      this.dom.actionWrap.hidden = true;
      this.dom.trayWrap.hidden = false;
      this.dom.vesselHint.textContent = `Seret atau ketuk bahan (0/${step.items.length})`;

      step.items.forEach((item, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'kl-ing-card';
        btn.dataset.itemId = item.id;
        btn.setAttribute('aria-label', `Masukkan ${item.label}`);
        btn.innerHTML = `
          <div class="kl-ing-img-wrap">
            <img src="${item.img}" alt="${item.label}" draggable="false" />
            <span class="kl-ing-check" aria-hidden="true">✓</span>
          </div>
          <span class="kl-ing-label">${item.label}</span>
        `;

        btn.addEventListener('pointerdown', (e) => this.startDrag(e, item, btn, step));
        this.dom.trayItems.appendChild(btn);

        if (window.gsap && !appState.get('reducedMotion')) {
          window.gsap.fromTo(
            btn,
            { y: 18, opacity: 0, scale: 0.9 },
            { y: 0, opacity: 1, scale: 1, duration: 0.35, delay: idx * 0.06, ease: 'back.out(1.4)' }
          );
        }
      });
    } else if (step.type === 'action') {
      this.dom.trayWrap.hidden = true;
      this.dom.actionWrap.hidden = false;
      this.dom.actionBtn.textContent = step.actionLabel;
      this.dom.actionBtn.disabled = false;
      this.dom.actionProgressFill.style.width = '0%';
      this.dom.vesselHint.textContent = `Ketuk 0/${step.requiredTaps} kali`;
      this.dom.actionBtn.onclick = () => this.handleActionTap(step);
    }
  }

  setVesselImage(src, animate = false) {
    if (!src) return;
    if (this.dom.vesselImg.getAttribute('src') === src) return;
    this.dom.vesselImg.src = src;

    if (animate && window.gsap && !appState.get('reducedMotion')) {
      window.gsap.fromTo(
        this.dom.vesselImg,
        { scale: 0.9, opacity: 0.72 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.4)' }
      );
    }
  }

  /* =========================================================
     DRAG & DROP + TAP-TO-FLY FALLBACK
     ========================================================= */
  startDrag(e, item, cardEl, step) {
    if (this.isStepTransitioning || this.completedItems.has(item.id)) return;
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();

    const ghost = document.createElement('div');
    ghost.className = 'kl-drag-ghost';
    ghost.innerHTML = `<img src="${item.img}" alt="" draggable="false" />`;
    ghost.style.left = `${e.clientX}px`;
    ghost.style.top = `${e.clientY}px`;
    document.body.appendChild(ghost);

    cardEl.classList.add('is-dragging');
    this.dom.vesselZone.classList.add('is-drag-active');

    this.dragState = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      moved: false,
      item,
      cardEl,
      step,
      ghost,
    };

    window.addEventListener('pointermove', this.boundPointerMove, { passive: false });
    window.addEventListener('pointerup', this.boundPointerUp);
    window.addEventListener('pointercancel', this.boundPointerUp);
  }

  onPointerMove(e) {
    if (!this.dragState || e.pointerId !== this.dragState.pointerId) return;
    e.preventDefault();

    const dx = e.clientX - this.dragState.startX;
    const dy = e.clientY - this.dragState.startY;
    if (Math.hypot(dx, dy) > 10) this.dragState.moved = true;

    const vx = e.clientX - this.dragState.lastX;
    this.dragState.lastX = e.clientX;
    const tilt = Math.max(-14, Math.min(14, vx * 0.85));

    const ghost = this.dragState.ghost;
    ghost.style.left = `${e.clientX}px`;
    ghost.style.top = `${e.clientY}px`;
    ghost.style.transform = `translate(-50%, -50%) scale(1.12) rotate(${tilt.toFixed(1)}deg)`;

    const over = this.isOverVessel(e.clientX, e.clientY);
    this.dom.vesselZone.classList.toggle('is-drop-hover', over);
  }

  onPointerUp(e) {
    if (!this.dragState || e.pointerId !== this.dragState.pointerId) return;
    const { item, cardEl, step, ghost, moved } = this.dragState;
    this.cleanupDrag(false);

    const overVessel = this.isOverVessel(e.clientX, e.clientY);

    if (overVessel) {
      ghost.remove();
      this.commitIngredient(item, cardEl, step);
    } else if (!moved) {
      // Tap cepat: terbangkan gambar bahan masuk ke wadah
      this.flyGhostToVessel(ghost, () => {
        this.commitIngredient(item, cardEl, step);
      });
    } else {
      // Dilepas di luar wadah -> kembalikan halus ke nampan
      if (window.gsap && !appState.get('reducedMotion')) {
        const rect = cardEl.getBoundingClientRect();
        window.gsap.to(ghost, {
          left: rect.left + rect.width / 2,
          top: rect.top + rect.height / 2,
          scale: 0.65,
          opacity: 0,
          duration: 0.24,
          ease: 'power2.in',
          onComplete: () => ghost.remove(),
        });
      } else {
        ghost.remove();
      }
      this.showToast(`Seret ${item.label} ke ${step.vesselLabel} di tengah meja.`);
    }
  }

  isOverVessel(clientX, clientY) {
    const rect = this.dom.vesselZone.getBoundingClientRect();
    const pad = 30;
    return (
      clientX >= rect.left - pad &&
      clientX <= rect.right + pad &&
      clientY >= rect.top - pad &&
      clientY <= rect.bottom + pad
    );
  }

  flyGhostToVessel(ghost, onDone) {
    const vRect = this.dom.vesselImg.getBoundingClientRect();
    const targetX = vRect.left + vRect.width / 2;
    const targetY = vRect.top + vRect.height * 0.42;

    if (window.gsap && !appState.get('reducedMotion')) {
      window.gsap.to(ghost, {
        left: targetX,
        top: targetY,
        scale: 0.42,
        opacity: 0,
        duration: 0.36,
        ease: 'power2.inOut',
        onComplete: () => {
          ghost.remove();
          onDone();
        },
      });
    } else {
      ghost.remove();
      onDone();
    }
  }

  cleanupDrag(removeGhost = false) {
    if (this.dragState) {
      this.dragState.cardEl.classList.remove('is-dragging');
      if (removeGhost && this.dragState.ghost) {
        this.dragState.ghost.remove();
      }
    }
    if (this.dom.vesselZone) {
      this.dom.vesselZone.classList.remove('is-drag-active', 'is-drop-hover');
    }
    this.dragState = null;
    window.removeEventListener('pointermove', this.boundPointerMove);
    window.removeEventListener('pointerup', this.boundPointerUp);
    window.removeEventListener('pointercancel', this.boundPointerUp);
  }

  commitIngredient(item, cardEl, step) {
    if (this.completedItems.has(item.id)) return;
    this.completedItems.add(item.id);

    cardEl.classList.add('is-done');
    cardEl.disabled = true;

    this.sfx.playDrop(item.sfxType || 'plop');
    this.playSparkleBurst();
    this.bounceVessel();

    if (item.triggersTransform && step.vesselAfterImg) {
      this.setVesselImage(step.vesselAfterImg, true);
    }

    const doneCount = this.completedItems.size;
    const total = step.items.length;
    this.dom.vesselHint.textContent = `Bahan masuk (${doneCount}/${total})`;
    this.showToast(item.dropMessage || `${item.label} dimasukkan!`);

    if (doneCount >= total) {
      this.isStepTransitioning = true;
      if (step.vesselAfterImg) {
        this.setVesselImage(step.vesselAfterImg, true);
      }
      this.schedule(() => {
        this.stepIndex += 1;
        this.renderStep();
      }, 720);
    }
  }

  /* =========================================================
     AKSI MENGADUK / MENCAMPUR / MEMANGGANG
     ========================================================= */
  onVesselClick() {
    if (!this.recipe || this.isStepTransitioning) return;
    const step = this.recipe.steps[this.stepIndex];
    if (step && step.type === 'action') {
      this.handleActionTap(step);
    }
  }

  handleActionTap(step) {
    if (this.isStepTransitioning) return;
    this.actionTaps += 1;

    const isFinal = this.actionTaps >= step.requiredTaps;
    this.sfx.playAction(step.toolAnim || 'stir', isFinal);

    const pct = Math.min(100, Math.round((this.actionTaps / step.requiredTaps) * 100));
    this.dom.actionProgressFill.style.width = `${pct}%`;
    this.dom.vesselHint.textContent = `Proses ${this.actionTaps}/${step.requiredTaps}`;

    const feedbackList = Array.isArray(step.tapFeedback) ? step.tapFeedback : [];
    const feedbackMsg =
      feedbackList[Math.min(this.actionTaps - 1, feedbackList.length - 1)] ||
      'Proses memasak berlangsung...';
    this.showToast(feedbackMsg);

    this.animateCookingAction(step.toolAnim);
    this.playSparkleBurst();

    if (isFinal) {
      this.isStepTransitioning = true;
      this.dom.actionBtn.disabled = true;
      this.schedule(() => {
        this.stepIndex += 1;
        this.renderStep();
      }, 760);
    }
  }

  animateCookingAction(mode) {
    const gsap = window.gsap;
    if (!gsap || appState.get('reducedMotion')) return;

    if (mode === 'stir' && !this.dom.toolImg.hidden) {
      gsap.fromTo(
        this.dom.toolImg,
        { rotation: -22, x: -16, y: -4 },
        {
          rotation: 22,
          x: 16,
          y: 4,
          duration: 0.22,
          yoyo: true,
          repeat: 1,
          ease: 'sine.inOut',
        }
      );
      this.bounceVessel();
    } else if (mode === 'bake') {
      gsap.fromTo(
        this.dom.vesselImg,
        { x: -4, filter: 'brightness(1.24) drop-shadow(0 0 18px rgba(255,165,60,0.75))' },
        {
          x: 4,
          filter: 'brightness(1) drop-shadow(0 14px 20px rgba(0,0,0,0.62))',
          duration: 0.08,
          repeat: 3,
          yoyo: true,
          clearProps: 'x,filter',
        }
      );
    } else {
      gsap.fromTo(
        this.dom.vesselImg,
        { rotation: -7, scale: 0.95 },
        { rotation: 0, scale: 1, duration: 0.36, ease: 'elastic.out(1, 0.5)' }
      );
    }
  }

  /* =========================================================
     VFX: API KOMPOR, UAP PANAS, SPARKLE & BOUNCE
     ========================================================= */
  bounceVessel() {
    if (!window.gsap || appState.get('reducedMotion')) return;
    window.gsap.fromTo(
      this.dom.vesselImg,
      { scaleX: 1.07, scaleY: 0.93 },
      { scaleX: 1, scaleY: 1, duration: 0.36, ease: 'elastic.out(1, 0.45)' }
    );
  }

  playSparkleBurst() {
    const el = this.dom.vfxSparkle;
    if (!el) return;
    el.src = KULINER_ASSETS.vfxSparkle;
    el.hidden = false;

    if (window.gsap && !appState.get('reducedMotion')) {
      window.gsap.killTweensOf(el);
      window.gsap.fromTo(
        el,
        { scale: 0.42, opacity: 1, rotation: -15 },
        {
          scale: 1.25,
          opacity: 0,
          rotation: 25,
          duration: 0.55,
          ease: 'power2.out',
          onComplete: () => {
            el.hidden = true;
          },
        }
      );
    } else {
      this.schedule(() => {
        el.hidden = true;
      }, 300);
    }
  }

  toggleFire(visible) {
    const el = this.dom.vfxFire;
    if (!el) return;
    el.hidden = !visible;
    if (visible && window.gsap && !appState.get('reducedMotion')) {
      window.gsap.killTweensOf(el);
      const tw = window.gsap.fromTo(
        el,
        { scaleY: 0.92, scaleX: 0.96, opacity: 0.85 },
        {
          scaleY: 1.08,
          scaleX: 1.04,
          opacity: 1,
          duration: 0.32,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        }
      );
      this.vfxTweens.push(tw);
    }
  }

  toggleSteam(visible) {
    const el = this.dom.vfxSteam;
    if (!el) return;
    el.hidden = !visible;
    if (visible && window.gsap && !appState.get('reducedMotion')) {
      window.gsap.killTweensOf(el);
      const tw = window.gsap.fromTo(
        el,
        { y: 12, opacity: 0.25, scale: 0.92 },
        {
          y: -14,
          opacity: 0.78,
          scale: 1.08,
          duration: 1.9,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        }
      );
      this.vfxTweens.push(tw);
    }
  }

  showToast(msg) {
    const el = this.dom.toast;
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      el.classList.remove('is-visible');
    }, 2200);
  }

  schedule(fn, ms) {
    const id = setTimeout(() => {
      this.timers.delete(id);
      fn();
    }, ms);
    this.timers.add(id);
    return id;
  }

  clearTimers() {
    this.timers.forEach((id) => clearTimeout(id));
    this.timers.clear();
    clearTimeout(this.toastTimer);
  }

  killVfxTweens() {
    this.vfxTweens.forEach((tw) => tw.kill());
    this.vfxTweens = [];
  }
}