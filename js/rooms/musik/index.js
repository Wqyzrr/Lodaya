/**
 * js/rooms/musik/index.js
 * Ruang III — Seni Musik: Piano Tiles Rek Ayo Rek (Tingkat Mudah).
 */
import { songConfig } from './song-config.js';
import { PianoTilesEngine } from './piano-tiles.js';
import { appState } from '../../core/state-manager.js';

export const musikRoom = {
  id: 'musik',
  title: 'Seni Musik — Rek Ayo Rek',
  tutorial: {
    eyebrow: 'Ruang III — Seni Musik',
    title: 'Panduan Piano Tiles: Rek Ayo Rek',
    steps: [
      {
        heading: 'Ketuk Bilah Emas di Garis Nada',
        text: 'Ketuk lajur tempat bilah emas turun saat mendekati garis nada di bagian bawah (atau tekan tombol D, F, J, K di komputer).',
      },
      {
        heading: 'Skor & Kombo',
        text: 'Ketukan tepat memberi skor Sempurna dan menambah Kombo. Permainan ini bertempo santai agar nyaman dimainkan semua usia.',
      },
      {
        heading: 'Tanpa Hukuman Berat',
        text: 'Jika ada bilah yang terlewat, permainan tetap berlanjut dengan nyaman hingga lagu selesai.',
      },
    ],
  },

  init(mountEl, ctx) {
    this.mountEl = mountEl;
    this.ctx = ctx;

    const ornamentSrc = ctx.loadingManager.getAssetUrl('wayang3');

    this.mountEl.innerHTML = `
      <div class="musik-shell">
        <aside class="musik-sidebar">
          <div class="musik-title-block">
            <span class="musik-tag">Ruang III &bull; Seni Musik</span>
            <h2>${songConfig.title}</h2>
            <p class="musik-subtitle">${songConfig.subtitle}</p>
            <div class="musik-audio-notice" id="musik-audio-notice" hidden>
              Berkas <code>assets/audio/rek-ayo-rek.mp3</code> belum terpasang. Mode latihan santai dengan nada lembut aktif.
            </div>
          </div>

          <div class="musik-stats">
            <div class="musik-stat-card">
              <span>Skor</span>
              <strong id="musik-score">0</strong>
            </div>
            <div class="musik-stat-card">
              <span>Kombo</span>
              <strong id="musik-combo">0</strong>
            </div>
            <div class="musik-stat-card">
              <span>Akurasi</span>
              <strong id="musik-accuracy">100%</strong>
            </div>
            <div class="musik-stat-card">
              <span>Tingkat</span>
              <strong>Mudah</strong>
            </div>
          </div>

          <div>
            <div class="musik-progress-wrap">
              <div class="musik-progress-label">
                <span>Kemajuan Lagu</span>
                <span id="musik-progress-pct">0%</span>
              </div>
              <div class="musik-progress-track">
                <div class="musik-progress-fill" id="musik-progress-fill"></div>
              </div>
            </div>

            <div class="musik-btn-group">
              <button type="button" class="btn-musik-primary" id="btn-musik-start">Mulai Bermain</button>
              <button type="button" class="btn-musik-secondary" id="btn-musik-pause" disabled>Jeda</button>
            </div>
          </div>
        </aside>

        <div class="tiles-board-wrap" id="tiles-board">
          <img src="${ornamentSrc}" alt="" class="tiles-bg-ornament" aria-hidden="true" draggable="false" />
          <div class="tiles-hit-zone" aria-hidden="true"></div>
          <div class="tiles-feedback" id="tiles-feedback" aria-live="polite"></div>
          <div class="tiles-layer" id="tiles-layer"></div>

          <div class="tiles-lanes" id="tiles-lanes">
            <div class="tile-lane" data-lane="0" role="button" aria-label="Lajur 1"></div>
            <div class="tile-lane" data-lane="1" role="button" aria-label="Lajur 2"></div>
            <div class="tile-lane" data-lane="2" role="button" aria-label="Lajur 3"></div>
            <div class="tile-lane" data-lane="3" role="button" aria-label="Lajur 4"></div>
          </div>

          <div class="lane-key-labels" aria-hidden="true">
            <span>D</span><span>F</span><span>J</span><span>K</span>
          </div>

          <div class="tiles-result-overlay" id="tiles-result" hidden>
            <h3>Permainan Selesai</h3>
            <p id="tiles-result-summary"></p>
            <button type="button" class="btn-musik-primary" id="btn-musik-replay">Mainkan Lagi</button>
          </div>
        </div>
      </div>
    `;

    this.boardEl = this.mountEl.querySelector('#tiles-board');
    this.tilesLayerEl = this.mountEl.querySelector('#tiles-layer');
    this.laneEls = Array.from(this.mountEl.querySelectorAll('.tile-lane'));
    this.scoreEl = this.mountEl.querySelector('#musik-score');
    this.comboEl = this.mountEl.querySelector('#musik-combo');
    this.accEl = this.mountEl.querySelector('#musik-accuracy');
    this.progPctEl = this.mountEl.querySelector('#musik-progress-pct');
    this.progFillEl = this.mountEl.querySelector('#musik-progress-fill');
    this.feedbackEl = this.mountEl.querySelector('#tiles-feedback');
    this.noticeEl = this.mountEl.querySelector('#musik-audio-notice');
    this.resultEl = this.mountEl.querySelector('#tiles-result');
    this.resultSummaryEl = this.mountEl.querySelector('#tiles-result-summary');
    this.btnStart = this.mountEl.querySelector('#btn-musik-start');
    this.btnPause = this.mountEl.querySelector('#btn-musik-pause');
    this.btnReplay = this.mountEl.querySelector('#btn-musik-replay');

    this.engine = new PianoTilesEngine({
      config: songConfig,
      boardEl: this.boardEl,
      tilesLayerEl: this.tilesLayerEl,
      laneEls: this.laneEls,
      audioManager: ctx.audioManager,
      onStatsUpdate: (stats) => this.updateStatsUI(stats),
      onFeedback: (label) => this.showFeedback(label),
      onFinish: (stats) => this.showResult(stats),
    });

    this.bindEvents();
  },

  bindEvents() {
    this.laneEls.forEach((laneEl) => {
      laneEl.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const lane = parseInt(laneEl.dataset.lane, 10);
        this.engine.tapLane(lane);
      });
    });

    this.btnStart.addEventListener('click', () => this.startGame());
    this.btnReplay.addEventListener('click', () => this.startGame());

    this.btnPause.addEventListener('click', () => {
      if (this.engine.state === 'playing') {
        this.engine.pause();
        this.btnPause.textContent = 'Lanjutkan';
      } else if (this.engine.state === 'paused') {
        this.engine.resume();
        this.btnPause.textContent = 'Jeda';
      }
    });

    this.boundKeydown = (e) => {
      if (appState.get('currentScene') !== 'musik') return;
      const map = { d: 0, f: 1, j: 2, k: 3 };
      const key = e.key.toLowerCase();
      if (key in map) {
        this.engine.tapLane(map[key]);
      }
    };
  },

  async startGame() {
    this.resultEl.hidden = true;
    this.btnStart.textContent = 'Ulangi Lagu';
    this.btnPause.disabled = false;
    this.btnPause.textContent = 'Jeda';
    const hasAudio = await this.engine.start();
    this.noticeEl.hidden = hasAudio;
  },

  updateStatsUI(stats) {
    this.scoreEl.textContent = String(stats.score);
    this.comboEl.textContent = String(stats.combo);
    this.accEl.textContent = `${stats.accuracy}%`;
    this.progPctEl.textContent = `${stats.progress}%`;
    this.progFillEl.style.width = `${stats.progress}%`;
  },

  showFeedback(text) {
    this.feedbackEl.textContent = text;
    if (window.gsap) {
      window.gsap.killTweensOf(this.feedbackEl);
      window.gsap.fromTo(
        this.feedbackEl,
        { opacity: 1, y: 6, scale: 0.94 },
        { opacity: 0, y: -14, scale: 1.04, duration: 0.5, ease: 'power2.out' }
      );
    }
  },

  showResult(stats) {
    this.btnPause.disabled = true;
    this.resultSummaryEl.textContent = `Skor Akhir: ${stats.score} | Akurasi: ${stats.accuracy}% | Kombo Tertinggi: ${stats.maxCombo}`;
    this.resultEl.hidden = false;
  },

  enter() {
    window.addEventListener('keydown', this.boundKeydown);
    this.noticeEl.hidden = this.ctx.audioManager.isTrackAvailable('musik');
    this.engine.reset();
  },

  exit() {
    window.removeEventListener('keydown', this.boundKeydown);
    this.engine.destroy();
    this.resultEl.hidden = true;
    this.btnPause.disabled = true;
    this.btnPause.textContent = 'Jeda';
    this.btnStart.textContent = 'Mulai Bermain';
  },

  resize() {},
};
