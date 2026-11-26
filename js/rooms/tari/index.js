/**
 * js/rooms/tari/index.js
 * Ruang II — Seni Tari: Eksplorasi Interaktif "Gandrung: Tarian Khas Banyuwangi"
 * 5 Bagian Full-Bleed Editorial + GSAP Smooth Scroll + Costume Explorer + Quiz.
 */
import { appState } from '../../core/state-manager.js';
import {
  TARI_ASSETS,
  STORY_CARDS,
  TIMELINE_ITEMS,
  COSTUME_PARTS,
  DANCE_MOVES,
  QUIZ_QUESTIONS,
  TARI_TUTORIAL,
} from './tari-data.js';

const SECTION_IDS = [
  { id: 'tr-sec-hero', label: 'Pembuka' },
  { id: 'tr-sec-story', label: 'Kisah' },
  { id: 'tr-sec-costume', label: 'Busana' },
  { id: 'tr-sec-moves', label: 'Gerak' },
  { id: 'tr-sec-quiz', label: 'Kuis' },
];

export const tariRoom = {
  id: 'tari',
  title: 'Seni Tari',
  tutorial: TARI_TUTORIAL,

  init(mountEl, ctx) {
    this.mountEl = mountEl;
    this.ctx = ctx;

    this.isActive = false;
    this.preloaded = false;
    this.activeCostumeIdx = 0;
    this.activeSectionIdx = 0;

    // Status Kuis
    this.quizIndex = 0;
    this.quizScore = 0;
    this.quizLocked = false;

    // Tracking Animasi & Observer
    this.scrollTween = null;
    this.sectionObserver = null;
    this.revealObserver = null;
    this.ambientTweens = [];

    this.onKeyDown = this.handleKeyDown.bind(this);

    this.renderShell();
    this.cacheDOM();
    this.bindEvents();
    this.renderCostumeDetail(0, false);
    this.renderQuizQuestion();
  },

  renderShell() {
    const storyMarkup = STORY_CARDS.map(
      (card) => `
      <article class="tr-story-card tr-reveal">
        <div class="tr-story-thumb">
          <img src="${card.img}" alt="${card.title}" loading="lazy" draggable="false" />
        </div>
        <div class="tr-story-body">
          <span class="tr-card-eyebrow">${card.eyebrow}</span>
          <h3>${card.title}</h3>
          <p>${card.shortText}</p>
          <button type="button" class="tr-card-link" data-story-id="${card.id}">
            Baca Selengkapnya →
          </button>
        </div>
      </article>
    `
    ).join('');

    const timelineMarkup = TIMELINE_ITEMS.map(
      (item) => `
      <div class="tr-tl-item">
        <div class="tr-tl-avatar">
          <img src="${item.img}" alt="${item.era}" loading="lazy" draggable="false" />
        </div>
        <div class="tr-tl-text">
          <strong>${item.era}</strong>
          <span>${item.desc}</span>
        </div>
      </div>
    `
    ).join('');

    const costumePinsMarkup = COSTUME_PARTS.map(
      (part, idx) => `
      <button
        type="button"
        class="tr-hotspot ${idx === 0 ? 'is-active' : ''}"
        data-costume-idx="${idx}"
        style="top: ${part.pin.top}; left: ${part.pin.left};"
        aria-label="Lihat detail ${part.label}"
      >
        <span class="tr-hotspot-dot" aria-hidden="true"></span>
        <span class="tr-hotspot-tag">${part.label}</span>
      </button>
    `
    ).join('');

    const costumePillsMarkup = COSTUME_PARTS.map(
      (part, idx) => `
      <button
        type="button"
        class="tr-costume-pill ${idx === 0 ? 'is-active' : ''}"
        data-costume-idx="${idx}"
      >
        ${part.label}
      </button>
    `
    ).join('');

    const movesMarkup = DANCE_MOVES.map(
      (move) => `
      <article class="tr-move-card tr-reveal">
        <div class="tr-move-media">
          <img src="${move.img}" alt="Gerak ${move.title}" loading="lazy" draggable="false" />
        </div>
        <div class="tr-move-info">
          <span class="tr-move-num">${move.number}</span>
          <h3>${move.title}</h3>
          <p>${move.shortDesc}</p>
          <button type="button" class="tr-btn-mini" data-move-id="${move.id}">
            Lihat Detail →
          </button>
        </div>
      </article>
    `
    ).join('');

    const sideNavMarkup = SECTION_IDS.map(
      (sec, idx) => `
      <button
        type="button"
        class="tr-side-dot ${idx === 0 ? 'is-active' : ''}"
        data-scroll-target="${sec.id}"
        aria-label="Lompat ke bagian ${sec.label}"
        title="${sec.label}"
      >
        <span class="tr-side-dot-core"></span>
      </button>
    `
    ).join('');

    this.mountEl.innerHTML = `
      <div
        class="tr-room"
        id="tr-room"
        style="--tr-paper-bg: url('${TARI_ASSETS.paperTexture}'); --tr-batik-bg: url('${TARI_ASSETS.batikDecor}');"
      >
        <!-- Navigasi Titik Vertikal di Sisi Kanan -->
        <nav class="tr-side-nav" aria-label="Navigasi bagian Seni Tari">
          ${sideNavMarkup}
        </nav>

        <!-- Kontainer Gulir Vertikal Utama -->
        <div class="tr-scroller" id="tr-scroller">

          <!-- =================================================
               BAGIAN 1: HERO FULLSCREEN
               ================================================= -->
          <section class="tr-section tr-hero" id="tr-sec-hero">
            <img
              class="tr-hero-bg"
              src="${TARI_ASSETS.hero}"
              alt="Penari Gandrung Banyuwangi"
              draggable="false"
            />
            <div class="tr-hero-scrim" aria-hidden="true"></div>

            <div class="tr-hero-content">
              <span class="tr-hero-eyebrow">Ruang II • Seni Tari Jawa Timur</span>
              <h2 class="tr-hero-title">GANDRUNG</h2>
              <p class="tr-hero-subtitle">Tarian Khas Banyuwangi</p>
              <div class="tr-ornament-line" aria-hidden="true"></div>
              <p class="tr-hero-lead">
                Ekspresi keanggunan, rasa syukur, dan jati diri budaya masyarakat Osing yang terus hidup melintasi generasi.
              </p>

              <div class="tr-hero-actions">
                <button type="button" class="tr-btn tr-btn-crimson" id="tr-btn-explore">
                  <span>Jelajahi Tarian</span>
                  <span aria-hidden="true">→</span>
                </button>
                <button type="button" class="tr-btn tr-btn-outline" id="tr-btn-music">
                  <span id="tr-music-icon" aria-hidden="true">▶</span>
                  <span id="tr-music-label">Iringan Gandrung</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              class="tr-scroll-cue"
              data-scroll-target="tr-sec-story"
              aria-label="Gulir ke bagian Kisah di Balik Tarian"
            >
              <span>Gulir ke Bawah</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </section>

          <!-- =================================================
               BAGIAN 2: KISAH DI BALIK TARIAN
               ================================================= -->
          <section class="tr-section tr-parchment" id="tr-sec-story">
            <div class="tr-section-inner">
              <header class="tr-sec-header tr-reveal">
                <span class="tr-sec-eyebrow">Warisan Budaya Osing</span>
                <h2 class="tr-sec-title">Kisah di Balik Tarian</h2>
                <div class="tr-ornament-line is-dark is-center" aria-hidden="true"></div>
                <p class="tr-sec-desc">
                  Telusuri perjalanan sejarah, filosofi, dan pementasan Tari Gandrung Banyuwangi dari masa ke masa.
                </p>
              </header>

              <div class="tr-story-grid">
                ${storyMarkup}
              </div>

              <div class="tr-timeline-bar tr-reveal">
                <div class="tr-tl-badge">Perjalanan<br>Gandrung</div>
                <div class="tr-tl-track">
                  ${timelineMarkup}
                </div>
              </div>

              <div class="tr-next-row">
                <button type="button" class="tr-btn-next-sec is-dark" data-scroll-target="tr-sec-costume">
                  Menyingkap Busana Gandrung ↓
                </button>
              </div>
            </div>
          </section>

          <!-- =================================================
               BAGIAN 3: MENYINGKAP KEINDAHAN BUSANA (INTERAKTIF)
               ================================================= -->
          <section class="tr-section tr-dark-stage" id="tr-sec-costume">
            <div class="tr-stage-spotlight" aria-hidden="true"></div>

            <div class="tr-section-inner tr-costume-layout">
              <!-- Kolom Kiri: Judul & Pemilih Cepat -->
              <div class="tr-costume-intro tr-reveal">
                <span class="tr-sec-eyebrow is-gold">Eksplorasi Busana</span>
                <h2 class="tr-sec-title is-gold">Menyingkap Keindahan Gandrung</h2>
                <div class="tr-ornament-line" aria-hidden="true"></div>
                <p class="tr-sec-desc is-light">
                  Ketuk pin emas pada penari atau pilih bagian busana di bawah untuk mengenal makna tiap unsurnya.
                </p>

                <div class="tr-costume-pills" role="tablist" aria-label="Pilih bagian busana">
                  ${costumePillsMarkup}
                </div>

                <button type="button" class="tr-btn-next-sec is-light" data-scroll-target="tr-sec-moves">
                  Lanjut ke Ragam Gerak ↓
                </button>
              </div>

              <!-- Kolom Tengah: Penari & 4 Hotspot Pin -->
              <div class="tr-costume-figure-wrap tr-reveal">
                <div class="tr-costume-figure">
                  <img
                    class="tr-dancer-full"
                    src="${TARI_ASSETS.costumeFull}"
                    alt="Busana Lengkap Penari Gandrung"
                    draggable="false"
                  />
                  ${costumePinsMarkup}
                </div>
              </div>

              <!-- Kolom Kanan: Kartu Detail Busana -->
              <div class="tr-costume-card tr-reveal" id="tr-costume-card" aria-live="polite">
                <div class="tr-costume-card-media">
                  <img id="tr-costume-img" src="" alt="" draggable="false" />
                </div>
                <div class="tr-costume-card-body">
                  <span class="tr-costume-sub" id="tr-costume-sub"></span>
                  <h3 id="tr-costume-title"></h3>
                  <p id="tr-costume-desc"></p>
                </div>
                <div class="tr-costume-card-nav">
                  <button type="button" class="tr-circle-btn" id="tr-costume-prev" aria-label="Bagian sebelumnya">←</button>
                  <span class="tr-costume-counter" id="tr-costume-counter">1 / 4</span>
                  <button type="button" class="tr-circle-btn" id="tr-costume-next" aria-label="Bagian berikutnya">→</button>
                </div>
              </div>
            </div>
          </section>

          <!-- =================================================
               BAGIAN 4: RAGAM GERAK KHAS
               ================================================= -->
          <section class="tr-section tr-parchment" id="tr-sec-moves">
            <div class="tr-section-inner">
              <header class="tr-moves-header tr-reveal">
                <div>
                  <span class="tr-sec-eyebrow">Koreografi Tradisional</span>
                  <h2 class="tr-sec-title">Ragam Gerak Khas</h2>
                </div>
                <p class="tr-sec-desc">
                  Pelajari tiga gerak utama Tari Gandrung tempat keanggunan, ritme, dan ekspresi berpadu selaras.
                </p>
              </header>

              <div class="tr-moves-grid">
                ${movesMarkup}
              </div>

              <div class="tr-next-row">
                <button type="button" class="tr-btn-next-sec is-dark" data-scroll-target="tr-sec-quiz">
                  Uji Wawasan Budayamu ↓
                </button>
              </div>
            </div>
          </section>

          <!-- =================================================
               BAGIAN 5: UJI WAWASAN BUDAYAMU (KUIS INTERAKTIF)
               ================================================= -->
          <section class="tr-section tr-parchment tr-quiz-sec" id="tr-sec-quiz">
            <img class="tr-corner-flower tl" src="${TARI_ASSETS.flowerDecor}" alt="" aria-hidden="true" draggable="false" />
            <img class="tr-corner-flower br" src="${TARI_ASSETS.flowerDecor}" alt="" aria-hidden="true" draggable="false" />

            <div class="tr-section-inner tr-quiz-layout">
              <div class="tr-quiz-intro tr-reveal">
                <span class="tr-sec-eyebrow">Evaluasi Ringan</span>
                <h2 class="tr-sec-title">Uji Wawasan Budayamu</h2>
                <div class="tr-ornament-line is-dark" aria-hidden="true"></div>
                <p class="tr-sec-desc">
                  Seberapa jauh kamu mengenal Tari Gandrung Banyuwangi? Jawab 5 pertanyaan singkat ini untuk mengukur pemahamanmu!
                </p>

                <div class="tr-quiz-footer-links">
                  <button type="button" class="tr-btn-next-sec is-dark" data-scroll-target="tr-sec-hero">
                    ↑ Kembali ke Atas
                  </button>
                </div>
              </div>

              <div class="tr-quiz-box tr-reveal" id="tr-quiz-box">
                <!-- Tampilan Pertanyaan -->
                <div id="tr-quiz-play">
                  <div class="tr-quiz-meta">
                    <div class="tr-quiz-progress-wrap">
                      <span id="tr-quiz-counter">Pertanyaan 1 dari ${QUIZ_QUESTIONS.length}</span>
                      <div class="tr-quiz-bar-track">
                        <div class="tr-quiz-bar-fill" id="tr-quiz-bar-fill"></div>
                      </div>
                    </div>
                    <span class="tr-quiz-score-pill">
                      Skor: <strong id="tr-quiz-score">0</strong>
                    </span>
                  </div>

                  <h3 class="tr-quiz-question" id="tr-quiz-question"></h3>
                  <div class="tr-quiz-options" id="tr-quiz-options"></div>

                  <div class="tr-quiz-feedback" id="tr-quiz-feedback" hidden>
                    <p id="tr-quiz-explanation"></p>
                    <button type="button" class="tr-btn tr-btn-crimson tr-btn-sm" id="tr-btn-quiz-next">
                      Pertanyaan Berikutnya →
                    </button>
                  </div>
                </div>

                <!-- Tampilan Hasil Akhir Kuis -->
                <div class="tr-quiz-result" id="tr-quiz-result" hidden>
                  <span class="tr-result-eyebrow">Kuis Selesai</span>
                  <h3 class="tr-result-rank" id="tr-result-rank">Duta Budaya Gandrung</h3>
                  <div class="tr-result-score-big">
                    <strong id="tr-result-score-val">5</strong>
                    <span>/ ${QUIZ_QUESTIONS.length} Benar</span>
                  </div>
                  <p class="tr-result-msg" id="tr-result-msg"></p>
                  <div class="tr-result-actions">
                    <button type="button" class="tr-btn tr-btn-crimson tr-btn-sm" id="tr-btn-quiz-retry">
                      Ulangi Kuis
                    </button>
                    <button type="button" class="tr-btn tr-btn-dark-outline tr-btn-sm" id="tr-btn-back-joglo">
                      Kembali ke Joglo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

        <!-- Modal Detail Cerita & Gerak -->
        <div class="tr-modal" id="tr-modal" role="dialog" aria-modal="true" aria-labelledby="tr-modal-title" hidden>
          <div class="tr-modal-backdrop" data-close-modal></div>
          <div class="tr-modal-card">
            <button type="button" class="tr-modal-close" id="tr-modal-close" aria-label="Tutup jendela">✕</button>
            <div class="tr-modal-media">
              <img id="tr-modal-img" src="" alt="" draggable="false" />
            </div>
            <div class="tr-modal-body">
              <span class="tr-card-eyebrow" id="tr-modal-eyebrow"></span>
              <h3 id="tr-modal-title"></h3>
              <p id="tr-modal-text"></p>
              <p class="tr-modal-extra" id="tr-modal-extra" hidden></p>
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
      room: q('#tr-room'),
      scroller: q('#tr-scroller'),
      sections: qa('.tr-section'),
      sideDots: qa('.tr-side-dot'),
      scrollTriggers: qa('[data-scroll-target]'),

      btnExplore: q('#tr-btn-explore'),
      btnMusic: q('#tr-btn-music'),
      musicIcon: q('#tr-music-icon'),
      musicLabel: q('#tr-music-label'),

      storyBtns: qa('[data-story-id]'),
      moveBtns: qa('[data-move-id]'),

      hotspots: qa('.tr-hotspot'),
      costumePills: qa('.tr-costume-pill'),
      costumeCard: q('#tr-costume-card'),
      costumeImg: q('#tr-costume-img'),
      costumeSub: q('#tr-costume-sub'),
      costumeTitle: q('#tr-costume-title'),
      costumeDesc: q('#tr-costume-desc'),
      costumeCounter: q('#tr-costume-counter'),
      costumePrev: q('#tr-costume-prev'),
      costumeNext: q('#tr-costume-next'),

      quizPlay: q('#tr-quiz-play'),
      quizResult: q('#tr-quiz-result'),
      quizCounter: q('#tr-quiz-counter'),
      quizBarFill: q('#tr-quiz-bar-fill'),
      quizScore: q('#tr-quiz-score'),
      quizQuestion: q('#tr-quiz-question'),
      quizOptions: q('#tr-quiz-options'),
      quizFeedback: q('#tr-quiz-feedback'),
      quizExplanation: q('#tr-quiz-explanation'),
      btnQuizNext: q('#tr-btn-quiz-next'),
      resultRank: q('#tr-result-rank'),
      resultScoreVal: q('#tr-result-score-val'),
      resultMsg: q('#tr-result-msg'),
      btnQuizRetry: q('#tr-btn-quiz-retry'),
      btnBackJoglo: q('#tr-btn-back-joglo'),

      modal: q('#tr-modal'),
      modalImg: q('#tr-modal-img'),
      modalEyebrow: q('#tr-modal-eyebrow'),
      modalTitle: q('#tr-modal-title'),
      modalText: q('#tr-modal-text'),
      modalExtra: q('#tr-modal-extra'),
      modalClose: q('#tr-modal-close'),
      modalCloseTriggers: qa('[data-close-modal]'),
    };
  },

  bindEvents() {
    this.dom.btnExplore.addEventListener('click', () => this.scrollToSection('tr-sec-story'));

    this.dom.btnMusic.addEventListener('click', () => this.toggleRoomMusic());

    this.dom.scrollTriggers.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.scrollTarget;
        if (targetId) this.scrollToSection(targetId);
      });
    });

    // Modal Cerita
    this.dom.storyBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = STORY_CARDS.find((c) => c.id === btn.dataset.storyId);
        if (card) {
          this.openModal({
            eyebrow: `Kisah Gandrung • ${card.eyebrow}`,
            title: card.title,
            text: card.fullText,
            img: card.img,
          });
        }
      });
    });

    // Modal Gerak Tari
    this.dom.moveBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const move = DANCE_MOVES.find((m) => m.id === btn.dataset.moveId);
        if (move) {
          this.openModal({
            eyebrow: `Ragam Gerak ${move.number}`,
            title: move.title,
            text: move.fullDesc,
            extra: `Ciri Utama: ${move.focus}`,
            img: move.img,
          });
        }
      });
    });

    // Eksplorasi Busana (Hotspot + Pill + Prev/Next)
    const selectCostume = (idx) => {
      const wrapped = (idx + COSTUME_PARTS.length) % COSTUME_PARTS.length;
      this.renderCostumeDetail(wrapped, true);
    };

    this.dom.hotspots.forEach((pin) => {
      pin.addEventListener('click', () => selectCostume(Number(pin.dataset.costumeIdx)));
    });
    this.dom.costumePills.forEach((pill) => {
      pill.addEventListener('click', () => selectCostume(Number(pill.dataset.costumeIdx)));
    });
    this.dom.costumePrev.addEventListener('click', () => selectCostume(this.activeCostumeIdx - 1));
    this.dom.costumeNext.addEventListener('click', () => selectCostume(this.activeCostumeIdx + 1));

    // Kuis
    this.dom.btnQuizNext.addEventListener('click', () => this.nextQuizQuestion());
    this.dom.btnQuizRetry.addEventListener('click', () => this.resetQuiz());
    this.dom.btnBackJoglo.addEventListener('click', () => {
      if (this.ctx && typeof this.ctx.returnToLanding === 'function') {
        this.ctx.returnToLanding();
      }
    });

    // Tutup Modal
    this.dom.modalClose.addEventListener('click', () => this.closeModal());
    this.dom.modalCloseTriggers.forEach((el) => {
      el.addEventListener('click', () => this.closeModal());
    });
  },

  /* =========================================================
     SIKLUS HIDUP RUANGAN (ENTER / EXIT / RESIZE)
     ========================================================= */
  enter() {
    this.isActive = true;
    this.preloadAssets();
    this.dom.scroller.scrollTop = 0;
    this.updateSideNav(0);
    this.closeModal();

    if (this.ctx && this.ctx.audioManager) {
      this.ctx.audioManager
        .playRoomTrack('tari', { loop: true, reset: false })
        .then(() => this.syncMusicButton());
    }

    this.setupObservers();
    this.animateHeroEntrance();
    window.addEventListener('keydown', this.onKeyDown);
  },

  exit() {
    this.isActive = false;
    window.removeEventListener('keydown', this.onKeyDown);
    this.closeModal();

    if (this.scrollTween) {
      this.scrollTween.kill();
      this.scrollTween = null;
    }
    this.ambientTweens.forEach((tw) => tw.kill());
    this.ambientTweens = [];

    if (this.sectionObserver) {
      this.sectionObserver.disconnect();
      this.sectionObserver = null;
    }
    if (this.revealObserver) {
      this.revealObserver.disconnect();
      this.revealObserver = null;
    }
  },

  resize() {
    // Layout berbasis CSS responsive clamp() & grid menyesuaikan otomatis
  },

  preloadAssets() {
    if (this.preloaded) return;
    this.preloaded = true;
    Object.values(TARI_ASSETS).forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
  },

  /* =========================================================
     GSAP SMOOTH SCROLL & INTERSECTION OBSERVERS
     ========================================================= */
  scrollToSection(sectionId) {
    const target = this.mountEl.querySelector(`#${sectionId}`);
    if (!target || !this.dom.scroller) return;

    const targetY = target.offsetTop;

    if (this.scrollTween) {
      this.scrollTween.kill();
      this.scrollTween = null;
    }

    if (window.gsap && !appState.get('reducedMotion')) {
      this.scrollTween = window.gsap.to(this.dom.scroller, {
        scrollTop: targetY,
        duration: 0.9,
        ease: 'power3.inOut',
        onComplete: () => {
          this.scrollTween = null;
        },
      });
    } else {
      this.dom.scroller.scrollTop = targetY;
    }
  },

  setupObservers() {
    if (this.sectionObserver) this.sectionObserver.disconnect();
    if (this.revealObserver) this.revealObserver.disconnect();

    // 1. Lacak bagian aktif untuk indikator titik kanan
    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = SECTION_IDS.findIndex((s) => s.id === entry.target.id);
            if (idx !== -1) this.updateSideNav(idx);
          }
        });
      },
      { root: this.dom.scroller, threshold: 0.45 }
    );

    this.dom.sections.forEach((sec) => this.sectionObserver.observe(sec));

    // 2. Animasi masuk halus untuk elemen .tr-reveal
    const reveals = Array.from(this.mountEl.querySelectorAll('.tr-reveal'));
    if (!window.gsap || appState.get('reducedMotion')) {
      reveals.forEach((el) => el.classList.add('is-shown'));
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.classList.contains('is-shown')) {
            entry.target.classList.add('is-shown');
            window.gsap.fromTo(
              entry.target,
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.58, ease: 'power2.out', clearProps: 'transform' }
            );
            this.revealObserver.unobserve(entry.target);
          }
        });
      },
      { root: this.dom.scroller, threshold: 0.14 }
    );

    reveals.forEach((el) => {
      if (!el.classList.contains('is-shown')) {
        this.revealObserver.observe(el);
      }
    });
  },

  updateSideNav(activeIdx) {
    this.activeSectionIdx = activeIdx;
    this.dom.sideDots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === activeIdx);
    });
  },

  animateHeroEntrance() {
    if (!window.gsap || appState.get('reducedMotion')) return;
    const heroEls = this.mountEl.querySelectorAll(
      '.tr-hero-eyebrow, .tr-hero-title, .tr-hero-subtitle, .tr-hero-lead, .tr-hero-actions'
    );
    window.gsap.fromTo(
      heroEls,
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.65, ease: 'power3.out', clearProps: 'transform' }
    );
  },

  /* =========================================================
     AUDIO RUANGAN
     ========================================================= */
  toggleRoomMusic() {
    const am = this.ctx && this.ctx.audioManager;
    if (!am) return;

    if (!am.isTrackAvailable('tari')) {
      // Fallback: jika gandrung-banyuwangi.mp3 belum tersedia, arahkan ke audio ambient
      am.toggleMute();
      this.syncMusicButton();
      return;
    }

    const track = am.getTrackElement('tari');
    if (track && !track.paused && !appState.get('audioMuted')) {
      track.pause();
      this.syncMusicButton(false);
    } else {
      if (appState.get('audioMuted')) am.toggleMute();
      am.playRoomTrack('tari', { loop: true, reset: false }).then(() => {
        this.syncMusicButton(true);
      });
    }
  },

  syncMusicButton(forcePlaying = null) {
    const am = this.ctx && this.ctx.audioManager;
    let isPlaying = false;

    if (forcePlaying !== null) {
      isPlaying = forcePlaying;
    } else if (am && am.isTrackAvailable('tari')) {
      const track = am.getTrackElement('tari');
      isPlaying = Boolean(track && !track.paused && !appState.get('audioMuted'));
    } else {
      isPlaying = !appState.get('audioMuted');
    }

    this.dom.musicIcon.textContent = isPlaying ? '❚❚' : '▶';
    this.dom.musicLabel.textContent = isPlaying ? 'Jeda Iringan' : 'Putar Iringan';
  },

  /* =========================================================
     BAGIAN 3: EKSPLORASI BUSANA
     ========================================================= */
  renderCostumeDetail(idx, animate = true) {
    this.activeCostumeIdx = idx;
    const part = COSTUME_PARTS[idx];
    if (!part) return;

    this.dom.hotspots.forEach((pin, i) => pin.classList.toggle('is-active', i === idx));
    this.dom.costumePills.forEach((pill, i) => pill.classList.toggle('is-active', i === idx));

    const applyContent = () => {
      this.dom.costumeImg.src = part.img;
      this.dom.costumeImg.alt = `${part.label} — ${part.subtitle}`;
      this.dom.costumeSub.textContent = part.subtitle;
      this.dom.costumeTitle.textContent = part.label;
      this.dom.costumeDesc.textContent = part.description;
      this.dom.costumeCounter.textContent = `${idx + 1} / ${COSTUME_PARTS.length}`;
    };

    if (animate && window.gsap && !appState.get('reducedMotion')) {
      window.gsap.to(this.dom.costumeCard, {
        opacity: 0.45,
        y: 6,
        duration: 0.14,
        ease: 'power1.in',
        onComplete: () => {
          applyContent();
          window.gsap.to(this.dom.costumeCard, {
            opacity: 1,
            y: 0,
            duration: 0.28,
            ease: 'power2.out',
          });
        },
      });
    } else {
      applyContent();
    }
  },

  /* =========================================================
     BAGIAN 5: KUIS BUDAYA INTERAKTIF
     ========================================================= */
  resetQuiz() {
    this.quizIndex = 0;
    this.quizScore = 0;
    this.quizLocked = false;
    this.dom.quizPlay.hidden = false;
    this.dom.quizResult.hidden = true;
    this.renderQuizQuestion();
  },

  renderQuizQuestion() {
    const q = QUIZ_QUESTIONS[this.quizIndex];
    if (!q) {
      this.showQuizResult();
      return;
    }

    this.quizLocked = false;
    this.dom.quizCounter.textContent = `Pertanyaan ${this.quizIndex + 1} dari ${QUIZ_QUESTIONS.length}`;
    this.dom.quizScore.textContent = String(this.quizScore);
    const pct = Math.round(((this.quizIndex + 1) / QUIZ_QUESTIONS.length) * 100);
    this.dom.quizBarFill.style.width = `${pct}%`;

    this.dom.quizQuestion.textContent = q.question;
    this.dom.quizFeedback.hidden = true;

    const letters = ['A', 'B', 'C', 'D'];
    this.dom.quizOptions.innerHTML = q.options
      .map(
        (opt, i) => `
      <button type="button" class="tr-quiz-opt" data-opt-idx="${i}">
        <span class="tr-opt-letter">${letters[i]}</span>
        <span class="tr-opt-text">${opt}</span>
      </button>
    `
      )
      .join('');

    this.dom.quizOptions.querySelectorAll('.tr-quiz-opt').forEach((btn) => {
      btn.addEventListener('click', () => this.handleQuizAnswer(Number(btn.dataset.optIdx)));
    });
  },

  handleQuizAnswer(selectedIdx) {
    if (this.quizLocked) return;
    this.quizLocked = true;

    const q = QUIZ_QUESTIONS[this.quizIndex];
    const isCorrect = selectedIdx === q.correctIndex;
    if (isCorrect) {
      this.quizScore += 20;
      this.dom.quizScore.textContent = String(this.quizScore);
    }

    const buttons = Array.from(this.dom.quizOptions.querySelectorAll('.tr-quiz-opt'));
    buttons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.correctIndex) {
        btn.classList.add('is-correct');
      } else if (i === selectedIdx && !isCorrect) {
        btn.classList.add('is-wrong');
      }
    });

    this.dom.quizExplanation.textContent = `${isCorrect ? 'Tepat! ' : 'Belum tepat. '}${q.explanation}`;
    this.dom.btnQuizNext.textContent =
      this.quizIndex + 1 >= QUIZ_QUESTIONS.length ? 'Lihat Hasil Akhir →' : 'Pertanyaan Berikutnya →';
    this.dom.quizFeedback.hidden = false;
  },

  nextQuizQuestion() {
    this.quizIndex += 1;
    if (this.quizIndex >= QUIZ_QUESTIONS.length) {
      this.showQuizResult();
    } else {
      this.renderQuizQuestion();
    }
  },

  showQuizResult() {
    const correctCount = Math.round(this.quizScore / 20);
    this.dom.quizPlay.hidden = true;
    this.dom.quizResult.hidden = false;
    this.dom.resultScoreVal.textContent = String(correctCount);

    let rank = 'Sahabat Tradisi';
    let msg = 'Terima kasih telah menjelajahi Tari Gandrung! Coba baca kembali kisah dan busananya lalu ulangi kuisnya.';
    if (correctCount === QUIZ_QUESTIONS.length) {
      rank = 'Duta Budaya Gandrung';
      msg = 'Sempurna! Kamu menguasai sejarah, busana, dan ragam gerak Tari Gandrung Banyuwangi dengan luar biasa.';
    } else if (correctCount >= 3) {
      rank = 'Penikmat Seni Banyuwangi';
      msg = 'Hebat! Pemahamanmu tentang warisan budaya Tari Gandrung sudah sangat baik.';
    }

    this.dom.resultRank.textContent = rank;
    this.dom.resultMsg.textContent = msg;

    if (window.gsap && !appState.get('reducedMotion')) {
      window.gsap.fromTo(
        this.dom.quizResult,
        { scale: 0.94, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.42, ease: 'back.out(1.3)' }
      );
    }
  },

  /* =========================================================
     MODAL DETAIL & KEYBOARD
     ========================================================= */
  openModal({ eyebrow, title, text, extra = '', img }) {
    this.dom.modalEyebrow.textContent = eyebrow || '';
    this.dom.modalTitle.textContent = title || '';
    this.dom.modalText.textContent = text || '';
    this.dom.modalImg.src = img || '';
    this.dom.modalImg.alt = title || '';

    if (extra) {
      this.dom.modalExtra.textContent = extra;
      this.dom.modalExtra.hidden = false;
    } else {
      this.dom.modalExtra.hidden = true;
    }

    this.dom.modal.hidden = false;

    if (window.gsap && !appState.get('reducedMotion')) {
      const card = this.dom.modal.querySelector('.tr-modal-card');
      window.gsap.fromTo(
        card,
        { scale: 0.92, y: 16, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.32, ease: 'power2.out' }
      );
    }
  },

  closeModal() {
    if (this.dom && this.dom.modal) {
      this.dom.modal.hidden = true;
    }
  },

  handleKeyDown(e) {
    if (!this.isActive) return;
    if (e.key === 'Escape' && !this.dom.modal.hidden) {
      this.closeModal();
    }
  },
};