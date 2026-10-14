/* Right-click / press-and-hold on an app, project, image or widget opens a small
   menu: Open or Uninstall/Remove. Removing shows a fake "uninstalling" loader, then
   the item flies into the Trash in the dock. Open the Trash to restore things.
   Everything lives in sessionStorage, so a page refresh brings it all back. */
(function () {
  const desk = document.querySelector('.desktop');
  if (!desk) return;

  const KEY = 'icon_trash_session';
  let trashed = []; // {id, kind, label, sel, icon}
  try { trashed = JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch (e) {}
  let version = 0;

  const snd = (fn, ...a) => { try { if (typeof Sound !== 'undefined' && Sound[fn]) Sound[fn](...a); } catch (e) {} };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- hiding ---------- */
  const styleEl = document.createElement('style');
  styleEl.id = 'trash-hide';
  document.head.appendChild(styleEl);
  function joined() { return trashed.map((t) => t.sel).join(','); }
  function persist() {
    try { sessionStorage.setItem(KEY, JSON.stringify(trashed)); } catch (e) {}
    const j = joined();
    styleEl.textContent = j ? `${trashed.map((t) => t.sel + '{display:none!important}').join('\n')}` : '';
    version++;
    updateTrashIcon();
    renderPanel();
  }
  function isHidden(el) {
    const j = joined();
    try { return !!j && el.matches(j); } catch (e) { return false; }
  }
  window.Trash = { isHidden, get version() { return version; } };

  /* ---------- what is removable ---------- */
  function describe(el) {
    const label = (el.getAttribute('aria-label') || (el.querySelector('.file-label, .ios-app-label, .desktop-icon-label, .icon-label, span:last-child') || el).textContent || '').trim().replace(/\s+/g, ' ');
    const iconEl = el.querySelector('.icon-glyph');
    const icon = iconEl ? iconEl.outerHTML : '';
    if (el.matches('.finder-file')) {
      const photo = el.classList.contains('photo-file');
      return { kind: photo ? 'image' : 'project', id: (photo ? 'img:' : 'proj:') + el.dataset.open, label: (el.querySelector('.file-label') || el).textContent.trim() || label,
        sel: `.finder-file[data-open="${el.dataset.open}"]`, icon, open: true };
    }
    if (el.matches('.dock-item[data-open], .desktop-icon[data-open], .ios-app[data-open], .ios-dock-item[data-open]')) {
      const k = el.dataset.open;
      return { kind: 'app', id: 'app:' + k, label, sel: `:is(.desktop-icon,.dock-item,.ios-app,.ios-dock-item)[data-open="${k}"]`, icon, open: true };
    }
    if (el.matches('a.desktop-icon, a.ios-app')) {
      const h = el.getAttribute('href');
      return { kind: 'app', id: 'app:' + h, label, sel: `a.desktop-icon[href="${h}"],a.ios-app[href="${h}"]`, icon, open: true };
    }
    if (el.matches('.widget')) {
      const c = Array.from(el.classList).find((x) => x.startsWith('widget-'));
      if (!c) return null;
      const names = { 'widget-clock': 'Clock', 'widget-coffee': 'Coffee Counter', 'widget-quote': 'Design Notes', 'widget-music': 'Favorite Songs' };
      return { kind: 'widget', id: 'widget:' + c, label: names[c] || 'Widget', sel: `.widget.${c}`, icon: '', open: false };
    }
    return null;
  }
  const TARGETS = '.finder-file, .dock-item[data-open], .desktop-icon, .widget, .ios-app[data-open], a.ios-app, .ios-dock-item[data-open]';
  function targetOf(e) {
    const t = e.target.closest && e.target.closest(TARGETS);
    return t || null;
  }

  /* ---------- context menu ---------- */
  const menu = document.createElement('div');
  menu.className = 'ctx-menu';
  menu.setAttribute('role', 'menu');
  menu.hidden = true;
  document.body.appendChild(menu);
  const TRASH_SVG = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  let openedAt = 0;
  function closeMenu() { menu.hidden = true; menu.innerHTML = ''; }
  function openMenu(x, y, rows) {
    menu.innerHTML = rows.map((r, i) => r === '-' ? '<div class="ctx-sep"></div>'
      : r.head ? `<div class="ctx-head">${esc(r.head)}</div>`
      : `<button class="ctx-item${r.danger ? ' is-danger' : ''}" data-i="${i}" role="menuitem"${r.disabled ? ' disabled' : ''}>${r.icon || ''}<span>${esc(r.text)}</span></button>`).join('');
    menu.hidden = false;
    openedAt = performance.now();
    const w = menu.offsetWidth, h = menu.offsetHeight;
    menu.style.left = Math.max(6, Math.min(x, innerWidth - w - 6)) + 'px';
    menu.style.top = Math.max(6, Math.min(y, innerHeight - h - 6)) + 'px';
    menu.onclick = (e) => {
      const b = e.target.closest('.ctx-item');
      if (!b || b.disabled) return;
      if (performance.now() - openedAt < 400) return; // the finger that held may still be lifting
      const r = rows[+b.dataset.i];
      closeMenu();
      snd('click');
      r.run();
    };
    snd('hover');
  }
  document.addEventListener('pointerdown', (e) => { if (!menu.hidden && !e.target.closest('.ctx-menu')) closeMenu(); }, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMenu(); closePanel(); } });
  addEventListener('blur', closeMenu);
  addEventListener('resize', closeMenu);

  function rowsFor(el) {
    const d = describe(el);
    const rows = [{ head: d.label }];
    if (d.open) rows.push({ text: 'Open', icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none"><path d="M7 17L17 7M9 7h8v8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>', run: () => el.click() });
    rows.push('-');
    const verb = d.kind === 'app' ? `Uninstall “${d.label}”` : d.kind === 'image' ? 'Remove image' : d.kind === 'project' ? 'Remove project' : `Remove “${d.label}”`;
    rows.push({ text: verb, icon: TRASH_SVG, danger: true, run: () => removeFlow(el, d) });
    return rows;
  }
  function rowsForDesk() {
    return [
      { head: 'Desktop' },
      { text: 'Open Trash' + (trashed.length ? ` (${trashed.length})` : ''), icon: TRASH_SVG, run: openPanel },
      { text: 'Restore everything', disabled: !trashed.length, run: () => restoreAll() },
    ];
  }

  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.ctx-menu, .trash-panel, .rm-loader')) { e.preventDefault(); return; }
    if (e.target.closest('#trash-dock')) { e.preventDefault(); openMenu(e.clientX, e.clientY, [{ head: 'Trash' }, { text: 'Open Trash', icon: TRASH_SVG, run: openPanel }, { text: 'Restore everything', disabled: !trashed.length, run: restoreAll }, { text: 'Empty Trash', danger: true, disabled: !trashed.length, run: emptyFlow }]); return; }
    const t = targetOf(e);
    if (t && describe(t)) { e.preventDefault(); openMenu(e.clientX, e.clientY, rowsFor(t)); return; }
    // empty desktop area (not over a window / the menu bar / the dock)
    if (e.target.closest('.os-window, .menu-bar, .dock, .ios-shell, .overlay, .welcome-overlay, .lightbox, input, textarea')) return;
    if (e.target.closest('.desktop')) { e.preventDefault(); openMenu(e.clientX, e.clientY, rowsForDesk()); }
  });

  // press-and-hold (mouse or touch) opens the same menu
  let hold = null;
  document.addEventListener('pointerdown', (e) => {
    if (e.button > 0 || desk.classList.contains('gravity-on')) return;
    const t = targetOf(e);
    if (!t || !describe(t)) return;
    const sx = e.clientX, sy = e.clientY;
    hold = { t, sx, sy, timer: setTimeout(() => {
      hold.fired = true;
      t.__swallow = true;
      openMenu(sx + 8, sy + 16, rowsFor(t));
    }, 650) };
  }, true);
  document.addEventListener('pointermove', (e) => {
    if (hold && !hold.fired && Math.hypot(e.clientX - hold.sx, e.clientY - hold.sy) > 8) { clearTimeout(hold.timer); hold = null; }
  }, true);
  ['pointerup', 'pointercancel'].forEach((ev) => document.addEventListener(ev, () => {
    if (hold) { clearTimeout(hold.timer); const h = hold; hold = null; if (h.fired) setTimeout(() => { h.t.__swallow = false; }, 60); }
  }, true));
  // the click that follows a long press must not open the app
  document.addEventListener('click', (e) => {
    const t = e.target.closest && e.target.closest(TARGETS);
    if (t && t.__swallow) { e.stopImmediatePropagation(); e.preventDefault(); t.__swallow = false; }
  }, true);

  /* ---------- drag an item onto the Trash ---------- */
  let dnd = null; // {t, d, sx, sy, started, ghost, hot}
  const dropZone = () => {
    const b = document.getElementById('trash-dock');
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return r.width ? { l: r.left - 26, r: r.right + 26, t: r.top - 30, b: r.bottom + 20, cx: r.left + r.width / 2, cy: r.top + r.height / 2 } : null;
  };
  document.addEventListener('pointerdown', (e) => {
    if (e.button > 0 || e.pointerType === 'touch' || desk.classList.contains('gravity-on') || busy) return;
    const t = targetOf(e);
    if (!t || t.closest('.ios-shell')) return;
    if (t.matches('.widget') && e.target.closest('button, a, input, .music-progress')) return;
    const d = describe(t);
    if (!d) return;
    dnd = { t, d, sx: e.clientX, sy: e.clientY, started: false };
  }, true);
  document.addEventListener('pointermove', (e) => {
    if (!dnd) return;
    if (!dnd.started) {
      if (Math.hypot(e.clientX - dnd.sx, e.clientY - dnd.sy) < 10) return;
      if (hold) { clearTimeout(hold.timer); hold = null; }
      closeMenu();
      const t = dnd.t;
      const r = t.getBoundingClientRect();
      const g = t.cloneNode(true);
      g.removeAttribute('id');
      g.classList.add('trash-ghost');
      Object.assign(g.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', margin: '0', zIndex: 5000, pointerEvents: 'none', transition: 'none' });
      document.body.appendChild(g);
      dnd.ghost = g; dnd.ox = dnd.sx - r.left; dnd.oy = dnd.sy - r.top; dnd.r = r;
      dnd.started = true;
      t.classList.add('trash-pending');
      document.body.classList.add('is-trash-dragging');
      closeMenu();
    }
    const g = dnd.ghost;
    const dx = e.clientX - dnd.sx, dy = e.clientY - dnd.sy;
    const z = dropZone();
    const hot = !!z && e.clientX > z.l && e.clientX < z.r && e.clientY > z.t && e.clientY < z.b;
    g.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.max(-8, Math.min(8, dx / 40))}deg) scale(${hot ? 0.7 : 1.04})`;
    if (hot !== dnd.hot) {
      dnd.hot = hot;
      const b = document.getElementById('trash-dock');
      if (b) b.classList.toggle('is-hot', hot);
      if (hot) snd('hover');
    }
  }, true);
  document.addEventListener('dragstart', (e) => { if (dnd) e.preventDefault(); }, true);
  document.addEventListener('selectstart', (e) => { if (dnd) e.preventDefault(); }, true);
  function endDnd(e, cancelled) {
    if (!dnd) return;
    const s = dnd; dnd = null;
    if (!s.started) return;
    document.body.classList.remove('is-trash-dragging');
    const b = document.getElementById('trash-dock');
    if (b) b.classList.remove('is-hot');
    s.t.__swallow = true;
    setTimeout(() => { s.t.__swallow = false; }, 80);
    const g = s.ghost;
    const z = dropZone();
    if (!cancelled && s.hot && z) {
      // swallowed by the Trash, then the usual "removing…" loader
      const dx = z.cx - (s.r.left + s.r.width / 2), dy = z.cy - (s.r.top + s.r.height / 2);
      g.style.transition = 'transform .28s cubic-bezier(.5,0,.8,.4), opacity .28s ease-in';
      g.style.transform = `translate(${dx}px, ${dy}px) scale(.1) rotate(16deg)`;
      g.style.opacity = '0';
      setTimeout(() => g.remove(), 300);
      removeFlow(s.t, s.d, { dropped: true });
    } else {
      // not over the Trash: spring back
      g.style.transition = 'transform .3s cubic-bezier(.2,.9,.3,1.2), opacity .3s';
      g.style.transform = 'translate(0,0) rotate(0) scale(1)';
      g.style.opacity = '0.4';
      setTimeout(() => { g.remove(); s.t.classList.remove('trash-pending'); }, 320);
    }
  }
  document.addEventListener('pointerup', (e) => endDnd(e, false), true);
  document.addEventListener('pointercancel', (e) => endDnd(e, true), true);
  addEventListener('blur', () => endDnd(null, true));

  /* ---------- the loader ---------- */
  const loader = document.createElement('div');
  loader.className = 'rm-loader';
  loader.hidden = true;
  document.body.appendChild(loader);

  function runLoader({ title, steps, ms, icon }) {
    return new Promise((resolve) => {
      loader.innerHTML = `<div class="rm-card" role="status" aria-live="polite">
        <div class="rm-icon">${icon || ''}</div>
        <div class="rm-title">${esc(title)}</div>
        <div class="rm-step">${esc(steps[0])}</div>
        <div class="rm-bar"><i></i></div>
        <div class="rm-pct">0%</div></div>`;
      loader.hidden = false;
      requestAnimationFrame(() => loader.classList.add('is-in'));
      const bar = loader.querySelector('.rm-bar i');
      const pct = loader.querySelector('.rm-pct');
      const step = loader.querySelector('.rm-step');
      const t0 = performance.now();
      let p = 0, lastStep = 0;
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / ms);
        // installer-style pacing: quick, a stall around 60-70%, then a rush
        const target = k < 0.55 ? k * 1.1 : k < 0.8 ? 0.6 + (k - 0.55) * 0.35 : 0.69 + (k - 0.8) * 1.55;
        p = Math.min(1, Math.max(p, target));
        bar.style.width = (p * 100).toFixed(1) + '%';
        pct.textContent = Math.round(p * 100) + '%';
        const si = Math.min(steps.length - 1, Math.floor(p * steps.length));
        if (si !== lastStep) { lastStep = si; step.textContent = steps[si]; snd('hover'); }
        if (k < 1) requestAnimationFrame(tick);
        else {
          bar.style.width = '100%'; pct.textContent = '100%'; step.textContent = 'Done';
          setTimeout(() => {
            loader.classList.remove('is-in');
            setTimeout(() => { loader.hidden = true; loader.innerHTML = ''; resolve(); }, 180);
          }, 260);
        }
      };
      requestAnimationFrame(tick);
    });
  }

  /* ---------- remove / restore flows ---------- */
  let busy = false;
  function closeWindowsFor(d) {
    try {
      if (typeof WM === 'undefined') return;
      if (d.kind === 'app') {
        const id = d.id.slice(4);
        if (WM.openWindows && WM.openWindows.has(id)) WM.close(id);
        if (id === 'work' && WM.openWindows && WM.openWindows.has('case-viewer')) WM.close('case-viewer');
      } else if (d.kind === 'project' && WM.openWindows && WM.openWindows.has('case-viewer')) {
        WM.close('case-viewer');
      }
    } catch (e) {}
  }
  function flyToTrash(el) {
    const dest = [document.getElementById('trash-dock'), document.getElementById('trash-ios')].find((d) => d && d.getBoundingClientRect().width);
    const r = el.getBoundingClientRect();
    if (!dest || !r.width) return Promise.resolve();
    const g = el.cloneNode(true);
    g.removeAttribute('id');
    g.className += ' trash-ghost';
    Object.assign(g.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', margin: '0', transform: 'none', transition: 'none', zIndex: 5000, pointerEvents: 'none' });
    document.body.appendChild(g);
    const dr = dest.getBoundingClientRect();
    const dx = dr.left + dr.width / 2 - (r.left + r.width / 2);
    const dy = dr.top + dr.height / 2 - (r.top + r.height / 2);
    g.getBoundingClientRect();
    g.style.transition = 'transform .65s cubic-bezier(.5,-0.1,.7,.4), opacity .65s ease-in';
    g.style.transform = `translate(${dx}px, ${dy}px) scale(.12) rotate(14deg)`;
    g.style.opacity = '0.2';
    return new Promise((res) => setTimeout(() => { g.remove(); res(); }, 680));
  }
  async function removeFlow(el, d, opt) {
    if (busy) return;
    busy = true;
    const isApp = d.kind === 'app';
    const title = isApp ? `Uninstalling ${d.label}…` : d.kind === 'widget' ? `Removing ${d.label}…` : `Removing ${d.label}…`;
    const steps = isApp
      ? ['Preparing to uninstall…', 'Closing running windows…', 'Deleting app files…', 'Clearing cache and preferences…', 'Moving to Trash…']
      : d.kind === 'image'
        ? ['Locating image…', 'Deleting from library…', 'Clearing thumbnails…', 'Moving to Trash…']
        : d.kind === 'project'
          ? ['Locating project…', 'Archiving case study…', 'Removing assets…', 'Moving to Trash…']
          : ['Detaching widget…', 'Clearing data…', 'Moving to Trash…'];
    snd('open');
    await runLoader({ title, steps, ms: 1500 + Math.random() * 900, icon: d.icon || (d.kind === 'widget' ? '<span class="rm-widget-glyph"></span>' : '') });
    closeWindowsFor(d);
    if (!(opt && opt.dropped)) await flyToTrash(el);
    if (!trashed.some((t) => t.id === d.id)) trashed.push({ id: d.id, kind: d.kind, label: d.label, sel: d.sel, icon: d.icon });
    if (d.id === 'widget:widget-music') window.dispatchEvent(new Event('music:stop'));
    persist();
    el.classList.remove('trash-pending');
    snd('impact', 'card', 0.7);
    bounceTrash();
    busy = false;
  }
  async function restore(id, quick) {
    const t = trashed.find((x) => x.id === id);
    if (!t || busy) return;
    busy = true;
    if (!quick) await runLoader({ title: `Restoring ${t.label}…`, steps: ['Finding item in Trash…', 'Putting it back…'], ms: 700, icon: t.icon });
    trashed = trashed.filter((x) => x.id !== id);
    persist();
    snd('open');
    desk.querySelectorAll(t.sel).forEach((n) => { n.classList.add('restored-pop'); setTimeout(() => n.classList.remove('restored-pop'), 700); });
    busy = false;
  }
  async function restoreAll() {
    if (!trashed.length || busy) return;
    busy = true;
    await runLoader({ title: 'Restoring everything…', steps: ['Reading Trash…', 'Putting items back…', 'Finishing up…'], ms: 900, icon: '' });
    const sels = trashed.map((t) => t.sel);
    trashed = [];
    persist();
    snd('open');
    sels.forEach((s) => desk.querySelectorAll(s).forEach((n) => { n.classList.add('restored-pop'); setTimeout(() => n.classList.remove('restored-pop'), 700); }));
    busy = false;
  }
  async function emptyFlow() {
    if (!trashed.length || busy) return;
    busy = true;
    await runLoader({ title: 'Emptying Trash…', steps: ['Counting items…', 'Shredding files…', 'Erasing…'], ms: 1500, icon: '' });
    // permanently gone for this visit: keep them hidden, drop them from the Trash list
    const gone = trashed.splice(0, trashed.length);
    gone.forEach((g) => { permanent.push(g.sel); });
    permStyle.textContent = permanent.map((s) => s + '{display:none!important}').join('\n');
    persist();
    toast('Gone for good. (Until you refresh the page 😉)');
    busy = false;
  }
  const permanent = [];
  const permStyle = document.createElement('style');
  document.head.appendChild(permStyle);
  // permanent removals must still count as hidden for the gravity engine
  const origHidden = isHidden;
  window.Trash.isHidden = (el) => { try { return origHidden(el) || (permanent.length && el.matches(permanent.join(','))); } catch (e) { return false; } };

  /* ---------- dock icon ---------- */
  const trashBtns = [document.getElementById('trash-dock'), document.getElementById('trash-ios')].filter(Boolean);
  const trashBtn = trashBtns[0];
  function updateTrashIcon() {
    trashBtns.forEach((b) => {
      b.classList.toggle('is-full', trashed.length > 0);
      const badge = b.querySelector('.trash-badge');
      if (badge) { badge.textContent = trashed.length; badge.hidden = !trashed.length; }
    });
  }
  function bounceTrash() {
    trashBtns.forEach((b) => { b.classList.remove('is-bounce'); void b.offsetWidth; b.classList.add('is-bounce'); });
  }
  trashBtns.forEach((b) => b.addEventListener('click', () => { snd('open'); togglePanel(); }));

  /* ---------- toast ---------- */
  function toast(text) {
    const n = document.createElement('div');
    n.className = 'trash-toast';
    n.textContent = text;
    document.body.appendChild(n);
    requestAnimationFrame(() => n.classList.add('is-in'));
    setTimeout(() => { n.classList.remove('is-in'); setTimeout(() => n.remove(), 300); }, 2600);
  }

  /* ---------- the Trash window ---------- */
  const panel = document.createElement('div');
  panel.className = 'trash-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Trash');
  panel.innerHTML = `<div class="window-titlebar trash-bar">
      <div class="traffic-lights"><button class="tl-close" aria-label="Close Trash"></button><button class="tl-min" aria-label="Close Trash"></button><button class="tl-max" aria-label="Trash"></button></div>
      <span class="window-title">Trash</span></div>
    <div class="trash-list"></div>
    <div class="trash-foot"><button class="trash-act" data-act="restore-all">Restore All</button><button class="trash-act is-danger" data-act="empty">Empty Trash</button></div>`;
  document.body.appendChild(panel);
  const listEl = panel.querySelector('.trash-list');
  const KIND = { app: 'App', project: 'Project', image: 'Image', widget: 'Widget' };

  function renderPanel() {
    if (!listEl) return;
    if (!trashed.length) {
      listEl.innerHTML = '<div class="trash-empty"><img src="/icons/Trash%20Empty.png" width="56" height="56" alt=""><p>Trash is empty</p><small>Right-click (or press and hold) any app, project or image to remove it.</small></div>';
    } else {
      listEl.innerHTML = trashed.map((t) => `<div class="trash-row">
        <span class="trash-thumb">${t.icon || '<span class="trash-widget-glyph"></span>'}</span>
        <span class="trash-meta"><b>${esc(t.label)}</b><small>${KIND[t.kind] || 'Item'}</small></span>
        <button class="trash-restore" data-id="${esc(t.id)}">Restore</button></div>`).join('');
    }
    panel.querySelectorAll('.trash-act').forEach((b) => { b.disabled = !trashed.length; });
  }
  panel.addEventListener('click', (e) => {
    if (e.target.closest('.tl-close, .tl-min')) { closePanel(); return; }
    if (e.target.closest('.tl-max')) { snd('click'); panel.classList.toggle('is-max'); return; }
    const r = e.target.closest('.trash-restore');
    if (r) { snd('click'); restore(r.dataset.id); return; }
    const a = e.target.closest('.trash-act');
    if (a && !a.disabled) { snd('click'); a.dataset.act === 'empty' ? emptyFlow() : restoreAll(); }
  });
  const PKEY = 'icon_trash_pos';
  let lastPos = null; // where the user last left the Trash window
  try { lastPos = JSON.parse(sessionStorage.getItem(PKEY) || 'null'); } catch (e) {}
  function placePanel() {
    if (window.matchMedia('(max-width: 760px)').matches) return; // phones use a bottom sheet
    const w = panel.offsetWidth, h = panel.offsetHeight;
    let x = (innerWidth - w) / 2, y = (innerHeight - h) / 2; // default: centre of the screen
    if (lastPos) { x = lastPos.x; y = lastPos.y; }
    x = Math.max(0, Math.min(innerWidth - Math.min(w, 120), x));
    y = Math.max(28, Math.min(innerHeight - 60, y));
    Object.assign(panel.style, { left: x + 'px', top: y + 'px', right: 'auto', bottom: 'auto' });
  }
  function openPanel(skipHistory) {
    if (!panel.hidden && panel.classList.contains('is-in')) return;
    renderPanel();
    panel.hidden = false;
    if (skipHistory !== true && routerBooted) routeNavigate('trash', null, null); // gives the Trash its own URL: /trash
    placePanel();
    requestAnimationFrame(() => panel.classList.add('is-in'));
    if (typeof WM !== 'undefined' && WM.focus) { /* keep above windows via z-index */ }
  }
  function closePanel(skipHistory) {
    if (panel.hidden) return;
    if (skipHistory !== true && routerBooted && routeState.app === 'trash' && history.state && history.state.app) {
      history.back(); // popstate closes the panel and the URL steps back
      return;
    }
    panel.classList.remove('is-in');
    setTimeout(() => { panel.hidden = true; panel.classList.remove('is-max'); }, 180);
  }
  function togglePanel() { panel.hidden ? openPanel() : closePanel(); }

  // drag the Trash window by its title bar
  (() => {
    const bar = panel.querySelector('.trash-bar');
    let d = null;
    bar.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.traffic-lights') || panel.classList.contains('is-max')) return;
      const r = panel.getBoundingClientRect();
      d = { x: e.clientX - r.left, y: e.clientY - r.top };
      bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener('pointermove', (e) => {
      if (!d) return;
      panel.style.left = Math.max(0, Math.min(innerWidth - 120, e.clientX - d.x)) + 'px';
      panel.style.top = Math.max(28, Math.min(innerHeight - 60, e.clientY - d.y)) + 'px';
      panel.style.right = 'auto'; panel.style.bottom = 'auto';
    });
    ['pointerup', 'pointercancel'].forEach((ev) => bar.addEventListener(ev, () => {
      if (d) {
        const r = panel.getBoundingClientRect();
        lastPos = { x: r.left, y: r.top };
        try { sessionStorage.setItem(PKEY, JSON.stringify(lastPos)); } catch (e) {}
      }
      d = null;
    }));
  })();

  window.Trash.open = () => openPanel(true);
  window.Trash.close = () => closePanel(true);
  if (routerBooted && routeState.app === 'trash') openPanel(true); // page loaded directly on /trash

  persist();
  updateTrashIcon();
})();
