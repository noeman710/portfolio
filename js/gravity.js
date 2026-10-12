(function () {
function loadMatter() {
  if (window.Matter) return Promise.resolve(window.Matter);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
    s.onload = () => resolve(window.Matter);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
// Gravity mode: desktop icons and widget cards become physics bodies (matter-js).
// They fall to the bottom, collide with each other, the walls and the dock, and can be
// grabbed and thrown. Elements stay in the layout; only their CSS transform is driven,
// so turning gravity off simply floats everything back to its original place.

let resetTimer = null;

function startGravity(desk) {
  clearTimeout(resetTimer);
  let stopped = false;
  let raf = 0;
  let items = [];
  let removeResize = () => {};
  let removeListeners = [];

  (async () => {
    const M = await loadMatter();
    if (stopped) return;
    const { Engine, Bodies, Body, Composite, Constraint } = M;

    const engine = Engine.create({ gravity: { x: 0, y: 1.1 } });
    const els = Array.from(desk.querySelectorAll('.desktop-icons > .desktop-icon, .widgets > .widget'));

    // Measure the true layout position (no leftover transforms / transitions).
    els.forEach((el) => { el.style.transition = 'none'; el.style.transform = 'none'; });
    const dr = desk.getBoundingClientRect();
    const rects = els.map((el) => el.getBoundingClientRect());

    const W = () => desk.clientWidth;
    const H = () => desk.clientHeight;
    const T = 300;
    const opts = { isStatic: true, friction: 0.6 };
    const floor = Bodies.rectangle(W() / 2, H() + T / 2, W() * 3, T, opts);
    const left = Bodies.rectangle(-T / 2, H() / 2, T, H() * 6, opts);
    const right = Bodies.rectangle(W() + T / 2, H() / 2, T, H() * 6, opts);
    const world = [floor, left, right];

    const dockEl = desk.querySelector('.dock');
    let dock = null;
    if (dockEl) {
      const r = dockEl.getBoundingClientRect();
      dock = Bodies.rectangle(r.left - dr.left + r.width / 2, r.top - dr.top + r.height / 2, r.width, r.height, opts);
      world.push(dock);
    }

    items = els.map((el, i) => {
      const r = rects[i];
      const cx = r.left - dr.left + r.width / 2;
      const cy = r.top - dr.top + r.height / 2;
      const isWidget = el.classList.contains('widget');
      const body = Bodies.rectangle(cx, cy, r.width, r.height, {
        restitution: 0.3, friction: 0.5, frictionAir: 0.012, density: isWidget ? 0.0016 : 0.002,
        chamfer: { radius: 6 },
      });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.06);
      Body.setVelocity(body, { x: (Math.random() - 0.5) * 2, y: 0 });
      el.style.willChange = 'transform';
      world.push(body);
      return { el, body, cx, cy, isWidget };
    });
    Composite.add(engine.world, world);

    // ---- grab & throw ----
    items.forEach((it) => {
      const { el, body, isWidget } = it;
      let drag = null;

      const onDown = (e) => {
        if (e.button !== 0) return;
        if (isWidget && e.target.closest('button, a, input, .music-progress')) return;
        e.preventDefault();
        el.setPointerCapture(e.pointerId);
        const px = e.clientX - dr.left;
        const py = e.clientY - dr.top;
        const ox = px - body.position.x;
        const oy = py - body.position.y;
        const c = Math.cos(-body.angle);
        const s = Math.sin(-body.angle);
        const constraint = Constraint.create({
          pointA: { x: px, y: py }, bodyB: body, pointB: { x: ox * c - oy * s, y: ox * s + oy * c },
          stiffness: 0.18, damping: 0.12, length: 0,
        });
        Composite.add(engine.world, constraint);
        drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: false, constraint };
        el.classList.add('is-grabbed');
      };
      const onMove = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        drag.constraint.pointA = { x: e.clientX - dr.left, y: e.clientY - dr.top };
        if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) drag.moved = true;
      };
      const onUp = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        Composite.remove(engine.world, drag.constraint);
        if (drag.moved) el.__wasDragged = true;
        drag = null;
        el.classList.remove('is-grabbed');
      };
      // Swallow the click that ends a drag so it doesn't open the app / follow the link.
      const onClick = (e) => {
        if (el.__wasDragged) { e.stopImmediatePropagation(); e.preventDefault(); el.__wasDragged = false; }
      };

      el.addEventListener('pointerdown', onDown);
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointercancel', onUp);
      el.addEventListener('click', onClick, true);
      removeListeners.push(() => {
        el.removeEventListener('pointerdown', onDown);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
        el.removeEventListener('pointercancel', onUp);
        el.removeEventListener('click', onClick, true);
        el.classList.remove('is-grabbed');
        el.__wasDragged = false;
      });
    });

    // ---- keep walls in sync with the window size ----
    const onResize = () => {
      Body.setPosition(floor, { x: W() / 2, y: H() + T / 2 });
      Body.setPosition(right, { x: W() + T / 2, y: H() / 2 });
      Body.setPosition(left, { x: -T / 2, y: H() / 2 });
    };
    window.addEventListener('resize', onResize);
    removeResize = () => window.removeEventListener('resize', onResize);

    // ---- simulation loop ----
    let last = performance.now();
    const tick = (t) => {
      const dt = Math.min(t - last, 33);
      last = t;
      Engine.update(engine, dt || 16);
      for (const { el, body, cx, cy } of items) {
        el.style.transform = `translate(${(body.position.x - cx).toFixed(2)}px, ${(body.position.y - cy).toFixed(2)}px) rotate(${body.angle.toFixed(4)}rad)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  })();

  return {
    stop(onDone) {
      stopped = true;
      cancelAnimationFrame(raf);
      removeResize();
      removeListeners.forEach((fn) => fn());
      removeListeners = [];
      const list = items;
      items = [];
      if (!list.length) { if (onDone) onDone(); return; }
      // Zero-G: float every element back to its original spot.
      list.forEach(({ el }, i) => {
        el.style.transition = `transform ${(0.8 + Math.random() * 0.4).toFixed(2)}s cubic-bezier(.2,.9,.25,1) ${i * 30}ms`;
        el.style.transform = 'translate(0px, 0px) rotate(0rad)';
      });
      resetTimer = setTimeout(() => {
        list.forEach(({ el }) => { el.style.transition = ''; el.style.transform = ''; el.style.willChange = ''; });
        if (onDone) onDone();
      }, 1700);
    },
  };
}

window.startGravity = startGravity;
})();
