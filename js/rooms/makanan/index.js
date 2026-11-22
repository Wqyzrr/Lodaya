/**
 * js/rooms/makanan/index.js
 * Ruang IV — Seni Makanan: Dapur Tradisional Jawa Timur
 * (Rawon, Proll Tape, Wedang Angsle).
 */
import { RECIPES } from './recipes.js';
import { CookingEngine } from './cooking-engine.js';

export const makananRoom = {
  id: 'makanan',
  title: 'Seni Makanan — Dapur Jawa Timur',
  tutorial: {
    eyebrow: 'Ruang IV — Seni Makanan',
    title: 'Panduan Dapur Tradisional Jawa Timur',
    steps: [
      {
        heading: 'Pilih Satu dari Tiga Hidangan',
        text: 'Pilih Rawon, Proll Tape, atau Wedang Angsle untuk mulai memasak secara terpandu.',
      },
      {
        heading: 'Ikuti Petunjuk di Bagian Atas',
        text: 'Setiap langkah menampilkan petunjuk jelas dan menyorot bahan yang perlu diketuk atau diseret ke wadah masak.',
      },
      {
        heading: 'Ulangi Petunjuk Kapan Saja',
        text: 'Ketuk tombol "Ulangi Petunjuk" atau "Ganti Hidangan" di kanan atas bila Anda membutuhkan bantuan.',
      },
    ],
  },

  init(mountEl, ctx) {
    this.mountEl = mountEl;
    this.ctx = ctx;

    this.mountEl.innerHTML = `
      <div class="makanan-shell">
        <div class="makanan-topbar">
          <div class="makanan-title-group">
            <span class="makanan-tag">Ruang IV &bull; Seni Makanan</span>
            <h2 id="makanan-room-heading">Dapur Tradisional Jawa Timur</h2>
          </div>
          <div class="makanan-topbar-actions">
            <button type="button" class="btn-kitchen-subtle" id="btn-kitchen-repeat" hidden>Ulangi Petunjuk</button>
            <button type="button" class="btn-kitchen-subtle" id="btn-kitchen-dishes" hidden>Ganti Hidangan</button>
          </div>
        </div>

        <!-- Tampilan 1: Pilih Hidangan -->
        <div class="dish-selector-view" id="dish-selector-view">
          <p class="dish-selector-intro">Pilih salah satu hidangan khas Jawa Timur di bawah ini untuk mencoba memasaknya langkah demi langkah.</p>
          <div class="dish-grid" id="dish-grid"></div>
        </div>

        <!-- Tampilan 2: Meja Memasak Aktif -->
        <div class="kitchen-work-view" id="kitchen-work-view" hidden>
          <div class="kitchen-guide-banner">
            <div>
              <span class="guide-step-badge" id="guide-step-badge">Langkah 1</span>
              <p class="guide-instruction-text" id="guide-instruction-text"></p>
            </div>
            <div class="guide-progress-bar">
              <span id="guide-progress-text">Langkah 1 / 5</span>
              <div class="guide-progress-track">
                <div class="guide-progress-fill" id="guide-progress-fill"></div>
              </div>
            </div>
          </div>

          <div class="kitchen-bench">
            <div class="kitchen-panel">
              <h3 class="kitchen-panel-title" id="kitchen-tray-title">Bahan-Bahan</h3>
              <div class="ingredient-tray" id="ingredient-tray"></div>
            </div>

            <div class="kitchen-panel">
              <h3 class="kitchen-panel-title">Wadah Memasak</h3>
              <div class="vessel-station" id="vessel-station">
                <div class="vessel-svg-box" id="vessel-svg-box"></div>
                <div class="vessel-label" id="vessel-label"></div>
                <div class="vessel-status" id="vessel-status"></div>
                <button type="button" class="btn-kitchen-action" id="btn-kitchen-action" hidden></button>
              </div>
            </div>

            <div class="kitchen-toast" id="kitchen-toast" role="status" aria-live="polite"></div>
          </div>
        </div>

        <!-- Tampilan 3: Selesai Memasak -->
        <div class="kitchen-complete-view" id="kitchen-complete-view" hidden>
          <div class="complete-card">
            <div class="complete-svg" id="complete-svg"></div>
            <h3 id="complete-title">Hidangan Siap Disajikan!</h3>
            <p id="complete-desc"></p>
            <div class="complete-actions">
              <button type="button" class="btn-kitchen-action" id="btn-cook-another">Masak Hidangan Lain</button>
              <button type="button" class="btn-kitchen-subtle" id="btn-complete-home">Kembali ke Joglo</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.headingEl = this.mountEl.querySelector('#makanan-room-heading');
    this.selectorView = this.mountEl.querySelector('#dish-selector-view');
    this.workView = this.mountEl.querySelector('#kitchen-work-view');
    this.completeView = this.mountEl.querySelector('#kitchen-complete-view');
    this.dishGrid = this.mountEl.querySelector('#dish-grid');
    this.btnRepeat = this.mountEl.querySelector('#btn-kitchen-repeat');
    this.btnDishes = this.mountEl.querySelector('#btn-kitchen-dishes');

    this.engine = new CookingEngine(
      {
        stepBadgeEl: this.mountEl.querySelector('#guide-step-badge'),
        instructionEl: this.mountEl.querySelector('#guide-instruction-text'),
        progressTextEl: this.mountEl.querySelector('#guide-progress-text'),
        progressFillEl: this.mountEl.querySelector('#guide-progress-fill'),
        trayTitleEl: this.mountEl.querySelector('#kitchen-tray-title'),
        trayEl: this.mountEl.querySelector('#ingredient-tray'),
        vesselStationEl: this.mountEl.querySelector('#vessel-station'),
        vesselSvgEl: this.mountEl.querySelector('#vessel-svg-box'),
        vesselLabelEl: this.mountEl.querySelector('#vessel-label'),
        vesselStatusEl: this.mountEl.querySelector('#vessel-status'),
        actionBtn: this.mountEl.querySelector('#btn-kitchen-action'),
        toastEl: this.mountEl.querySelector('#kitchen-toast'),
      },
      {
        onComplete: (recipe) => this.showCompletion(recipe),
      }
    );

    this.renderDishCards();

    this.btnRepeat.addEventListener('click', () => this.engine.repeatInstruction());
    this.btnDishes.addEventListener('click', () => this.showDishSelection());
    this.mountEl.querySelector('#btn-cook-another').addEventListener('click', () => this.showDishSelection());
    this.mountEl.querySelector('#btn-complete-home').addEventListener('click', () => {
      if (this.ctx.returnToLanding) this.ctx.returnToLanding();
    });
  },

  renderDishCards() {
    this.dishGrid.innerHTML = '';
    RECIPES.forEach((recipe) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'dish-card';
      card.innerHTML = `
        <div class="dish-svg-wrap" aria-hidden="true">${recipe.svg}</div>
        <span class="dish-origin">${recipe.origin}</span>
        <h3>${recipe.name}</h3>
        <p>${recipe.shortDesc}</p>
        <span class="dish-card-cta">Mulai Memasak</span>
      `;
      card.addEventListener('click', () => this.startDish(recipe));
      this.dishGrid.appendChild(card);
    });
  },

  showDishSelection() {
    this.engine.destroy();
    this.headingEl.textContent = 'Dapur Tradisional Jawa Timur';
    this.selectorView.hidden = false;
    this.workView.hidden = true;
    this.completeView.hidden = true;
    this.btnRepeat.hidden = true;
    this.btnDishes.hidden = true;
  },

  startDish(recipe) {
    this.headingEl.textContent = `Memasak ${recipe.name}`;
    this.selectorView.hidden = true;
    this.workView.hidden = false;
    this.completeView.hidden = true;
    this.btnRepeat.hidden = false;
    this.btnDishes.hidden = false;
    this.engine.startRecipe(recipe);
  },

  showCompletion(recipe) {
    this.workView.hidden = true;
    this.completeView.hidden = false;
    this.btnRepeat.hidden = true;
    this.btnDishes.hidden = false;

    this.mountEl.querySelector('#complete-svg').innerHTML = recipe.svg;
    this.mountEl.querySelector('#complete-title').textContent = `${recipe.name} Siap Disajikan!`;
    this.mountEl.querySelector('#complete-desc').textContent = recipe.culturalDesc;
  },

  enter() {
    this.showDishSelection();
  },

  exit() {
    this.engine.destroy();
  },

  resize() {},
};
