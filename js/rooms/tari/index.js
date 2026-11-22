/**
 * js/rooms/tari/index.js
 * Ruang II — Seni Tari: Panggung Interaktif Tari Gandrung Banyuwangi.
 */
import { DANCER_ASSET_CONFIG, GANDRUNG_ACTIONS } from './dance-actions.js';
import { StageMovementController } from './movement.js';
import { appState } from '../../core/state-manager.js';

export const tariRoom = {
  id: 'tari',
  title: 'Seni Tari — Tari Gandrung Banyuwangi',
  tutorial: {
    eyebrow: 'Ruang II — Seni Tari',
    title: 'Panduan Panggung Tari Gandrung Banyuwangi',
    steps: [
      {
        heading: 'Gerakkan Penari di Panggung',
        text: 'Gunakan joystick virtual di pojok kiri bawah panggung (ponsel/layar sentuh) atau tombol Panah / WASD di keyboard komputer.',
      },
      {
        heading: 'Tampilkan Ragam Gerak Gandrung',
        text: 'Ketuk tombol gerak tari di bawah panggung seperti Sembah Jejer, Ayunan Kipas, Kibasan Sampur, atau Putaran Paju.',
      },
      {
        heading: 'Kembali ke Sikap Siap',
        text: 'Ketuk tombol "Sikap Siap" untuk mengembalikan penari ke pose netral, dan gunakan tombol musik di kanan atas untuk memutar atau menjeda iringan.',
      },
    ],
  },

  init(mountEl, ctx) {
    this.mountEl = mountEl;
    this.ctx = ctx;
    this.activeActionTl = null;
    this.idleTl = null;
    this.musicPlaying = false;

    const dancerSrc = ctx.loadingManager.getAssetUrl(DANCER_ASSET_CONFIG.assetKey);
    const lanternSrc = ctx.loadingManager.getAssetUrl('lentera');

    this.mountEl.innerHTML = `
      <div class="tari-shell">
        <div class="tari-header">
          <div class="tari-title-group">
            <span class="tari-tag">Ruang II &bull; Seni Tari</span>
            <h2>Tari Gandrung Banyuwangi</h2>
          </div>
          <div class="tari-music-bar">
            <button type="button" class="btn-tari-audio" id="btn-tari-music">Putar Iringan Gandrung</button>
          </div>
        </div>

        <div class="tari-stage-wrap" id="tari-stage">
          <div class="stage-spotlight" aria-hidden="true"></div>
          <div class="stage-backdrop-arch" aria-hidden="true"></div>
          <img src="${lanternSrc}" alt="" class="stage-lantern left" aria-hidden="true" draggable="false" />
          <img src="${lanternSrc}" alt="" class="stage-lantern right" aria-hidden="true" draggable="false" />
          <div class="stage-floor" aria-hidden="true"></div>

          <div class="tari-pose-banner" id="tari-pose-banner">
            <strong>Sikap Siap</strong> &mdash; Gerakkan penari atau pilih ragam gerak di bawah
          </div>

          <div class="dancer-rig" id="dancer-rig">
            <div class="dancer-shadow" aria-hidden="true"></div>
            <div class="dancer-body" id="dancer-body">
              <div class="dancer-sampur" id="dancer-sampur" aria-hidden="true"></div>
              <img src="${dancerSrc}" alt="${DANCER_ASSET_CONFIG.altText}" class="dancer-img" draggable="false" />
              <div class="dancer-fan" id="dancer-fan" aria-hidden="true"></div>
            </div>
          </div>

          <div class="joystick-zone">
            <div class="joystick-base" id="tari-joystick-base" aria-label="Joystick gerak penari">
              <div class="joystick-knob" id="tari-joystick-knob"></div>
            </div>
            <span class="joystick-caption">Geser / WASD</span>
          </div>
        </div>

        <div class="tari-actions-bar" id="tari-actions-bar"></div>
      </div>
    `;

    this.stageEl = this.mountEl.querySelector('#tari-stage');
    this.rigEl = this.mountEl.querySelector('#dancer-rig');
    this.bodyEl = this.mountEl.querySelector('#dancer-body');
    this.fanEl = this.mountEl.querySelector('#dancer-fan');
    this.sampurEl = this.mountEl.querySelector('#dancer-sampur');
    this.bannerEl = this.mountEl.querySelector('#tari-pose-banner');
    this.actionsBar = this.mountEl.querySelector('#tari-actions-bar');
    this.btnMusic = this.mountEl.querySelector('#btn-tari-music');

    this.dancerEls = {
      body: this.bodyEl,
      fan: this.fanEl,
      sampur: this.sampurEl,
    };

    this.movement = new StageMovementController(
      this.stageEl,
      this.rigEl,
      this.mountEl.querySelector('#tari-joystick-base'),
      this.mountEl.querySelector('#tari-joystick-knob'),
      (isMoving, facing) => this.handleMoveState(isMoving, facing)
    );

    this.buildActionButtons();
    this.btnMusic.addEventListener('click', () => this.toggleMusic());
  },

  buildActionButtons() {
    this.actionsBar.innerHTML = '';
    GANDRUNG_ACTIONS.forEach((action) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-dance-action';
      btn.dataset.actionId = action.id;
      btn.textContent = action.label;
      btn.addEventListener('click', () => this.triggerDanceAction(action, btn));
      this.actionsBar.appendChild(btn);
    });
  },

  startIdleBreathing() {
    if (appState.get('reducedMotion') || !window.gsap) return;
    if (this.idleTl) this.idleTl.kill();
    this.idleTl = window.gsap.to(this.bodyEl, {
      y: -3,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  },

  handleMoveState(isMoving, facing) {
    if (!window.gsap) return;
    window.gsap.to(this.bodyEl, {
      scaleX: facing,
      duration: 0.2,
      ease: 'power2.out',
      overwrite: 'auto',
    });

    if (isMoving) {
      if (this.activeActionTl && this.activeActionTl.isActive()) return;
      if (this.idleTl) this.idleTl.pause();
      if (!appState.get('reducedMotion')) {
        window.gsap.to(this.bodyEl, {
          rotation: facing * 3,
          duration: 0.22,
          overwrite: 'auto',
        });
      }
    } else {
      window.gsap.to(this.bodyEl, { rotation: 0, duration: 0.22, overwrite: 'auto' });
      if (this.idleTl) this.idleTl.resume();
    }
  },

  triggerDanceAction(action, activeBtn) {
    if (!window.gsap) return;
    if (this.activeActionTl) {
      this.activeActionTl.kill();
      this.activeActionTl = null;
    }
    if (this.idleTl) this.idleTl.pause();

    this.actionsBar.querySelectorAll('.btn-dance-action').forEach((b) => {
      b.classList.toggle('is-active', b === activeBtn && action.id !== 'netral');
    });

    this.bannerEl.innerHTML = `<strong>${action.label}</strong> &mdash; ${action.description}`;

    this.activeActionTl = action.play(this.dancerEls, window.gsap);
    if (this.activeActionTl && typeof this.activeActionTl.eventCallback === 'function') {
      this.activeActionTl.eventCallback('onComplete', () => {
        if (this.idleTl) this.idleTl.resume();
      });
    }
  },

  async toggleMusic() {
    const audio = this.ctx.audioManager;
    if (!audio.isTrackAvailable('tari')) {
      this.btnMusic.textContent = 'Audio Gandrung Belum Tersedia';
      return;
    }
    const el = audio.getTrackElement('tari');
    if (this.musicPlaying && el && !el.paused) {
      el.pause();
      this.musicPlaying = false;
      this.btnMusic.textContent = 'Putar Iringan Gandrung';
    } else {
      const ok = await audio.playRoomTrack('tari', { loop: true });
      this.musicPlaying = ok;
      this.btnMusic.textContent = ok ? 'Jeda Iringan Gandrung' : 'Audio Gandrung Belum Tersedia';
    }
  },

  async enter() {
    this.movement.start();
    this.startIdleBreathing();
    const ok = await this.ctx.audioManager.playRoomTrack('tari', { loop: true });
    this.musicPlaying = ok;
    this.btnMusic.textContent = ok ? 'Jeda Iringan Gandrung' : 'Audio Gandrung Belum Tersedia';
  },

  exit() {
    this.movement.stop();
    if (this.activeActionTl) {
      this.activeActionTl.kill();
      this.activeActionTl = null;
    }
    if (this.idleTl) {
      this.idleTl.kill();
      this.idleTl = null;
    }
    this.musicPlaying = false;
  },

  resize() {
    this.movement.recalculateBounds(false);
  },
};
