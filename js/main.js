/**
 * js/main.js
 * Titik masuk utama aplikasi modular Pesona Jawa Timur.
 */
import { appState } from './core/state-manager.js';
import { loadingManager } from './core/loading-manager.js';
import { audioManager } from './core/audio-manager.js';
import { orientationManager } from './core/orientation-manager.js';
import { transitionManager } from './core/transition-manager.js';
import { navigation } from './core/navigation.js';

import { gyroscopeSystem } from './systems/gyroscope.js';
import { parallaxSystem } from './systems/parallax.js';
import { tutorialManager } from './systems/tutorial-manager.js';

import { peranRoom } from './rooms/peran/index.js';
import { tariRoom } from './rooms/tari/index.js';
import { musikRoom } from './rooms/musik/index.js';
import { makananRoom } from './rooms/makanan/index.js';

async function bootstrap() {
  // 1. Inisialisasi sistem inti & pengaman orientasi
  orientationManager.init();
  audioManager.init();
  tutorialManager.init();

  // 2. Daftarkan 4 ruangan independen
  navigation.registerRoom(peranRoom);
  navigation.registerRoom(tariRoom);
  navigation.registerRoom(musikRoom);
  navigation.registerRoom(makananRoom);
  navigation.init();

  // 3. Muat aset esensial halaman utama (Tier 1) secara jujur
  await loadingManager.loadLandingAssets();
  appState.set('landingReady', true);

  // 4. Aktifkan sistem gerak & transisi setelah aset utama siap
  gyroscopeSystem.init();
  parallaxSystem.init();
  transitionManager.init();

  // 5. Sembunyikan layar pemuatan untuk menampakkan tirai pembuka
  loadingManager.hideLandingLoader();
}

document.addEventListener('DOMContentLoaded', bootstrap);
