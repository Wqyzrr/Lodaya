/**
 * js/rooms/tari/movement.js
 * Pengendali gerak bebas hibrida (Joystick Virtual Mobile + Keyboard WASD/Panah)
 * dengan batas panggung yang selalu dihitung ulang saat ukuran layar berubah.
 */
export class StageMovementController {
  constructor(stageEl, dancerRigEl, joystickBaseEl, joystickKnobEl, onMoveStateChange) {
    this.stageEl = stageEl;
    this.dancerRigEl = dancerRigEl;
    this.joystickBaseEl = joystickBaseEl;
    this.joystickKnobEl = joystickKnobEl;
    this.onMoveStateChange = onMoveStateChange;

    this.x = 0;
    this.y = 0;
    this.facing = 1;
    this.speed = 210; // piksel per detik
    this.keys = new Set();
    this.joyVec = { x: 0, y: 0 };
    this.joyPointerId = null;
    this.isMoving = false;
    this.rafId = null;
    this.lastTime = 0;

    this.bounds = { minX: 20, maxX: 400, minY: 100, maxY: 260 };

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundJoyDown = this.handleJoyDown.bind(this);
    this.boundJoyMove = this.handleJoyMove.bind(this);
    this.boundJoyUp = this.handleJoyUp.bind(this);
    this.tick = this.tick.bind(this);
  }

  recalculateBounds(centerIfFirst = false) {
    const stageRect = this.stageEl.getBoundingClientRect();
    const rigRect = this.dancerRigEl.getBoundingClientRect();
    const w = stageRect.width || 640;
    const h = stageRect.height || 320;
    const rw = rigRect.width || 110;
    const rh = rigRect.height || 150;

    this.bounds = {
      minX: Math.max(16, w * 0.14),
      maxX: Math.max(24, w - rw - w * 0.08),
      minY: Math.max(16, h * 0.24),
      maxY: Math.max(24, h - rh - 10),
    };

    if (centerIfFirst) {
      this.x = (this.bounds.minX + this.bounds.maxX) * 0.5;
      this.y = this.bounds.minY + (this.bounds.maxY - this.bounds.minY) * 0.65;
    } else {
      this.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, this.x));
      this.y = Math.max(this.bounds.minY, Math.min(this.bounds.maxY, this.y));
    }

    this.applyTransform();
  }

  start() {
    this.recalculateBounds(this.x === 0 && this.y === 0);
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    this.joystickBaseEl.addEventListener('pointerdown', this.boundJoyDown);
    window.addEventListener('pointermove', this.boundJoyMove, { passive: false });
    window.addEventListener('pointerup', this.boundJoyUp);
    window.addEventListener('pointercancel', this.boundJoyUp);

    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.keys.clear();
    this.joyVec = { x: 0, y: 0 };
    this.joyPointerId = null;
    this.resetKnob();

    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    this.joystickBaseEl.removeEventListener('pointerdown', this.boundJoyDown);
    window.removeEventListener('pointermove', this.boundJoyMove);
    window.removeEventListener('pointerup', this.boundJoyUp);
    window.removeEventListener('pointercancel', this.boundJoyUp);
  }

  handleKeyDown(e) {
    const code = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(code)) {
      this.keys.add(code);
    }
  }

  handleKeyUp(e) {
    this.keys.delete(e.key.toLowerCase());
  }

  handleJoyDown(e) {
    e.preventDefault();
    this.joyPointerId = e.pointerId;
    this.updateJoystick(e.clientX, e.clientY);
  }

  handleJoyMove(e) {
    if (this.joyPointerId === null || e.pointerId !== this.joyPointerId) return;
    e.preventDefault();
    this.updateJoystick(e.clientX, e.clientY);
  }

  handleJoyUp(e) {
    if (this.joyPointerId === null || e.pointerId !== this.joyPointerId) return;
    this.joyPointerId = null;
    this.joyVec = { x: 0, y: 0 };
    this.resetKnob();
  }

  updateJoystick(clientX, clientY) {
    const rect = this.joystickBaseEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width * 0.36;

    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }

    this.joyVec.x = dx / maxR;
    this.joyVec.y = dy / maxR;
    this.joystickKnobEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }

  resetKnob() {
    this.joystickKnobEl.style.transform = 'translate(-50%, -50%)';
  }

  tick(now) {
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;

    let vx = this.joyVec.x;
    let vy = this.joyVec.y;

    if (this.keys.has('arrowleft') || this.keys.has('a')) vx -= 1;
    if (this.keys.has('arrowright') || this.keys.has('d')) vx += 1;
    if (this.keys.has('arrowup') || this.keys.has('w')) vy -= 1;
    if (this.keys.has('arrowdown') || this.keys.has('s')) vy += 1;

    const mag = Math.hypot(vx, vy);
    const movingNow = mag > 0.1;

    if (movingNow) {
      if (mag > 1) {
        vx /= mag;
        vy /= mag;
      }
      this.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, this.x + vx * this.speed * dt));
      this.y = Math.max(this.bounds.minY, Math.min(this.bounds.maxY, this.y + vy * this.speed * dt));
      if (Math.abs(vx) > 0.15) {
        this.facing = vx < 0 ? -1 : 1;
      }
      this.applyTransform();
    }

    if (movingNow !== this.isMoving) {
      this.isMoving = movingNow;
      if (this.onMoveStateChange) this.onMoveStateChange(movingNow, this.facing);
    }

    this.rafId = requestAnimationFrame(this.tick);
  }

  applyTransform() {
    this.dancerRigEl.style.transform = `translate3d(${this.x.toFixed(1)}px, ${this.y.toFixed(1)}px, 0)`;
  }
}
