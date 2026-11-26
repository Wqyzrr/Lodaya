/**
 * js/rooms/tari/tari-data.js
 * Registri aset, data narasi 5 bagian, eksplorasi busana, gerak tari,
 * dan bank soal kuis untuk Ruang II — Seni Tari (Gandrung Banyuwangi).
 */

const TARI_BASE = 'assets/senitari/';

export const TARI_ASSETS = {
  // 12 Aset Baru di assets/senitari/
  hero: `${TARI_BASE}hero-gandrung.webp`,
  storyOrigins: `${TARI_BASE}story-origins.webp`,
  storyMeaning: `${TARI_BASE}story-meaning.webp`,
  storyPerformance: `${TARI_BASE}story-performance.webp`,
  costumeFull: `${TARI_BASE}costume-dancer-full.webp`,
  detailOmprok: `${TARI_BASE}detail-omprok.webp`,
  detailKipas: `${TARI_BASE}detail-kipas.webp`,
  detailSelendang: `${TARI_BASE}detail-selendang.webp`,
  detailBusana: `${TARI_BASE}detail-busana.webp`,
  moveSembahan: `${TARI_BASE}move-sembahan.webp`,
  moveLayangKipas: `${TARI_BASE}move-layang-kipas.webp`,
  moveGandrongan: `${TARI_BASE}move-gandrongan.webp`,

  // Aset Reused dari Repo
  paperTexture: 'assets/seniperan/paper_texture.webp',
  batikDecor: 'assets/seniperan/batik_decorations.webp',
  flowerDecor: 'assets/seniperan/flower_decorations.webp',
};

export const STORY_CARDS = [
  {
    id: 'origins',
    eyebrow: 'Sejarah',
    title: 'Asal-Usul',
    shortText: 'Akar sejarah Tari Gandrung yang lahir dari masyarakat Osing Banyuwangi.',
    fullText:
      'Tari Gandrung lahir pada abad ke-18 di Banyuwangi sebagai ungkapan syukur masyarakat Osing atas hasil panen dan semangat perjuangan membangun kembali Blambangan. Pada masa awal, tarian ini dibawakan oleh penari laki-laki (Gandrung Lanang) sebelum berkembang menjadi tarian perempuan yang anggun.',
    img: TARI_ASSETS.storyOrigins,
  },
  {
    id: 'meaning',
    eyebrow: 'Filosofi',
    title: 'Makna Budaya',
    shortText: 'Simbol rasa syukur, sukacita, dan keramahan masyarakat pesisir timur Jawa.',
    fullText:
      'Kata "Gandrung" bermakna terpesona atau kasih yang mendalam kepada Dewi Sri (Dewi Padi) atas kemakmuran bumi. Setiap gerak dan senyuman penari memancarkan kehangatan, keramahtamahan, serta persatuan antarwarga.',
    img: TARI_ASSETS.storyMeaning,
  },
  {
    id: 'performance',
    eyebrow: 'Pementasan',
    title: 'Pertunjukan',
    shortText: 'Dari pentas rakyat malam hari hingga festival kolosal Gandrung Sewu.',
    fullText:
      'Pementasan Gandrung tradisional terdiri atas tiga babak: Jejer (pembukaan), Paju (menari bersama penonton sebagai bentuk penghormatan), dan Seblang Subuh (penutup). Kini Gandrung juga tampil megah dalam Festival Gandrung Sewu di Pantai Boom Banyuwangi.',
    img: TARI_ASSETS.storyPerformance,
  },
];

export const TIMELINE_ITEMS = [
  {
    era: 'Abad ke-18',
    desc: 'Lahir di Banyuwangi sebagai tari syukur & semangat Blambangan',
    img: TARI_ASSETS.storyOrigins,
  },
  {
    era: '1900-an',
    desc: 'Tumbuh subur sebagai seni rakyat yang dicintai masyarakat Osing',
    img: TARI_ASSETS.storyMeaning,
  },
  {
    era: '1970-an',
    desc: 'Diakui resmi sebagai ikon budaya dan maskot Kabupaten Banyuwangi',
    img: TARI_ASSETS.storyPerformance,
  },
  {
    era: 'Masa Kini',
    desc: 'Warisan budaya hidup yang mendunia lewat Festival Gandrung Sewu',
    img: TARI_ASSETS.hero,
  },
];

export const COSTUME_PARTS = [
  {
    id: 'omprok',
    label: 'Omprok',
    subtitle: 'Mahkota Penari Gandrung',
    img: TARI_ASSETS.detailOmprok,
    pin: { top: '13%', left: '50%' },
    description:
      'Mahkota khas penari Gandrung yang terbuat dari kulit kerbau berukir emas bermotif tokoh Antasena, dihiasi ornamen bunga merah-putih sebagai lambang keagungan, keberanian, dan kebanggaan masyarakat Banyuwangi.',
  },
  {
    id: 'kipas',
    label: 'Kipas',
    subtitle: 'Kipas Lipat Batik',
    img: TARI_ASSETS.detailKipas,
    pin: { top: '36%', left: '28%' },
    description:
      'Properti utama yang dimainkan dengan gerakan luwes membuka, menutup, dan melayang. Kipas berfungsi mempertegas ekspresi wajah, ritme musik, serta keanggunan gerak tangan penari.',
  },
  {
    id: 'selendang',
    label: 'Selendang',
    subtitle: 'Sampur Sutra Merah',
    img: TARI_ASSETS.detailSelendang,
    pin: { top: '48%', left: '72%' },
    description:
      'Kain selendang merah menyala yang disampirkan di bahu dan pinggang. Saat menari, kibasan sampur menjadi penanda ajakan menari (Paju) sekaligus menambah dinamika visual di atas panggung.',
  },
  {
    id: 'busana',
    label: 'Busana',
    subtitle: 'Otok Beludru & Batik Gajah Oling',
    img: TARI_ASSETS.detailBusana,
    pin: { top: '65%', left: '46%' },
    description:
      'Memadukan atasan beludru hitam berbordir benang emas (otok) dengan kain bawahan batik khas Banyuwangi bermotif Gajah Oling—melambangkan keteguhan hati dan kedekatan manusia dengan alam.',
  },
];

export const DANCE_MOVES = [
  {
    id: 'sembahan',
    number: '01',
    title: 'Sembahan',
    shortDesc: 'Gerakan pembuka penuh hormat untuk menyapa penonton dan panggung.',
    fullDesc:
      'Sembahan dilakukan di awal babak Jejer dengan menundukkan kepala secara anggun serta merapatkan kedua telapak tangan di depan dada sambil memegang kipas. Gerakan ini mencerminkan adab, kerendahan hati, dan penghormatan kepada para tamu.',
    focus: 'Postur tegak lembut, pandangan teduh, dan tempo kendang perlahan.',
    img: TARI_ASSETS.moveSembahan,
  },
  {
    id: 'layang-kipas',
    number: '02',
    title: 'Layang Kipas',
    shortDesc: 'Ayunan kipas yang luwes memancarkan keanggunan dan keceriaan.',
    fullDesc:
      'Penari merentangkan lengan kanan dan mengayunkan kipas terbuka mengikuti ketukan biola dan kempul. Permainan buka-tutup kipas menciptakan aksen visual yang memikat sekaligus menonjolkan kelenturan pergelangan tangan.',
    focus: 'Kelenturan pergelangan tangan, ayunan melingkar, dan senyum hangat.',
    img: TARI_ASSETS.moveLayangKipas,
  },
  {
    id: 'gandrongan',
    number: '03',
    title: 'Gandrongan',
    shortDesc: 'Gerak lincah penuh ekspresi yang menghidupkan semangat Tari Gandrung.',
    fullDesc:
      'Bagian paling dinamis dari tarian ini. Dengan kedua lengan terbentang dan selendang merah berkibar mengikuti putaran tubuh, penari menyalurkan energi kegembiraan yang akrab dan mengajak penonton larut dalam irama Banyuwangi.',
    focus: 'Langkah kaki lincah, kibasan sampur lebar, dan kontak mata ekspresif.',
    img: TARI_ASSETS.moveGandrongan,
  },
];

export const QUIZ_QUESTIONS = [
  {
    question: 'Dari kota/kabupaten manakah Tari Gandrung berasal?',
    options: ['Surabaya', 'Banyuwangi', 'Malang', 'Jember'],
    correctIndex: 1,
    explanation: 'Tari Gandrung merupakan ikon seni tari tradisional kebanggaan masyarakat Osing, Banyuwangi.',
  },
  {
    question: 'Apa nama mahkota emas khas yang dikenakan penari Gandrung?',
    options: ['Siger', 'Omprok', 'Udheng', 'Blangkon'],
    correctIndex: 1,
    explanation: 'Omprok adalah mahkota kulit kerbau berukir emas bermotif Antasena yang menjadi ciri utama Gandrung.',
  },
  {
    question: 'Motif batik khas Banyuwangi yang umum dipakai pada kain bawahan Gandrung adalah...',
    options: ['Parang Rusak', 'Mega Mendung', 'Gajah Oling', 'Kawung'],
    correctIndex: 2,
    explanation: 'Batik Gajah Oling adalah motif tertua dan paling ikonik dari Banyuwangi.',
  },
  {
    question: 'Gerakan pembuka penuh hormat untuk menyapa penonton disebut...',
    options: ['Sembahan', 'Layang Kipas', 'Gandrongan', 'Seblang'],
    correctIndex: 0,
    explanation: 'Sembahan menjadi gestur penghormatan pembuka sebelum tarian memasuki irama yang lebih dinamis.',
  },
  {
    question: 'Pada awalnya, Tari Gandrung diciptakan sebagai ungkapan...',
    options: [
      'Latihan perang prajurit',
      'Rasa syukur atas panen & kemakmuran',
      'Upacara pelayaran laut',
      'Perlombaan ketangkasan',
    ],
    correctIndex: 1,
    explanation: 'Gandrung lahir sebagai perwujudan rasa syukur masyarakat kepada Dewi Sri atas hasil panen yang melimpah.',
  },
];

export const TARI_TUTORIAL = {
  eyebrow: 'Panduan Ruang Seni Tari',
  title: 'Eksplorasi Tari Gandrung Banyuwangi',
  steps: [
    {
      heading: 'Jelajahi 5 Bagian Cerita',
      text: 'Ketuk tombol "Jelajahi Tarian", gulir ke bawah, atau gunakan titik navigasi di tepi kanan untuk berpindah antarbagian.',
    },
    {
      heading: 'Sentuh Detail Busana & Gerak',
      text: 'Ketuk pin emas pada penari (Omprok, Kipas, Selendang, Busana) serta tombol "Lihat Detail" pada kartu sejarah dan gerak tari.',
    },
    {
      heading: 'Uji Wawasan di Bagian Akhir',
      text: 'Jawab 5 pertanyaan singkat di bagian bawah untuk menguji pengetahuanmu tentang Tari Gandrung Banyuwangi.',
    },
  ],
};