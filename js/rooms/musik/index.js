export const musikRoom = {
  id: 'musik',
  title: 'Seni Musik',
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