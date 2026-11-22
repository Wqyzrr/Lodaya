export const tariRoom = {
  id: 'tari',
  title: 'Seni Tari',
  tutorial: null,

  init(mountEl, ctx) {
    this.mountEl = mountEl;
    this.ctx = ctx;
    this.mountEl.innerHTML = '';
  },

  enter() {},
  exit() {},
  resize() {},
};