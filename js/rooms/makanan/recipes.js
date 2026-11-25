/**
 * js/rooms/makanan/recipes.js
 * Registri 43 aset WebP dan konfigurasi resep step-by-step untuk Ruang IV — Kuliner.
 * Mendukung perubahan visual wadah per 1x drag-and-drop (stageImgs) dan posisi kompor kanan.
 */

const KULINER_BASE = 'assets/kuliner/';

export const KULINER_ASSETS = {
  // Environment & UI
  bgWarung: `${KULINER_BASE}bg-meja-warung.webp`,
  bgMasak: `${KULINER_BASE}bg-meja-masak.webp`,
  uiTray: `${KULINER_BASE}ui-tray-bahan.webp`,
  uiKartuResep: `${KULINER_BASE}ui-kartu-resep.webp`,

  // VFX
  vfxUap: `${KULINER_BASE}vfx-uap-panas.webp`,
  vfxApi: `${KULINER_BASE}vfx-api-kompor.webp`,
  vfxSparkle: `${KULINER_BASE}vfx-sparkle.webp`,

  // Menu 1: Rawon
  rawonPanciKosong: `${KULINER_BASE}rawon-panci-kosong.webp`,
  rawonPanciDaging: `${KULINER_BASE}rawon-panci-daging.webp`,
  rawonPanciMatang: `${KULINER_BASE}rawon-panci-matang.webp`,
  rawonPanciRempah: `${KULINER_BASE}rawon-panci-rempah.webp`,
  rawonSendokKayu: `${KULINER_BASE}rawon-sendok-kayu.webp`,
  rawonDaging: `${KULINER_BASE}rawon-bahan-daging.webp`,
  rawonKluwek: `${KULINER_BASE}rawon-bahan-kluwek.webp`,
  rawonRempah: `${KULINER_BASE}rawon-bahan-rempah.webp`,
  rawonTopping: `${KULINER_BASE}rawon-topping-telur.webp`,
  rawonJadi: `${KULINER_BASE}rawon-hasil-jadi.webp`,

  // Menu 2: Prol Tape
  prolMangkukKosong: `${KULINER_BASE}prol-mangkuk-kosong.webp`,
  prolMangkukTape: `${KULINER_BASE}prol-mangkuk-tape.webp`,
  prolMangkukCampur: `${KULINER_BASE}prol-mangkuk-campur.webp`,
  prolMangkukAdonan: `${KULINER_BASE}prol-mangkuk-adonan.webp`,
  prolPengaduk: `${KULINER_BASE}prol-pengaduk-whisk.webp`,
  prolTape: `${KULINER_BASE}prol-bahan-tape.webp`,
  prolTepungTelur: `${KULINER_BASE}prol-bahan-tepung-telur.webp`,
  prolTopping: `${KULINER_BASE}prol-topping-keju-kismis.webp`,
  prolLoyangKosong: `${KULINER_BASE}prol-loyang-kosong.webp`,
  prolLoyangAdonan: `${KULINER_BASE}prol-loyang-adonan.webp`,
  prolLoyangTopping: `${KULINER_BASE}prol-loyang-topping.webp`,
  prolOven: `${KULINER_BASE}prol-oven-tangkring.webp`,
  prolJadi: `${KULINER_BASE}prol-hasil-jadi.webp`,

  // Menu 3: Wedang Angsle
  angsleMangkukKosong: `${KULINER_BASE}angsle-mangkuk-kosong.webp`,
  angsleMangkuk1: `${KULINER_BASE}angsle-mangkuk-1-ketan.webp`,
  angsleMangkuk2: `${KULINER_BASE}angsle-mangkuk-2-mutiara.webp`,
  angsleMangkuk3: `${KULINER_BASE}angsle-mangkuk-3-kacang.webp`,
  angsleMangkuk4: `${KULINER_BASE}angsle-mangkuk-4-roti.webp`,
  angsleMangkukKuah: `${KULINER_BASE}angsle-mangkuk-kuah.webp`,
  angsleKetan: `${KULINER_BASE}angsle-bahan-ketan.webp`,
  angsleMutiara: `${KULINER_BASE}angsle-bahan-mutiara.webp`,
  angsleKacangHijau: `${KULINER_BASE}angsle-bahan-kacang-hijau.webp`,
  angsleRoti: `${KULINER_BASE}angsle-bahan-roti.webp`,
  angsleKuahSantan: `${KULINER_BASE}angsle-kuah-santan.webp`,
  angsleToppingKacang: `${KULINER_BASE}angsle-topping-kacang.webp`,
  angsleJadi: `${KULINER_BASE}angsle-hasil-jadi.webp`,
};

export const RECIPES = [
  {
    id: 'rawon',
    name: 'Rawon',
    origin: 'Khas Jawa Timur',
    tagline: 'Sup Daging Kuah Hitam Kluwek',
    techniqueLabel: 'Tumis & Rebus',
    finishedImg: KULINER_ASSETS.rawonJadi,
    culturalFact:
      'Rawon merupakan salah satu hidangan berkuah tertua di Jawa Timur. Warna hitam pekat dan cita rasa gurih mendalamnya berasal dari buah kluwek (keluak), biasa dinikmati bersama nasi hangat, tauge pendek, dan telur asin.',
    steps: [
      {
        type: 'drag-drop',
        stationPos: 'stove',
        title: 'Langkah 1 • Racik Bahan ke Kendil',
        instruction:
          'Seret Daging Sapi, Bumbu & Kluwek, serta Daun Jeruk & Serai ke panci tanah liat di atas kompor.',
        vesselImg: KULINER_ASSETS.rawonPanciKosong,
        stageImgs: [
          KULINER_ASSETS.rawonPanciDaging,
          KULINER_ASSETS.rawonPanciMatang,
          KULINER_ASSETS.rawonPanciRempah,
        ],
        vesselLabel: 'Panci Kendil Rawon',
        showFire: true,
        showSteam: false,
        items: [
          {
            id: 'daging',
            label: 'Daging Sapi',
            img: KULINER_ASSETS.rawonDaging,
            sfxType: 'sizzle',
            dropMessage: 'Potongan daging sapi mulai dimasak!',
          },
          {
            id: 'kluwek',
            label: 'Bumbu & Kluwek',
            img: KULINER_ASSETS.rawonKluwek,
            sfxType: 'plop',
            dropMessage: 'Kuah menghitam pekat oleh kluwek!',
          },
          {
            id: 'rempah',
            label: 'Daun Jeruk & Serai',
            img: KULINER_ASSETS.rawonRempah,
            sfxType: 'sprinkle',
            dropMessage: 'Aroma segar daun jeruk dan serai menguar!',
          },
        ],
      },
      {
        type: 'action',
        stationPos: 'stove',
        title: 'Langkah 2 • Aduk & Didihkan Kuah',
        instruction:
          'Ketuk panci atau tombol di bawah untuk mengaduk kuah Rawon hingga bumbu meresap.',
        vesselImg: KULINER_ASSETS.rawonPanciRempah,
        vesselLabel: 'Kuah Rawon Mendidih',
        toolImg: KULINER_ASSETS.rawonSendokKayu,
        toolAnim: 'stir',
        actionLabel: 'Aduk Kuah Rawon',
        requiredTaps: 3,
        tapFeedback: [
          'Bumbu kluwek mulai menyatu dengan daging...',
          'Aroma rempah harum memenuhi dapur...',
          'Kuah Rawon mendidih sempurna!',
        ],
        showFire: true,
        showSteam: true,
      },
      {
        type: 'drag-drop',
        stationPos: 'center',
        title: 'Langkah 3 • Sajikan dengan Pelengkap',
        instruction:
          'Tambahkan Tauge Pendek & Telur Asin untuk menyempurnakan semangkuk Rawon hangat.',
        vesselImg: KULINER_ASSETS.rawonPanciRempah,
        stageImgs: [KULINER_ASSETS.rawonJadi],
        vesselLabel: 'Mangkuk Saji Rawon',
        showFire: false,
        showSteam: true,
        items: [
          {
            id: 'topping',
            label: 'Tauge & Telur Asin',
            img: KULINER_ASSETS.rawonTopping,
            sfxType: 'sprinkle',
            dropMessage: 'Rawon siap disajikan hangat!',
          },
        ],
      },
    ],
  },

  {
    id: 'prol_tape',
    name: 'Prol Tape',
    origin: 'Khas Jember',
    tagline: 'Kue Panggang Tape Lembut',
    techniqueLabel: 'Aduk & Panggang',
    finishedImg: KULINER_ASSETS.prolJadi,
    culturalFact:
      'Prol Tape adalah kudapan ikonik dari Jember berbahan dasar tape singkong manis. Teksturnya padat namun lembut lumer saat digigit, dipadukan wangi mentega, parutan keju, dan kismis.',
    steps: [
      {
        type: 'drag-drop',
        stationPos: 'center',
        title: 'Langkah 1 • Campur Bahan Adonan',
        instruction:
          'Seret Tape Singkong serta Tepung, Gula & Telur ke dalam mangkuk keramik.',
        vesselImg: KULINER_ASSETS.prolMangkukKosong,
        stageImgs: [
          KULINER_ASSETS.prolMangkukTape,
          KULINER_ASSETS.prolMangkukCampur,
        ],
        vesselLabel: 'Mangkuk Adonan',
        showFire: false,
        showSteam: false,
        items: [
          {
            id: 'tape',
            label: 'Tape Singkong',
            img: KULINER_ASSETS.prolTape,
            sfxType: 'plop',
            dropMessage: 'Tape singkong manis masuk ke mangkuk!',
          },
          {
            id: 'tepung_telur',
            label: 'Tepung, Gula & Telur',
            img: KULINER_ASSETS.prolTepungTelur,
            sfxType: 'pour',
            dropMessage: 'Tepung dan telur siap diaduk bersama tape!',
          },
        ],
      },
      {
        type: 'action',
        stationPos: 'center',
        title: 'Langkah 2 • Aduk Adonan Hingga Halus',
        instruction:
          'Ketuk mangkuk atau tombol untuk mengaduk adonan Prol Tape hingga tercampur rata.',
        vesselImg: KULINER_ASSETS.prolMangkukCampur,
        vesselAfterImg: KULINER_ASSETS.prolMangkukAdonan,
        vesselLabel: 'Adonan Prol Tape',
        toolImg: KULINER_ASSETS.prolPengaduk,
        toolAnim: 'mix',
        actionLabel: 'Aduk Adonan',
        requiredTaps: 3,
        tapFeedback: [
          'Tape mulai lumat menyatu dengan telur...',
          'Adonan makin halus dan harum mentega...',
          'Adonan tercampur rata dan siap dituang!',
        ],
        showFire: false,
        showSteam: false,
      },
      {
        type: 'drag-drop',
        stationPos: 'center',
        title: 'Langkah 3 • Tuang ke Loyang & Beri Topping',
        instruction:
          'Masukkan Adonan Tape ke loyang panggang, lalu taburi Parutan Keju & Kismis.',
        vesselImg: KULINER_ASSETS.prolLoyangKosong,
        stageImgs: [
          KULINER_ASSETS.prolLoyangAdonan,
          KULINER_ASSETS.prolLoyangTopping,
        ],
        vesselLabel: 'Loyang Panggang',
        showFire: false,
        showSteam: false,
        items: [
          {
            id: 'adonan',
            label: 'Adonan Tape',
            img: KULINER_ASSETS.prolMangkukAdonan,
            sfxType: 'pour',
            dropMessage: 'Adonan tertuang rapi ke dalam loyang!',
          },
          {
            id: 'keju_kismis',
            label: 'Keju & Kismis',
            img: KULINER_ASSETS.prolTopping,
            sfxType: 'sprinkle',
            dropMessage: 'Taburan keju dan kismis mempercantik permukaan!',
          },
        ],
      },
      {
        type: 'action',
        stationPos: 'stove',
        title: 'Langkah 4 • Panggang di Oven Tangkring',
        instruction:
          'Ketuk oven di atas kompor atau tombol untuk memanggang Prol Tape hingga matang keemasan.',
        vesselImg: KULINER_ASSETS.prolOven,
        vesselLabel: 'Oven Tangkring',
        toolAnim: 'bake',
        actionLabel: 'Panggang Kue',
        requiredTaps: 3,
        tapFeedback: [
          'Oven memanas, aroma manis mulai tercium...',
          'Permukaan kue mulai berubah keemasan...',
          'Ting! Prol Tape matang sempurna!',
        ],
        showFire: true,
        showSteam: true,
      },
    ],
  },

  {
    id: 'wedang_angsle',
    name: 'Wedang Angsle',
    origin: 'Khas Malang',
    tagline: 'Sajian Hangat Santan Jahe',
    techniqueLabel: 'Racik & Siram',
    finishedImg: KULINER_ASSETS.angsleJadi,
    culturalFact:
      'Wedang Angsle adalah minuman hangat legendaris dari Malang yang biasa dinikmati saat malam hari. Kuah santan jahe beraroma pandan berpadu hangat dengan ketan, mutiara sagu, kacang hijau, dan potongan roti.',
    steps: [
      {
        type: 'drag-drop',
        stationPos: 'center',
        title: 'Langkah 1 • Tata Isian di Mangkuk',
        instruction:
          'Seret Ketan Putih, Mutiara Sagu, Kacang Hijau, dan Roti Tawar ke dalam mangkuk saji.',
        vesselImg: KULINER_ASSETS.angsleMangkukKosong,
        stageImgs: [
          KULINER_ASSETS.angsleMangkuk1,
          KULINER_ASSETS.angsleMangkuk2,
          KULINER_ASSETS.angsleMangkuk3,
          KULINER_ASSETS.angsleMangkuk4,
        ],
        vesselLabel: 'Mangkuk Racikan Angsle',
        showFire: false,
        showSteam: false,
        items: [
          {
            id: 'ketan',
            label: 'Ketan Putih',
            img: KULINER_ASSETS.angsleKetan,
            sfxType: 'plop',
            dropMessage: 'Ketan putih pulen masuk ke mangkuk!',
          },
          {
            id: 'mutiara',
            label: 'Mutiara Sagu',
            img: KULINER_ASSETS.angsleMutiara,
            sfxType: 'sprinkle',
            dropMessage: 'Mutiara sagu merah muda mempercantik warna!',
          },
          {
            id: 'kacang_hijau',
            label: 'Kacang Hijau',
            img: KULINER_ASSETS.angsleKacangHijau,
            sfxType: 'sprinkle',
            dropMessage: 'Kacang hijau rebus lembut ditambahkan!',
          },
          {
            id: 'roti',
            label: 'Roti Tawar',
            img: KULINER_ASSETS.angsleRoti,
            sfxType: 'plop',
            dropMessage: 'Potongan roti tawar siap menyerap kuah hangat!',
          },
        ],
      },
      {
        type: 'drag-drop',
        stationPos: 'center',
        title: 'Langkah 2 • Siram Kuah Santan Jahe',
        instruction:
          'Seret Panci Kuah Santan Jahe hangat ke mangkuk untuk menyiram seluruh isian.',
        vesselImg: KULINER_ASSETS.angsleMangkuk4,
        stageImgs: [KULINER_ASSETS.angsleMangkukKuah],
        vesselLabel: 'Siram Kuah Hangat',
        showFire: false,
        showSteam: true,
        items: [
          {
            id: 'kuah',
            label: 'Kuah Santan Jahe',
            img: KULINER_ASSETS.angsleKuahSantan,
            sfxType: 'pour',
            dropMessage: 'Kuah santan jahe hangat harum menyiram isian!',
          },
        ],
      },
      {
        type: 'drag-drop',
        stationPos: 'center',
        title: 'Langkah 3 • Taburi Kacang Sangrai',
        instruction:
          'Tambahkan taburan Kacang Tanah Sangrai renyah sebagai sentuhan akhir Wedang Angsle.',
        vesselImg: KULINER_ASSETS.angsleMangkukKuah,
        stageImgs: [KULINER_ASSETS.angsleJadi],
        vesselLabel: 'Wedang Angsle Hangat',
        showFire: false,
        showSteam: true,
        items: [
          {
            id: 'kacang_sangrai',
            label: 'Kacang Sangrai',
            img: KULINER_ASSETS.angsleToppingKacang,
            sfxType: 'sprinkle',
            dropMessage: 'Wedang Angsle hangat siap dinikmati!',
          },
        ],
      },
    ],
  },
];

export const KULINER_TUTORIAL = {
  eyebrow: 'Panduan Ruang Kuliner',
  title: 'Cara Memasak di Warung Jawa Timur',
  steps: [
    {
      heading: 'Pilih Hidangan di Meja Warung',
      text: 'Ketuk salah satu dari tiga sajian khas Jawa Timur di atas meja: Rawon, Prol Tape, atau Wedang Angsle.',
    },
    {
      heading: 'Seret atau Ketuk Bahan',
      text: 'Ikuti kartu resep di atas meja. Seret gambar bahan dari nampan bawah ke wadah masak, atau cukup ketuk bahan untuk memasukkannya otomatis.',
    },
    {
      heading: 'Aduk & Panggang Hingga Matang',
      text: 'Pada tahap pengolahan, ketuk wadah masak atau tombol aksi untuk mengaduk kuah, mencampur adonan, atau memanggang hingga sajian siap dinikmati.',
    },
  ],
};