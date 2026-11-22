/**
 * js/rooms/makanan/recipes.js
 * Konfigurasi resep independen untuk Ruang IV — Seni Makanan.
 * Untuk menambah atau mengubah resep, cukup edit objek di array RECIPES
 * tanpa mengubah cooking-engine.js.
 */

export const VESSEL_SVGS = {
  cobek: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="60" cy="76" rx="46" ry="20" fill="#5A4A42" stroke="#E8C58E" stroke-width="2.5"/>
    <ellipse cx="60" cy="72" rx="36" ry="12" fill="#3B2F29"/>
    <path d="M74 36L92 50C96 53 96 59 92 62L74 72C70 74 64 72 62 67L58 55C56 49 67 32 74 36Z" fill="#786459" stroke="#E8C58E" stroke-width="2"/>
  </svg>`,
  panci: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="24" y="48" width="72" height="44" rx="14" fill="#6F3C22" stroke="#E8C58E" stroke-width="2.5"/>
    <ellipse cx="60" cy="48" rx="36" ry="11" fill="#2A1810" stroke="#E8C58E" stroke-width="2.5"/>
    <path d="M14 58H24M96 58H106" stroke="#E8C58E" stroke-width="4" stroke-linecap="round"/>
    <path d="M44 26C44 20 50 18 48 12M60 24C60 18 66 16 64 10M76 26C76 20 82 18 80 12" stroke="#FFE1A8" stroke-width="2" stroke-linecap="round" opacity="0.75"/>
  </svg>`,
  mangkuk: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 54C20 82 38 96 60 96C82 96 100 82 100 54H20Z" fill="#8C4E2B" stroke="#E8C58E" stroke-width="2.5"/>
    <ellipse cx="60" cy="54" rx="40" ry="12" fill="#462514" stroke="#E8C58E" stroke-width="2.5"/>
  </svg>`,
  loyang: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="46" width="80" height="42" rx="8" fill="#7D5631" stroke="#E8C58E" stroke-width="2.5"/>
    <rect x="28" y="54" width="64" height="26" rx="4" fill="#D8A95A"/>
    <path d="M36 32C36 26 42 24 40 18M60 30C60 24 66 22 64 16M84 32C84 26 90 24 88 18" stroke="#FFE1A8" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
  </svg>`,
  teko: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="58" cy="68" r="28" fill="#8D4C26" stroke="#E8C58E" stroke-width="2.5"/>
    <path d="M84 58C96 54 100 66 94 76C90 82 82 82 80 80" stroke="#E8C58E" stroke-width="3" stroke-linecap="round"/>
    <path d="M30 66L16 54" stroke="#E8C58E" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="58" cy="40" rx="16" ry="5" fill="#C99A55" stroke="#FFE1A8" stroke-width="2"/>
  </svg>`,
};

export const DISH_SVGS = {
  rawon: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 58C18 84 36 98 60 98C84 98 102 84 102 58H18Z" fill="#5A2D18" stroke="#E8C58E" stroke-width="2.5"/>
    <ellipse cx="60" cy="58" rx="42" ry="14" fill="#22140D" stroke="#E8C58E" stroke-width="2.5"/>
    <circle cx="48" cy="58" r="7" fill="#6E3B23"/>
    <circle cx="68" cy="60" r="8" fill="#5E2E1A"/>
    <path d="M44 52L54 55M64 53L76 55" stroke="#F5E9D3" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="58" cy="54" r="3" fill="#6AA86D"/>
  </svg>`,
  proll_tape: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="60" cy="88" rx="46" ry="12" fill="#3D2415" stroke="#E8C58E" stroke-width="2"/>
    <rect x="26" y="44" width="68" height="38" rx="8" fill="#E3B159" stroke="#FFE1A8" stroke-width="2.5"/>
    <path d="M26 56H94" stroke="#B67926" stroke-width="2"/>
    <rect x="38" y="49" width="12" height="4" rx="2" fill="#FFF3CE"/>
    <rect x="56" y="49" width="12" height="4" rx="2" fill="#FFF3CE"/>
    <rect x="74" y="49" width="10" height="4" rx="2" fill="#FFF3CE"/>
    <circle cx="46" cy="66" r="3.5" fill="#6A3318"/>
    <circle cx="72" cy="68" r="3.5" fill="#6A3318"/>
  </svg>`,
  wedang_angsle: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 58C22 84 39 98 60 98C81 98 98 84 98 58H22Z" fill="#2A4A38" stroke="#E8C58E" stroke-width="2.5"/>
    <ellipse cx="60" cy="58" rx="38" ry="12" fill="#EFE0BE" stroke="#E8C58E" stroke-width="2.5"/>
    <rect x="38" y="52" width="14" height="10" rx="2" fill="#FFF8E8" stroke="#C99A55"/>
    <circle cx="64" cy="56" r="5" fill="#D95D67"/>
    <circle cx="75" cy="59" r="4" fill="#6FA868"/>
    <path d="M46 34C46 28 52 26 50 20M62 32C62 26 68 24 66 18M76 34C76 28 82 26 80 20" stroke="#FFE1A8" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
  </svg>`,
};

export const RECIPES = [
  {
    id: 'rawon',
    name: 'Rawon',
    origin: 'Khas Jawa Timur',
    shortDesc: 'Sup daging sapi berkuah hitam pekat dari kluwek yang kaya rempah dan harum.',
    culturalDesc: 'Rawon merupakan salah satu hidangan berkuah tertua di Jawa Timur. Warna hitam khas dan cita rasa gurih mendalamnya berasal dari buah kluwek (keluak), disajikan bersama nasi hangat, tauge pendek, dan sambal.',
    svg: DISH_SVGS.rawon,
    steps: [
      {
        type: 'tap-select',
        title: 'Langkah 1 — Siapkan Bumbu Rawon',
        instruction: 'Ketuk bahan-bahan bumbu utama (termasuk Kluwek) untuk menyiapkannya.',
        vessel: 'cobek',
        vesselLabel: 'Meja Persiapan Bumbu',
        items: [
          { id: 'kluwek', label: 'Kluwek (Keluak)', color: '#2B1B14' },
          { id: 'bawang', label: 'Bawang Merah & Putih', color: '#D4A59A' },
          { id: 'kunyit', label: 'Kunyit & Kemiri', color: '#D99B26' },
          { id: 'daun_jeruk', label: 'Daun Jeruk & Serai', color: '#4E8248' },
        ],
      },
      {
        type: 'drag-drop',
        title: 'Langkah 2 — Masukkan Bumbu ke Cobek',
        instruction: 'Seret (atau ketuk) seluruh bumbu ke dalam Cobek untuk dihaluskan.',
        vessel: 'cobek',
        vesselLabel: 'Cobek Batu',
        items: [
          { id: 'kluwek', label: 'Isi Kluwek', color: '#2B1B14' },
          { id: 'bawang', label: 'Bawang & Rempah', color: '#D4A59A' },
          { id: 'kunyit', label: 'Kunyit & Kemiri', color: '#D99B26' },
        ],
      },
      {
        type: 'action',
        title: 'Langkah 3 — Haluskan Bumbu',
        instruction: 'Ketuk tombol "Haluskan Bumbu" hingga bumbu kluwek lembut merata.',
        vessel: 'cobek',
        vesselLabel: 'Cobek & Ulekan',
        actionLabel: 'Haluskan Bumbu',
        requiredTaps: 2,
      },
      {
        type: 'drag-drop',
        title: 'Langkah 4 — Masukkan ke Panci Rebusan',
        instruction: 'Seret (atau ketuk) Bumbu Halus, Daging Sapi, dan Daun Jeruk ke dalam Panci.',
        vessel: 'panci',
        vesselLabel: 'Panci Kuah Rawon',
        items: [
          { id: 'bumbu_halus', label: 'Bumbu Kluwek Halus', color: '#24150E' },
          { id: 'daging', label: 'Potongan Daging Sapi', color: '#8F352A' },
          { id: 'daun_jeruk', label: 'Daun Jeruk & Serai', color: '#4E8248' },
        ],
      },
      {
        type: 'action',
        title: 'Langkah 5 — Masak Kuah Hingga Harum',
        instruction: 'Ketuk tombol "Didihkan Kuah" untuk memasak Rawon hingga bumbu meresap.',
        vessel: 'panci',
        vesselLabel: 'Panci Rawon di Atas Api',
        actionLabel: 'Didihkan Kuah Rawon',
        requiredTaps: 2,
      },
    ],
  },
  {
    id: 'proll_tape',
    name: 'Proll Tape',
    origin: 'Khas Jember, Jawa Timur',
    shortDesc: 'Kue lembut berbahan tape singkong manis dengan taburan keju dan kismis.',
    culturalDesc: 'Proll Tape adalah kudapan khas Jember yang mengolah tape singkong (peuyeum) menjadi kue panggang bertekstur lembut, manis, sedikit asam segar, dan harum mentega.',
    svg: DISH_SVGS.proll_tape,
    steps: [
      {
        type: 'tap-select',
        title: 'Langkah 1 — Pilih Bahan Proll Tape',
        instruction: 'Ketuk bahan utama Proll Tape untuk memulai persiapan adonan.',
        vessel: 'mangkuk',
        vesselLabel: 'Meja Bahan Kue',
        items: [
          { id: 'tape', label: 'Tape Singkong Matang', color: '#F0DF9B' },
          { id: 'tepung', label: 'Tepung Terigu & Gula', color: '#F5EFE2' },
          { id: 'telur', label: 'Telur & Mentega Cair', color: '#E5AD3C' },
          { id: 'keju', label: 'Keju Parut & Kismis', color: '#D49A45' },
        ],
      },
      {
        type: 'action',
        title: 'Langkah 2 — Haluskan Tape Singkong',
        instruction: 'Ketuk tombol "Haluskan Tape" untuk melumatkan tape singkong tanpa serat.',
        vessel: 'mangkuk',
        vesselLabel: 'Mangkuk Adonan',
        actionLabel: 'Haluskan Tape',
        requiredTaps: 2,
      },
      {
        type: 'drag-drop',
        title: 'Langkah 3 — Campurkan Bahan Adonan',
        instruction: 'Seret (atau ketuk) Tepung, Telur & Mentega, serta Susu ke dalam Mangkuk.',
        vessel: 'mangkuk',
        vesselLabel: 'Mangkuk Adonan',
        items: [
          { id: 'tepung', label: 'Tepung & Gula', color: '#F5EFE2' },
          { id: 'telur', label: 'Telur & Mentega', color: '#E5AD3C' },
          { id: 'susu', label: 'Susu Cair', color: '#FFFDF5' },
        ],
      },
      {
        type: 'drag-drop',
        title: 'Langkah 4 — Tuang ke Loyang & Beri Topping',
        instruction: 'Seret (atau ketuk) Adonan dan Taburan Keju Kismis ke dalam Loyang Panggang.',
        vessel: 'loyang',
        vesselLabel: 'Loyang Panggang',
        items: [
          { id: 'adonan', label: 'Adonan Proll Tape', color: '#EED68C' },
          { id: 'keju', label: 'Keju Parut & Kismis', color: '#C98A2E' },
        ],
      },
      {
        type: 'action',
        title: 'Langkah 5 — Panggang Hingga Keemasan',
        instruction: 'Ketuk tombol "Panggang Kue" sampai permukaan Proll Tape matang keemasan.',
        vessel: 'loyang',
        vesselLabel: 'Oven Tradisional',
        actionLabel: 'Panggang Proll Tape',
        requiredTaps: 2,
      },
    ],
  },
  {
    id: 'wedang_angsle',
    name: 'Wedang Angsle',
    origin: 'Khas Malang & Jawa Timur',
    shortDesc: 'Minuman hangat berkuah santan jahe dengan isian ketan, roti, dan kacang hijau.',
    culturalDesc: 'Wedang Angsle adalah sajian hangat khas Jawa Timur, sangat populer di Malang saat malam hari. Perpaduan kuah santan jahe beraroma pandan dan aneka isian lembut menghadirkan rasa hangat yang menenangkan.',
    svg: DISH_SVGS.wedang_angsle,
    steps: [
      {
        type: 'tap-select',
        title: 'Langkah 1 — Siapkan Isian & Kuah Jahe',
        instruction: 'Ketuk bahan-bahan tradisional Wedang Angsle berikut ini.',
        vessel: 'mangkuk',
        vesselLabel: 'Meja Persiapan Angsle',
        items: [
          { id: 'jahe', label: 'Jahe Bakar & Daun Pandan', color: '#B8894A' },
          { id: 'ketan', label: 'Ketan Putih Kukus', color: '#F5F0E4' },
          { id: 'kacang_hijau', label: 'Kacang Hijau Rebus', color: '#6E8F55' },
          { id: 'roti', label: 'Potongan Roti & Mutiara', color: '#D96B73' },
        ],
      },
      {
        type: 'action',
        title: 'Langkah 2 — Masak Kuah Santan Jahe',
        instruction: 'Ketuk tombol "Rebus Kuah Jahe" agar aroma jahe dan daun pandan keluar harum.',
        vessel: 'teko',
        vesselLabel: 'Teko Kuah Santan Jahe',
        actionLabel: 'Rebus Kuah Jahe',
        requiredTaps: 2,
      },
      {
        type: 'drag-drop',
        title: 'Langkah 3 — Tata Isian di Mangkuk Saji',
        instruction: 'Seret (atau ketuk) Ketan Putih, Kacang Hijau, dan Roti Mutiara ke Mangkuk Saji.',
        vessel: 'mangkuk',
        vesselLabel: 'Mangkuk Saji Angsle',
        items: [
          { id: 'ketan', label: 'Ketan Putih', color: '#F5F0E4' },
          { id: 'kacang_hijau', label: 'Kacang Hijau', color: '#6E8F55' },
          { id: 'roti', label: 'Roti & Mutiara', color: '#D96B73' },
        ],
      },
      {
        type: 'action',
        title: 'Langkah 4 — Tuangkan Kuah Hangat',
        instruction: 'Ketuk tombol "Tuang Kuah Santan Jahe" untuk menyempurnakan Wedang Angsle.',
        vessel: 'mangkuk',
        vesselLabel: 'Mangkuk Wedang Angsle',
        actionLabel: 'Tuang Kuah Hangat',
        requiredTaps: 1,
      },
    ],
  },
];
