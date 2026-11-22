/**
 * js/rooms/musik/song-config.js
 * Konfigurasi lagu & peta ketukan (beat-map) untuk Piano Tiles: Rek Ayo Rek.
 *
 * CATATAN PENTING SINKRONISASI AUDIO:
 * - Letakkan berkas MP3 asli Anda di: assets/audio/rek-ayo-rek.mp3
 * - Setelah MP3 tersedia, sesuaikan `bpm`, `offset` (detik), dan array `notes`
 *   di bawah ini agar tepat mengikuti ketukan rekaman MP3 Anda.
 * - Selama `bpm` masih bernilai `null` atau berkas MP3 belum tersedia,
 *   permainan otomatis menjalankan pola latihan mudah (Easy) yang santai
 *   tanpa mengklaim sinkronisasi rekaman eksternal.
 */
export const songConfig = {
  title: 'Rek Ayo Rek',
  subtitle: 'Lagu Daerah Jawa Timur (Tingkat Mudah)',
  audio: 'assets/audio/rek-ayo-rek.mp3',
  difficulty: 'easy',
  // Setel BPM & offset sesuai berkas MP3 asli yang Anda masukkan:
  bpm: null,
  offset: 0,
  // Kecepatan jatuh santai (detik dari puncak papan hingga garis ketuk)
  fallDuration: 2.35,
  // Jendela ketuk longgar (detik) agar ramah pengunjung baru
  perfectWindow: 0.22,
  goodWindow: 0.42,
  // Durasi total peta latihan (detik)
  duration: 36,
  // Format setiap nada: { time: detik_saat_menyentuh_garis, lane: 0..3 }
  notes: [
    { time: 2.2, lane: 0 },
    { time: 3.1, lane: 1 },
    { time: 4.0, lane: 2 },
    { time: 4.9, lane: 3 },
    { time: 5.9, lane: 2 },
    { time: 6.8, lane: 1 },
    { time: 7.8, lane: 0 },
    { time: 8.8, lane: 2 },
    { time: 9.8, lane: 1 },
    { time: 10.7, lane: 3 },
    { time: 11.7, lane: 2 },
    { time: 12.7, lane: 0 },
    { time: 13.7, lane: 1 },
    { time: 14.6, lane: 2 },
    { time: 15.6, lane: 3 },
    { time: 16.6, lane: 1 },
    { time: 17.6, lane: 2 },
    { time: 18.5, lane: 0 },
    { time: 19.5, lane: 3 },
    { time: 20.5, lane: 2 },
    { time: 21.5, lane: 1 },
    { time: 22.4, lane: 0 },
    { time: 23.4, lane: 2 },
    { time: 24.4, lane: 3 },
    { time: 25.4, lane: 1 },
    { time: 26.4, lane: 2 },
    { time: 27.3, lane: 0 },
    { time: 28.3, lane: 1 },
    { time: 29.3, lane: 3 },
    { time: 30.3, lane: 2 },
    { time: 31.3, lane: 1 },
    { time: 32.3, lane: 0 },
    { time: 33.4, lane: 2 },
  ],
};
