/* Triggers
   Wires desktop icons, dock items and iOS apps to the window manager. */

function initTriggers() {
  document.querySelectorAll('[data-open]').forEach((el) => {
    el.addEventListener('click', () => { Sound.open(); WM.open(el.dataset.open, el); });
    el.addEventListener('dblclick', () => WM.open(el.dataset.open, el));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        Sound.open();
        WM.open(el.dataset.open, el);
      }
    });
  });

  document.querySelectorAll('[data-close]').forEach((el) => {
    el.addEventListener('click', () => { Sound.close(); WM.close(el.dataset.close); });
  });

  document.querySelectorAll('[data-maximize]').forEach((el) => {
    el.addEventListener('click', () => { Sound.click(); WM.toggleMaximize(el.dataset.maximize); });
  });

  document.querySelectorAll('.os-window').forEach((win) => {
    win.addEventListener('pointerdown', () => WM.focus(win.id.replace('win-', '')));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const visible = document.querySelectorAll('.os-window.is-visible');
      let topWin = null, topZ = -1;
      visible.forEach((w) => {
        const z = parseInt(w.style.zIndex || '0', 10);
        if (z > topZ) { topZ = z; topWin = w; }
      });
      if (topWin) WM.close(topWin.id.replace('win-', ''));
    }
  });
}
