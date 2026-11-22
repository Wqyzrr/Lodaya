/**
 * js/rooms/makanan/cooking-engine.js
 * Mesin memasak hibrida (Ketuk + Seret & Lepas ramah layar sentuh dan pengunjung 40-50+).
 * Mendukung seret-lepas dengan Pointer Events sekaligus fallback ketuk langsung
 * agar pengunjung yang belum terbiasa menyeret tetap dapat menyelesaikan setiap langkah.
 */
import { VESSEL_SVGS } from './recipes.js';

export class CookingEngine {
  constructor(dom, callbacks) {
    this.dom = dom;
    this.callbacks = callbacks;
    this.recipe = null;
    this.stepIndex = 0;
    this.completedItems = new Set();
    this.actionTaps = 0;
    this.toastTimer = null;

    // Status seret
    this.dragState = null;
    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);
  }

  startRecipe(recipe) {
    this.recipe = recipe;
    this.stepIndex = 0;
    this.renderStep();
  }

  repeatInstruction() {
    if (!this.recipe) return;
    const step = this.recipe.steps[this.stepIndex];
    if (!step) return;
    this.showToast(step.instruction);
  }

  showToast(message) {
    clearTimeout(this.toastTimer);
    this.dom.toastEl.textContent = message;
    this.dom.toastEl.classList.add('is-visible');
    this.toastTimer = setTimeout(() => {
      this.dom.toastEl.classList.remove('is-visible');
    }, 2400);
  }

  renderStep() {
    if (!this.recipe) return;
    const steps = this.recipe.steps;
    if (this.stepIndex >= steps.length) {
      this.callbacks.onComplete(this.recipe);
      return;
    }

    const step = steps[this.stepIndex];
    this.completedItems.clear();
    this.actionTaps = 0;

    // Perbarui panel panduan
    this.dom.stepBadgeEl.textContent = step.title;
    this.dom.instructionEl.textContent = step.instruction;
    this.dom.progressTextEl.textContent = `Langkah ${this.stepIndex + 1} / ${steps.length}`;
    this.dom.progressFillEl.style.width = `${Math.round(((this.stepIndex + 1) / steps.length) * 100)}%`;

    // Perbarui wadah masak
    this.dom.vesselSvgEl.innerHTML = VESSEL_SVGS[step.vessel] || VESSEL_SVGS.mangkuk;
    this.dom.vesselLabelEl.textContent = step.vesselLabel;
    this.dom.vesselStationEl.classList.toggle('is-drop-ready', step.type === 'drag-drop');

    // Bersihkan baki bahan
    this.dom.trayEl.innerHTML = '';

    if (step.type === 'tap-select' || step.type === 'drag-drop') {
      this.dom.actionBtn.hidden = true;
      this.dom.trayTitleEl.textContent =
        step.type === 'drag-drop' ? 'Seret Bahan ke Wadah (atau Ketuk)' : 'Ketuk Semua Bahan yang Disorot';
      this.dom.vesselStatusEl.textContent =
        step.type === 'drag-drop'
          ? `0 dari ${step.items.length} bahan dimasukkan`
          : `0 dari ${step.items.length} bahan disiapkan`;

      step.items.forEach((item) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'ingredient-item is-target';
        el.dataset.itemId = item.id;
        el.innerHTML = `
          <span class="ingredient-swatch" style="background:${item.color}" aria-hidden="true"></span>
          <span>${item.label}</span>
        `;

        if (step.type === 'tap-select') {
          el.addEventListener('click', () => this.completeItem(item, el, step));
        } else {
          el.addEventListener('pointerdown', (e) => this.startDrag(e, item, el, step));
        }

        this.dom.trayEl.appendChild(el);
      });
    } else if (step.type === 'action') {
      this.dom.trayTitleEl.textContent = 'Tahap Pengolahan';
      this.dom.trayEl.innerHTML = `
        <div style="grid-column:1/-1; font-size:0.86rem; line-height:1.5; color:rgba(245,233,211,0.88); padding:0.3rem;">
          Ketuk tombol di sebelah kanan untuk melanjutkan proses memasak <strong>${this.recipe.name}</strong>.
        </div>
      `;
      this.dom.actionBtn.hidden = false;
      this.dom.actionBtn.textContent = step.actionLabel;
      this.dom.vesselStatusEl.textContent = `Ketuk ${step.requiredTaps} kali untuk menyelesaikan langkah ini`;
      this.dom.actionBtn.onclick = () => this.handleActionTap(step);
    }
  }

  completeItem(item, el, step) {
    if (this.completedItems.has(item.id)) return;
    this.completedItems.add(item.id);
    el.classList.remove('is-target');
    el.classList.add('is-done');
    el.disabled = true;

    const doneCount = this.completedItems.size;
    const total = step.items.length;
    this.dom.vesselStatusEl.textContent =
      step.type === 'drag-drop'
        ? `${doneCount} dari ${total} bahan dimasukkan`
        : `${doneCount} dari ${total} bahan disiapkan`;

    this.showToast(`${item.label} berhasil ditambahkan.`);

    if (doneCount >= total) {
      setTimeout(() => {
        this.stepIndex += 1;
        this.renderStep();
      }, 480);
    }
  }

  startDrag(e, item, el, step) {
    if (this.completedItems.has(item.id)) return;
    e.preventDefault();

    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.textContent = item.label;
    ghost.style.left = `${e.clientX}px`;
    ghost.style.top = `${e.clientY}px`;
    document.body.appendChild(ghost);

    this.dragState = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      item,
      el,
      step,
      ghost,
    };

    window.addEventListener('pointermove', this.boundPointerMove, { passive: false });
    window.addEventListener('pointerup', this.boundPointerUp);
    window.addEventListener('pointercancel', this.boundPointerUp);
  }

  onPointerMove(e) {
    if (!this.dragState || e.pointerId !== this.dragState.pointerId) return;
    e.preventDefault();
    const dx = e.clientX - this.dragState.startX;
    const dy = e.clientY - this.dragState.startY;
    if (Math.hypot(dx, dy) > 10) this.dragState.moved = true;
    this.dragState.ghost.style.left = `${e.clientX}px`;
    this.dragState.ghost.style.top = `${e.clientY}px`;
  }

  onPointerUp(e) {
    if (!this.dragState || e.pointerId !== this.dragState.pointerId) return;
    const { item, el, step, ghost, moved } = this.dragState;
    this.cleanupDrag();
    ghost.remove();

    const targetRect = this.dom.vesselStationEl.getBoundingClientRect();
    const insideDrop =
      e.clientX >= targetRect.left - 24 &&
      e.clientX <= targetRect.right + 24 &&
      e.clientY >= targetRect.top - 24 &&
      e.clientY <= targetRect.bottom + 24;

    // Izinkan lepas di wadah ATAU ketuk cepat (aksesibilitas pengunjung 40-50+)
    if (insideDrop || !moved) {
      this.completeItem(item, el, step);
    } else {
      this.showToast(`Seret ${item.label} ke area ${step.vesselLabel} di sebelah kanan.`);
    }
  }

  cleanupDrag() {
    this.dragState = null;
    window.removeEventListener('pointermove', this.boundPointerMove);
    window.removeEventListener('pointerup', this.boundPointerUp);
    window.removeEventListener('pointercancel', this.boundPointerUp);
  }

  handleActionTap(step) {
    this.actionTaps += 1;
    if (window.gsap) {
      window.gsap.fromTo(
        this.dom.vesselSvgEl,
        { scale: 0.94, rotation: -3 },
        { scale: 1, rotation: 0, duration: 0.3, ease: 'back.out(2)' }
      );
    }

    const remaining = step.requiredTaps - this.actionTaps;
    if (remaining > 0) {
      this.dom.vesselStatusEl.textContent = `Bagus! Ketuk ${remaining} kali lagi.`;
      this.showToast('Proses berlangsung...');
    } else {
      this.dom.actionBtn.hidden = true;
      this.dom.vesselStatusEl.textContent = 'Tahap selesai!';
      this.showToast('Langkah berhasil diselesaikan.');
      setTimeout(() => {
        this.stepIndex += 1;
        this.renderStep();
      }, 520);
    }
  }

  destroy() {
    if (this.dragState && this.dragState.ghost) {
      this.dragState.ghost.remove();
    }
    this.cleanupDrag();
    clearTimeout(this.toastTimer);
  }
}
