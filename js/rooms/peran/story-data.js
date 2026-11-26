/**
 * js/rooms/peran/story-data.js
 * Data narasi, registri aset, dan konfigurasi panduan
 * untuk Buku Cerita Interaktif: "Rahasia di Balik Topeng Reog".
 */

const ASSET_BASE = 'assets/seniperan/';
export const TOTAL_STORY_IMAGES = 28;

export const STORY_META = {
  title: 'DONGENG<br>REOG PONOROGO',
  subtitle: '',
  eyebrow: 'Ruang I • Seni Peran Jawa Timur',
  openCta: 'Buka Buku',
  audioTrackKey: 'peran',
};

/**
 * Registri aset di assets/seniperan/.
 * Menggunakan nama dasar tanpa ekstensi agar pemuat aset dapat mencoba
 * .webp terlebih dahulu lalu fallback otomatis ke .png / .jpg.
 */
export const STORY_ASSETS = {
  bookCover: `${ASSET_BASE}book_cover`,
  paperTexture: `${ASSET_BASE}paper_texture`,
  paperCorner: `${ASSET_BASE}paper_corner`,
  batikDecorations: `${ASSET_BASE}batik_decorations`,
  flowerDecorations: `${ASSET_BASE}flower_decorations`,
  magicalParticles: `${ASSET_BASE}magical_particles`,
  characters: {
    boy: {
      basePath: `${ASSET_BASE}boy`,
      alt: 'Bima, anak desa yang penuh rasa ingin tahu',
    },
    singo_barong: {
      basePath: `${ASSET_BASE}singo_barong`,
      alt: 'Singo Barong dengan mahkota Dadak Merak',
    },
    bujang_ganong: {
      basePath: `${ASSET_BASE}bujang_ganong`,
      alt: 'Bujang Ganong yang lincah dan cerdik',
    },
    jathil: {
      basePath: `${ASSET_BASE}jathil`,
      alt: 'Penari Jathil berkuda kepang',
    },
    warok: {
      basePath: `${ASSET_BASE}warok`,
      alt: 'Warok Ponorogo yang berwibawa',
    },
  },
};

/**
 * 14 spread berpasangan dari cerita-1 s.d. cerita-28:
 * Spread 1: cerita-1 (kiri) + cerita-2 (kanan)
 * Spread 2: cerita-3 (kiri) + cerita-4 (kanan)
 * ...
 * Spread 14: cerita-27 (kiri) + cerita-28 (kanan)
 */
export const STORY_PAGES = Array.from({ length: TOTAL_STORY_IMAGES / 2 }, (_, idx) => {
  const leftNum = idx * 2 + 1;
  const rightNum = leftNum + 1;
  return {
    id: `spread-${idx + 1}`,
    spreadNumber: idx + 1,
    leftPageNumber: leftNum,
    rightPageNumber: rightNum,
    leftBasePath: `${ASSET_BASE}cerita-${leftNum}`,
    rightBasePath: `${ASSET_BASE}cerita-${rightNum}`,
    leftAlt: `Halaman cerita ${leftNum} Rahasia di Balik Topeng Reog`,
    rightAlt: `Halaman cerita ${rightNum} Rahasia di Balik Topeng Reog`,
  };
});

export const STORY_CLOSING = {
  eyebrow: 'Tamat • Akhir Kisah',
  title: 'Rahasia Sejati Telah Ditemukan',
  message:
    'Di balik megahnya topeng Singo Barong, tersimpan keberanian, kebijaksanaan, dan semangat gotong royong masyarakat Ponorogo. Terima kasih telah membaca bersama Bima.',
  note: 'Anda dapat menutup buku ini untuk kembali ke Rumah Joglo atau mengulang cerita dari halaman pertama.',
};

export const PERAN_TUTORIAL = {
  eyebrow: 'Panduan Buku Cerita',
  title: 'Cara Membaca Rahasia di Balik Topeng Reog',
  steps: [
    {
      heading: 'Buka Sampul Buku',
      text: 'Ketuk tombol "Buka Buku" atau geser sampul ke kiri untuk membuka buku cerita bergambar.',
    },
    {
      heading: 'Balik Halaman Secara Alami',
      text: 'Geser layar ke kiri/kanan, tarik sudut halaman dengan mouse, gunakan tombol panah di bawah buku, atau tekan tombol panah keyboard.',
    },
    {
      heading: 'Nikmati Musik Latar',
      text: 'Gunakan kontrol suara di kanan atas untuk mengatur volume atau mematikan musik pengiring cerita.',
    },
  ],
};