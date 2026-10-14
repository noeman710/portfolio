/* Window manager
   Open / close / focus / maximise windows, dock indicators, menu-bar title. */

const WM = {
  zCounter: 100,
  openWindows: new Set(),
  lastFocusedTrigger: null,

  getWindowEl(id) {
    return document.getElementById('win-' + id);
  },

  open(id, triggerEl, skipHistory) {
    const entry = filesystem[id];
    if (!entry) return;

    if (entry.kind === 'folder') {
      this.open('work', triggerEl, true);
      openFinderFolder(id, skipHistory);
      return;
    }
    if (entry.kind === 'pdf') {
      openResume();
      return;
    }
    if (entry.kind === 'case-study') {
      this.openCaseStudy(id, skipHistory);
      return;
    }
    if (entry.kind === 'photo') {
      openLightbox(entry.data.src, entry.data.alt);
      return;
    }
    if (entry.kind === 'maps') {
      ensureTangierMap();
    }

    if (id === 'work' && !this.openWindows.has('work') && finderFolder !== 'work') {
      finderFolder = 'work';
      renderFinder();
    }

    if (!skipHistory && routerBooted && ROUTE_APP_IDS.includes(id)) {
      routeNavigate(id, null);
    }

    const el = this.getWindowEl(id);
    if (!el) return;

    this.lastFocusedTrigger = triggerEl || document.activeElement;
    el.classList.add('is-visible');
    el.setAttribute('aria-hidden', 'false');
    this.focus(id);
    this.openWindows.add(id);
    this.updateDockIndicators();
    this.updateMenuBarTitle();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add('is-animated-in');
        if (entry.kind === 'maps' && tangierMap) tangierMap.invalidateSize();
      });
    });

    const firstField = el.querySelector('input, textarea, button.finder-file, .window-body [tabindex]');
    if (firstField) setTimeout(() => firstField.focus(), 60);
  },

  openCaseStudy(id, skipHistory) {
    const data = filesystem[id].data;
    const el = document.getElementById('win-case-viewer');
    if (!el) return;

    if (!skipHistory && routerBooted) {
      routeNavigate('work', id, filesystem[id].parent !== 'work' ? filesystem[id].parent : null);
    }
    if (!this.openWindows.has('work')) {
      this.open('work', null, true);
    }

    el.querySelector('.case-title').textContent = data.title;
    el.querySelector('.case-tag').textContent = data.tag;
    el.querySelector('.case-summary').textContent = data.summary;

    const visual = el.querySelector('.case-visual');
    if (data.cover) {
      visual.innerHTML = `<img src="${data.cover}" alt="${data.title} cover" loading="lazy">`;
    } else {
      visual.innerHTML = `<span class="case-glyph">${data.title.charAt(0)}</span>`;
    }

    const linksRow = el.querySelector('.case-links');
    if (linksRow) {
      const links = data.links || {};
      const buttons = [];
      if (links.live) {
        buttons.push(`<a href="${links.live}" target="_blank" rel="noopener" class="case-link-btn case-link-live">View Live</a>`);
      }
      if (links.behance) {
        buttons.push(`<a href="${links.behance}" target="_blank" rel="noopener" class="case-link-btn case-link-behance">View on Behance</a>`);
      }
      if (links.instagram) {
        buttons.push(`<a href="${links.instagram}" target="_blank" rel="noopener" class="case-link-btn case-link-instagram">View on Instagram</a>`);
      }
      if (links.guide) {
        buttons.push(`<a href="${links.guide}" target="_blank" rel="noopener" class="case-link-btn case-link-guide">View Guidelines (PDF)</a>`);
      }
      linksRow.innerHTML = buttons.join('');
      linksRow.style.display = buttons.length ? 'flex' : 'none';
    }

    el.querySelector('.case-paragraphs').innerHTML = data.body.map((p) => `<p>${p}</p>`).join('');
    el.querySelector('.case-role').textContent = data.role;
    el.querySelector('.case-context').textContent = data.context;
    el.querySelector('.case-scope').textContent = data.scope;
    el.querySelector('.window-title').textContent = data.title;

    el.classList.add('is-visible');
    el.setAttribute('aria-hidden', 'false');
    this.focus('case-viewer');
    this.openWindows.add('case-viewer');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add('is-animated-in'));
    });
  },

  close(id, skipHistory) {
    if (!skipHistory && routerBooted && (ROUTE_APP_IDS.includes(id) || id === 'case-viewer')) {
      if (id === 'work' && routeState.folder && !routeState.case) {
        // inside a sub-folder the history has an extra step: close the window directly and reset the URL
        history.replaceState(emptyRoute(), '', '/');
        routeState = emptyRoute();
        finderFolder = 'work';
        renderFinder();
        this.close(id, true);
        return;
      }
      const isCurrentRoute = (id === 'case-viewer' && routeState.case) ||
        (id === routeState.app && !routeState.case);
      if (isCurrentRoute && history.state && (history.state.app || history.state.case)) {
        history.back();
        return;
      }
    }

    const el = this.getWindowEl(id);
    if (!el) return;
    el.classList.remove('is-animated-in');
    el.setAttribute('aria-hidden', 'true');
    this.openWindows.delete(id);
    this.updateDockIndicators();
    this.updateMenuBarTitle();

    const finish = () => el.classList.remove('is-visible');
    if (REDUCED_MOTION) { finish(); return; }
    setTimeout(finish, 260);

    if (this.lastFocusedTrigger && document.body.contains(this.lastFocusedTrigger)) {
      this.lastFocusedTrigger.focus();
    }
  },

  focus(id) {
    const el = this.getWindowEl(id);
    if (!el) return;
    this.zCounter += 1;
    el.style.zIndex = this.zCounter;
    document.querySelectorAll('.os-window').forEach((w) => w.classList.remove('is-focused'));
    el.classList.add('is-focused');
    this.updateMenuBarTitle();
  },

  toggleMaximize(id) {
    const el = this.getWindowEl(id);
    if (!el) return;
    if (el.dataset.maximized === 'true') {
      el.style.width = el.dataset.prevWidth || '';
      el.style.height = el.dataset.prevHeight || '';
      el.style.top = el.dataset.prevTop || '';
      el.style.left = el.dataset.prevLeft || '';
      el.dataset.maximized = 'false';
    } else {
      el.dataset.prevWidth = el.style.width;
      el.dataset.prevHeight = el.style.height;
      el.dataset.prevTop = el.style.top;
      el.dataset.prevLeft = el.style.left;
      el.style.top = '38px';
      el.style.left = '16px';
      el.style.width = 'calc(100vw - 32px)';
      el.style.height = 'calc(100vh - 110px)';
      el.dataset.maximized = 'true';
    }
  },

  updateDockIndicators() {
    document.querySelectorAll('.dock-item[data-id]').forEach((btn) => {
      btn.classList.toggle('is-open', this.openWindows.has(btn.dataset.id));
    });
  },

  updateMenuBarTitle() {
    const nameEl = document.querySelector('.menu-app-name');
    if (!nameEl) return;
    let topId = null;
    let topZ = -1;
    document.querySelectorAll('.os-window.is-visible').forEach((w) => {
      const z = parseInt(w.style.zIndex || '0', 10);
      if (z > topZ) { topZ = z; topId = w.id; }
    });
    if (!topId) { nameEl.textContent = 'Noemane El Afia'; return; }
    const titleEl = document.querySelector('#' + topId + ' .window-title');
    nameEl.textContent = titleEl ? titleEl.textContent : 'Finder';
  },
};

function openResume() {
  const link = document.getElementById('resume-download-link');
  if (link) window.open(link.href, '_blank');
}
