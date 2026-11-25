/**
 * js/rooms/musik/index.js
 * Ruang III — Seni Musik: Memory Game Saron "Rek Ayo Rek"
 */
import { appState } from '../../core/state-manager.js';
import { saronAudio, SARON_NOTES } from './saron-audio.js';
import { MUSIK_ASSETS, REK_AYO_REK_ROUNDS, MUSIK_TUTORIAL } from './song-config.js';

const EXTENSIONS = ['.webp', '.png', '.jpg'];
const resolvedCache = new Map();

function resolveAsset(basePath) {
  if (!basePath) return Promise.resolve(null);
  if (resolvedCache.has(basePath)) return Promise.resolve(resolvedCache.get(basePath));

  return new Promise((resolve) => {
    let idx = 0;
    const next = () => {
      if (idx >= EXTENSIONS.length) {
        resolvedCache.set(basePath, null);
        resolve(null);
        return;
      }
      const candidate = `${basePath}${EXTENSIONS[idx]}`;
      idx += 1;
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        resolvedCache.set(basePath, candidate);
        resolve(candidate);
      };
      img.onerror = next;
      img.src = candidate;
    };
    next();
  });
}

function getAsset(basePath) {
  return resolvedCache.get(basePath) || '';
}

export const musikRoom = {
  id: 'musik',
  title: 'Seni Musik',
  tutorial: MUSIK_TUTORIAL,

  init(mountEl, ctx) {
    this.mountEl = mountEl;
    this.ctx = ctx;

    this.isActive = false;
    this.mode = 'idle'; // 'idle' | 'demo' | 'player' | 'transition' | 'won' | 'freeplay'
    this.roundIndex = 0;
    this.inputIndex = 0;
    this.score = 0;
    this.streak = 0;

    this.timers = new Set();
    this.ambientTweens = [];
    this.malletTween = null;

    this.onKeyDown = this.handleKeyDown.bind(this);

    this.renderShell();
    this.cacheDOM();
    this.bindEvents();
  },

  renderShell() {
    const bilahMarkup = SARON_NOTES.map((note, idx) => `
      <button
        type="button"
        class="sm-bilah"
        data-note="${idx}"
        style="--bilah-scale-h: ${(1 - idx * 0.032).toFixed(3)}"
        aria-label="Bilah Saron nada ${note.cipher} (${note.name})"
      >
        <span class="sm-bilah-visual">
          <img class="sm-bilah-img base" data-bilah-base alt="" draggable="false" />
          <img class="sm-bilah-img glow" data-bilah-glow alt="" draggable="false" />
        </span>
        <span class="sm-bilah-ripple" aria-hidden="true"></span>
        <span class="sm-bilah-badge">
          <strong>${note.cipher}</strong>
          <small>${note.name}</small>
        </span>
      </button>
    `).join('');

    this.mountEl.innerHTML = `
      <div class="sm-room" id="sm-room">
        <!-- Lapisan Atmosfer Pendopo Gamelan -->
        <div class="sm-env" aria-hidden="true">
          <img class="sm-bg-pendopo" id="sm-bg-pendopo" alt="" draggable="false" />
          <div class="sm-bg-vignette"></div>
          <img class="sm-gamelan-backdrop" id="sm-gamelan-backdrop" alt="" draggable="false" />
          <img class="sm-lantern left" id="sm-lantern-left" alt="" draggable="false" />
          <img class="sm-lantern right" id="sm-lantern-right" alt="" draggable="false" />
          <div class="sm-particles" id="sm-particles"></div>
          <img class="sm-karpet" id="sm-karpet" alt="" draggable="false" />
        </div>

        <!-- Bar Atas: Papan Lirik & Status Babak -->
        <div class="sm-header">
          <div class="sm-title-block">
            <span class="sm-eyebrow">Ruang III • Seni Musik Jawa Timur</span>
            <h2 class="sm-title">Saron: Rek Ayo Rek</h2>
          </div>

          <div class="sm-lyric-board" id="sm-lyric-board">
            <img class="sm-lyric-bg" id="sm-lyric-bg" alt="" draggable="false" aria-hidden="true" />
            <div class="sm-lyric-content">
              <span class="sm-round-label" id="sm-round-label">Siap Menabuh Gamelan</span>
              <p class="sm-lyric-text" id="sm-lyric-text">“Rek ayo rek, mlaku-mlaku nang Tunjungan”</p>
              <div class="sm-pattern-dots" id="sm-pattern-dots" aria-live="polite"></div>
            </div>
          </div>

          <div class="sm-score-pill">
            <span>Skor</span>
            <strong id="sm-score-val">0</strong>
          </div>
        </div>

        <!-- Area Tengah: Pengrawit Pemandu + Instrumen Saron -->
        <div class="sm-stage" id="sm-stage">
          <!-- Pemandu Pengrawit di Sisi Kiri -->
          <div class="sm-guide-wrap" id="sm-guide-wrap">
            <div class="sm-speech-bubble" id="sm-speech-bubble" role="status" aria-live="polite">
              <span class="sm-turn-tag" id="sm-turn-tag">Pemandu Gamelan</span>
              <p id="sm-guide-msg">Ketuk <strong>Mulai</strong> untuk mendengarkan pola Saron lagu Rek Ayo Rek!</p>
            </div>
            <img class="sm-pengrawit-img" id="sm-pengrawit-img" alt="Pengrawit Gamelan Jawa Timur" draggable="false" />
          </div>

          <!-- Panggung Saron Interaktif -->
          <div class="sm-saron-stage" id="sm-saron-stage">
            <div class="sm-saron-shadow" aria-hidden="true"></div>
            <div class="sm-saron-body">
              <img class="sm-rancakan-img" id="sm-rancakan-img" alt="Rancakan Saron" draggable="false" />
              <div class="sm-bilah-rack" id="sm-bilah-rack" role="group" aria-label="Enam bilah instrumen Saron">
                ${bilahMarkup}
              </div>
              <!-- Tabuh Saron Melayang (Animasi GSAP) -->
              <img class="sm-tabuh" id="sm-tabuh" alt="" draggable="false" aria-hidden="true" />
            </div>
          </div>
        </div>

        <!-- Bar Kontrol Bawah -->
        <div class="sm-controls">
          <button type="button" class="sm-btn sm-btn-primary" id="sm-btn-start">Mulai Permainan</button>
          <button type="button" class="sm-btn sm-btn-secondary" id="sm-btn-replay" hidden>Dengarkan Ulang</button>
          <button type="button" class="sm-btn sm-btn-ghost" id="sm-btn-freeplay">Mode Bebas</button>
        </div>

        <!-- Overlay Kemenangan -->
        <div class="sm-victory-overlay" id="sm-victory-overlay" hidden>
          <div class="sm-victory-card">
            <img class="sm-corner tl" data-victory-corner alt="" draggable="false" aria-hidden="true" />
            <img class="sm-corner tr" data-victory-corner alt="" draggable="false" aria-hidden="true" />
            <img class="sm-corner bl" data-victory-corner alt="" draggable="false" aria-hidden="true" />
            <img class="sm-corner br" data-victory-corner alt="" draggable="false" aria-hidden="true" />
            <img class="sm-medal-img" id="sm-medal-img" alt="Medali Pengrawit Gamelan" draggable="false" />
            <span class="sm-victory-eyebrow">Harmoni Jawa Timur</span>
            <h3>Lagu Rek Ayo Rek Selesai!</h3>
            <p id="sm-victory-desc">Kamu berhasil menabuh seluruh pola Saron dengan penuh penghayatan.</p>
            <div class="sm-victory-actions">
              <button type="button" class="sm-btn sm-btn-primary" id="sm-btn-play-again">Main Lagi</button>
              <button type="button" class="sm-btn sm-btn-secondary" id="sm-btn-victory-free">Main Bebas</button>
              <button type="button" class="sm-btn sm-btn-ghost" id="sm-btn-return">Kembali ke Joglo</button>
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
      room: q('#sm-room'),
      bgPendopo: q('#sm-bg-pendopo'),
      gamelanBackdrop: q('#sm-gamelan-backdrop'),
      lanternLeft: q('#sm-lantern-left'),
      lanternRight: q('#sm-lantern-right'),
      particles: q('#sm-particles'),
      karpet: q('#sm-karpet'),

      lyricBg: q('#sm-lyric-bg'),
      roundLabel: q('#sm-round-label'),
      lyricText: q('#sm-lyric-text'),
      patternDots: q('#sm-pattern-dots'),
      scoreVal: q('#sm-score-val'),

      guideWrap: q('#sm-guide-wrap'),
      speechBubble: q('#sm-speech-bubble'),
      turnTag: q('#sm-turn-tag'),
      guideMsg: q('#sm-guide-msg'),
      pengrawitImg: q('#sm-pengrawit-img'),

      saronStage: q('#sm-saron-stage'),
      rancakanImg: q('#sm-rancakan-img'),
      bilahRack: q('#sm-bilah-rack'),
      bilahEls: qa('.sm-bilah'),
      bilahBaseImgs: qa('[data-bilah-base]'),
      bilahGlowImgs: qa('[data-bilah-glow]'),
      tabuh: q('#sm-tabuh'),

      btnStart: q('#sm-btn-start'),
      btnReplay: q('#sm-btn-replay'),
      btnFreeplay: q('#sm-btn-freeplay'),

      victoryOverlay: q('#sm-victory-overlay'),
      victoryCorners: qa('[data-victory-corner]'),
      medalImg: q('#sm-medal-img'),
      victoryDesc: q('#sm-victory-desc'),
      btnPlayAgain: q('#sm-btn-play-again'),
      btnVictoryFree: q('#sm-btn-victory-free'),
      btnReturn: q('#sm-btn-return'),
    };
  },

  bindEvents() {
    this.dom.bilahEls.forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const idx = Number(btn.dataset.note);
        this.handlePlayerTap(idx);
      });
    });

    this.dom.btnStart.addEventListener('click', () => this.startGame());
    this.dom.btnReplay.addEventListener('click', () => {
      if (this.mode === 'player') {
        this.playRoundDemo();
      }
    });
    this.dom.btnFreeplay.addEventListener('click', () => this.toggleFreeplay());

    this.dom.btnPlayAgain.addEventListener('click', () => {
      this.dom.victoryOverlay.hidden = true;
      this.startGame();
    });
    this.dom.btnVictoryFree.addEventListener('click', () => {
      this.dom.victoryOverlay.hidden = true;
      this.enterFreeplay();
    });
    this.dom.btnReturn.addEventListener('click', () => {
      if (this.ctx && typeof this.ctx.returnToLanding === 'function') {
        this.ctx.returnToLanding();
      }
    });
  },

  /* =========================================================
     SIKLUS HIDUP RUANGAN (ENTER / EXIT / RESIZE)
     ========================================================= */
  async enter() {
    this.isActive = true;
    this.clearTimers();

    // Redam musik latar Joglo agar dentingan Saron terdengar jernih
    if (this.ctx && this.ctx.audioManager) {
      this.ctx.audioManager.pauseAmbient();
    }

    await Promise.all([this.loadAssets(), saronAudio.preloadSample()]);
    if (!this.isActive) return;

    this.applyAssets();
    this.resetToIdle();
    this.startAmbientMotion();

    window.addEventListener('keydown', this.onKeyDown);
  },

  exit() {
    this.isActive = false;
    this.clearTimers();
    this.killAnimations();
    window.removeEventListener('keydown', this.onKeyDown);
    this.dom.victoryOverlay.hidden = true;
  },

  resize() {
    if (!this.isActive) return;
    if (window.gsap && this.dom.tabuh) {
      window.gsap.set(this.dom.tabuh, { clearProps: 'x,y' });
    }
  },

  /* =========================================================
     PEMUATAN & PEMASANGAN ASET
     ========================================================= */
  async loadAssets() {
    await Promise.all(Object.values(MUSIK_ASSETS).map((path) => resolveAsset(path)));
  },

  applyAssets() {
    const assign = (el, key) => {
      if (!el) return;
      const url = getAsset(MUSIK_ASSETS[key]);
      if (url) {
        el.src = url;
        el.hidden = false;
      } else {
        el.hidden = true;
      }
    };

    assign(this.dom.bgPendopo, 'bgPendopo');
    assign(this.dom.gamelanBackdrop, 'gamelanBackdrop');
    assign(this.dom.karpet, 'karpetTikar');
    assign(this.dom.rancakanImg, 'saronRancakan');
    assign(this.dom.tabuh, 'tabuhSaron');
    assign(this.dom.pengrawitImg, 'pengrawitGuide');
    assign(this.dom.lyricBg, 'papanLirik');
    assign(this.dom.medalImg, 'medaliGamelan');
    assign(this.dom.lanternLeft, 'lentera');
    assign(this.dom.lanternRight, 'lentera');

    const bilahUrl = getAsset(MUSIK_ASSETS.saronBilah);
    const glowUrl = getAsset(MUSIK_ASSETS.saronBilahGlow);
    this.dom.bilahBaseImgs.forEach((img) => {
      if (bilahUrl) img.src = bilahUrl;
    });
    this.dom.bilahGlowImgs.forEach((img) => {
      if (glowUrl) img.src = glowUrl;
    });

    const cornerUrl = getAsset(MUSIK_ASSETS.paperCorner);
    this.dom.victoryCorners.forEach((img) => {
      if (cornerUrl) {
        img.src = cornerUrl;
        img.hidden = false;
      } else {
        img.hidden = true;
      }
    });
  },

  /* =========================================================
     ALUR MEMORY GAME SARON
     ========================================================= */
  resetToIdle() {
    this.mode = 'idle';
    this.roundIndex = 0;
    this.inputIndex = 0;
    this.score = 0;
    this.streak = 0;

    this.dom.scoreVal.textContent = '0';
    this.dom.roundLabel.textContent = 'Siap Menabuh Gamelan';
    this.dom.lyricText.textContent = '“Rek ayo rek, mlaku-mlaku nang Tunjungan”';
    this.dom.patternDots.innerHTML = '';

    this.dom.btnStart.hidden = false;
    this.dom.btnStart.textContent = 'Mulai Permainan';
    this.dom.btnReplay.hidden = true;
    this.dom.btnFreeplay.textContent = 'Mode Bebas';
    this.dom.victoryOverlay.hidden = true;

    this.setGuideMessage(
      'Pemandu Gamelan',
      'Ketuk <strong>Mulai Permainan</strong> untuk mendengarkan pola Saron, atau coba <strong>Mode Bebas</strong>.'
    );
    this.setBilahInteractive(false);
  },

  startGame() {
    this.clearTimers();
    this.roundIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.dom.scoreVal.textContent = '0';
    this.dom.victoryOverlay.hidden = true;

    this.dom.btnStart.textContent = 'Ulangi dari Babak 1';
    this.dom.btnFreeplay.textContent = 'Mode Bebas';
    this.dom.btnReplay.hidden = false;

    this.beginRound(0);
  },

  beginRound(index) {
    this.roundIndex = index;
    this.inputIndex = 0;
    const round = REK_AYO_REK_ROUNDS[index];
    if (!round) {
      this.handleVictory();
      return;
    }

    this.dom.roundLabel.textContent = `${round.title} (${index + 1}/${REK_AYO_REK_ROUNDS.length})`;
    this.dom.lyricText.textContent = round.lyric;
    this.renderPatternDots(round.pattern.length, 0);

    this.playRoundDemo();
  },

  playRoundDemo() {
    const round = REK_AYO_REK_ROUNDS[this.roundIndex];
    if (!round) return;

    this.clearTimers();
    this.mode = 'demo';
    this.inputIndex = 0;
    this.setBilahInteractive(false);
    this.dom.btnReplay.disabled = true;
    this.renderPatternDots(round.pattern.length, 0);

    this.setGuideMessage(
      'Dengarkan Pola...',
      `Perhatikan urutan <strong>${round.pattern.length} nada</strong> pada bilah Saron.`
    );

    const startDelay = 550;
    round.pattern.forEach((noteIdx, step) => {
      this.schedule(() => {
        if (!this.isActive || this.mode !== 'demo') return;
        this.strikeBilah(noteIdx, true);
        this.highlightDot(step, 'is-demo');
      }, startDelay + step * round.tempoMs);
    });

    const totalTime = startDelay + round.pattern.length * round.tempoMs + 320;
    this.schedule(() => {
      if (!this.isActive || this.mode !== 'demo') return;
      this.mode = 'player';
      this.setBilahInteractive(true);
      this.dom.btnReplay.disabled = false;
      this.renderPatternDots(round.pattern.length, 0);
      this.setGuideMessage(
        'Giliranmu!',
        'Ketuk bilah Saron sesuai urutan yang baru kamu dengar.'
      );
      this.bounceGuide();
    }, totalTime);
  },

  handlePlayerTap(bilahIndex) {
    if (!this.isActive) return;

    // Izinkan menabuh bebas di mode freeplay atau saat idle (coba-coba)
    if (this.mode === 'freeplay' || this.mode === 'idle') {
      this.strikeBilah(bilahIndex, false);
      return;
    }

    if (this.mode !== 'player') return;

    const round = REK_AYO_REK_ROUNDS[this.roundIndex];
    if (!round) return;

    const expected = round.pattern[this.inputIndex];
    this.strikeBilah(bilahIndex, false);

    if (bilahIndex === expected) {
      this.highlightDot(this.inputIndex, 'is-done');
      this.inputIndex += 1;
      this.streak += 1;
      this.score += 100 + Math.min(50, this.streak * 10);
      this.dom.scoreVal.textContent = String(this.score);

      if (this.inputIndex >= round.pattern.length) {
        this.mode = 'transition';
        this.setBilahInteractive(false);
        this.dom.btnReplay.disabled = true;

        saronAudio.playGongAccent();
        this.pulseGamelanBackdrop();
        this.bounceGuide();
        this.setGuideMessage('Tepat Sekali!', round.successMsg);

        this.schedule(() => {
          if (!this.isActive) return;
          if (this.roundIndex + 1 < REK_AYO_REK_ROUNDS.length) {
            this.beginRound(this.roundIndex + 1);
          } else {
            this.handleVictory();
          }
        }, 1350);
      }
    } else {
      // Salah urutan: tidak langsung kalah, beri umpan balik lembut & putar ulang
      this.mode = 'transition';
      this.streak = 0;
      this.setBilahInteractive(false);
      this.dom.btnReplay.disabled = true;

      saronAudio.playMissFeedback();
      const wrongEl = this.dom.bilahEls[bilahIndex];
      if (wrongEl) {
        wrongEl.classList.add('is-wrong');
        this.schedule(() => wrongEl.classList.remove('is-wrong'), 420);
      }

      this.setGuideMessage(
        'Hampir Tepat',
        'Tidak apa-apa! Yuk dengarkan ulang pola nadanya sekali lagi.'
      );

      this.schedule(() => {
        if (this.isActive) this.playRoundDemo();
      }, 1150);
    }
  },

  handleVictory() {
    this.mode = 'won';
    this.clearTimers();
    this.setBilahInteractive(false);
    saronAudio.playGongAccent();
    this.pulseGamelanBackdrop();

    this.dom.victoryDesc.textContent =
      `Luar biasa! Kamu menyelesaikan seluruh 4 babak "Rek Ayo Rek" dengan skor ${this.score}.`;
    this.dom.victoryOverlay.hidden = false;

    if (window.gsap && !appState.get('reducedMotion')) {
      const card = this.dom.victoryOverlay.querySelector('.sm-victory-card');
      window.gsap.fromTo(
        card,
        { scale: 0.88, y: 18, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.48, ease: 'back.out(1.4)' }
      );
    }
  },

  toggleFreeplay() {
    if (this.mode === 'freeplay') {
      this.resetToIdle();
    } else {
      this.enterFreeplay();
    }
  },

  enterFreeplay() {
    this.clearTimers();
    this.mode = 'freeplay';
    this.setBilahInteractive(true);
    this.dom.btnReplay.hidden = true;
    this.dom.btnStart.textContent = 'Mulai Permainan';
    this.dom.btnFreeplay.textContent = 'Keluar Mode Bebas';
    this.dom.roundLabel.textContent = 'Mode Bebas — Eksplorasi Saron';
    this.dom.lyricText.textContent = 'Ketuk bilah 1–6 sesuka hati untuk merangkai melodimu sendiri!';
    this.dom.patternDots.innerHTML = '';
    this.setGuideMessage(
      'Mode Bebas',
      'Silakan tabuh bilah Saron sesukamu! Gunakan jari atau tombol <strong>1–6</strong>.'
    );
  },

  /* =========================================================
     ANIMASI PUKULAN BILAH, TABUH GSAP & VISUAL FEEDBACK
     ========================================================= */
  strikeBilah(bilahIndex, isDemo) {
    const bilahEl = this.dom.bilahEls[bilahIndex];
    if (!bilahEl) return;

    saronAudio.playNote(bilahIndex, isDemo ? 0.92 : 1.0);

    // Nyala bilah + cincin gelombang emas (pengganti nota_emas)
    bilahEl.classList.remove('is-lit');
    void bilahEl.offsetWidth; // restart animasi ripple
    bilahEl.classList.add('is-lit');

    this.schedule(() => {
      bilahEl.classList.remove('is-lit');
    }, isDemo ? 380 : 320);

    const gsap = window.gsap;
    if (gsap && !appState.get('reducedMotion')) {
      gsap.fromTo(
        bilahEl,
        { y: 0, scale: 1 },
        { y: 4, scale: 0.96, duration: 0.08, yoyo: true, repeat: 1, ease: 'power2.out' }
      );
      this.animateMalletTo(bilahEl);
    }
  },

  animateMalletTo(bilahEl) {
    const gsap = window.gsap;
    const tabuh = this.dom.tabuh;
    if (!gsap || !tabuh || tabuh.hidden) return;

    const bodyRect = this.dom.bilahRack.parentElement.getBoundingClientRect();
    const bilahRect = bilahEl.getBoundingClientRect();

    const targetX = bilahRect.left + bilahRect.width * 0.5 - bodyRect.left;
    const targetY = bilahRect.top + bilahRect.height * 0.28 - bodyRect.top;

    if (this.malletTween) this.malletTween.kill();

    this.malletTween = gsap.timeline();
    this.malletTween
      .to(tabuh, {
        left: targetX,
        top: targetY,
        opacity: 1,
        rotation: -24,
        scale: 1,
        duration: 0.11,
        ease: 'power2.out',
        force3D: true,
      })
      .to(tabuh, {
        rotation: 12,
        y: 8,
        duration: 0.07,
        ease: 'power3.in',
        force3D: true,
      })
      .to(tabuh, {
        rotation: -14,
        y: -4,
        duration: 0.16,
        ease: 'power2.out',
        force3D: true,
      });
  },

  pulseGamelanBackdrop() {
    if (!window.gsap || appState.get('reducedMotion') || !this.dom.gamelanBackdrop) return;
    window.gsap.fromTo(
      this.dom.gamelanBackdrop,
      { scale: 1, filter: 'brightness(1)' },
      { scale: 1.03, filter: 'brightness(1.22)', duration: 0.25, yoyo: true, repeat: 1, ease: 'sine.inOut' }
    );
  },

  bounceGuide() {
    if (!window.gsap || appState.get('reducedMotion') || !this.dom.pengrawitImg) return;
    window.gsap.fromTo(
      this.dom.pengrawitImg,
      { y: 0 },
      { y: -8, duration: 0.22, yoyo: true, repeat: 1, ease: 'power2.out' }
    );
  },

  /* =========================================================
     ATMOSFER AMBIENT (LENTERA, PARTIKEL, PENGRAWIT IDLE)
     ========================================================= */
  startAmbientMotion() {
    this.killAnimations();
    const gsap = window.gsap;
    if (!gsap || appState.get('reducedMotion')) return;

    if (this.dom.lanternLeft && !this.dom.lanternLeft.hidden) {
      this.ambientTweens.push(
        gsap.to(this.dom.lanternLeft, {
          rotation: 2.2, duration: 3.6, repeat: -1, yoyo: true, ease: 'sine.inOut',
        })
      );
    }
    if (this.dom.lanternRight && !this.dom.lanternRight.hidden) {
      this.ambientTweens.push(
        gsap.to(this.dom.lanternRight, {
          rotation: -2.4, duration: 4.1, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.5,
        })
      );
    }
    if (this.dom.pengrawitImg && !this.dom.pengrawitImg.hidden) {
      this.ambientTweens.push(
        gsap.to(this.dom.pengrawitImg, {
          y: -5, duration: 3.1, repeat: -1, yoyo: true, ease: 'sine.inOut',
        })
      );
    }

    // Partikel emas melayang hangat
    const layer = this.dom.particles;
    layer.innerHTML = '';
    const pUrl = getAsset(MUSIK_ASSETS.magicalParticles);
    for (let i = 0; i < 10; i += 1) {
      const dot = document.createElement('span');
      dot.className = pUrl ? 'sm-sparkle has-img' : 'sm-sparkle';
      if (pUrl) dot.style.backgroundImage = `url("${pUrl}")`;

      gsap.set(dot, {
        left: `${gsap.utils.random(8, 92)}%`,
        top: `${gsap.utils.random(12, 82)}%`,
        scale: gsap.utils.random(0.45, 1.05),
        opacity: 0,
      });
      layer.appendChild(dot);

      this.ambientTweens.push(
        gsap.to(dot, {
          y: gsap.utils.random(-32, -12),
          x: gsap.utils.random(-14, 14),
          opacity: gsap.utils.random(0.22, 0.65),
          duration: gsap.utils.random(3.8, 6.4),
          delay: gsap.utils.random(0, 2.5),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      );
    }
  },

  /* =========================================================
     UTILITAS UI, KEYBOARD & PEMBERSIHAN
     ========================================================= */
  setGuideMessage(tag, htmlMsg) {
    this.dom.turnTag.textContent = tag;
    this.dom.guideMsg.innerHTML = htmlMsg;
    this.dom.speechBubble.classList.toggle('is-player-turn', this.mode === 'player');
  },

  setBilahInteractive(enabled) {
    this.dom.bilahRack.classList.toggle('is-interactive', enabled);
  },

  renderPatternDots(total, doneCount) {
    this.dom.patternDots.innerHTML = Array.from({ length: total }, (_, i) => {
      const cls = i < doneCount ? 'sm-pdot is-done' : 'sm-pdot';
      return `<span class="${cls}" data-dot="${i}"></span>`;
    }).join('');
  },

  highlightDot(index, className) {
    const dot = this.dom.patternDots.querySelector(`[data-dot="${index}"]`);
    if (!dot) return;
    dot.classList.add(className);
    if (className === 'is-demo') {
      this.schedule(() => dot.classList.remove('is-demo'), 360);
    }
  },

  handleKeyDown(e) {
    if (!this.isActive) return;
    const modal = document.getElementById('tutorial-modal');
    if (modal && !modal.hidden) return;

    const map = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, a: 0, s: 1, d: 2, f: 3, g: 4, h: 5 };
    const key = e.key.toLowerCase();
    if (key in map) {
      e.preventDefault();
      this.handlePlayerTap(map[key]);
    }
  },

  schedule(fn, delay) {
    const id = setTimeout(() => {
      this.timers.delete(id);
      fn();
    }, delay);
    this.timers.add(id);
    return id;
  },

  clearTimers() {
    this.timers.forEach((id) => clearTimeout(id));
    this.timers.clear();
  },

  killAnimations() {
    if (this.malletTween) {
      this.malletTween.kill();
      this.malletTween = null;
    }
    this.ambientTweens.forEach((tw) => tw.kill());
    this.ambientTweens = [];
  },
};