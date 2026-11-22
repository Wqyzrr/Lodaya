/**
 * navigation.js
 * Pengarah siklus hidup ruangan (init, enter, exit, resize) serta penghubung
 * pintu Joglo, pemuatan aset ruangan, transisi, audio, dan panduan.
 */
import { appState } from './state-manager.js';
import { loadingManager } from './loading-manager.js';
import { transitionManager } from './transition-manager.js';
import { audioManager } from './audio-manager.js';
import { orientationManager } from './orientation-manager.js';
import { tutorialManager } from '../systems/tutorial-manager.js';

class NavigationController {
  constructor() {
    this.rooms = new Map();
    this.initializedRooms = new Set();
    this.doorUnits = Array.from(document.querySelectorAll('.door-unit'));
    this.btnBack = document.getElementById('btn-back');
  }

  registerRoom(roomModule) {
    if (!roomModule || !roomModule.id) return;
    this.rooms.set(roomModule.id, roomModule);
  }

  init() {
    this.doorUnits.forEach((door) => {
      door.addEventListener('click', () => {
        const targetKey = door.dataset.target;
        this.openRoom(targetKey, door);
      });
    });

    if (this.btnBack) {
      this.btnBack.addEventListener('click', () => {
        this.returnToLanding();
      });
    }

    orientationManager.onLayoutRecalc(() => {
      const current = appState.get('currentScene');
      if (current !== 'landing') {
        const room = this.rooms.get(current);
        if (room && typeof room.resize === 'function') {
          room.resize();
        }
      }
    });
  }

  async openRoom(roomKey, doorUnit) {
    if (appState.get('isTransitioning')) return;
    if (appState.get('currentScene') !== 'landing') return;
    if (!appState.get('curtainOpened')) return;

    const room = this.rooms.get(roomKey);
    const targetSection = document.getElementById(`section-${roomKey}`);
    const mountEl = document.getElementById(`room-mount-${roomKey}`);
    if (!room || !targetSection || !mountEl) return;

    // Kunci input sementara selama pemuatan aset ruangan
    appState.set('isTransitioning', true);
    await loadingManager.loadRoomAssets(roomKey, room.title || 'Ruangan');

    if (!this.initializedRooms.has(roomKey)) {
      if (typeof room.init === 'function') {
        room.init(mountEl, {
          audioManager,
          loadingManager,
          tutorialManager,
          returnToLanding: () => this.returnToLanding(),
        });
      }
      this.initializedRooms.add(roomKey);
    }

    appState.set('currentScene', roomKey);

    await transitionManager.enterRoom(doorUnit, targetSection, () => {
      if (typeof room.enter === 'function') {
        room.enter();
      }
    });

    // Tampilkan panduan ruangan pertama kali & aktifkan tombol Panduan di HUD
    if (room.tutorial) {
      tutorialManager.setRoomTutorial(roomKey, room.tutorial, true);
    }
  }

  async returnToLanding() {
    if (appState.get('isTransitioning')) return;
    const currentKey = appState.get('currentScene');
    if (currentKey === 'landing') return;

    const room = this.rooms.get(currentKey);
    const currentSection = document.getElementById(`section-${currentKey}`);
    if (!currentSection) return;

    tutorialManager.clearRoomTutorial();

    await transitionManager.exitToLanding(currentSection, () => {
      if (room && typeof room.exit === 'function') {
        room.exit();
      }
      audioManager.stopRoomTrack(true);
      appState.set('currentScene', 'landing');
    });
  }
}

export const navigation = new NavigationController();
