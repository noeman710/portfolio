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
    const SEL = '.desktop-icons > .desktop-icon, .widgets > .widget, .os-window.is-visible';
    const W = () => desk.clientWidth;
    const H = () => desk.clientHeight;
    const T = 300;
    const opts = { isStatic: true, friction: 0.6 };
    const floor = Bodies.rectangle(W() / 2, H() + T / 2, W() * 3, T, opts);
    const left = Bodies.rectangle(-T / 2, H() / 2, T, H() * 6, opts);
    const right = Bodies.rectangle(W() + T / 2, H() / 2, T, H() * 6, opts);
    const world = [floor, left, right];

    const dockEl = desk.querySelector('.dock');
    if (dockEl) {
      const dr0 = desk.getBoundingClientRect();
      const r = dockEl.getBoundingClientRect();
      world.push(Bodies.rectangle(r.left - dr0.left + r.width / 2, r.top - dr0.top + r.height / 2, r.width, r.height, opts));
    }
    Composite.add(engine.world, world);

    const tracked = new Set();

    function addItem(el) {
      if (tracked.has(el)) return;
      tracked.add(el);
      const isWin = el.classList.contains('os-window');
      const isWidget = el.classList.contains('widget');
      // Measure the true layout position (no leftover transform / transition).
      el.style.transition = 'none';
      el.style.transform = 'none';
      const dr = desk.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      if (isWin) el.style.transition = 'opacity 0.28s';
      const cx = r.left - dr.left + r.width / 2;
      const cy = r.top - dr.top + r.height / 2;
      const body = Bodies.rectangle(cx, cy, r.width, r.height, {
        restitution: 0.25, friction: 0.5, frictionAir: 0.012,
        density: isWin ? 0.0006 : isWidget ? 0.0016 : 0.002,
        chamfer: { radius: 6 },
      });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * (isWin ? 0.01 : 0.06));
      Body.setVelocity(body, { x: (Math.random() - 0.5) * 2, y: 0 });
      el.style.willChange = 'transform';
      Composite.add(engine.world, body);
      const it = { el, body, cx, cy, off: null };
      items.push(it);

      // ---- grab & throw (windows are grabbed by their title bar) ----
      let drag = null;
      const grabbable = (e) => {
        if (isWin) return !!e.target.closest('.window-titlebar') && !e.target.closest('.traffic-lights');
        return !(isWidget && e.target.closest('button, a, input, .music-progress'));
      };
      const onDown = (e) => {
        if (e.button !== 0 || !grabbable(e)) return;
        e.preventDefault();
        e.stopPropagation(); // keep the normal title-bar dragger out of it
        if (isWin && typeof WM !== 'undefined') WM.focus(el.id.replace('win-', ''));
        el.setPointerCapture(e.pointerId);
        const d = desk.getBoundingClientRect();
        const px = e.clientX - d.left;
        const py = e.clientY - d.top;
        const ox = px - body.position.x;
        const oy = py - body.position.y;
        const c = Math.cos(-body.angle);
        const sn = Math.sin(-body.angle);
        const constraint = Constraint.create({
          pointA: { x: px, y: py }, bodyB: body, pointB: { x: ox * c - oy * sn, y: ox * sn + oy * c },
          stiffness: 0.18, damping: 0.12, length: 0,
        });
        Composite.add(engine.world, constraint);
        drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: false, constraint };
        el.classList.add('is-grabbed');
      };
      const onMove = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = desk.getBoundingClientRect();
        drag.constraint.pointA = { x: e.clientX - d.left, y: e.clientY - d.top };
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
      el.addEventListener('pointerdown', onDown, true);
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointercancel', onUp);
      el.addEventListener('click', onClick, true);
      it.cleanup = () => {
        el.removeEventListener('pointerdown', onDown, true);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
        el.removeEventListener('pointercancel', onUp);
        el.removeEventListener('click', onClick, true);
        el.classList.remove('is-grabbed');
        el.__wasDragged = false;
        if (drag) Composite.remove(engine.world, drag.constraint);
      };
    }

    // Windows can be opened/closed while gravity is on: keep bodies in sync.
    function sync() {
      const live = new Set(desk.querySelectorAll(SEL));
      live.forEach((el) => addItem(el));
      items = items.filter((it) => {
        if (live.has(it.el)) return true;
        Composite.remove(engine.world, it.body);
        it.cleanup();
        tracked.delete(it.el);
        it.el.style.transform = '';
        it.el.style.willChange = '';
        if (it.el.classList.contains('os-window')) it.el.style.transition = '';
        return false;
      });
    }
    sync();
    const syncTimer = setInterval(sync, 150);
    removeListeners.push(() => clearInterval(syncTimer));

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
      items.forEach((it) => it.cleanup && it.cleanup());
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
