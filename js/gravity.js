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

    // ---- collision sounds ----
    const kindOf = (el) => el.classList.contains('os-window') ? 'window'
      : el.classList.contains('widget') ? 'widget'
      : el.classList.contains('finder-file') ? 'card' : 'icon';
    const owner = new Map(); // matter body -> element
    let lastHit = 0;
    const lastBody = new WeakMap();
    function hookSounds(eng) {
      Matter.Events.on(eng, 'collisionStart', (ev) => {
        if (typeof Sound === 'undefined' || stopped) return;
        const now = performance.now();
        if (now - lastHit < 55) return; // keep it from turning into noise
        for (const pair of ev.pairs) {
          const a = pair.bodyA, b = pair.bodyB;
          const speed = Math.hypot(a.velocity.x - b.velocity.x, a.velocity.y - b.velocity.y);
          if (speed < 1.6) continue;
          const dyn = [a, b].filter((x) => owner.has(x));
          if (!dyn.length) continue;
          const body = dyn.reduce((p, c) => (c.mass > p.mass ? c : p));
          if (now - (lastBody.get(body) || 0) < 140) continue;
          lastBody.set(body, now);
          lastHit = now;
          Sound.impact(kindOf(owner.get(body)), Math.min(1, speed / 14), dyn.length === 2);
          break;
        }
      });
    }
    hookSounds(engine);

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
      owner.set(body, el);
      const it = { el, body, cx, cy, off: null };
      items.push(it);

      const toLocal = (e) => {
        const d = desk.getBoundingClientRect();
        return { x: e.clientX - d.left, y: e.clientY - d.top };
      };
      const grabbable = (e) => {
        if (isWin) return !!e.target.closest('.window-titlebar') && !e.target.closest('.traffic-lights');
        return !(isWidget && e.target.closest('button, a, input, .music-progress'));
      };
      it.cleanup = attachGrab(el, body, engine, toLocal, grabbable, () => {
        if (isWin && typeof WM !== 'undefined') WM.focus(el.id.replace('win-', ''));
      });
      if (isWin) it.sub = createSub(el, it, r);
    }

    // Generic grab & throw: drag a body with a spring constraint. `toLocal` maps a
    // pointer event into that body's world coordinates.
    function attachGrab(el, body, eng, toLocal, grabbable, beforeGrab) {
      let drag = null;
      const onDown = (e) => {
        if (e.button !== 0 || !grabbable(e)) return;
        e.preventDefault();
        e.stopPropagation(); // keep the normal title-bar dragger / click handlers out of it
        if (beforeGrab) beforeGrab();
        el.setPointerCapture(e.pointerId);
        const p = toLocal(e);
        const ox = p.x - body.position.x;
        const oy = p.y - body.position.y;
        const c = Math.cos(-body.angle);
        const sn = Math.sin(-body.angle);
        const constraint = Constraint.create({
          pointA: { x: p.x, y: p.y }, bodyB: body, pointB: { x: ox * c - oy * sn, y: ox * sn + oy * c },
          stiffness: 0.18, damping: 0.12, length: 0,
        });
        Composite.add(eng.world, constraint);
        drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: false, constraint };
        el.classList.add('is-grabbed');
      };
      const onMove = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        e.stopPropagation();
        drag.constraint.pointA = toLocal(e);
        if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) drag.moved = true;
      };
      const onUp = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        Composite.remove(eng.world, drag.constraint);
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
      return () => {
        el.removeEventListener('pointerdown', onDown, true);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
        el.removeEventListener('pointercancel', onUp);
        el.removeEventListener('click', onClick, true);
        el.classList.remove('is-grabbed');
        el.__wasDragged = false;
        if (drag) Composite.remove(eng.world, drag.constraint);
      };
    }

    // Items inside a window (Work / Photos cards) fall inside that window, in their own
    // little world whose floor and walls are the window body.
    function createSub(win, winIt, winRect) {
      const bodyEl = win.querySelector('.window-body');
      if (!bodyEl) return null;
      const kids = Array.from(bodyEl.querySelectorAll('.finder-file'));
      if (!kids.length) return null;
      bodyEl.scrollTop = 0;
      bodyEl.classList.add('g-lock');
      const br = bodyEl.getBoundingClientRect();
      const offX = br.left - winRect.left;
      const offY = br.top - winRect.top;
      const bw = bodyEl.clientWidth;
      const bh = bodyEl.clientHeight;
      const eng = Engine.create({ gravity: { x: 0, y: 1.1 } });
      const o = { isStatic: true, friction: 0.6 };
      Composite.add(eng.world, [
        Bodies.rectangle(bw / 2, bh + T / 2, bw * 3, T, o),
        Bodies.rectangle(-T / 2, bh / 2, T, bh * 6, o),
        Bodies.rectangle(bw + T / 2, bh / 2, T, bh * 6, o),
      ]);
      const toLocal = (e) => {
        // pointer -> window-body coordinates, undoing the window's physics transform
        const d = desk.getBoundingClientRect();
        const px = e.clientX - d.left - winIt.body.position.x;
        const py = e.clientY - d.top - winIt.body.position.y;
        const c = Math.cos(-winIt.body.angle);
        const sn = Math.sin(-winIt.body.angle);
        return { x: px * c - py * sn + winRect.width / 2 - offX, y: px * sn + py * c + winRect.height / 2 - offY };
      };
      const sub = { eng, bodyEl, known: new Set(), subItems: [] };
      sub.addKid = (k, fromTop) => {
        sub.known.add(k);
        k.style.transition = 'none';
        k.style.transform = 'none';
        const kr = k.getBoundingClientRect();
        const lx = kr.left - br.left + kr.width / 2;
        const ly = kr.top - br.top + kr.height / 2;
        // anything that started below the visible area (or was just restored) drops in from the top
        const cy = fromTop ? kr.height / 2 + 6 : Math.min(ly, bh - kr.height / 2 - 4);
        const body = Bodies.rectangle(lx, cy, kr.width, kr.height, {
          restitution: 0.3, friction: 0.5, frictionAir: 0.012, density: 0.002, chamfer: { radius: 6 },
        });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.06);
        Composite.add(eng.world, body);
        owner.set(body, k);
        k.style.willChange = 'transform';
        const kit = { el: k, body, cx: lx, cy: ly, kid: true, eng, sub };
        kit.cleanup = attachGrab(k, body, eng, toLocal, () => true, null);
        items.push(kit);
        sub.subItems.push(kit);
      };
      kids.forEach((k) => sub.addKid(k, false));
      hookSounds(eng);
      return sub;
    }

    // Windows can be opened/closed while gravity is on: keep bodies in sync.
    function sync() {
      const hid = (el) => !!(window.Trash && window.Trash.isHidden(el));
      const live = new Set(Array.from(desk.querySelectorAll(SEL)).filter((el) => !hid(el)));
      live.forEach((el) => addItem(el));
      items = items.filter((it) => {
        if (it.kid) {
          if (!it.dead && !hid(it.el)) return true;
          Composite.remove(it.eng.world, it.body);
          it.cleanup();
          it.el.style.transform = ''; it.el.style.willChange = '';
          it.sub.known.delete(it.el);
          return false;
        }
        if (live.has(it.el)) return true;
        Composite.remove(engine.world, it.body);
        it.cleanup();
        if (it.sub) { it.sub.bodyEl.classList.remove('g-lock'); it.sub.subItems.forEach((k) => { k.cleanup(); k.el.style.transform = ''; k.el.style.willChange = ''; k.el.style.transition = ''; k.dead = true; }); items = items.filter((x) => !x.dead); }
        tracked.delete(it.el);
        it.el.style.transform = '';
        it.el.style.willChange = '';
        if (it.el.classList.contains('os-window')) it.el.style.transition = '';
        return false;
      });
      // cards restored from the Trash while gravity is on: drop them in
      items.filter((it) => it.sub && !it.kid).forEach((it) => {
        it.sub.bodyEl.querySelectorAll('.finder-file').forEach((k) => {
          if (!it.sub.known.has(k) && !hid(k)) it.sub.addKid(k, true);
        });
      });
      // the layout reflows when something is removed/restored: re-base every body on it
      const ver = window.Trash ? window.Trash.version : 0;
      if (ver !== lastVer) { lastVer = ver; rebase(); }
    }
    let lastVer = window.Trash ? window.Trash.version : 0;
    function rebase() {
      const saved = items.map((it) => it.el.style.transform);
      items.forEach((it) => { it.el.style.transform = 'none'; });
      const dr = desk.getBoundingClientRect();
      items.forEach((it) => {
        if (it.kid) {
          const br = it.sub.bodyEl.getBoundingClientRect();
          const kr = it.el.getBoundingClientRect();
          it.cx = kr.left - br.left + kr.width / 2;
          it.cy = kr.top - br.top + kr.height / 2;
        } else {
          const r = it.el.getBoundingClientRect();
          it.cx = r.left - dr.left + r.width / 2;
          it.cy = r.top - dr.top + r.height / 2;
        }
      });
      items.forEach((it, i) => { it.el.style.transform = saved[i]; });
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
      for (const it of items) if (it.sub) Engine.update(it.sub.eng, dt || 16);
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
      items.forEach((it) => { if (it.sub) it.sub.bodyEl.classList.remove('g-lock'); });
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
