# Pesona Jawa Timur - XII-INTERNATIONAL 4

Website pameran budaya Jawa Timur berbasis **HTML5, CSS3, Vanilla JavaScript (ES6 Modules), dan GSAP 3.12.5**, dirancang khusus untuk **mobile landscape** (dengan dukungan desktop) dan aksesibel bagi seluruh pengunjung termasuk guru, tamu undangan, serta pengunjung usia 40–50+.

---

## Cara Menjalankan Proyek

Proyek menggunakan ES6 Modules (`<script type="module">`), jalankan melalui server lokal (jangan membuka `index.html` langsung dengan `file://`):

```bash
# Opsi 1: Python
python -m http.server 8080

# Opsi 2: Node.js
melalui Live Server Extension VS Code
```

Lalu buka `http://localhost:8080` di browser.

---

## Struktur Arsitektur Modular

```text
pesona-jawa-timur-landing/
├── assets/
│   ├── [16 aset gambar asli tetap utuh]
│   ├── optimized/          # (Opsional) hasil konversi WebP dari scripts/optimize-assets.mjs
│   └── audio/              # Tempat meletakkan 4 berkas MP3
│       ├── ambient-jatim.mp3
│       ├── reog-story.mp3
│       ├── gandrung-banyuwangi.mp3
│       └── rek-ayo-rek.mp3
├── css/
│   ├── style.css           # Tema global, Joglo, grounding, plakat pintu, HUD
│   ├── components/
│   │   ├── loading.css     # Layar pemuatan progresif jujur
│   │   └── tutorial.css    # Modal panduan universal
│   └── rooms/
│       ├── peran.css       # Gaya Buku Cerita Reog Ponorogo
│       ├── tari.css        # Gaya Panggung Tari Gandrung Banyuwangi
│       ├── musik.css       # Gaya Piano Tiles Rek Ayo Rek
│       └── makanan.css     # Gaya Dapur Tradisional Jawa Timur
├── js/
│   ├── main.js             # Bootstrap aplikasi
│   ├── core/
│   │   ├── state-manager.js
│   │   ├── loading-manager.js
│   │   ├── audio-manager.js
│   │   ├── orientation-manager.js
│   │   ├── transition-manager.js
│   │   └── navigation.js
│   ├── systems/
│   │   ├── gyroscope.js
│   │   ├── parallax.js
│   │   └── tutorial-manager.js
│   └── rooms/
│       ├── peran/   (index.js, story-data.js)
│       ├── tari/    (index.js, movement.js, dance-actions.js)
│       ├── musik/   (index.js, piano-tiles.js, song-config.js)
│       └── makanan/ (index.js, cooking-engine.js, recipes.js)
├── scripts/
│   └── optimize-assets.mjs # Konverter PNG/JPG -> WebP tanpa menimpa file asli
└── index.html
```

---

## 1. Lokasi Assets Audio MP3

Letakkan berkas MP3 Anda di folder `assets/audio/` dengan nama berikut:

| Nama Berkas | Kegunaan |
| :--- | :--- |
| `assets/audio/ambient-jatim.mp3` | Musik latar suasana Rumah Joglo (otomatis diputar & diredam saat masuk ruangan) |
| `assets/audio/reog-story.mp3` | Musik latar Ruang I — Seni Peran |
| `assets/audio/gandrung-banyuwangi.mp3` | Musik pengiring Ruang II — Seni Tari |
| `assets/audio/rek-ayo-rek.mp3` | Lagu utama Ruang III — Seni Musik (Piano Tiles) |

Seluruh ruangan tetap berfungsi normal tanpa galat meskipun berkas MP3 belum dimasukkan.

---

## 2. Optimasi Ukuran Aset (51 MB → WebP)

Untuk mempercepat muat di ponsel tanpa menghapus aset PNG asli:

```bash
npm install sharp
node scripts/optimize-assets.mjs
```

Skrip akan menghasilkan versi WebP di `assets/optimized/`. `loading-manager.js` otomatis mendeteksi WebP dan langsung kembali ke PNG/JPG asli bila folder `optimized/` belum ada.

---

## 3. Panduan Modifikasi Tiap Ruangan Secara Independen

* **Menambah/mengubah halaman cerita (Seni Peran):** Sunting array `STORY_PAGES` di `js/rooms/peran/story-data.js`. Setiap objek memiliki `contextType` (`'fact'` atau `'legend'`), `title`, `body`, `note`, `artKeys`, dan `artCaption`.
* **Mengubah gerak tari atau mengganti gambar penari (Seni Tari):** Sunting `DANCER_ASSET_CONFIG` dan array `GANDRUNG_ACTIONS` di `js/rooms/tari/dance-actions.js`.
* **Mengubah peta ketukan lagu Piano Tiles (Seni Musik):** Sunting `bpm`, `offset`, `duration`, dan array `notes` (`{ time, lane }`, dengan `lane` bernilai `0`–`3`) di `js/rooms/musik/song-config.js` agar cocok dengan rekaman `assets/audio/rek-ayo-rek.mp3` Anda.
* **Menambah/mengubah resep masakan (Seni Makanan):** Sunting array `RECIPES` di `js/rooms/makanan/recipes.js`. Setiap langkah mendukung tipe `'tap-select'`, `'drag-drop'`, dan `'action'`.

---

## 4. Laporan Kualitas & Keterbatasan Pengujian

* **Terverifikasi secara statis:** Seluruh impor ES6, ID elemen DOM, tautan CSS, jalur aset, dan struktur modul telah diverifikasi bebas referensi rusak.
* **Keterbatasan lingkungan:** Pengujian perangkat fisik (iOS Safari `DeviceOrientationEvent.requestPermission()`, layar sentuh fisik joystick/drag-and-drop, serta pemutaran berkas MP3 eksternal) tidak dapat dijalankan langsung di lingkungan pembuatan kode ini. Harap lakukan uji langsung pada ponsel landscape kecil (≤390px tinggi), ponsel landscape besar, dan desktop sebelum hari acara.
