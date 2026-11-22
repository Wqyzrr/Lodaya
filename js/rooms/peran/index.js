export const peranRoom = {
  id: 'peran',
  title: 'Seni Peran',
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