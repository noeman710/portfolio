/* BorderGlow for widgets
   Vanilla port of the React Bits <BorderGlow /> component (same CSS, same maths, see app/styles/border-glow.css).
   Every .widget becomes a glow card: the border + outer glow light up on the side the pointer is closest to. */

(function () {
  // Exactly the React Bits defaults / usage example.
  const OPTS = {
    edgeSensitivity: 30,
    glowColor: '40 80 80',
    backgroundColor: '#05080C',
    borderRadius: 28,
    glowRadius: 40,
    glowIntensity: 1.0,
    coneSpread: 25,
    fillOpacity: 0.5,
    colors: ['#c084fc', '#f472b6', '#38bdf8'],
  };

  const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
  const GRADIENT_KEYS = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'];
  const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

  function glowVars(glowColor, intensity) {
    const [h, s, l] = glowColor.split(/\s+/).map(parseFloat);
    const base = `${h}deg ${s}% ${l}%`;
    const opacities = [100, 60, 50, 40, 30, 20, 10];
    const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
    const vars = {};
    opacities.forEach((o, i) => { vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(o * intensity, 100)}%)`; });
    return vars;
  }

  function gradientVars(colors) {
    const vars = {};
    for (let i = 0; i < 7; i++) {
      const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
      vars[GRADIENT_KEYS[i]] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`;
    }
    vars['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`;
    return vars;
  }

  function onMove(e) {
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const cx = r.width / 2, cy = r.height / 2;
    const dx = e.clientX - r.left - cx, dy = e.clientY - r.top - cy;
    const kx = dx !== 0 ? cx / Math.abs(dx) : Infinity;
    const ky = dy !== 0 ? cy / Math.abs(dy) : Infinity;
    const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    let deg = dx === 0 && dy === 0 ? 0 : Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;
    card.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
    card.style.setProperty('--cursor-angle', deg.toFixed(3) + 'deg');
  }

  function apply(card, over) {
    if (card.classList.contains('border-glow-card')) return;
    const o = { ...OPTS, ...(over || {}) };
    card.classList.add('border-glow-card');
    const vars = {
      '--card-bg': o.backgroundColor,
      '--edge-sensitivity': o.edgeSensitivity,
      '--border-radius': o.borderRadius + 'px',
      '--glow-padding': o.glowRadius + 'px',
      '--cone-spread': o.coneSpread,
      '--fill-opacity': o.fillOpacity,
      ...glowVars(o.glowColor, o.glowIntensity),
      ...gradientVars(o.colors),
    };
    Object.entries(vars).forEach(([k, v]) => card.style.setProperty(k, v));

    const edge = document.createElement('span');
    edge.className = 'edge-light';
    const inner = document.createElement('div');
    inner.className = 'border-glow-inner';
    // Moves the nodes (listeners stay attached). Window resize handles stay on the card so they are not clipped.
    [...card.childNodes].forEach((n) => { if (!(n.classList && n.classList.contains('window-resize-handle'))) inner.appendChild(n); });
    card.append(edge, inner);
    card.addEventListener('pointermove', onMove);
  }

  // Windows ("tabs") use the same card, on the dark #05080C background.
  const TAB = { backgroundColor: '#05080C' };
  function applyTab(el) { el.classList.add('glow-tab'); apply(el, TAB); }
  window.BorderGlow = { apply, applyTab };

  function init() {
    document.querySelectorAll('.widget').forEach((w) => apply(w));
    document.querySelectorAll('.os-window').forEach(applyTab);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
