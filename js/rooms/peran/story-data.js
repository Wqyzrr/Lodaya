/**
 * js/rooms/peran/story-data.js
 * Data narasi, registri aset, dan konfigurasi panduan
 * untuk Buku Cerita Interaktif: "Rahasia di Balik Topeng Reog".
 */

const ASSET_BASE = 'assets/seniperan/';

export const STORY_META = {
  title: 'Rahasia di Balik<br>Topeng Reog',
  subtitle: 'Dongeng Budaya<br>Reog Ponorogo',
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
    title: 'Persiapan di Halaman Pendopo',
    sceneBasePath: `${ASSET_BASE}storybook1`,
    sceneAlt:
      'Warga dan seniman Reog Ponorogo bersiap di halaman pendopo desa, menata gamelan dan menyiapkan topeng Dadak Merak sambil disaksikan Bima dan Sari',
    sceneCaption: 'Kesibukan hangat sebelum pertunjukan dimulai',
    characterKey: 'boy',
    characterPos: 'left',
    contextType: 'fact',
    contextLabel: 'Fakta Budaya',
    paragraphs: [
      'Sore itu, halaman pendopo desa tampak jauh lebih ramai dari biasanya. Bima dan Sari berdiri terpaku menyaksikan para seniman menyiapkan topeng harimau raksasa berhias bulu merak.',
      'Di sudut lain, para pengrawit mulai menyetel gong dan kendang, sementara beberapa penari berlatih gerakan kuda kepang dengan penuh semangat.',
    ],
    culturalFact:
      'Reog Ponorogo adalah seni pertunjukan tradisional khas Kabupaten Ponorogo, Jawa Timur, yang melibatkan kerja sama erat antara penari, pemusik, dan warga desa.',
  },
  {
    id: 'page-2',
    pageNumber: 2,
    title: 'Megahnya Topeng Dadak Merak',
    sceneBasePath: `${ASSET_BASE}storybook2`,
    sceneAlt:
      'Seorang sesepuh Warok memperkenalkan topeng Dadak Merak dari dekat kepada Bima dan Sari di lapangan desa berlatar pegunungan',
    sceneCaption: 'Bima dan Sari mengagumi Dadak Merak dari dekat',
    characterKey: 'elder',
    characterPos: 'right',
    contextType: 'fact',
    contextLabel: 'Fakta Budaya',
    paragraphs: [
      'Melihat rasa penasaran di mata Bima dan Sari, Mbah Karto mengajak mereka mendekat. Dari jarak sedekat itu, topeng Singo Barong tampak begitu tinggi, gagah, dan penuh warna.',
      'Mbah Karto tersenyum sambil menjelaskan bahwa setiap helai bulu merak dan ukiran pada topeng itu melambangkan keberanian serta kebanggaan masyarakat Ponorogo.',
    ],
    culturalFact:
      'Dadak Merak memiliki berat sekitar 50 hingga 60 kilogram dan diangkat oleh penari (pembarong) hanya dengan menggigit bagian kayu di dalamnya menggunakan kekuatan gigi serta leher.',
  },
  {
    id: 'page-3',
    pageNumber: 3,
    title: 'Menuju Kemeriahan Alun-Alun',
    sceneBasePath: `${ASSET_BASE}storybook3`,
    sceneAlt:
      'Jalan desa yang asri dikelilingi rumah kayu, pagar bambu, dan sawah terasering menuju area pertunjukan yang dihiasi janur kuning',
    sceneCaption: 'Jalan desa menuju arena pertunjukan rakyat',
    characterKey: 'boy',
    characterPos: 'left',
    contextType: 'fact',
    contextLabel: 'Fakta Budaya',
    paragraphs: [
      'Dari kejauhan, janur kuning yang melengkung di dekat balai desa mulai terlihat jelas. Rombongan Reog mulai berarak menyusuri jalan setapak di tepi sawah yang menghijau.',
      'Langkah Bima semakin cepat. Udara desa yang sejuk kini dipenuhi suara tabuhan yang memanggil seluruh warga untuk berkumpul.',
    ],
    culturalFact:
      'Pemasangan janur kuning dan arak-arakan keliling desa merupakan tradisi untuk mengundang warga sekaligus membawa suasana suka cita sebelum pementasan utama.',
  },
  {
    id: 'page-4',
    pageNumber: 4,
    title: 'Senja di Arena Pertunjukan',
    sceneBasePath: `${ASSET_BASE}storybook4`,
    sceneAlt:
      'Warga berkumpul melingkar di depan pendopo saat senja dengan nyala api unggun kecil, sementara penari Warok, Jathil, dan penabuh gamelan bersiap tampil',
    sceneCaption: 'Warga berkumpul melingkar menyambut senja',
    characterKey: 'girl',
    characterPos: 'left',
    contextType: 'fact',
    contextLabel: 'Fakta Budaya',
    paragraphs: [
      'Langit perlahan berubah jingga. Api unggun kecil dinyalakan di tengah halaman pendopo yang telah dihiasi umbul-umbul dan janur.',
      'Warga dari anak-anak hingga orang tua duduk dan berdiri melingkar. Para penari Warok dan Jathil mulai mengambil posisi, menandakan pertunjukan segera dimulai.',
    ],
    culturalFact:
      'Pertunjukan Reog Ponorogo tradisional biasanya digelar di ruang terbuka atau alun-alun agar penonton dapat menikmati tarian dari segala arah secara langsung.',
  },
  {
    id: 'page-5',
    pageNumber: 5,
    title: 'Tarian Gagah Singo Barong',
    sceneBasePath: `${ASSET_BASE}storybook5`,
    sceneAlt:
      'Pembarong menari dengan gagah mengenakan Dadak Merak raksasa di tengah arena yang diterangi api unggun dan lentera, disambut tepuk tangan warga',
    sceneCaption: 'Singo Barong menari penuh tenaga di tengah arena',
    characterKey: 'boy',
    characterPos: 'right',
    contextType: 'fact',
    contextLabel: 'Fakta Budaya',
    paragraphs: [
      'Begitu irama gamelan menghentak, Singo Barong melompat masuk ke tengah arena! Bulu meraknya yang lebar bergoyang megah mengikuti setiap ayunan langkah sang pembarong.',
      'Sorak-sorai dan tepuk tangan warga langsung pecah. Percikan cahaya dari api unggun membuat tarian itu tampak semakin hidup dan memukau.',
    ],
    culturalFact:
      'Singo Barong melambangkan sosok raja yang kuat dan berwibawa. Gerakannya yang lincah meski membawa beban berat membutuhkan latihan fisik dan konsentrasi tinggi.',
  },
  {
    id: 'page-6',
    pageNumber: 6,
    title: 'Empat Tokoh Utama Reog',
    sceneBasePath: `${ASSET_BASE}storybook6`,
    sceneAlt:
      'Empat tokoh utama Reog Ponorogo yaitu Jathil, Bujang Ganong, Warok, dan Singo Barong berpose bersama di depan pendopo disaksikan warga',
    sceneCaption: 'Jathil, Bujang Ganong, Warok, dan Singo Barong',
    characterKey: 'elder',
    characterPos: 'left',
    contextType: 'fact',
    contextLabel: 'Fakta Budaya',
    paragraphs: [
      'Di arena itu, Bima akhirnya mengenal seluruh tokoh penting dalam cerita Reog. Ada Jathil yang menari anggun bersama kuda kepangnya, serta Bujang Ganong bertopeng merah yang lincah dan jenaka.',
      'Di samping mereka berdiri Warok berpakaian serba hitam yang berwibawa, mendampingi Singo Barong sebagai pusat kemegahan pertunjukan.',
    ],
    culturalFact:
      'Setiap tokoh Reog memiliki peran khas: Jathil sebagai prajurit berkuda, Bujang Ganong sebagai patih yang cerdik dan akrobatik, serta Warok sebagai sosok pelindung yang bijaksana.',
  },
  {
    id: 'page-7',
    pageNumber: 7,
    title: 'Harmoni Gamelan dan Slompret',
    sceneBasePath: `${ASSET_BASE}storybook7`,
    sceneAlt:
      'Para pengrawit memainkan kendang, saron, gong, dan terompet slompret dengan penuh penghayatan di bawah cahaya lampion malam',
    sceneCaption: 'Irama gamelan yang menghidupkan suasana malam',
    characterKey: 'boy',
    characterPos: 'left',
    contextType: 'fact',
    contextLabel: 'Fakta Budaya',
    paragraphs: [
      'Di bawah temaram lampion gantung, para pengrawit memainkan alat musik mereka dengan penuh penghayatan. Dentuman kendang dan gong berpadu apik dengan dentingan saron.',
      'Lengkingan khas terompet slompret mengalun menembus malam, menjadi penanda perubahan gerakan bagi para penari di tengah arena.',
    ],
    culturalFact:
      'Musik pengiring Reog Ponorogo memiliki ciri khas pada suara terompet slompret yang melengking, dipadukan dengan kendang, ketipung, gong, kempul, dan angklung reog.',
  },
  {
    id: 'page-8',
    pageNumber: 8,
    title: 'Puncak Kemeriahan di Bawah Bintang',
    sceneBasePath: `${ASSET_BASE}storybook8`,
    sceneAlt:
      'Seluruh tokoh Reog Ponorogo menari bersama secara energik pada puncak pertunjukan malam hari di bawah langit berbintang dan cahaya obor',
    sceneCaption: 'Semua penari bersatu dalam puncak pertunjukan',
    characterKey: 'girl',
    characterPos: 'right',
    contextType: 'fact',
    contextLabel: 'Fakta Budaya',
    paragraphs: [
      'Langit malam bertabur bintang, namun semangat warga sama sekali tidak surut. Pada babak puncak, Singo Barong, Bujang Ganong, Warok, dan Jathil menari bersama dalam satu harmoni yang memukau.',
      'Cahaya obor yang diangkat warga menerangi senyum lebar di setiap wajah. Malam itu menjadi perayaan kebersamaan yang tak akan pernah dilupakan Bima.',
    ],
    culturalFact:
      'Reog Ponorogo telah diakui oleh UNESCO sebagai Warisan Budaya Takbenda yang Memerlukan Perlindungan Mendesak pada Desember 2024, menjadi kebanggaan Indonesia di mata dunia.',
  },
  {
    id: 'page-9',
    pageNumber: 9,
    title: 'Janji Menjaga Warisan Budaya',
    sceneBasePath: `${ASSET_BASE}storybook9`,
    sceneAlt:
      'Bima duduk di tepi jalan bukit desa memandangi rombongan Reog Ponorogo berjalan pulang menyusuri jalan setapak di tepi sawah saat senja',
    sceneCaption: 'Rombongan Reog pulang menyusuri jalan desa',
    characterKey: 'boy',
    characterPos: 'left',
    contextType: 'fact',
    contextLabel: 'Pesan Budaya',
    paragraphs: [
      'Dari tepi bukit kecil, Bima duduk tenang memandangi rombongan Reog yang berjalan pulang menyusuri jalan desa di samping petak-petak sawah.',
      'Di dalam hatinya tumbuh rasa bangga yang besar. Bima berjanji suatu hari nanti ia akan ikut belajar menari dan menjaga warisan Reog Ponorogo agar terus hidup selamanya.',
    ],
    culturalFact:
      'Melestarikan budaya daerah dapat dimulai dari generasi muda dengan cara mengenal sejarahnya, menonton pertunjukannya, hingga ikut berlatih di sanggar seni lokal.',
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