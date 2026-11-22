/**
 * js/rooms/tari/dance-actions.js
 * Konfigurasi ragam gerak khas Tari Gandrung Banyuwangi.
 * Arsitektur terpisah: mudah menambah gerakan baru atau mengganti aset penari
 * di masa mendatang tanpa mengubah mesin gerak panggung.
 */
export const DANCER_ASSET_CONFIG = {
  // Menggunakan aset penari.png yang tersedia.
  // Ganti key/url ini jika di masa depan tersedia sprite khusus Tari Gandrung.
  assetKey: 'penari',
  altText: 'Penari Tari Gandrung Banyuwangi',
};

export const GANDRUNG_ACTIONS = [
  {
    id: 'sembah',
    label: 'Sembah Jejer',
    description: 'Sikap hormat pembuka Tari Gandrung kepada para tamu dan penonton.',
    play(els, gsap) {
      const tl = gsap.timeline();
      tl.to(els.body, { y: 8, scaleY: 0.95, rotation: 0, duration: 0.45, ease: 'sine.inOut' })
        .to(els.fan, { rotation: -22, scale: 0.92, duration: 0.45, ease: 'sine.inOut' }, '<')
        .to(els.sampur, { rotation: 16, duration: 0.45, ease: 'sine.inOut' }, '<')
        .to(els.body, { y: 0, scaleY: 1, duration: 0.55, ease: 'sine.out' })
        .to(els.fan, { rotation: 8, scale: 1, duration: 0.55, ease: 'sine.out' }, '<');
      return tl;
    },
  },
  {
    id: 'kipas',
    label: 'Ayunan Kipas',
    description: 'Gerak kipas anggun yang menjadi ciri khas Tari Gandrung Banyuwangi.',
    play(els, gsap) {
      const tl = gsap.timeline({ repeat: 1 });
      tl.to(els.body, { rotation: -5, y: -5, duration: 0.38, ease: 'sine.inOut' })
        .to(els.fan, { rotation: 48, scale: 1.12, duration: 0.35, ease: 'power2.out' }, '<')
        .to(els.sampur, { rotation: -24, duration: 0.38, ease: 'sine.inOut' }, '<')
        .to(els.body, { rotation: 5, y: 2, duration: 0.42, ease: 'sine.inOut' })
        .to(els.fan, { rotation: -28, scale: 1, duration: 0.42, ease: 'sine.inOut' }, '<')
        .to(els.sampur, { rotation: 20, duration: 0.42, ease: 'sine.inOut' }, '<')
        .to(els.body, { rotation: 0, y: 0, duration: 0.35, ease: 'sine.out' });
      return tl;
    },
  },
  {
    id: 'sampur',
    label: 'Kibasan Sampur',
    description: 'Gerak pergelangan halus (ukel) dipadukan kibasan selendang sampur.',
    play(els, gsap) {
      const tl = gsap.timeline({ repeat: 1 });
      tl.to(els.body, { skewX: -4, y: -4, duration: 0.35, ease: 'sine.inOut' })
        .to(els.sampur, { rotation: -52, scaleY: 1.12, duration: 0.32, ease: 'power2.out' }, '<')
        .to(els.fan, { rotation: 16, duration: 0.35 }, '<')
        .to(els.body, { skewX: 4, y: 3, duration: 0.4, ease: 'sine.inOut' })
        .to(els.sampur, { rotation: 24, scaleY: 1, duration: 0.4, ease: 'sine.inOut' }, '<')
        .to(els.body, { skewX: 0, y: 0, duration: 0.32, ease: 'sine.out' });
      return tl;
    },
  },
  {
    id: 'paju',
    label: 'Putaran Paju',
    description: 'Langkah berputar dinamis penuh semangat kebersamaan khas Banyuwangi.',
    play(els, gsap) {
      const tl = gsap.timeline();
      tl.to(els.body, { scaleX: -1, y: -8, duration: 0.34, ease: 'power2.inOut' })
        .to(els.fan, { rotation: 40, duration: 0.34 }, '<')
        .to(els.sampur, { rotation: -38, duration: 0.34 }, '<')
        .to(els.body, { scaleX: 1, y: 0, duration: 0.36, ease: 'power2.inOut' })
        .to(els.fan, { rotation: 0, duration: 0.36 }, '<')
        .to(els.sampur, { rotation: 0, duration: 0.36 }, '<');
      return tl;
    },
  },
  {
    id: 'netral',
    label: 'Sikap Siap',
    description: 'Kembali ke sikap berdiri anggun di panggung.',
    play(els, gsap) {
      return gsap.to([els.body, els.fan, els.sampur], {
        x: 0,
        y: 0,
        rotation: 0,
        skewX: 0,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 0.35,
        ease: 'power2.out',
      });
    },
  },
];
