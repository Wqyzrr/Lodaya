/**
 * js/rooms/peran/story-data.js
 * Data narasi, registri aset, dan konfigurasi panduan
 * untuk Buku Cerita Interaktif: "Rahasia di Balik Topeng Reog".
 */

const ASSET_BASE = 'assets/seniperan/';

export const STORY_META = {
  title: 'Rahasia di Balik Topeng Reog',
  subtitle: 'Dongeng Budaya Reog Ponorogo',
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
 * 9 halaman cerita berurutan menggunakan storybook1 s.d. storybook9.
 * contextType: 'fact' (fakta budaya terdokumentasi) | 'legend' (cerita rakyat / tradisi lisan)
 */
export const STORY_PAGES = [
  {
    id: 'page-1',
    pageNumber: 1,
    title: 'Tabuhan Gamelan di Alun-Alun',
    sceneBasePath: `${ASSET_BASE}storybook1`,
    sceneAlt: 'Bima berlari menuju alun-alun desa yang ramai oleh pertunjukan Reog Ponorogo',
    sceneCaption: 'Sore hangat di alun-alun Ponorogo',
    characterKey: 'boy',
    characterPos: 'left',
    contextType: 'fact',
    contextLabel: 'Fakta Budaya',
    paragraphs: [
      'Sore itu, dentuman kendang dan lengkingan terompet slompret menggema hingga ke beranda rumah Bima. Rasa ingin tahunya langsung membuncah.',
      'Ia berlari menuju alun-alun desa. Warga telah berkumpul melingkar, menanti dimulainya pertunjukan Reog Ponorogo yang megah.',
    ],
    culturalFact:
      'Reog Ponorogo adalah seni pertunjukan tradisional khas Kabupaten Ponorogo, Jawa Timur, yang memadukan tari, topeng, dan musik gamelan tradisional.',
  },
  {
    id: 'page-2',
    pageNumber: 2,
    title: 'Derap Tangkas Pasukan Jathil',
    sceneBasePath: `${ASSET_BASE}storybook2`,
    sceneAlt: 'Para penari Jathil menunggangi kuda kepang dengan gerakan serempak',
    sceneCaption: 'Pasukan berkuda kepang membuka arena',
    characterKey: 'jathil',
    characterPos: 'right',
    contextType: 'fact',
    contextLabel: 'Fakta Budaya',
    paragraphs: [
      'Arena dibuka oleh barisan penari yang menunggangi kuda anyaman bambu. Langkah kaki mereka serempak mengikuti irama kenong dan kempul.',
      'Bima bertepuk tangan kagum. Gerakan mereka tampak begitu ringan, kompak, dan penuh semangat.',
    ],
    culturalFact:
      'Tari Jathil menggambarkan ketangkasan prajurit berkuda. Gerakannya yang serempak mencerminkan kedisiplinan dan kekompakan tim.',
  },
  {
    id: 'page-3',
    pageNumber: 3,
    title: 'Kelincahan Bujang Ganong',
    sceneBasePath: `${ASSET_BASE}storybook3`,
    sceneAlt: 'Bujang Ganong bertopeng merah melompat lincah menghibur penonton',
    sceneCaption: 'Aksi akrobatik Bujang Ganong yang jenaka',
    characterKey: 'bujang_ganong',
    characterPos: 'right',
    contextType: 'fact',
    contextLabel: 'Tokoh Pertunjukan',
    paragraphs: [
      'Tiba-tiba, sesosok penari bertopeng merah dengan mata besar melompat jungkir balik ke tengah arena! Penonton bersorak riuh.',
      'Bima tertawa senang melihat tingkahnya yang jenaka sekaligus sangat lincah menyapa anak-anak di tepi panggung.',
    ],
    culturalFact:
      'Bujang Ganong (Patih Pujangga Anom) dikenal sebagai tokoh yang cerdik, berani, dan enerjik. Gerakan akrobatiknya selalu mencairkan suasana.',
  },
  {
    id: 'page-4',
    pageNumber: 4,
    title: 'Wibawa Sang Warok',
    sceneBasePath: `${ASSET_BASE}storybook4`,
    sceneAlt: 'Warok berpakaian serba hitam berdiri tenang dengan penuh wibawa',
    sceneCaption: 'Langkah tenang penuh kebijaksanaan',
    characterKey: 'warok',
    characterPos: 'left',
    contextType: 'fact',
    contextLabel: 'Fakta Budaya',
    paragraphs: [
      'Di sisi arena, Bima memperhatikan sosok berpakaian serba hitam dengan tali kolor putih besar. Gerakannya tenang, mantap, dan berwibawa.',
      'Seorang kakek di sebelah Bima berbisik bahwa tokoh itu adalah Warok, penjaga ketenangan dan teladan bagi para penari.',
    ],
    culturalFact:
      'Dalam tradisi masyarakat Ponorogo, Warok dihormati sebagai sosok yang menjunjung tinggi budi pekerti, keteguhan hati, dan kebijaksanaan.',
  },
  {
    id: 'page-5',
    pageNumber: 5,
    title: 'Megahnya Singo Barong',
    sceneBasePath: `${ASSET_BASE}storybook5`,
    sceneAlt: 'Topeng raksasa Singo Barong bermahkota bulu merak menari di tengah arena',
    sceneCaption: 'Dadak Merak berkilau diterpa cahaya senja',
    characterKey: 'singo_barong',
    characterPos: 'right',
    contextType: 'fact',
    contextLabel: 'Fakta Budaya',
    paragraphs: [
      'Suara slompret meninggi dan semua mata tertuju ke tengah lapangan. Muncullah topeng raksasa berkepala harimau dengan mahkota bulu merak yang menjulang!',
      'Bima tertegun. Bagaimana mungkin satu orang mampu menari sambil menopang topeng sebesar dan semegah itu?',
    ],
    culturalFact:
      'Topeng ini disebut Dadak Merak. Bobotnya dapat mencapai puluhan kilogram dan ditopang oleh kekuatan leher serta gigitan penari Pembarong pada bagian kayu di dalam topeng.',
  },
  {
    id: 'page-6',
    pageNumber: 6,
    title: 'Kisah Prabu Klono Sewandono',
    sceneBasePath: `${ASSET_BASE}storybook6`,
    sceneAlt: 'Ilustrasi kisah rakyat Prabu Klono Sewandono dan Putri Dewi Songgolangit',
    sceneCaption: 'Cerita rakyat yang dituturkan turun-temurun',
    characterKey: null,
    characterPos: 'left',
    contextType: 'legend',
    contextLabel: 'Cerita Rakyat',
    paragraphs: [
      'Sambil beristirahat, sang kakek menceritakan salah satu legenda populer tentang Prabu Klono Sewandono dari Kerajaan Bantarangin.',
      'Sang Prabu hendak meminang Putri Dewi Songgolangit dari Kediri, yang meminta syarat berupa pertunjukan seni unik yang belum pernah ada sebelumnya.',
    ],
    culturalFact:
      'Kisah Prabu Klono Sewandono merupakan tradisi lisan (legenda rakyat) yang berkembang dalam berbagai versi di tengah masyarakat Ponorogo.',
  },
  {
    id: 'page-7',
    pageNumber: 7,
    title: 'Makna di Balik Topeng',
    sceneBasePath: `${ASSET_BASE}storybook7`,
    sceneAlt: 'Detail wajah Singo Barong dan keindahan bulu merak di atasnya',
    sceneCaption: 'Perpaduan keberanian dan keindahan',
    characterKey: 'singo_barong',
    characterPos: 'left',
    contextType: 'legend',
    contextLabel: 'Makna Tradisi',
    paragraphs: [
      'Bima menatap kembali Singo Barong yang menari gagah. Kini ia mengerti bahwa setiap bentuk pada topeng menyimpan pesan luhur.',
      'Keberanian yang kuat selalu lebih indah ketika didampingi oleh hati yang tenang dan bijaksana.',
    ],
    culturalFact:
      'Dalam penafsiran tradisi setempat, kepala harimau melambangkan keberanian dan keteguhan, sedangkan burung merak di atasnya menggambarkan keindahan serta pengendalian diri.',
  },
  {
    id: 'page-8',
    pageNumber: 8,
    title: 'Rahasia di Balik Panggung',
    sceneBasePath: `${ASSET_BASE}storybook8`,
    sceneAlt: 'Para penari, penabuh gamelan, dan perajin saling membantu di belakang panggung',
    sceneCaption: 'Gotong royong adalah rahasia sejati Reog',
    characterKey: 'boy',
    characterPos: 'right',
    contextType: 'fact',
    contextLabel: 'Fakta Budaya',
    paragraphs: [
      'Usai pementasan, Bima mengintip ke belakang panggung. Di sanalah ia menemukan rahasia terbesar di balik topeng Reog!',
      'Para penari, penabuh gamelan, dan perajin saling bahu-membahu mengangkat serta merawat Dadak Merak bersama-sama.',
    ],
    culturalFact:
      'Pementasan Reog Ponorogo melibatkan kerja sama puluhan orang—penari, pengrawit gamelan, hingga perajin topeng. Kekuatan utamanya lahir dari gotong royong.',
  },
  {
    id: 'page-9',
    pageNumber: 9,
    title: 'Janji Bima untuk Masa Depan',
    sceneBasePath: `${ASSET_BASE}storybook9`,
    sceneAlt: 'Bima tersenyum bangga memandang langit senja Ponorogo setelah pertunjukan',
    sceneCaption: 'Menjaga nyala warisan budaya Jawa Timur',
    characterKey: 'boy',
    characterPos: 'left',
    contextType: 'fact',
    contextLabel: 'Warisan Budaya',
    paragraphs: [
      'Langit Ponorogo berubah keemasan. Bima pulang dengan hati hangat dan penuh rasa bangga terhadap budaya daerahnya.',
      'Ia berjanji akan membagikan kisah Reog Ponorogo kepada teman-temannya agar tradisi indah ini terus hidup dari generasi ke generasi.',
    ],
    culturalFact:
      'Reog Ponorogo telah diakui UNESCO sebagai Warisan Budaya Takbenda pada Desember 2024 dan terus dilestarikan melalui sanggar seni serta Festival Grebeg Suro.',
  },
];

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
      heading: 'Nikmati Musik & Detail Budaya',
      text: 'Gunakan kontrol suara di kanan atas untuk mengatur musik latar. Setiap halaman membedakan Fakta Budaya dan Cerita Rakyat.',
    },
  ],
};