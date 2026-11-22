/**
 * tutorial-manager.js
 * Pengelola modal panduan interaktif universal yang dapat dibuka ulang
 * kapan saja melalui tombol "Panduan" di HUD.
 */
class TutorialManager {
  constructor() {
    this.modal = document.getElementById('tutorial-modal');
    this.eyebrowEl = document.getElementById('tutorial-eyebrow');
    this.titleEl = document.getElementById('tutorial-title');
    this.bodyEl = document.getElementById('tutorial-body');
    this.btnClose = document.getElementById('btn-tutorial-close');
    this.btnHelp = document.getElementById('btn-help');

    this.seenRooms = new Set();
    this.currentConfig = null;
  }

  init() {
    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => this.close());
    }
    if (this.modal) {
      this.modal.querySelectorAll('[data-close-tutorial]').forEach((el) => {
        el.addEventListener('click', () => this.close());
      });
    }
    if (this.btnHelp) {
      this.btnHelp.addEventListener('click', () => {
        if (this.currentConfig) this.open(this.currentConfig);
      });
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && !this.modal.hidden) {
        this.close();
      }
    });
  }

  setRoomTutorial(roomKey, config, autoShowFirstTime = true) {
    this.currentConfig = config || null;
    if (this.btnHelp) {
      this.btnHelp.hidden = !this.currentConfig;
    }
    if (this.currentConfig && autoShowFirstTime && !this.seenRooms.has(roomKey)) {
      this.seenRooms.add(roomKey);
      this.open(this.currentConfig);
    }
  }

  clearRoomTutorial() {
    this.currentConfig = null;
    if (this.btnHelp) this.btnHelp.hidden = true;
    this.close();
  }

  open(config) {
    if (!this.modal || !config) return;
    this.eyebrowEl.textContent = config.eyebrow || 'Panduan Ruangan';
    this.titleEl.textContent = config.title || 'Cara Berinteraksi';
    this.bodyEl.innerHTML = '';

    (config.steps || []).forEach((step, idx) => {
      const row = document.createElement('div');
      row.className = 'tutorial-step';
      row.innerHTML = `
        <div class="tutorial-step-num" aria-hidden="true">${idx + 1}</div>
        <div class="tutorial-step-text">
          <h3>${step.heading}</h3>
          <p>${step.text}</p>
        </div>
      `;
      this.bodyEl.appendChild(row);
    });

    this.modal.hidden = false;
  }

  close() {
    if (!this.modal) return;
    this.modal.hidden = true;
  }
}

export const tutorialManager = new TutorialManager();
