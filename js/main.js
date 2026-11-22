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

  // 2. Jalankan animasi opening kipas batik SEGERA (tidak menunggu loading selesai)
  transitionManager.init();

  // 3. Daftarkan 4 ruangan independen
  navigation.registerRoom(peranRoom);
  navigation.registerRoom(tariRoom);
  navigation.registerRoom(musikRoom);
  navigation.registerRoom(makananRoom);
  navigation.init();

  // 4. Muat aset esensial halaman utama sambil animasi opening berjalan
  await loadingManager.loadLandingAssets();
  appState.set('landingReady', true);

  // 5. Aktifkan sistem gerak parallax & gyroscope
  gyroscopeSystem.init();
  parallaxSystem.init();

  // 6. Tampilkan tombol "Ketuk Layar untuk Masuk"
  loadingManager.hideLandingLoader();
}

document.addEventListener('DOMContentLoaded', bootstrap);