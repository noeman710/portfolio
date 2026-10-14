/* Window dragging
   Move windows by their title bar. */

function initDragging() {
  if (IS_MOBILE) return;
  document.querySelectorAll('.window-titlebar').forEach((bar) => {
    let dragging = false;
    let startX, startY, startLeft, startTop;
    const win = bar.closest('.os-window');

    bar.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.traffic-lights')) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = win.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      win.style.left = startLeft + 'px';
      win.style.top = startTop + 'px';
      WM.focus(win.id.replace('win-', ''));
      bar.setPointerCapture(e.pointerId);
    });

    bar.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      win.style.left = Math.max(0, startLeft + dx) + 'px';
      win.style.top = Math.max(28, startTop + dy) + 'px';
    });

    ['pointerup', 'pointercancel'].forEach((evt) => {
      bar.addEventListener(evt, () => { dragging = false; });
    });
  });
}
