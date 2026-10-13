/* Kayn: a free-roaming 3D character (Sketchfab embed, transparent background).
   - drag him anywhere, over any open window
   - he turns to look at your mouse / finger
   - hover or click and he waves (plays the model's animation if it has one + a hello bubble) */
(function () {
  if (window.__kaynLoaded) return;
  window.__kaynLoaded = true;

  var UID = 'b7ebd33c9b704782896177fb380a8e91';
  var API_SRC = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';
  var POS_KEY = 'icon_kayn_pos';
  var LOOK = 0.9;          // how far he turns towards the mouse (radians at the screen edge)
  var LOOK_SIGN = -1;      // flip to 1 if he ever turns away from the cursor

  var el = document.createElement('div');
  el.className = 'kayn-pet';
  el.innerHTML =
    '<iframe class="kayn-pet-frame" title="Kayn.song" tabindex="-1" allow="autoplay; fullscreen; xr-spatial-tracking" ' +
    'allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>' +
    '<div class="kayn-hit" aria-label="Kayn, drag me" role="img"></div>' +
    '<div class="kayn-bubble">Hi! 👋</div>' +
    '<a class="kayn-credit" href="https://sketchfab.com/3d-models/kaynsong-b7ebd33c9b704782896177fb380a8e91" target="_blank" rel="nofollow noopener">Kayn.song · APO · Sketchfab</a>';
  document.body.appendChild(el);
  var frame = el.querySelector('.kayn-pet-frame');
  var hit = el.querySelector('.kayn-hit');
  var bubble = el.querySelector('.kayn-bubble');

  /* ---------- position (draggable, remembered) ---------- */
  function size() { return { w: el.offsetWidth, h: el.offsetHeight }; }
  function clamp(x, y) {
    var s = size();
    return { x: Math.max(-s.w * 0.3, Math.min(innerWidth - s.w * 0.7, x)), y: Math.max(28, Math.min(innerHeight - s.h * 0.6, y)) };
  }
  function place(x, y) { var c = clamp(x, y); el.style.left = c.x + 'px'; el.style.top = c.y + 'px'; return c; }
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem(POS_KEY)); } catch (e) {}
  if (saved && typeof saved.x === 'number') place(saved.x, saved.y);
  else place(innerWidth - size().w - 24, innerHeight - size().h - 96);
  window.addEventListener('resize', function () { var r = el.getBoundingClientRect(); place(r.left, r.top); });

  var drag = null;
  hit.addEventListener('pointerdown', function (e) {
    if (e.button > 0) return;
    var r = el.getBoundingClientRect();
    drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, sx: e.clientX, sy: e.clientY, moved: false };
    try { hit.setPointerCapture(e.pointerId); } catch (err) {}
    e.preventDefault();
  });
  hit.addEventListener('pointermove', function (e) {
    look(e.clientX, e.clientY);
    if (!drag) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 5) { drag.moved = true; el.classList.add('is-dragging'); }
    if (drag.moved) place(e.clientX - drag.dx, e.clientY - drag.dy);
  });
  function end(e) {
    if (!drag) return;
    var wasClick = !drag.moved;
    drag = null;
    el.classList.remove('is-dragging');
    try { hit.releasePointerCapture(e.pointerId); } catch (err) {}
    if (wasClick) wave(); else {
      var r = el.getBoundingClientRect();
      try { localStorage.setItem(POS_KEY, JSON.stringify({ x: r.left, y: r.top })); } catch (err) {}
      el.classList.add('is-dropped');
      setTimeout(function () { el.classList.remove('is-dropped'); }, 500);
    }
  }
  hit.addEventListener('pointerup', end);
  hit.addEventListener('pointercancel', end);
  hit.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') wave(true); });

  /* ---------- waving ---------- */
  var api = null, anims = [], waving = false, byeTimer = null;
  function wave(soft) {
    if (waving && soft) return;
    waving = true;
    el.classList.remove('is-waving'); void el.offsetWidth; el.classList.add('is-waving');
    bubble.classList.add('is-in');
    clearTimeout(byeTimer);
    byeTimer = setTimeout(function () { bubble.classList.remove('is-in'); el.classList.remove('is-waving'); waving = false; }, 2200);
    if (api && anims.length) {
      try { api.seekTo(0); api.play(); } catch (e) {}
    }
  }

  /* ---------- looking at the mouse (orbits the camera around the model) ---------- */
  var base = null, pending = null, raf = 0;
  function look(mx, my) {
    if (!api || !base) return;
    pending = [mx, my];
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      if (!pending) return;
      var r = el.getBoundingClientRect();
      var nx = Math.max(-1, Math.min(1, (pending[0] - (r.left + r.width / 2)) / (innerWidth / 2)));
      var ny = Math.max(-1, Math.min(1, (pending[1] - (r.top + r.height / 2)) / (innerHeight / 2)));
      var yaw = LOOK_SIGN * nx * LOOK;
      var ox = base.pos[0] - base.tgt[0], oy = base.pos[1] - base.tgt[1], oz = base.pos[2] - base.tgt[2];
      var c = Math.cos(yaw), s = Math.sin(yaw);
      var pos = [base.tgt[0] + ox * c - oy * s, base.tgt[1] + ox * s + oy * c, base.tgt[2] + oz + ny * 0.25 * Math.hypot(ox, oy)];
      try { api.setCameraLookAt(pos, base.tgt, 0.25); } catch (e) {}
    });
  }
  document.addEventListener('pointermove', function (e) { if (!drag) look(e.clientX, e.clientY); }, { passive: true });

  /* ---------- load the viewer lazily so it never slows the first paint ---------- */
  function boot() {
    if (!window.Sketchfab) return;
    var client = new window.Sketchfab(frame);
    client.init(UID, {
      autostart: 1, transparent: 1, preload: 1, dnt: 1,
      ui_controls: 0, ui_infos: 0, ui_stop: 0, ui_inspector: 0, ui_help: 0, ui_settings: 0, ui_vr: 0,
      ui_fullscreen: 0, ui_annotations: 0, ui_ar: 0, ui_hint: 0, ui_watermark: 0,
      scrollwheel: 0, double_click: 0, orbit_constraint_pan: 1,
      success: function (a) {
        api = a;
        api.start();
        api.addEventListener('viewerready', function () {
          el.classList.add('is-ready');
          api.getCameraLookAt(function (err, cam) { if (!err && cam) base = { pos: cam.position, tgt: cam.target }; });
          api.getAnimations(function (err, list) { if (!err && list) anims = list; });
          setTimeout(function () { wave(); }, 600);
        });
      },
      error: function () { el.classList.add('is-failed'); }
    });
  }
  function load() {
    var s = document.createElement('script');
    s.src = API_SRC; s.async = true; s.onload = boot;
    document.head.appendChild(s);
  }
  if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 4000 }); else setTimeout(load, 1500);
})();
