/**
 * js/rooms/peran/index.js
 * Ruang I — Seni Peran: Buku Cerita Bergambar Interaktif Reog Ponorogo.
 */
import { STORY_PAGES } from './story-data.js';
import { appState } from '../../core/state-manager.js';

export const peranRoom = {
  id: 'peran',
  title: 'Seni Peran — Reog Ponorogo',
  tutorial: {
    eyebrow: 'Ruang I — Seni Peran',
    title: 'Panduan Buku Cerita Reog Ponorogo',
    steps: [
      {
        heading: 'Membalik Halaman',
        text: 'Geser halaman ke kiri untuk maju, geser ke kanan untuk mundur, atau ketuk tombol Sebelumnya dan Berikutnya di bagian bawah.',
      },
      {
        heading: 'Lompat ke Halaman Tertentu',
        text: 'Anda juga dapat mengetuk titik-titik penanda di bagian bawah layar untuk melihat kemajuan cerita.',
      },
      {
        heading: 'Kembali ke Joglo',
        text: 'Ketuk tombol "Kembali ke Joglo" di pojok kiri atas kapan saja untuk mengunjungi ruang budaya lainnya.',
      },
    ],
  },

  init(mountEl, ctx) {
    this.mountEl = mountEl;
    this.ctx = ctx;
    this.currentIndex = 0;
    this.isTurning = false;
    this.swipeStartX = 0;
    this.swipeStartY = 0;
    this.pointerActive = false;

    this.mountEl.innerHTML = `
      <div class="peran-shell">
        <div class="peran-topbar">
          <div class="peran-heading">
            <span class="peran-badge">Ruang I &bull; Seni Peran</span>
            <h2>Kisah Reog Ponorogo</h2>
          </div>
          <div class="peran-page-counter" id="peran-page-counter">Halaman 1 dari ${STORY_PAGES.length}</div>
        </div>

        <div class="storybook-stage" id="storybook-stage">
          <article class="storybook-spread" id="storybook-spread" aria-live="polite">
            <div class="book-page-left">
              <span class="page-corner tl" aria-hidden="true"></span>
              <span class="page-corner bl" aria-hidden="true"></span>
              <div class="story-art-frame" id="story-art-frame"></div>
              <div class="story-art-caption" id="story-art-caption"></div>
            </div>

            <div class="book-page-right">
              <span class="page-corner tr" aria-hidden="true"></span>
              <span class="page-corner br" aria-hidden="true"></span>
              <span class="story-context-tag" id="story-context-tag"></span>
              <h3 id="story-page-title"></h3>
              <div class="story-divider" aria-hidden="true"></div>
              <p class="story-body-text" id="story-body-text"></p>
              <div class="story-cultural-note" id="story-cultural-note"></div>
            </div>
          </article>
        </div>

        <div class="peran-controls">
          <button type="button" class="btn-book-nav" id="btn-story-prev" aria-label="Halaman sebelumnya">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span>Sebelumnya</span>
          </button>

          <div class="peran-progress-dots" id="peran-progress-dots" role="tablist" aria-label="Navigasi halaman cerita"></div>

          <button type="button" class="btn-book-nav" id="btn-story-next" aria-label="Halaman berikutnya">
            <span>Berikutnya</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    this.stageEl = this.mountEl.querySelector('#storybook-stage');
    this.spreadEl = this.mountEl.querySelector('#storybook-spread');
    this.artFrameEl = this.mountEl.querySelector('#story-art-frame');
    this.artCaptionEl = this.mountEl.querySelector('#story-art-caption');
    this.contextTagEl = this.mountEl.querySelector('#story-context-tag');
    this.titleEl = this.mountEl.querySelector('#story-page-title');
    this.bodyEl = this.mountEl.querySelector('#story-body-text');
    this.noteEl = this.mountEl.querySelector('#story-cultural-note');
    this.counterEl = this.mountEl.querySelector('#peran-page-counter');
    this.dotsEl = this.mountEl.querySelector('#peran-progress-dots');
    this.btnPrev = this.mountEl.querySelector('#btn-story-prev');
    this.btnNext = this.mountEl.querySelector('#btn-story-next');

    this.buildDots();
    this.bindEvents();
    this.renderPage(0, false);
  },

  buildDots() {
    this.dotsEl.innerHTML = '';
    STORY_PAGES.forEach((page, idx) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'story-dot';
      dot.setAttribute('aria-label', `Buka halaman ${idx + 1}: ${page.title}`);
      dot.addEventListener('click', () => this.goToPage(idx));
      this.dotsEl.appendChild(dot);
    });
  },

  bindEvents() {
    this.btnPrev.addEventListener('click', () => this.goToPage(this.currentIndex - 1));
    this.btnNext.addEventListener('click', () => this.goToPage(this.currentIndex + 1));

    this.stageEl.addEventListener('pointerdown', (e) => {
      this.pointerActive = true;
      this.swipeStartX = e.clientX;
      this.swipeStartY = e.clientY;
    });

    this.stageEl.addEventListener('pointerup', (e) => {
      if (!this.pointerActive) return;
      this.pointerActive = false;
      const dx = e.clientX - this.swipeStartX;
      const dy = e.clientY - this.swipeStartY;
      // Hanya picu balik halaman jika usapan horizontal dominan dan cukup jauh
      if (Math.abs(dx) > 52 && Math.abs(dx) > Math.abs(dy) * 1.35) {
        if (dx < 0) {
          this.goToPage(this.currentIndex + 1);
        } else {
          this.goToPage(this.currentIndex - 1);
        }
      }
    });

    this.stageEl.addEventListener('pointercancel', () => {
      this.pointerActive = false;
    });

    this.boundKeydown = (e) => {
      if (appState.get('currentScene') !== 'peran') return;
      if (e.key === 'ArrowRight') this.goToPage(this.currentIndex + 1);
      if (e.key === 'ArrowLeft') this.goToPage(this.currentIndex - 1);
    };
  },

  goToPage(nextIndex) {
    if (this.isTurning) return;
    if (nextIndex < 0 || nextIndex >= STORY_PAGES.length) return;
    if (nextIndex === this.currentIndex) return;

    const direction = nextIndex > this.currentIndex ? 1 : -1;
    this.currentIndex = nextIndex;
    this.renderPage(nextIndex, true, direction);
  },

  populateContent(page, index) {
    this.counterEl.textContent = `Halaman ${index + 1} dari ${STORY_PAGES.length}`;
    this.contextTagEl.textContent = page.contextLabel;
    this.contextTagEl.className = `story-context-tag ${page.contextType === 'legend' ? 'is-legend' : 'is-fact'}`;
    this.titleEl.textContent = page.title;
    this.bodyEl.textContent = page.body;
    this.noteEl.textContent = page.note;
    this.artCaptionEl.textContent = page.artCaption;

    // Muat ilustrasi menggunakan URL tersimpan dari loadingManager
    this.artFrameEl.innerHTML = '';
    this.artFrameEl.classList.toggle('has-pair', page.artKeys.length > 1);
    page.artKeys.forEach((key, i) => {
      const img = document.createElement('img');
      img.src = this.ctx.loadingManager.getAssetUrl(key);
      img.alt = page.artCaption;
      img.draggable = false;
      img.className = `story-art-img${i > 0 ? ' is-secondary' : ''}`;
      this.artFrameEl.appendChild(img);
    });

    this.btnPrev.disabled = index === 0;
    this.btnNext.disabled = index === STORY_PAGES.length - 1;

    Array.from(this.dotsEl.children).forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
    });
  },

  renderPage(index, animate = true, direction = 1) {
    const page = STORY_PAGES[index];
    if (!page) return;

    if (!animate || appState.get('reducedMotion') || !window.gsap) {
      this.populateContent(page, index);
      return;
    }

    this.isTurning = true;
    const gsap = window.gsap;
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(this.spreadEl, { clearProps: 'transform,opacity' });
        this.isTurning = false;
      },
    });

    tl.to(this.spreadEl, {
      rotateY: direction * -14,
      x: direction * -26,
      opacity: 0.15,
      duration: 0.24,
      ease: 'power2.in',
      force3D: true,
    })
    .add(() => {
      this.populateContent(page, index);
      gsap.set(this.spreadEl, {
        rotateY: direction * 14,
        x: direction * 26,
        opacity: 0.15,
      });
    })
    .to(this.spreadEl, {
      rotateY: 0,
      x: 0,
      opacity: 1,
      duration: 0.34,
      ease: 'power3.out',
      force3D: true,
    });
  },

  enter() {
    window.addEventListener('keydown', this.boundKeydown);
    this.ctx.audioManager.playRoomTrack('peran', { loop: true });
  },

  exit() {
    window.removeEventListener('keydown', this.boundKeydown);
    if (window.gsap && this.spreadEl) {
      window.gsap.killTweensOf(this.spreadEl);
      window.gsap.set(this.spreadEl, { clearProps: 'transform,opacity' });
    }
    this.isTurning = false;
  },

  resize() {},
};
