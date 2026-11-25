/**
 * js/rooms/musik/song-config.js
 * Konfigurasi aset, pola nada memory game "Rek Ayo Rek", dan panduan ruangan.
 */

const MUSIK_BASE = 'assets/senimusik/';

export const MUSIK_ASSETS = {
  bgPendopo: `${MUSIK_BASE}bg_pendopo_musik`,
  gamelanBackdrop: `${MUSIK_BASE}gamelan_backdrop`,
  karpetTikar: `${MUSIK_BASE}karpet_tikar`,
  saronRancakan: `${MUSIK_BASE}saron_rancakan`,
  saronBilah: `${MUSIK_BASE}saron_bilah`,
  saronBilahGlow: `${MUSIK_BASE}saron_bilah_glow`,
  tabuhSaron: `${MUSIK_BASE}tabuh_saron`,
  pengrawitGuide: `${MUSIK_BASE}pengrawit_guide`,
  papanLirik: `${MUSIK_BASE}papan_lirik`,
  medaliGamelan: `${MUSIK_BASE}medali_gamelan`,
  // Aset existing dari repo yang dipakai ulang
  lentera: 'assets/lentera',
  magicalParticles: 'assets/seniperan/magical_particles',
  paperCorner: 'assets/seniperan/paper_corner',
};

/**
 * 4 Babak Memory Game — Lagu "Rek Ayo Rek" (Surabaya, Jawa Timur)
 * Index bilah: 0(1/C4), 1(2/D4), 2(3/E4), 3(5/G4), 4(6/A4), 5(1̇/C5)
 */
export const REK_AYO_REK_ROUNDS = [
  {
    id: 'babak-1',
    title: 'Babak 1 — Pembuka',
    lyric: '“Rek ayo rek...”',
    pattern: [3, 3, 4, 3],
    tempoMs: 620,
    successMsg: 'Luwes sekali! Nada pembuka sudah kamu kuasai.',
  },
  {
    id: 'babak-2',
    title: 'Babak 2 — Jalan Tunjungan',
    lyric: '“...mlaku-mlaku nang Tunjungan”',
    pattern: [2, 1, 0, 1, 2],
    tempoMs: 560,
    successMsg: 'Mantap! Suasana Jalan Tunjungan makin terasa.',
  },
  {
    id: 'babak-3',
    title: 'Babak 3 — Rame-Rame',
    lyric: '“Rek ayo rek, rame-rame bebarengan”',
    pattern: [3, 4, 5, 4, 3, 2],
    tempoMs: 520,
    successMsg: 'Luar biasa! Irama gamelanmu sangat selaras.',
  },
  {
    id: 'babak-4',
    title: 'Babak 4 — Penutup Meriah',
    lyric: '“Cak ayo cak, dolek kenalan cah ayu!”',
    pattern: [2, 3, 4, 3, 2, 1, 0],
    tempoMs: 490,
    successMsg: 'Sempurna! Kamu resmi menjadi pengrawit Saron!',
  },
];

export const MUSIK_TUTORIAL = {
  eyebrow: 'Panduan Ruang Seni Musik',
  title: 'Cara Bermain Memory Game Saron',
  steps: [
    {
      heading: 'Simak & Dengarkan Pola Nada',
      text: 'Ketuk "Mulai Bermain". Tabuh kayu akan mengetuk bilah Saron secara berurutan mengikuti penggalan lagu "Rek Ayo Rek".',
    },
    {
      heading: 'Ulangi Urutan Bilah Saron',
      text: 'Saat giliranmu tiba, ketuk bilah Saron (atau tekan tombol 1–6 di keyboard) sesuai urutan cahaya dan nada yang baru kamu lihat.',
    },
    {
      heading: 'Ulangi Pola atau Main Bebas',
      text: 'Jika lupa urutannya, ketuk "Dengarkan Ulang". Kamu juga bisa mengetuk bilah kapan saja di "Mode Bebas" untuk mencoba suara Saron.',
    },
  ],
};