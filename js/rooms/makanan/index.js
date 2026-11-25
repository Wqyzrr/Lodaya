/**
 * js/rooms/makanan/index.js
 * Ruang IV — Kuliner: Warung & Minigame Masak Khas Jawa Timur
 */
import { appState } from '../../core/state-manager.js';
import { KULINER_ASSETS, RECIPES, KULINER_TUTORIAL } from './recipes.js';
import { CookingEngine } from './cooking-engine.js';

export const makananRoom = {
  id: 'makanan',
  title: 'Kuliner',
  tutorial: KULINER_TUTORIAL,

  init(mountEl, ctx) {
    this.mountEl = mountEl;
    this.ctx = ctx;

    this.isActive = false;
    this.view = 'warung';
    this.currentRecipe = null;
    this.cookedIds = new Set();
    this.ambientTweens = [];
    this.completeTweens = [];
    this.preloaded = false;

    this.renderShell();
    this.cacheDOM();

    this.engine = new CookingEngine(
      {
        stageCenter: this.dom.stageCenter,
        recipeBadge: this.dom.recipeBadge,
        recipeInstruction: this.dom.recipeInstruction,
        recipeDots: this.dom.recipeDots,
        vesselZone: this.dom.vesselZone,
        vesselImg: this.dom.vesselImg,
        vesselLabel: this.dom.vesselLabel,
        vesselHint: this.dom.vesselHint,
        toolClip: this.dom.toolClip,
        toolImg: this.dom.toolImg,
        vfxFire: this.dom.vfxFire,
        vfxSteam: this.dom.vfxSteam,
        vfxSparkle: this.dom.vfxSparkle,
        trayWrap: this.dom.trayWrap,
        trayItems: this.dom.trayItems,
        actionWrap: this.dom.actionWrap,
        actionBtn: this.dom.actionBtn,
        actionProgressFill: this.dom.actionProgressFill,
        toast: this.dom.toast,
      },
      {
        onComplete: (recipe) => this.showCompleteView(recipe),
      }
    );

    this.bindEvents();
  },

  renderShell() {
    const dishesMarkup = RECIPES.map(
      (recipe) => `
      <button
        type="button"
        class="kl-dish-slot"
        data-recipe-id="${recipe.id}"
        aria-label="Masak ${recipe.name} — ${recipe.origin}"
      >
        <div class="kl-dish-visual">
          <img
            class="kl-dish-steam"
            src="${KULINER_ASSETS.vfxUap}"
            alt=""
            draggable="false"
            aria-hidden="true"
          />
          <img
            class="kl-dish-img"
            src="${recipe.finishedImg}"
            alt="${recipe.name}"
            draggable="false"
          />
          <span class="kl-dish-done-badge" hidden>✓ Selesai</span>
        </div>
        <div class="kl-dish-plaque">
          <span class="kl-dish-origin">${recipe.origin} • ${recipe.techniqueLabel}</span>
          <h3>${recipe.name}</h3>
          <span class="kl-dish-cta">Masak Sekarang</span>
        </div>
      </button>
    `
    ).join('');

    this.mountEl.innerHTML = `
      <div class="kl-room" id="kl-room">
        <!-- Latar Full-Bleed First-Person POV -->
        <div class="kl-env" aria-hidden="true">
          <img
            class="kl-bg-img is-active"
            id="kl-bg-warung"
            src="${KULINER_ASSETS.bgWarung}"
            alt=""
            draggable="false"
          />
          <img
            class="kl-bg-img"
            id="kl-bg-masak"
            src="${KULINER_ASSETS.bgMasak}"
            alt=""
            draggable="false"
          />
          <div class="kl-bg-vignette"></div>
        </div>

        <!-- Bar Atas Ringkas -->
        <div class="kl-topbar">
          <div class="kl-title-block">
            <span class="kl-eyebrow">Ruang IV • Kuliner Jawa Timur</span>
            <h2 class="kl-title" id="kl-main-title">Warung Kuliner Tradisional</h2>
          </div>

          <div class="kl-topbar-right">
            <span class="kl-progress-pill" id="kl-progress-pill">0 / ${RECIPES.length} Hidangan</span>
            <button type="button" class="kl-btn kl-btn-ghost" id="kl-btn-change-menu" hidden>
              ← Meja Warung
            </button>
          </div>
        </div>

        <!-- TAMPILAN 1: MEJA WARUNG -->
        <div class="kl-warung-view" id="kl-warung-view">
          <p class="kl-warung-prompt">
            Ketuk salah satu hidangan khas di atas meja untuk mulai memasak
          </p>
          <div class="kl-warung-table-row">
            ${dishesMarkup}
          </div>
        </div>

        <!-- TAMPILAN 2: MEJA MASAK -->
        <div class="kl-cooking-view" id="kl-cooking-view" hidden>
          <!-- Kartu Resep Perkamen -->
          <div class="kl-recipe-card">
            <img
              class="kl-recipe-bg"
              src="${KULINER_ASSETS.uiKartuResep}"
              alt=""
              draggable="false"
              aria-hidden="true"
            />
            <div class="kl-recipe-inner">
              <div class="kl-recipe-head">
                <span class="kl-recipe-badge" id="kl-recipe-badge">Langkah 1</span>
                <div class="kl-step-dots" id="kl-step-dots" aria-hidden="true"></div>
              </div>
              <p class="kl-recipe-instruction" id="kl-recipe-instruction"></p>
            </div>
          </div>

          <!-- Area Tengah/Kanan: Wadah Masak + VFX -->
          <div class="kl-stage-center" id="kl-stage-center">
            <div class="kl-vessel-zone" id="kl-vessel-zone">
              <img
                class="kl-vfx-steam"
                id="kl-vfx-steam"
                src="${KULINER_ASSETS.vfxUap}"
                alt=""
                draggable="false"
                hidden
                aria-hidden="true"
              />
              <img
                class="kl-vfx-fire"
                id="kl-vfx-fire"
                src="${KULINER_ASSETS.vfxApi}"
                alt=""
                draggable="false"
                hidden
                aria-hidden="true"
              />
              <img
                class="kl-vessel-img"
                id="kl-vessel-img"
                alt="Wadah Masak"
                draggable="false"
              />
              <!-- Wrapper clipping agar ujung sendok/whisk terlihat tercelup di dalam wadah -->
              <div class="kl-tool-clip" id="kl-tool-clip" hidden aria-hidden="true">
                <img
                  class="kl-tool-img"
                  id="kl-tool-img"
                  alt=""
                  draggable="false"
                />
              </div>
              <img
                class="kl-vfx-sparkle"
                id="kl-vfx-sparkle"
                src="${KULINER_ASSETS.vfxSparkle}"
                alt=""
                draggable="false"
                hidden
                aria-hidden="true"
              />
              <div class="kl-vessel-meta">
                <strong id="kl-vessel-label">Wadah Masak</strong>
                <span id="kl-vessel-hint">Seret bahan ke sini</span>
              </div>
            </div>
          </div>

          <!-- Area Bawah: Nampan Bahan atau Panel Aksi -->
          <div class="kl-bottom-dock">
            <div class="kl-tray-wrap" id="kl-tray-wrap">
              <img
                class="kl-tray-bg"
                src="${KULINER_ASSETS.uiTray}"
                alt=""
                draggable="false"
                aria-hidden="true"
              />
              <div class="kl-tray-items" id="kl-tray-items"></div>
            </div>

            <div class="kl-action-wrap" id="kl-action-wrap" hidden>
              <div class="kl-action-bar-track">
                <div class="kl-action-bar-fill" id="kl-action-progress-fill"></div>
              </div>
              <button
                type="button"
                class="kl-btn kl-btn-primary kl-btn-cook-action"
                id="kl-btn-cook-action"
              >
                Aduk Masakan
              </button>
            </div>
          </div>

          <div class="kl-toast" id="kl-toast" role="status" aria-live="polite"></div>
        </div>

        <!-- TAMPILAN 3: OVERLAY HIDANGAN MATANG -->
        <div class="kl-complete-overlay" id="kl-complete-overlay" hidden>
          <div class="kl-complete-card" id="kl-complete-card">
            <div class="kl-complete-visual">
              <img
                class="kl-complete-sparkle"
                id="kl-complete-sparkle"
                src="${KULINER_ASSETS.vfxSparkle}"
                alt=""
                draggable="false"
                aria-hidden="true"
              />
              <!-- 3 kepulan uap kecil di atas permukaan makanan -->
              <div class="kl-complete-steam-group" aria-hidden="true">
                <img class="kl-complete-steam-wisp wisp-1" src="${KULINER_ASSETS.vfxUap}" alt="" draggable="false" />
                <img class="kl-complete-steam-wisp wisp-2" src="${KULINER_ASSETS.vfxUap}" alt="" draggable="false" />
                <img class="kl-complete-steam-wisp wisp-3" src="${KULINER_ASSETS.vfxUap}" alt="" draggable="false" />
              </div>
              <img
                class="kl-complete-img"
                id="kl-complete-img"
                alt="Hidangan Selesai"
                draggable="false"
              />
            </div>

            <div class="kl-complete-info">
              <span class="kl-complete-eyebrow" id="kl-complete-origin">Khas Jawa Timur</span>
              <h3 id="kl-complete-title">Hidangan Siap Disajikan!</h3>
              <p id="kl-complete-fact"></p>
              <div class="kl-complete-actions">
                <button type="button" class="kl-btn kl-btn-primary" id="kl-btn-other-menu">
                  Pilih Menu Lain
                </button>
                <button type="button" class="kl-btn kl-btn-secondary" id="kl-btn-cook-again">
                  Masak Ulang
                </button>
                <button type="button" class="kl-btn kl-btn-ghost" id="kl-btn-back-joglo">
                  Kembali ke Joglo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  cacheDOM() {
    const q = (sel) => this.mountEl.querySelector(sel);
    const qa = (sel) => Array.from(this.mountEl.querySelectorAll(sel));

    this.dom = {
      bgWarung: q('#kl-bg-warung'),
      bgMasak: q('#kl-bg-masak'),
      mainTitle: q('#kl-main-title'),
      progressPill: q('#kl-progress-pill'),
      btnChangeMenu: q('#kl-btn-change-menu'),

      warungView: q('#kl-warung-view'),
      dishSlots: qa('.kl-dish-slot'),
      dishSteams: qa('.kl-dish-steam'),

      cookingView: q('#kl-cooking-view'),
      stageCenter: q('#kl-stage-center'),
      recipeBadge: q('#kl-recipe-badge'),
      recipeInstruction: q('#kl-recipe-instruction'),
      recipeDots: q('#kl-step-dots'),

      vesselZone: q('#kl-vessel-zone'),
      vesselImg: q('#kl-vessel-img'),
      vesselLabel: q('#kl-vessel-label'),
      vesselHint: q('#kl-vessel-hint'),
      toolClip: q('#kl-tool-clip'),
      toolImg: q('#kl-tool-img'),
      vfxFire: q('#kl-vfx-fire'),
      vfxSteam: q('#kl-vfx-steam'),
      vfxSparkle: q('#kl-vfx-sparkle'),

      trayWrap: q('#kl-tray-wrap'),
      trayItems: q('#kl-tray-items'),
      actionWrap: q('#kl-action-wrap'),
      actionBtn: q('#kl-btn-cook-action'),
      actionProgressFill: q('#kl-action-progress-fill'),
      toast: q('#kl-toast'),

      completeOverlay: q('#kl-complete-overlay'),
      completeCard: q('#kl-complete-card'),
      completeImg: q('#kl-complete-img'),
      completeSparkle: q('#kl-complete-sparkle'),
      completeWisps: qa('.kl-complete-steam-wisp'),
      completeOrigin: q('#kl-complete-origin'),
      completeTitle: q('#kl-complete-title'),
      completeFact: q('#kl-complete-fact'),
      btnOtherMenu: q('#kl-btn-other-menu'),
      btnCookAgain: q('#kl-btn-cook-again'),
      btnBackJoglo: q('#kl-btn-back-joglo'),
    };
  },

  bindEvents() {
    this.dom.dishSlots.forEach((btn) => {
      btn.addEventListener('click', () => {
        const recipe = RECIPES.find((r) => r.id === btn.dataset.recipeId);
        if (recipe) this.openCookingView(recipe);
      });
    });

    this.dom.btnChangeMenu.addEventListener('click', () => this.openWarungView());
    this.dom.btnOtherMenu.addEventListener('click', () => this.openWarungView());
    this.dom.btnCookAgain.addEventListener('click', () => {
      if (this.currentRecipe) this.openCookingView(this.currentRecipe);
    });
    this.dom.btnBackJoglo.addEventListener('click', () => {
      if (this.ctx && typeof this.ctx.returnToLanding === 'function') {
        this.ctx.returnToLanding();
      }
    });
  },

  preloadAllAssets() {
    if (this.preloaded) return;
    this.preloaded = true;
    Object.values(KULINER_ASSETS).forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
  },

  enter() {
    this.isActive = true;
    this.preloadAllAssets();
    this.openWarungView();
    this.startWarungAmbient();
  },

  exit() {
    this.isActive = false;
    this.engine.stop();
    this.killAmbientTweens();
    this.killCompleteTweens();
    this.dom.completeOverlay.hidden = true;
  },

  resize() {
    if (!this.isActive) return;
    if (this.engine) {
      this.engine.cleanupDrag(true);
    }
  },

  openWarungView() {
    this.view = 'warung';
    this.engine.stop();
    this.killCompleteTweens();

    this.dom.bgWarung.classList.add('is-active');
    this.dom.bgMasak.classList.remove('is-active');

    this.dom.warungView.hidden = false;
    this.dom.cookingView.hidden = true;
    this.dom.completeOverlay.hidden = true;
    this.dom.btnChangeMenu.hidden = true;
    this.dom.mainTitle.textContent = 'Warung Kuliner Tradisional';

    this.updateProgressUI();

    if (window.gsap && !appState.get('reducedMotion')) {
      window.gsap.fromTo(
        this.dom.dishSlots,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.42,
          ease: 'power2.out',
          clearProps: 'transform',
        }
      );
    }
  },

  openCookingView(recipe) {
    this.view = 'cooking';
    this.currentRecipe = recipe;
    this.killCompleteTweens();

    this.dom.bgWarung.classList.remove('is-active');
    this.dom.bgMasak.classList.add('is-active');

    this.dom.warungView.hidden = true;
    this.dom.completeOverlay.hidden = true;
    this.dom.cookingView.hidden = false;
    this.dom.btnChangeMenu.hidden = false;
    this.dom.mainTitle.textContent = `Memasak ${recipe.name}`;

    this.engine.startRecipe(recipe);

    if (window.gsap && !appState.get('reducedMotion')) {
      window.gsap.fromTo(
        this.dom.cookingView,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: 'power2.out' }
      );
    }
  },

  showCompleteView(recipe) {
    this.view = 'complete';
    this.cookedIds.add(recipe.id);
    this.updateProgressUI();

    this.dom.completeImg.src = recipe.finishedImg;
    this.dom.completeImg.alt = `${recipe.name} siap disajikan`;
    this.dom.completeOrigin.textContent = `${recipe.origin} • ${recipe.tagline}`;
    this.dom.completeTitle.textContent = `${recipe.name} Siap Disajikan!`;
    this.dom.completeFact.textContent = recipe.culturalFact;
    this.dom.completeOverlay.hidden = false;

    this.startCompleteAnimations();
  },

  updateProgressUI() {
    this.dom.progressPill.textContent = `${this.cookedIds.size} / ${RECIPES.length} Hidangan`;
    this.dom.dishSlots.forEach((slot) => {
      const done = this.cookedIds.has(slot.dataset.recipeId);
      const badge = slot.querySelector('.kl-dish-done-badge');
      const cta = slot.querySelector('.kl-dish-cta');
      if (badge) badge.hidden = !done;
      if (cta) cta.textContent = done ? 'Masak Lagi' : 'Masak Sekarang';
      slot.classList.toggle('is-cooked', done);
    });
  },

  startWarungAmbient() {
    this.killAmbientTweens();
    if (!window.gsap || appState.get('reducedMotion')) return;

    this.dom.dishSteams.forEach((steam, i) => {
      const tw = window.gsap.fromTo(
        steam,
        { y: 8, opacity: 0.22 },
        {
          y: -12,
          opacity: 0.72,
          duration: 2.2 + i * 0.35,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        }
      );
      this.ambientTweens.push(tw);
    });
  },

  startCompleteAnimations() {
    this.killCompleteTweens();
    if (!window.gsap || appState.get('reducedMotion')) return;

    this.completeTweens.push(
      window.gsap.fromTo(
        this.dom.completeCard,
        { scale: 0.88, y: 20, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.45, ease: 'back.out(1.4)' }
      )
    );

    this.completeTweens.push(
      window.gsap.to(this.dom.completeSparkle, {
        rotation: 360,
        duration: 18,
        repeat: -1,
        ease: 'none',
      })
    );

    // 3 kepulan uap kecil naik bergantian secara natural di atas hidangan
    this.dom.completeWisps.forEach((wisp, i) => {
      const tl = window.gsap.timeline({ repeat: -1, delay: i * 0.75 });
      tl.fromTo(
        wisp,
        { y: 12, x: 0, scale: 0.72, opacity: 0 },
        { y: -10, x: i % 2 === 0 ? -5 : 5, scale: 1, opacity: 0.78, duration: 1.1, ease: 'sine.out' }
      ).to(wisp, {
        y: -30,
        x: i % 2 === 0 ? 4 : -4,
        scale: 1.22,
        opacity: 0,
        duration: 1.2,
        ease: 'sine.in',
      });
      this.completeTweens.push(tl);
    });
  },

  killAmbientTweens() {
    this.ambientTweens.forEach((tw) => tw.kill());
    this.ambientTweens = [];
  },

  killCompleteTweens() {
    this.completeTweens.forEach((tw) => tw.kill());
    this.completeTweens = [];
  },
};