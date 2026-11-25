/**
 * js/rooms/peran/index.js
 * Ruang I — Seni Peran: Buku Cerita Interaktif "Rahasia di Balik Topeng Reog"
 * Modular ES6 + GSAP 3.12.5 + CSS 3D Page-Flip Engine.
 */
import { appState } from '../../core/state-manager.js';
import {
  STORY_META,
  STORY_ASSETS,
  STORY_PAGES,
  PERAN_TUTORIAL,
  TOTAL_STORY_IMAGES,
} from './story-data.js';

const EXTENSIONS = ['.webp', '.png', '.jpg'];
const TOTAL_SPREADS = STORY_PAGES.length;

/**
 * Cache resolusi ekstensi aset (webp -> png -> jpg) agar tidak meminta ulang
 * dan menangani aset hilang secara halus tanpa error konsol.
 */
const resolvedAssetCache = new Map();

function resolveAssetUrl(basePath) {
  if (!basePath) return Promise.resolve(null);
  if (resolvedAssetCache.has(basePath)) {
    return Promise.resolve(resolvedAssetCache.get(basePath));
  }

  return new Promise((resolve) => {
    let idx = 0;
    const tryNext = () => {
      if (idx >= EXTENSIONS.length) {
        resolvedAssetCache.set(basePath, null);
        resolve(null);
        return;
      }
      const candidate = `${basePath}${EXTENSIONS[idx]}`;
      idx += 1;
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        resolvedAssetCache.set(basePath, candidate);
        resolve(candidate);
      };
      img.onerror = tryNext;
      img.src = candidate;
    };
    tryNext();
  });
}

function getCachedUrl(basePath) {
  return resolvedAssetCache.get(basePath) || null;
}

export const peranRoom = {
  id: 'peran',
  title: 'Seni Peran',
  tutorial: PERAN_TUTORIAL,

  init(mountEl, ctx) {
    this.mountEl = mountEl;
    this.ctx = ctx;

    // Status tampilan: 'cover' | 'reading' | 'closed-end'
    this.viewState = 'cover';
    this.currentSpread = 0; // 0..8 = STORY_PAGES, 9 = STORY_CLOSING
    this.isAnimating = false;
    this.isActive = false;

    // GSAP & Listener tracking untuk pembersihan total saat exit()
    this.ambientTweens = [];
    this.pageTweens = [];
    this.activeFlipTween = null;
    this.dragState = null;

    // Bound handlers
    this.onKeyDown = this.handleKeyDown.bind(this);
    this.onPointerDown = this.handlePointerDown.bind(this);
    this.onPointerMove = this.handlePointerMove.bind(this);
    this.onPointerUp = this.handlePointerUp.bind(this);
    this.onStagePointerMove = this.handleStageParallax.bind(this);

    this.renderShell();
    this.cacheDOM();
    this.bindStaticEvents();
  },

  renderShell() {
    const dotsMarkup = Array.from({ length: TOTAL_SPREADS }, (_, idx) => {
      const label = `Halaman ${idx * 2 + 1}–${idx * 2 + 2}`;
      return `<button type="button" class="sb-dot" data-spread="${idx}" aria-label="Buka ${label}"></button>`;
    }).join('');

    this.mountEl.innerHTML = `
      <div class="sb-room" id="sb-room">
        <!-- Latar Atmosfer & Partikel Emas -->
        <div class="sb-atmosphere" aria-hidden="true">
          <div class="sb-light-glow"></div>
          <div class="sb-batik-bg" id="sb-batik-bg"></div>
          <div class="sb-particles-layer" id="sb-particles-layer"></div>
        </div>

        <!-- Bar Atas Ringkas -->
        <div class="sb-topbar">
          <div class="sb-heading">
            <span class="sb-eyebrow">${STORY_META.eyebrow}</span>
            <h2 class="sb-main-title">${STORY_META.title}</h2>
          </div>
          <div class="sb-topbar-meta">
            <span class="sb-page-pill" id="sb-page-pill" hidden>Halaman 1 / ${STORY_PAGES.length}</span>
          </div>
        </div>

        <!-- Panggung Utama Buku 3D (Satu Objek Utuh: Tertutup & Terbuka) -->
        <div class="sb-stage" id="sb-stage">
          <div class="sb-book-shell is-closed" id="sb-book-shell">
            <div class="sb-hardcover-back" id="sb-hardcover-back" aria-hidden="true"></div>
            <div class="sb-page-stack left" id="sb-stack-left" aria-hidden="true"></div>
            <div class="sb-page-stack right" aria-hidden="true"></div>

            <div class="sb-spread-surface" id="sb-spread-surface">
              <!-- Halaman Kiri Statis -->
              <div class="sb-page sb-page-left" id="sb-page-left"></div>
              <!-- Halaman Kanan Statis -->
              <div class="sb-page sb-page-right" id="sb-page-right"></div>

              <!-- Bayangan Tulang Tengah Buku -->
              <div class="sb-spine-crease" id="sb-spine-crease" aria-hidden="true"></div>

              <!-- Bayangan Lempar saat Halaman Dibalik -->
              <div class="sb-cast-shadow" id="sb-cast-shadow" aria-hidden="true"></div>

              <!-- Lembaran 3D Aktif saat Flip / Drag Halaman -->
              <div class="sb-flip-leaf" id="sb-flip-leaf" aria-hidden="true">
                <div class="sb-flip-face sb-flip-front" id="sb-flip-front">
                  <div class="sb-flip-content" id="sb-flip-front-content"></div>
                  <div class="sb-flip-shade" id="sb-flip-front-shade"></div>
                </div>
                <div class="sb-flip-face sb-flip-back" id="sb-flip-back">
                  <div class="sb-flip-content" id="sb-flip-back-content"></div>
                  <div class="sb-flip-shade" id="sb-flip-back-shade"></div>
                </div>
              </div>

              <!-- LEMBARAN SAMPUL HARDCOVER 3D (Menyatu dengan Buku) -->
              <div class="sb-cover-leaf" id="sb-cover-leaf">
                <!-- Sisi Depan: Sampul Buku -->
                <div class="sb-cover-face sb-cover-front" id="sb-cover-front">
                  <img class="sb-cover-art" id="sb-cover-art" alt="Sampul Buku ${STORY_META.title}" draggable="false" />
                  <div class="sb-cover-vignette" aria-hidden="true"></div>
                  <div class="sb-cover-corners" aria-hidden="true">
                    <img class="sb-corner-img tl" data-asset-corner alt="" draggable="false" />
                    <img class="sb-corner-img tr" data-asset-corner alt="" draggable="false" />
                    <img class="sb-corner-img bl" data-asset-corner alt="" draggable="false" />
                    <img class="sb-corner-img br" data-asset-corner alt="" draggable="false" />
                  </div>
                  <div class="sb-cover-overlay">
                    <span class="sb-cover-subtitle">${STORY_META.subtitle}</span>
                    <h3 class="sb-cover-title">${STORY_META.title}</h3>
                    <div class="sb-cover-divider" aria-hidden="true"></div>
                    <button type="button" class="sb-btn-open" id="sb-btn-open">
                      <span>${STORY_META.openCta}</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Sisi Belakang: Langsung menampilkan Halaman Kiri Pertama -->
                <div class="sb-cover-face sb-cover-back" id="sb-cover-back">
                  <div class="sb-flip-content" id="sb-cover-back-content"></div>
                </div>
              </div>

              <!-- Aksen Karakter Bima di Samping Sampul -->
              <img class="sb-cover-boy" id="sb-cover-boy" alt="" draggable="false" aria-hidden="true" />

              <!-- Sudut Interaktif untuk Membalik Halaman -->
              <button type="button" class="sb-corner-hotspot prev" id="sb-corner-prev" aria-label="Balik ke halaman sebelumnya">
                <span class="sb-corner-peel"></span>
              </button>
              <button type="button" class="sb-corner-hotspot next" id="sb-corner-next" aria-label="Balik ke halaman berikutnya">
                <span class="sb-corner-peel"></span>
              </button>
            </div>
          </div>

          <!-- Pesan setelah buku ditutup kembali di akhir cerita -->
          <div class="sb-closed-banner" id="sb-closed-banner" hidden>
            <p>Kisah <strong>${STORY_META.title}</strong> selesai dibaca.</p>
            <div class="sb-closed-actions">
              <button type="button" class="sb-btn-secondary" id="sb-btn-reread">Baca Lagi</button>
              <button type="button" class="sb-btn-primary" id="sb-btn-return-joglo">Kembali ke Joglo</button>
            </div>
          </div>
        </div>

        <!-- Navigasi Bawah Buku -->
        <div class="sb-controls" id="sb-controls" hidden>
          <button type="button" class="sb-nav-btn" id="sb-btn-prev" aria-label="Halaman sebelumnya">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            <span>Sebelumnya</span>
          </button>

          <div class="sb-dots" id="sb-dots" role="tablist" aria-label="Navigasi halaman cerita">
            ${dotsMarkup}
          </div>

          <button type="button" class="sb-nav-btn" id="sb-btn-next" aria-label="Halaman berikutnya">
            <span id="sb-btn-next-label">Berikutnya</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  },

  cacheDOM() {
    const q = (sel) => this.mountEl.querySelector(sel);
    this.dom = {
      room: q('#sb-room'),
      batikBg: q('#sb-batik-bg'),
      particlesLayer: q('#sb-particles-layer'),
      pagePill: q('#sb-page-pill'),
      stage: q('#sb-stage'),

      // Buku & Sampul Terpadu
      bookShell: q('#sb-book-shell'),
      hardcoverBack: q('#sb-hardcover-back'),
      stackLeft: q('#sb-stack-left'),
      spineCrease: q('#sb-spine-crease'),
      spreadSurface: q('#sb-spread-surface'),
      coverLeaf: q('#sb-cover-leaf'),
      coverFront: q('#sb-cover-front'),
      coverBack: q('#sb-cover-back'),
      coverBackContent: q('#sb-cover-back-content'),
      coverArt: q('#sb-cover-art'),
      coverBoy: q('#sb-cover-boy'),
      btnOpen: q('#sb-btn-open'),
      closedBanner: q('#sb-closed-banner'),
      btnReread: q('#sb-btn-reread'),
      btnReturnJoglo: q('#sb-btn-return-joglo'),

      // Halaman & Flip Leaf
      pageLeft: q('#sb-page-left'),
      pageRight: q('#sb-page-right'),
      castShadow: q('#sb-cast-shadow'),
      flipLeaf: q('#sb-flip-leaf'),
      flipFrontContent: q('#sb-flip-front-content'),
      flipBackContent: q('#sb-flip-back-content'),
      flipFrontShade: q('#sb-flip-front-shade'),
      flipBackShade: q('#sb-flip-back-shade'),
      cornerPrev: q('#sb-corner-prev'),
      cornerNext: q('#sb-corner-next'),

      // Controls
      controls: q('#sb-controls'),
      btnPrev: q('#sb-btn-prev'),
      btnNext: q('#sb-btn-next'),
      btnNextLabel: q('#sb-btn-next-label'),
      dots: Array.from(this.mountEl.querySelectorAll('.sb-dot')),
      coverCorners: Array.from(this.mountEl.querySelectorAll('[data-asset-corner]')),
    };
  },

  bindStaticEvents() {
    this.dom.btnOpen.addEventListener('click', () => this.openBook(0));
    this.dom.btnReread.addEventListener('click', () => this.openBook(0));
    this.dom.btnReturnJoglo.addEventListener('click', () => {
      if (this.ctx && typeof this.ctx.returnToLanding === 'function') {
        this.ctx.returnToLanding();
      }
    });

    this.dom.btnPrev.addEventListener('click', () => this.stepPage(-1));
    this.dom.btnNext.addEventListener('click', () => {
      if (this.currentSpread === TOTAL_SPREADS - 1) {
        this.closeBook();
      } else {
        this.stepPage(1);
      }
    });

    this.dom.cornerPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      this.stepPage(-1);
    });
    this.dom.cornerNext.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.currentSpread === TOTAL_SPREADS - 1) {
        this.closeBook();
      } else {
        this.stepPage(1);
      }
    });

    this.dom.dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = Number(dot.dataset.spread);
        if (!Number.isNaN(idx) && idx !== this.currentSpread) {
          this.flipToSpread(idx);
        }
      });
    });

    // Delegasi tombol di dalam halaman penutup (dinamis)
    this.dom.spreadSurface.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-closing-action]');
      if (!actionBtn) return;
      const action = actionBtn.dataset.closingAction;
      if (action === 'close') this.closeBook();
      if (action === 'restart') this.flipToSpread(0);
    });
  },

  /**
   * Dipanggil setiap kali pengunjung memasuki Ruang Seni Peran.
   */
  async enter() {
    this.isActive = true;
    this.viewState = 'cover';
    this.currentSpread = 0;
    this.isAnimating = false;

    if (this.ctx && this.ctx.audioManager) {
      this.ctx.audioManager.playRoomTrack(STORY_META.audioTrackKey, {
        loop: true,
        reset: false,
      });
    }

    this.dom.bookShell.classList.add('is-closed');
    this.dom.coverLeaf.hidden = false;
    this.dom.controls.hidden = true;
    this.dom.pagePill.hidden = true;
    this.dom.closedBanner.hidden = true;
    this.dom.btnOpen.hidden = false;

    // Muat aset inti + halaman 1 sebelum sampul tampil agar tidak ada jeda saat dibuka
    await Promise.all([this.loadCoreAssets(), this.preloadSpreadAssets(0)]);
    if (!this.isActive) return;

    this.applyCoreAssetsToDOM();
    this.renderStaticSpread(0);
    this.dom.coverBackContent.innerHTML = this.buildLeftPageHTML(0);
    this.preloadSpreadAssets(1);

    if (window.gsap) {
      window.gsap.set(this.dom.bookShell, {
        xPercent: -25,
        scale: 0.84,
        opacity: 1,
        force3D: true,
      });
      window.gsap.set(this.dom.coverLeaf, { rotateY: 0, force3D: true });
      this.dom.coverFront.style.visibility = 'visible';
      this.dom.coverBack.style.visibility = 'hidden';
    }

    window.addEventListener('keydown', this.onKeyDown);
    this.dom.stage.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove, { passive: false });
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
    this.dom.room.addEventListener('pointermove', this.onStagePointerMove, { passive: true });

    this.startAmbientAtmosphere();
    this.animateCoverEntrance();
  },

  /**
   * Pembersihan total saat keluar dari ruang Seni Peran.
   */
  exit() {
    this.isActive = false;
    this.isAnimating = false;
    this.dragState = null;

    window.removeEventListener('keydown', this.onKeyDown);
    this.dom.stage.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    this.dom.room.removeEventListener('pointermove', this.onStagePointerMove);

    this.killAllAnimations();
    this.dom.flipLeaf.classList.remove('is-flipping');
  },

  resize() {
    if (!this.isActive) return;
    if (this.dragState) {
      this.cancelDrag(true);
    }
  },

  /* =========================================================
     PEMUATAN ASET PROGRESIF (PER SPREAD)
     ========================================================= */
  async loadCoreAssets() {
    await Promise.all([
      resolveAssetUrl(STORY_ASSETS.bookCover),
      resolveAssetUrl(STORY_ASSETS.paperTexture),
      resolveAssetUrl(STORY_ASSETS.paperCorner),
      resolveAssetUrl(STORY_ASSETS.batikDecorations),
      resolveAssetUrl(STORY_ASSETS.flowerDecorations),
      resolveAssetUrl(STORY_ASSETS.magicalParticles),
      resolveAssetUrl(STORY_ASSETS.characters.boy.basePath),
    ]);
  },

  applyCoreAssetsToDOM() {
    const coverUrl = getCachedUrl(STORY_ASSETS.bookCover);
    if (coverUrl) {
      this.dom.coverArt.src = coverUrl;
      this.dom.coverArt.classList.add('is-loaded');
    } else {
      this.dom.coverArt.hidden = true;
    }

    const paperUrl = getCachedUrl(STORY_ASSETS.paperTexture);
    if (paperUrl) {
      this.dom.room.style.setProperty('--sb-paper-bg', `url("${paperUrl}")`);
    }

    const batikUrl = getCachedUrl(STORY_ASSETS.batikDecorations);
    if (batikUrl) {
      this.dom.batikBg.style.backgroundImage = `url("${batikUrl}")`;
      this.dom.room.style.setProperty('--sb-batik-bg', `url("${batikUrl}")`);
    }

    const cornerUrl = getCachedUrl(STORY_ASSETS.paperCorner);
    this.dom.coverCorners.forEach((img) => {
      if (cornerUrl) {
        img.src = cornerUrl;
        img.hidden = false;
      } else {
        img.hidden = true;
      }
    });

    const boyUrl = getCachedUrl(STORY_ASSETS.characters.boy.basePath);
    if (boyUrl) {
      this.dom.coverBoy.src = boyUrl;
      this.dom.coverBoy.hidden = false;
    } else {
      this.dom.coverBoy.hidden = true;
    }
  },

  preloadSpreadAssets(spreadIdx) {
    if (spreadIdx < 0 || spreadIdx >= TOTAL_SPREADS) return Promise.resolve();
    const spread = STORY_PAGES[spreadIdx];
    return Promise.all([
      resolveAssetUrl(spread.leftBasePath),
      resolveAssetUrl(spread.rightBasePath),
    ]);
  },

  /* =========================================================
     RENDER KONTEN HALAMAN KIRI & KANAN
     ========================================================= */
  buildLeftPageHTML(spreadIdx) {
    const spread = STORY_PAGES[spreadIdx];
    const leftUrl = getCachedUrl(spread.leftBasePath);

    return `
      <div class="sb-comic-page is-left">
        ${
          leftUrl
            ? `<img class="sb-comic-img" src="${leftUrl}" alt="${spread.leftAlt}" draggable="false" />`
            : `<div class="sb-scene-fallback">Halaman ${spread.leftPageNumber}</div>`
        }
        <span class="sb-comic-folio is-left">${spread.leftPageNumber}</span>
      </div>
    `;
  },

  buildRightPageHTML(spreadIdx) {
    const spread = STORY_PAGES[spreadIdx];
    const rightUrl = getCachedUrl(spread.rightBasePath);

    return `
      <div class="sb-comic-page is-right">
        ${
          rightUrl
            ? `<img class="sb-comic-img" src="${rightUrl}" alt="${spread.rightAlt}" draggable="false" />`
            : `<div class="sb-scene-fallback">Halaman ${spread.rightPageNumber}</div>`
        }
        <span class="sb-comic-folio is-right">${spread.rightPageNumber}</span>
      </div>
    `;
  },

  renderStaticSpread(spreadIdx) {
    this.dom.pageLeft.innerHTML = this.buildLeftPageHTML(spreadIdx);
    this.dom.pageRight.innerHTML = this.buildRightPageHTML(spreadIdx);
    this.updateNavigationUI();
  },

  updateNavigationUI() {
    const isFirst = this.currentSpread === 0;
    const isLast = this.currentSpread === TOTAL_SPREADS - 1;

    this.dom.btnPrev.disabled = isFirst;
    this.dom.cornerPrev.hidden = isFirst;
    this.dom.btnNextLabel.textContent = isLast ? 'Tutup Buku' : 'Berikutnya';
    this.dom.cornerNext.setAttribute(
      'aria-label',
      isLast ? 'Tutup buku cerita' : 'Balik ke halaman berikutnya'
    );

    const spread = STORY_PAGES[this.currentSpread];
    this.dom.pagePill.textContent = `Halaman ${spread.leftPageNumber}–${spread.rightPageNumber} / ${TOTAL_STORY_IMAGES}`;

    this.dom.dots.forEach((dot, idx) => {
      const active = idx === this.currentSpread;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', String(active));
    });
  },

  /* =========================================================
     BUKA & TUTUP BUKU (ANIMASI 3D HARDCOVER)
     ========================================================= */
  async openBook(startSpread = 0) {
    if (this.isAnimating || this.viewState === 'reading') return;
    this.isAnimating = true;
    this.currentSpread = startSpread;

    await this.preloadSpreadAssets(startSpread);
    if (!this.isActive) return;

    this.renderStaticSpread(startSpread);
    this.dom.coverBackContent.innerHTML = this.buildLeftPageHTML(startSpread);
    this.preloadSpreadAssets(startSpread + 1);

    const gsap = window.gsap;
    const reduced = appState.get('reducedMotion');

    if (!gsap || reduced) {
      this.dom.bookShell.classList.remove('is-closed');
      this.dom.coverLeaf.hidden = true;
      this.dom.closedBanner.hidden = true;
      this.dom.controls.hidden = false;
      this.dom.pagePill.hidden = false;
      if (gsap) gsap.set(this.dom.bookShell, { xPercent: 0, scale: 1 });
      this.viewState = 'reading';
      this.isAnimating = false;
      this.startCharacterIdle();
      return;
    }

    this.dom.controls.hidden = false;
    this.dom.pagePill.hidden = false;
    gsap.set([this.dom.controls, this.dom.pagePill], { opacity: 0, y: 10 });

    const flipState = { angle: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        this.dom.bookShell.classList.remove('is-closed');
        this.dom.coverLeaf.hidden = true;
        this.dom.closedBanner.hidden = true;
        this.viewState = 'reading';
        this.isAnimating = false;
        // Tanpa animasi pop teks — langsung aktifkan gerak idle karakter yang lembut
        this.startCharacterIdle();
      },
    });

    // 1. Bima & banner penutup menghilang halus
    tl.to([this.dom.coverBoy, this.dom.closedBanner], {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.out',
    }, 0)

    // 2. Buku bergeser mulus ke kanan (xPercent: -25 -> 0) + zoom halus (0.84 -> 1)
    .to(this.dom.bookShell, {
      xPercent: 0,
      scale: 1,
      duration: 0.95,
      ease: 'power3.inOut',
      force3D: true,
    }, 0.05)

    // 3. Sampul terbuka 3D (0 -> -180deg) menyatu dengan gerakan geser & zoom
    .to(flipState, {
      angle: -180,
      duration: 0.95,
      ease: 'power2.inOut',
      onUpdate: () => {
        const a = flipState.angle;
        const pastHalf = a < -90;
        this.dom.coverLeaf.style.transform = `rotateY(${a.toFixed(2)}deg)`;
        this.dom.coverFront.style.visibility = pastHalf ? 'hidden' : 'visible';
        this.dom.coverBack.style.visibility = pastHalf ? 'visible' : 'hidden';
        if (pastHalf) {
          this.dom.bookShell.classList.remove('is-closed');
        }
      },
    }, 0.12)

    // 4. Navigasi bawah muncul tenang di akhir
    .to([this.dom.controls, this.dom.pagePill], {
      opacity: 1,
      y: 0,
      duration: 0.35,
      ease: 'power2.out',
    }, 0.85);
  },

  closeBook() {
    if (this.isAnimating || this.viewState !== 'reading') return;
    this.isAnimating = true;
    this.killPageTweens();

    const gsap = window.gsap;
    const reduced = appState.get('reducedMotion');

    this.dom.coverBackContent.innerHTML = this.buildLeftPageHTML(this.currentSpread);
    this.dom.coverLeaf.hidden = false;
    this.dom.btnOpen.hidden = true;
    this.dom.closedBanner.hidden = false;

    if (!gsap || reduced) {
      this.dom.bookShell.classList.add('is-closed');
      this.dom.controls.hidden = true;
      this.dom.pagePill.hidden = true;
      if (gsap) {
        gsap.set(this.dom.bookShell, { xPercent: -25, scale: 0.84 });
        gsap.set(this.dom.coverLeaf, { rotateY: 0 });
      }
      this.dom.coverFront.style.visibility = 'visible';
      this.dom.coverBack.style.visibility = 'hidden';
      this.viewState = 'closed-end';
      this.isAnimating = false;
      return;
    }

    gsap.set([this.dom.coverBoy, this.dom.closedBanner], { opacity: 0, y: 10 });
    this.dom.coverFront.style.visibility = 'hidden';
    this.dom.coverBack.style.visibility = 'visible';

    const flipState = { angle: -180 };
    const tl = gsap.timeline({
      onComplete: () => {
        this.dom.controls.hidden = true;
        this.dom.pagePill.hidden = true;
        this.viewState = 'closed-end';
        this.isAnimating = false;
      },
    });

    tl.to([this.dom.controls, this.dom.pagePill], { opacity: 0, y: 8, duration: 0.22 }, 0)
      .to(flipState, {
        angle: 0,
        duration: 0.88,
        ease: 'power2.inOut',
        onUpdate: () => {
          const a = flipState.angle;
          const pastHalf = a < -90;
          this.dom.coverLeaf.style.transform = `rotateY(${a.toFixed(2)}deg)`;
          this.dom.coverFront.style.visibility = pastHalf ? 'hidden' : 'visible';
          this.dom.coverBack.style.visibility = pastHalf ? 'visible' : 'hidden';
          if (!pastHalf) {
            this.dom.bookShell.classList.add('is-closed');
          }
        },
      }, 0.05)
      .to(this.dom.bookShell, {
        xPercent: -25,
        scale: 0.84,
        duration: 0.88,
        ease: 'power3.inOut',
        force3D: true,
      }, 0.1)
      .to([this.dom.coverBoy, this.dom.closedBanner], {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
      }, 0.78);
  },

  /* =========================================================
     SISTEM FLIP HALAMAN 3D (TOMBOL, SWIPE, DRAG, KEYBOARD)
     ========================================================= */
  stepPage(delta) {
    if (this.viewState !== 'reading' || this.isAnimating) return;
    const target = this.currentSpread + delta;
    if (target < 0 || target >= TOTAL_SPREADS) return;
    this.flipToSpread(target);
  },

  async flipToSpread(targetIdx) {
    if (this.isAnimating || targetIdx === this.currentSpread) return;
    if (targetIdx < 0 || targetIdx >= TOTAL_SPREADS) return;

    this.isAnimating = true;
    const direction = targetIdx > this.currentSpread ? 1 : -1;

    await this.preloadSpreadAssets(targetIdx);
    if (!this.isActive) return;

    const gsap = window.gsap;
    const reduced = appState.get('reducedMotion');

    if (!gsap || reduced) {
      this.currentSpread = targetIdx;
      this.renderStaticSpread(targetIdx);
      this.preloadSpreadAssets(targetIdx + 1);
      this.isAnimating = false;
      this.startCharacterIdle();
      return;
    }

    this.killPageTweens();
    this.prepareFlipLeaf(this.currentSpread, targetIdx, direction);

    const state = { progress: 0 };
    this.activeFlipTween = gsap.to(state, {
      progress: 1,
      duration: 0.68,
      ease: 'power2.inOut',
      onUpdate: () => this.applyFlipProgress(state.progress, direction),
      onComplete: () => {
        this.finishFlipCommit(targetIdx);
      },
    });
  },

  /**
   * Memasang konten 2 sisi pada lembaran 3D (.sb-flip-leaf) dan menyiapkan
   * halaman bawah sehingga tidak pernah terjadi kedipan atau pergantian mendadak.
   */
  prepareFlipLeaf(fromIdx, toIdx, direction) {
    if (direction === 1) {
      // Maju (kanan -> kiri): halaman bawah kanan = target kanan
      this.dom.pageRight.innerHTML = this.buildRightPageHTML(toIdx);
      this.dom.flipFrontContent.innerHTML = this.buildRightPageHTML(fromIdx);
      this.dom.flipBackContent.innerHTML = this.buildLeftPageHTML(toIdx);
    } else {
      // Mundur (kiri -> kanan): halaman bawah kiri = target kiri
      this.dom.pageLeft.innerHTML = this.buildLeftPageHTML(toIdx);
      this.dom.flipBackContent.innerHTML = this.buildLeftPageHTML(fromIdx);
      this.dom.flipFrontContent.innerHTML = this.buildRightPageHTML(toIdx);
    }

    this.dom.flipLeaf.classList.add('is-flipping');
    this.applyFlipProgress(0, direction);
  },

  applyFlipProgress(progress, direction) {
    const p = Math.max(0, Math.min(1, progress));
    const angle = direction === 1 ? -180 * p : -180 * (1 - p);
    const arc = Math.sin(p * Math.PI);
    const showBack = angle < -90;

    this.dom.flipLeaf.style.transform = `rotateY(${angle.toFixed(2)}deg)`;
    this.dom.flipFrontContent.parentElement.style.visibility = showBack ? 'hidden' : 'visible';
    this.dom.flipBackContent.parentElement.style.visibility = showBack ? 'visible' : 'hidden';

    this.dom.flipFrontShade.style.opacity = (arc * 0.42).toFixed(3);
    this.dom.flipBackShade.style.opacity = (arc * 0.42).toFixed(3);

    this.dom.castShadow.style.opacity = (arc * 0.34).toFixed(3);
    this.dom.castShadow.classList.toggle('is-left', showBack);
    this.dom.castShadow.classList.toggle('is-right', !showBack);
  },

  finishFlipCommit(targetIdx) {
    this.activeFlipTween = null;
    this.currentSpread = targetIdx;
    this.dom.flipLeaf.classList.remove('is-flipping');
    this.dom.flipLeaf.style.transform = '';
    this.dom.castShadow.style.opacity = '0';

    this.renderStaticSpread(targetIdx);
    this.isAnimating = false;

    // Preload spread berikutnya secara bertahap
    this.preloadSpreadAssets(targetIdx + 1);
    this.animateSpreadEntrance();
  },

  /* =========================================================
     INTERAKSI SENTUH SWIPE & MOUSE DRAG REAL-TIME
     ========================================================= */
  handlePointerDown(e) {
    if (!this.isActive || this.isAnimating) return;
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest('button')) return;

    // Izinkan geser sampul ke kiri untuk membuka buku
    if (this.viewState === 'cover') {
      this.dragState = {
        mode: 'cover',
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
      };
      return;
    }

    if (this.viewState !== 'reading') return;

    const rect = this.dom.spreadSurface.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      return;
    }

    const relX = (e.clientX - rect.left) / rect.width;
    this.dragState = {
      mode: 'page',
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startTime: performance.now(),
      rect,
      relX,
      locked: false,
      direction: 0,
      targetIdx: -1,
      progress: 0,
    };
  },

  handlePointerMove(e) {
    if (!this.dragState || e.pointerId !== this.dragState.pointerId) return;

    const dx = e.clientX - this.dragState.startX;
    const dy = e.clientY - this.dragState.startY;

    if (this.dragState.mode === 'cover') {
      if (dx < -48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        this.dragState = null;
        this.openBook(0);
      }
      return;
    }

    // Deteksi niat geser horizontal vs gulir vertikal
    if (!this.dragState.locked) {
      if (Math.hypot(dx, dy) < 10) return;
      if (Math.abs(dy) > Math.abs(dx) * 1.25) {
        this.dragState = null;
        return;
      }

      const direction = dx < 0 ? 1 : -1;
      const targetIdx = this.currentSpread + direction;
      if (targetIdx < 0 || targetIdx >= TOTAL_SPREADS) {
        this.dragState = null;
        return;
      }

      this.dragState.locked = true;
      this.dragState.direction = direction;
      this.dragState.targetIdx = targetIdx;
      this.killPageTweens();
      this.prepareFlipLeaf(this.currentSpread, targetIdx, direction);
    }

    // Cegah scroll atau navigasi browser selama membalik halaman
    e.preventDefault();

    const dragSpan = Math.max(140, this.dragState.rect.width * 0.56);
    const rawProgress =
      this.dragState.direction === 1 ? -dx / dragSpan : dx / dragSpan;
    this.dragState.progress = Math.max(0, Math.min(1, rawProgress));
    this.applyFlipProgress(this.dragState.progress, this.dragState.direction);
  },

  handlePointerUp(e) {
    if (!this.dragState || e.pointerId !== this.dragState.pointerId) return;
    const drag = this.dragState;
    this.dragState = null;

    if (drag.mode !== 'page' || !drag.locked) return;

    const elapsed = Math.max(1, performance.now() - drag.startTime);
    const velocity = Math.abs(e.clientX - drag.startX) / elapsed; // px/ms
    const shouldComplete = drag.progress > 0.26 || velocity > 0.55;

    const gsap = window.gsap;
    this.isAnimating = true;

    if (!gsap || appState.get('reducedMotion')) {
      if (shouldComplete) {
        this.finishFlipCommit(drag.targetIdx);
      } else {
        this.cancelDrag(true);
      }
      return;
    }

    const state = { progress: drag.progress };
    const endVal = shouldComplete ? 1 : 0;
    const remaining = Math.abs(endVal - drag.progress);

    this.activeFlipTween = gsap.to(state, {
      progress: endVal,
      duration: Math.max(0.16, remaining * 0.44),
      ease: 'power2.out',
      onUpdate: () => this.applyFlipProgress(state.progress, drag.direction),
      onComplete: () => {
        if (shouldComplete) {
          this.finishFlipCommit(drag.targetIdx);
        } else {
          this.cancelDrag(true);
        }
      },
    });
  },

  cancelDrag(restoreStatic = false) {
    this.dragState = null;
    this.activeFlipTween = null;
    this.dom.flipLeaf.classList.remove('is-flipping');
    this.dom.flipLeaf.style.transform = '';
    this.dom.castShadow.style.opacity = '0';
    if (restoreStatic) {
      this.renderStaticSpread(this.currentSpread);
    }
    this.isAnimating = false;
  },

  handleKeyDown(e) {
    if (!this.isActive || this.isAnimating) return;

    // Jangan bajak tombol saat modal panduan terbuka
    const tutorialModal = document.getElementById('tutorial-modal');
    if (tutorialModal && !tutorialModal.hidden) return;

    if (this.viewState === 'cover' && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      this.openBook(0);
      return;
    }

    if (this.viewState === 'reading') {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (this.currentSpread === TOTAL_SPREADS - 1) {
          this.closeBook();
        } else {
          this.stepPage(1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.stepPage(-1);
      }
    }
  },

  /* =========================================================
     ANIMASI GSAP: ATMOSFER, PARTIKEL, KARAKTER & KONTEN
     ========================================================= */
  startAmbientAtmosphere() {
    this.killAmbientTweens();
    const gsap = window.gsap;
    if (!gsap || appState.get('reducedMotion')) return;

    // Partikel emas melayang lembut
    const layer = this.dom.particlesLayer;
    layer.innerHTML = '';
    const particleUrl = getCachedUrl(STORY_ASSETS.magicalParticles);
    const count = 12;

    for (let i = 0; i < count; i += 1) {
      const el = document.createElement('span');
      el.className = particleUrl ? 'sb-magic-sparkle has-img' : 'sb-magic-sparkle';
      if (particleUrl) {
        el.style.backgroundImage = `url("${particleUrl}")`;
      }
      gsap.set(el, {
        left: `${gsap.utils.random(6, 94)}%`,
        top: `${gsap.utils.random(8, 92)}%`,
        scale: gsap.utils.random(0.45, 1.15),
        opacity: 0,
      });
      layer.appendChild(el);

      this.ambientTweens.push(
        gsap.to(el, {
          y: gsap.utils.random(-36, -14),
          x: gsap.utils.random(-18, 18),
          opacity: gsap.utils.random(0.25, 0.72),
          duration: gsap.utils.random(3.8, 6.8),
          delay: gsap.utils.random(0, 3),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      );
    }

    // Gerak latar batik sangat pelan untuk kedalaman atmosfer
    this.ambientTweens.push(
      gsap.to(this.dom.batikBg, {
        x: 14,
        y: -10,
        duration: 16,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    );
  },

  animateCoverEntrance() {
    const gsap = window.gsap;
    if (!gsap || appState.get('reducedMotion')) return;

    gsap.fromTo(
      this.dom.bookShell,
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', force3D: true }
    );

    if (!this.dom.coverBoy.hidden) {
      gsap.fromTo(
        this.dom.coverBoy,
        { x: -14, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.65, delay: 0.2, ease: 'power2.out' }
      );
      this.ambientTweens.push(
        gsap.to(this.dom.coverBoy, {
          y: -6,
          duration: 2.9,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      );
    }
  },

  animateSpreadEntrance() {
    this.killPageTweens();
    const gsap = window.gsap;
    if (!gsap || appState.get('reducedMotion')) return;

    const scene = this.dom.spreadSurface.querySelectorAll('.sb-anim-scene');
    const texts = this.dom.spreadSurface.querySelectorAll('.sb-anim-text');
    const ornaments = this.dom.spreadSurface.querySelectorAll('.sb-anim-ornament');
    const chars = this.dom.spreadSurface.querySelectorAll('.sb-anim-char');

    const tl = gsap.timeline();
    if (scene.length) {
      tl.fromTo(
        scene,
        { opacity: 0.4, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.48, ease: 'power2.out' },
        0
      );
    }
    if (ornaments.length) {
      tl.fromTo(
        ornaments,
        { opacity: 0, scale: 0.88 },
        { opacity: 1, scale: 1, stagger: 0.06, duration: 0.42, ease: 'power2.out' },
        0.06
      );
    }
    if (texts.length) {
      tl.fromTo(
        texts,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, stagger: 0.07, duration: 0.42, ease: 'power2.out' },
        0.08
      );
    }
    if (chars.length) {
      tl.fromTo(
        chars,
        { opacity: 0, y: 14, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.52, ease: 'back.out(1.2)' },
        0.14
      );
    }

    this.pageTweens.push(tl);
    this.startCharacterIdle();
  },

  startCharacterIdle() {
    const gsap = window.gsap;
    if (!gsap || appState.get('reducedMotion')) return;

    const chars = this.dom.spreadSurface.querySelectorAll('.sb-anim-char');
    chars.forEach((charEl, idx) => {
      // Variasi durasi & jeda agar tidak terasa mekanis
      const tw = gsap.to(charEl, {
        y: idx % 2 === 0 ? -7 : -5,
        rotation: idx % 2 === 0 ? 1.4 : -1.2,
        duration: 2.6 + idx * 0.75,
        delay: 0.35 + idx * 0.3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      this.pageTweens.push(tw);
    });
  },

  handleStageParallax(e) {
    if (!this.isActive || appState.get('reducedMotion') || e.pointerType === 'touch') return;
    const gsap = window.gsap;
    if (!gsap) return;

    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;

    gsap.to(this.dom.particlesLayer, {
      x: nx * -16,
      y: ny * -10,
      duration: 0.9,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  },

  killPageTweens() {
    if (this.activeFlipTween) {
      this.activeFlipTween.kill();
      this.activeFlipTween = null;
    }
    this.pageTweens.forEach((tw) => tw.kill());
    this.pageTweens = [];
  },

  killAmbientTweens() {
    this.ambientTweens.forEach((tw) => tw.kill());
    this.ambientTweens = [];
  },

  killAllAnimations() {
    this.killPageTweens();
    this.killAmbientTweens();
  },
};