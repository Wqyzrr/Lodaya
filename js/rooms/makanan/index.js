export const makananRoom = {
  id: 'makanan',
  title: 'Kuliner',
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