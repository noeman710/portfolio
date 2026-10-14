/* Gravity toggle
   Menu-bar switch and the G shortcut; the physics lives in effects/gravity.js. */

function initGravity() {
  const btn = document.getElementById('gravity-toggle');
  const desk = document.querySelector('.desktop');
  if (!btn || !desk || !window.startGravity) return;
  let g = null;
  const set = (on) => {
    if (on === !!g) return;
    btn.setAttribute('aria-checked', on ? 'true' : 'false');
    desk.classList.toggle('gravity-on', on);
    Sound.resume(); if (on) Sound.gravityOn(); else Sound.gravityOff();
    if (on) { g = window.startGravity(desk); }
    else { const cur = g; g = null; cur.stop(); }
  };
  btn.addEventListener('click', () => set(!g));
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'g' || e.key === 'G') && !e.metaKey && !e.ctrlKey && !e.altKey &&
        !/INPUT|TEXTAREA/.test((e.target.tagName || '')) && !e.target.isContentEditable) set(!g);
  });
}
