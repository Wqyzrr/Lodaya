/**
 * js/rooms/peran/story-data.js
 * Data cerita linear Buku Bergambar Reog Ponorogo.
 * Untuk menambah atau mengubah halaman, cukup sunting array STORY_PAGES di bawah ini
 * tanpa perlu mengubah logika di index.js.
 */
export const STORY_PAGES = [
  {
    id: 'pengenalan',
    contextType: 'fact',
    contextLabel: 'Konteks Budaya',
    title: 'Warisan Kebanggaan Ponorogo',
    body: 'Reog Ponorogo adalah seni pertunjukan tradisional khas Kabupaten Ponorogo, Jawa Timur, yang memadukan tari, musik gamelan, topeng, dan unsur teater rakyat. Pertunjukan ini kerap hadir dalam perayaan masyarakat, festival budaya, hingga penyambutan tamu kehormatan.',
    note: 'Reog Ponorogo telah diakui sebagai Warisan Budaya Takbenda dan menjadi salah satu ikon budaya paling dikenal dari Jawa Timur.',
    artKeys: ['reog'],
    artCaption: 'Dadak Merak — Ikon Utama Reog Ponorogo',
  },
  {
    id: 'dadak-merak',
    contextType: 'fact',
    contextLabel: 'Unsur Visual',
    title: 'Megahnya Topeng Dadak Merak',
    body: 'Pusat perhatian pertunjukan Reog adalah Dadak Merak, yakni topeng berkepala harimau (Singa Barong) yang dihiasi mahkota bulu burung merak asli yang mengembang megah. Bobotnya dapat mencapai puluhan kilogram dan ditopang oleh kekuatan leher serta gigitan penari Pembarong.',
    note: 'Singa Barong melambangkan keberanian dan keteguhan, sedangkan bulu merak menggambarkan keindahan serta wibawa.',
    artKeys: ['reog'],
    artCaption: 'Perpaduan Singa Barong dan Hiasan Bulu Merak',
  },
  {
    id: 'legenda-klono',
    contextType: 'legend',
    contextLabel: 'Legenda Rakyat',
    title: 'Kisah Prabu Klono Sewandono',
    body: 'Dalam salah satu versi cerita rakyat yang populer di masyarakat, dikisahkan Prabu Klono Sewandono dari Kerajaan Bantarangin hendak melamar Putri Dewi Songgolangit dari Kediri. Sang putri mengajukan syarat berupa tontonan seni yang belum pernah ada sebelumnya.',
    note: 'Cerita ini merupakan tradisi lisan (legenda rakyat) yang berkembang dalam berbagai versi di tengah masyarakat Ponorogo.',
    artKeys: ['wayang1'],
    artCaption: 'Ilustrasi Tokoh Klasik dalam Kisah Tradisi Jawa',
  },
  {
    id: 'bujang-ganong',
    contextType: 'legend',
    contextLabel: 'Tokoh Pertunjukan',
    title: 'Bujang Ganong yang Cerdik dan Lincah',
    body: 'Di sisi sang raja berdiri Patih Pujangga Anom, yang lebih dikenal sebagai Bujang Ganong. Ia digambarkan mengenakan topeng merah dengan mata melotot dan hidung panjang. Meski berwajah jenaka, gerakannya sangat lincah, akrobatik, dan penuh kecerdikan.',
    note: 'Tokoh Bujang Ganong kerap menjadi penghubung suasana yang menghibur penonton dari berbagai usia.',
    artKeys: ['topeng'],
    artCaption: 'Topeng Tradisional Penuh Ekspresi',
  },
  {
    id: 'jathilan',
    contextType: 'fact',
    contextLabel: 'Ragam Tari Pendamping',
    title: 'Derap Pasukan Jathilan',
    body: 'Sebelum Singa Barong tampil penuh, panggung disemarakkan oleh tarian Jathilan (kuda lumping). Para penari menunggangi properti kuda kepang anyaman bambu dengan gerakan serempak yang menggambarkan ketangkasan serta kedisiplinan prajurit berkuda.',
    note: 'Harmoni antara penari Jathilan, Bujang Ganong, Warok, dan Pembarong mencerminkan kekompakan tim.',
    artKeys: ['kudalumping', 'kudalumping2'],
    artCaption: 'Penari Kuda Kepang (Jathilan) Pengiring Reog',
  },
  {
    id: 'makna-nilai',
    contextType: 'fact',
    contextLabel: 'Nilai & Makna',
    title: 'Cerminan Gotong Royong Masyarakat',
    body: 'Di balik kemegahan panggungnya, pementasan Reog Ponorogo melibatkan puluhan orang: mulai dari penari, pengrawit pengiring kendang, kenong, kempul, dan terompet slompret, hingga perajin topeng dan kostum. Tanpa kerja sama yang erat, pertunjukan ini tidak dapat berjalan.',
    note: 'Reog mengajarkan bahwa kekuatan sejati lahir dari disiplin, saling menghormati, dan kebersamaan.',
    artKeys: ['wayang2'],
    artCaption: 'Simbol Harmoni dan Kebijaksanaan Nusantara',
  },
  {
    id: 'penutup',
    contextType: 'fact',
    contextLabel: 'Apresiasi Budaya',
    title: 'Menjaga Nyala Tradisi Jawa Timur',
    body: 'Hingga kini, masyarakat Ponorogo dan generasi muda terus melestarikan seni Reog melalui sanggar tari, festival tahunan Grebeg Suro, dan pengenalan di lingkungan sekolah. Mengenal kisahnya adalah langkah awal untuk ikut merawat kekayaan budaya bangsa.',
    note: 'Terima kasih telah menyimak kisah Reog Ponorogo. Anda dapat kembali ke Rumah Joglo untuk menjelajahi ruang budaya lainnya.',
    artKeys: ['wayang3'],
    artCaption: 'Akhir Kisah — Lestari Budaya Jawa Timur',
  },
];
