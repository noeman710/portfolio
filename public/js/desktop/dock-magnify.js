/* Dock magnification
   macOS-style zoom on dock icons. */

function initDockMagnify() {
  if (IS_MOBILE) return;
  const dock = document.querySelector('.dock');
  if (!dock) return;
  const items = Array.from(dock.querySelectorAll('.dock-item'));
  let lastPeak = null;

  dock.addEventListener('pointermove', (e) => {
    const mouseX = e.clientX;
    let peak = null;
    let peakScale = 1;
    items.forEach((item) => {
      const r = item.getBoundingClientRect();
      const center = r.left + r.width / 2;
      const dist = Math.abs(mouseX - center);
      const scale = Math.max(1, 1.35 - dist / 160);
      item.style.transform = `scale(${scale.toFixed(2)}) translateY(${(scale - 1) * -10}px)`;
      if (scale > peakScale) { peakScale = scale; peak = item; }
    });
    if (peak && peak !== lastPeak && peakScale > 1.15) {
      Sound.hover();
    }
    lastPeak = peak;
  });

  dock.addEventListener('pointerleave', () => {
    items.forEach((item) => { item.style.transform = 'scale(1)'; });
    lastPeak = null;
  });
}
