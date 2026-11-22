/**
 * loading-manager.js
 * Pemuatan progresif jujur (Tier 1 Landing, Tier 2 per Ruangan)
 * dengan deteksi WebP otomatis (fallback ke aset asli) dan penanganan galat.
 */

export const ASSET_MANIFEST = {
  landing: [
    { key: 'horizon', src: 'assets/horizon.webp', label: 'Menyiapkan langit senja Jawa Timur...' },
    { key: 'siluet', src: 'assets/siluet.webp', label: 'Menyiapkan siluet pegunungan...' },
    { key: 'grounding', src: 'assets/grounding.webp', label: 'Menyiapkan halaman rumah adat...' },
    { key: 'struktur_joglo', src: 'assets/struktur_joglo.webp', label: 'Membangun struktur Rumah Joglo...' },
    { key: 'daun_pintu', src: 'assets/daun_pintu.webp', label: 'Menyiapkan empat pintu pameran...' },
    { key: 'lentera', src: 'assets/lentera.webp', label: 'Menyalakan lentera tradisional...' },
    { key: 'dedaunan1', src: 'assets/dedaunan1.webp', label: 'Menata dedaunan latar depan...' },
    { key: 'dedaunan2', src: 'assets/dedaunan2.webp', label: 'Menyempurnakan suasana Joglo...' },
  ],
  peran: [
    { key: 'reog', src: 'assets/reog.webp', label: 'Menyiapkan ilustrasi Reog Ponorogo...' },
    { key: 'topeng', src: 'assets/topeng.webp', label: 'Menyiapkan ilustrasi Bujang Ganong...' },
    { key: 'kudalumping', src: 'assets/kudalumping.webp', label: 'Menyiapkan ilustrasi Jathilan...' },
    { key: 'kudalumping2', src: 'assets/kudalumping2.webp', label: 'Menyiapkan ilustrasi tarian pendamping...' },
    { key: 'wayang1', src: 'assets/wayang1.webp', label: 'Menyiapkan ornamen cerita...' },
    { key: 'wayang2', src: 'assets/wayang2.webp', label: 'Menyiapkan ornamen halaman...' },
    { key: 'wayang3', src: 'assets/wayang3.webp', label: 'Menyelesaikan buku cerita...' },
  ],
  tari: [
    { key: 'penari', src: 'assets/penari.webp', label: 'Menyiapkan penari Gandrung Banyuwangi...' },
    { key: 'lentera', src: 'assets/lentera.webp', label: 'Menyiapkan tata cahaya panggung...' },
  ],
  musik: [
    { key: 'wayang3', src: 'assets/wayang3.webp', label: 'Menyiapkan ornamen panggung musik...' },
  ],
  makanan: [
    { key: 'lentera', src: 'assets/lentera.webp', label: 'Menyiapkan dapur tradisional...' },
  ],
};

class LoadingManager {
  constructor() {
    this.cache = new Map(); // key -> resolved URL
    this.loadedGroups = new Set();
    this.supportsWebP = null;

    // Elemen UI layar muat awal
    this.screen = document.getElementById('loading-screen');
    this.barFill = document.getElementById('loading-bar-fill');
    this.statusEl = document.getElementById('loading-status');
    this.percentEl = document.getElementById('loading-percent');
    this.errorBox = document.getElementById('loading-error-box');
    this.errorText = document.getElementById('loading-error-text');
    this.btnRetry = document.getElementById('btn-loading-retry');
    this.btnContinue = document.getElementById('btn-loading-continue');

    // Elemen UI pemuat ruangan
    this.roomLoader = document.getElementById('room-loader');
    this.roomLabel = document.getElementById('room-loader-label');
    this.roomFill = document.getElementById('room-loader-fill');
    this.roomPercent = document.getElementById('room-loader-percent');
    this.roomError = document.getElementById('room-loader-error');
    this.btnRoomRetry = document.getElementById('btn-room-retry');
    this.btnRoomContinue = document.getElementById('btn-room-continue');
  }

  async detectWebP() {
    if (this.supportsWebP !== null) return this.supportsWebP;
    this.supportsWebP = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.width > 0 && img.height > 0);
      img.onerror = () => resolve(false);
      img.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
    });
    return this.supportsWebP;
  }

  getAssetUrl(key) {
    if (this.cache.has(key)) return this.cache.get(key);
    for (const group of Object.values(ASSET_MANIFEST)) {
      const found = group.find((item) => item.key === key);
      if (found) return found.src;
    }
    return '';
  }

  loadImageUrl(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Gagal memuat: ${url}`));
      img.src = url;
    });
  }

  async loadSingleAsset(item) {
    if (this.cache.has(item.key)) {
      return { key: item.key, url: this.cache.get(item.key), ok: true };
    }

    const canWebP = await this.detectWebP();
    if (canWebP && item.opt) {
      try {
        const resolved = await this.loadImageUrl(item.opt);
        this.cache.set(item.key, resolved);
        return { key: item.key, url: resolved, ok: true };
      } catch {
        // Fallback diam-diam ke aset asli PNG/JPG
      }
    }

    try {
      const resolved = await this.loadImageUrl(item.src);
      this.cache.set(item.key, resolved);
      return { key: item.key, url: resolved, ok: true };
    } catch {
      return { key: item.key, url: item.src, ok: false };
    }
  }

  applyCachedSourcesToDOM() {
    document.querySelectorAll('img[data-asset-key]').forEach((img) => {
      const key = img.dataset.assetKey;
      const resolved = this.cache.get(key);
      if (resolved && img.getAttribute('src') !== resolved) {
        img.src = resolved;
      }
    });
  }

  async loadLandingAssets() {
    const items = ASSET_MANIFEST.landing;
    const total = items.length;
    let completed = 0;
    const failed = [];

    this.errorBox.hidden = true;
    this.updateLandingUI(0, 'Memeriksa aset pameran...');

    const tasks = items.map((item) =>
      this.loadSingleAsset(item).then((res) => {
        completed += 1;
        if (!res.ok) failed.push(item);
        const pct = Math.round((completed / total) * 100);
        this.updateLandingUI(pct, item.label);
        return res;
      })
    );

    await Promise.all(tasks);
    this.applyCachedSourcesToDOM();

    if (failed.length === 0) {
      this.loadedGroups.add('landing');
      this.updateLandingUI(100, 'Ruang pameran siap dibuka.');
      return true;
    }

    // Tampilkan opsi coba ulang atau lanjutkan bila ada aset gagal
    this.errorText.textContent = `${failed.length} aset gagal dimuat. Anda dapat mencoba ulang atau tetap melanjutkan.`;
    this.errorBox.hidden = false;

    return new Promise((resolve) => {
      const onRetry = () => {
        cleanup();
        this.loadLandingAssets().then(resolve);
      };
      const onContinue = () => {
        cleanup();
        this.loadedGroups.add('landing');
        resolve(true);
      };
      const cleanup = () => {
        this.btnRetry.removeEventListener('click', onRetry);
        this.btnContinue.removeEventListener('click', onContinue);
      };
      this.btnRetry.addEventListener('click', onRetry);
      this.btnContinue.addEventListener('click', onContinue);
    });
  }

  updateLandingUI(percent, message) {
    if (this.barFill) this.barFill.style.width = `${percent}%`;
    if (this.percentEl) this.percentEl.textContent = `${percent}%`;
    if (this.statusEl && message) this.statusEl.textContent = message;
  }

  hideLandingLoader() {
    if (!this.screen) return;
    this.screen.classList.add('is-hidden');
  }

  async loadRoomAssets(roomKey, displayName = 'Ruangan') {
    if (this.loadedGroups.has(roomKey)) return true;
    const items = ASSET_MANIFEST[roomKey] || [];
    if (items.length === 0) {
      this.loadedGroups.add(roomKey);
      return true;
    }

    this.roomLoader.hidden = false;
    this.roomError.hidden = true;
    this.roomLabel.textContent = `Menyiapkan ${displayName}...`;
    this.roomFill.style.width = '0%';
    this.roomPercent.textContent = '0%';

    let completed = 0;
    const failed = [];
    const total = items.length;

    await Promise.all(
      items.map((item) =>
        this.loadSingleAsset(item).then((res) => {
          completed += 1;
          if (!res.ok) failed.push(item);
          const pct = Math.round((completed / total) * 100);
          this.roomFill.style.width = `${pct}%`;
          this.roomPercent.textContent = `${pct}%`;
          return res;
        })
      )
    );

    if (failed.length === 0) {
      this.loadedGroups.add(roomKey);
      this.roomLoader.hidden = true;
      return true;
    }

    this.roomError.hidden = false;
    return new Promise((resolve) => {
      const onRetry = () => {
        cleanup();
        this.loadRoomAssets(roomKey, displayName).then(resolve);
      };
      const onContinue = () => {
        cleanup();
        this.loadedGroups.add(roomKey);
        this.roomLoader.hidden = true;
        resolve(true);
      };
      const cleanup = () => {
        this.btnRoomRetry.removeEventListener('click', onRetry);
        this.btnRoomContinue.removeEventListener('click', onContinue);
      };
      this.btnRoomRetry.addEventListener('click', onRetry);
      this.btnRoomContinue.addEventListener('click', onContinue);
    });
  }
}

export const loadingManager = new LoadingManager();
