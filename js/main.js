/* ==========================================================================
   ICON: macOS-style desktop portfolio, shared behavior
   ========================================================================== */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const IS_MOBILE = window.matchMedia('(max-width: 760px)').matches;

/* ---------------------------------------------------------------------- */
/* Sound design: small synthesized UI sounds via Web Audio API             */
/* Everything here is generated tones/noise, no audio files to load.       */
/* The audio context only starts after a real user gesture (autoplay      */
/* policy), and the mute state persists per browser.                      */
/* ---------------------------------------------------------------------- */

const Sound = (() => {
  let ctx = null;
  let masterGain = null;
  let muted = false;
  try {
    muted = localStorage.getItem('sound-muted') === '1';
  } catch (e) {}

  function ensureContext() {
    if (ctx) return ctx;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : 0.5;
    masterGain.connect(ctx.destination);
    return ctx;
  }

  function resume() {
    const c = ensureContext();
    if (c && c.state === 'suspended') c.resume();
  }

  function tone({ freq = 440, duration = 0.08, type = 'sine', gain = 0.2, glideTo = null }) {
    const c = ensureContext();
    if (!c || muted) return;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, c.currentTime + duration);
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(gain, c.currentTime + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
    osc.connect(g);
    g.connect(masterGain);
    osc.start();
    osc.stop(c.currentTime + duration + 0.02);
  }

  function noiseBurst({ duration = 0.05, gain = 0.12, filterFreq = 2000 } = {}) {
    const c = ensureContext();
    if (!c || muted) return;
    const size = Math.max(1, Math.floor(c.sampleRate * duration));
    const buffer = c.createBuffer(1, size, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / size);
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const g = c.createGain();
    g.gain.setValueAtTime(gain, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
    src.connect(filter);
    filter.connect(g);
    g.connect(masterGain);
    src.start();
  }

  return {
    resume,
    isMuted() { return muted; },
    setMuted(value) {
      muted = value;
      try { localStorage.setItem('sound-muted', value ? '1' : '0'); } catch (e) {}
      if (masterGain) masterGain.gain.value = muted ? 0 : 0.5;
    },

    open() { tone({ freq: 380, glideTo: 640, duration: 0.14, type: 'sine', gain: 0.2 }); },
    close() { tone({ freq: 460, glideTo: 220, duration: 0.13, type: 'sine', gain: 0.16 }); },
    click() { tone({ freq: 880, duration: 0.05, type: 'sine', gain: 0.1 }); },
    hover() { tone({ freq: 1500, duration: 0.025, type: 'sine', gain: 0.035 }); },
    coffee() {
      tone({ freq: 320, glideTo: 210, duration: 0.11, type: 'triangle', gain: 0.18 });
      noiseBurst({ duration: 0.07, gain: 0.09, filterFreq: 1200 });
    },
    boot() { tone({ freq: 220, glideTo: 460, duration: 0.5, type: 'sine', gain: 0.14 }); },
  };
})();

function initSound() {
  const btn = document.getElementById('sound-toggle');
  if (btn) {
    btn.setAttribute('aria-pressed', Sound.isMuted() ? 'true' : 'false');
    btn.addEventListener('click', () => {
      const next = !Sound.isMuted();
      Sound.setMuted(next);
      btn.setAttribute('aria-pressed', next ? 'true' : 'false');
    });
  }

  // The audio context can only start after a genuine user gesture.
  const wake = () => { Sound.resume(); };
  document.addEventListener('pointerdown', wake, { once: true });
  document.addEventListener('keydown', wake, { once: true });
}

/* ---------------------------------------------------------------------- */
/* Virtual filesystem: single source of truth for icons, Finder, search   */
/* ---------------------------------------------------------------------- */

const filesystem = {
  'work': {
    type: 'app', kind: 'finder', title: 'Work', icon: 'folder',
  },
  'about': {
    type: 'app', kind: 'about', title: 'About Me', icon: 'doc',
  },
  'resume': {
    type: 'file', kind: 'pdf', title: 'Resume.pdf', icon: 'doc',
  },
  'notes': {
    type: 'app', kind: 'notes', title: 'Notes', icon: 'notes',
  },
  'mail': {
    type: 'app', kind: 'mail', title: 'Mail', icon: 'mail',
  },
  'social': {
    type: 'app', kind: 'social', title: 'Social', icon: 'social',
  },
  'trash': {
    type: 'app', kind: 'trash', title: 'Trash', icon: 'trash',
  },
  'sura': {
    type: 'file', kind: 'case-study', title: 'Sura.case', parent: 'work',
    data: {
      title: 'Sura',
      tag: 'Landing Page · Personal Project, 2026',
      summary: 'A high-performance landing page for a fictional digital growth agency, designed to command trust through precision rather than decoration.',
      cover: 'assets/images/projects/sura-cover.jpg',
      body: [
        'Most agencies talk about marketing, but Sura needed to feel like infrastructure. I approached the interface as a high-performance machine, pairing an obsidian-tech aesthetic with data-driven layouts so the design earns trust through clarity and precision rather than asking for it.',
        'Every engine starts with one idea. Before opening any software, I sketched and analysed Sura\u2019s core goals on paper, then moved from rough sketch to a high-fidelity mockup, making sure the final design was a fully engineered solution rather than just visual polish.',
        'Growth doesn\u2019t stay behind a desk, so I carried the same visual authority and high-speed feel from desktop through to mobile, keeping the experience responsive, fast, and consistent everywhere.',
      ],
      role: 'Personal / Concept Project',
      duration: 'Self-Directed',
      scope: 'Responsive Web, Desktop & Mobile',
      links: {
        behance: 'https://www.behance.net/gallery/250656571/SURA-Digital-Growth-Agency-Landing-Page',
      },
    },
  },
  'finderrlink': {
    type: 'file', kind: 'case-study', title: 'FinderrLink.case', parent: 'work',
    data: {
      title: 'FinderrLink',
      tag: 'SaaS Platform · Mediassive Internship, 2026',
      summary: 'An intelligent SaaS platform connecting freelancers, enterprises, and agencies for hiring, collaboration, and mission matching, built around a native AI assistant.',
      cover: 'assets/images/projects/finderrlink-cover.jpg',
      body: [
        'Designed the complete platform end to end across three user roles (freelancer, enterprise, agency), including the freelancer dashboard, mission board, hiring and company cards, KPI widgets, and profile pages.',
        'Built a floating AI assistant into the experience that helps freelancers surface matching missions and helps enterprises write and publish missions in seconds, cutting mission creation down to under 30 seconds.',
        'Adapted the full interface for mobile, keeping visual and functional consistency across devices, shipping production-ready screens ready for real use.',
      ],
      role: 'UX/UI Design Intern',
      duration: 'Mediassive Internship, Ongoing Development',
      scope: '3 Roles, Web & Mobile',
      links: {
        live: 'https://finderrlink.com/',
      },
    },
  },
  'entclinic': {
    type: 'file', kind: 'case-study', title: 'CentreORLTanger.case', parent: 'work',
    data: {
      title: 'Centre ORL Tanger',
      tag: 'Web Platform · Freelance, 2026',
      summary: 'A booking and consultation site for a specialist ENT (ear, nose, and throat) clinic in Tangier, built bilingual (French/Arabic) for a local patient base.',
      cover: 'assets/images/projects/entclinic-cover.jpg',
      body: [
        'Designed a warm, trust-building homepage for Dr. Bezzari Malhi Alae\u2019s ENT practice, leading with his credentials (15+ years of experience, CNSS/AMO coverage) and a direct consultation booking form above the fold.',
        'Structured the site around real patient concerns, laid out as clear service categories such as hearing and balance, snoring and sleep apnea, pediatric ENT, and thyroid, each with matching Arabic labels for bilingual accessibility.',
        'Built out supporting pages for the doctor\u2019s profile, the clinic itself, and contact, plus a Google-reviews section and WhatsApp/phone quick-contact, keeping the patient journey to booking as short as possible.',
      ],
      role: 'Freelance UX/UI Designer',
      duration: 'Client Project, 2026',
      scope: 'Bilingual Web Platform, Booking Flow',
      links: {
        live: 'https://centreorltanger.ma/',
      },
    },
  },
  'luma': {
    type: 'file', kind: 'case-study', title: 'Luma.case', parent: 'work',
    data: {
      title: 'LUMA',
      tag: 'Landing Page · Personal Project, 2026',
      summary: 'A digital flagship store for LUMA, a fictional AR-eyewear brand, designed to carry the user from an emotional "wow" hero moment down to hard technical proof.',
      cover: 'assets/images/projects/luma-cover.jpg',
      body: [
        'Framed the landing page as a digital flagship store rather than a simple product page, opening with an immersive hero built around the wearer and backed by real-feeling stats (market growth, unit shipments, field of view, peak brightness) to establish credibility instantly.',
        'Grounded the visual direction in human-centred research, defining the target audience and identifying the value propositions that needed to lead the story: speed, comfort, and cutting-edge technology, expressed through a dark, cinematic AR-innovation showcase and a Poppins-led type system.',
        'Carried the narrative through feature breakdowns, a "Redefine Your Reality" technical section, and customer voices, then adapted the full flow for mobile so the same wow-to-proof journey holds up on a smaller screen.',
      ],
      role: 'Personal / Concept Project',
      duration: 'Self-Directed',
      scope: 'Landing Page, Desktop & Mobile',
      links: {
        behance: 'https://www.behance.net/gallery/241679579/LUMA-AR-2026-UIUX-Case-Study',
      },
    },
  },
  'styla': {
    type: 'file', kind: 'case-study', title: 'Styla.case', parent: 'work',
    data: {
      title: 'Styla',
      tag: 'Mobile App · Personal Project, 2026',
      summary: 'A UX/UI concept for a modern fashion shopping app, designed to fix the clutter and difficulty of finding products that plague most e-commerce apps.',
      cover: 'assets/images/projects/styla-cover.jpg',
      body: [
        'Started from a clear problem statement: online fashion shoppers struggle with cluttered browsing, hard-to-find products, and outdated interfaces. I set out to design a seamless, visually engaging shopping experience built around easy navigation, visual product discovery, and personalized recommendations.',
        'Followed a full user-centered process, moving through discovery and research, persona-building (goals, frustrations, tech habits), design and prototyping, then testing and iteration, so every screen was grounded in an actual user need rather than just aesthetics.',
        'Brought the interface to life with a clean, image-forward home feed, category shortcuts, and product cards, tied together with a Poppins type system and a considered colour palette to give Styla its own distinct, modern brand identity.',
      ],
      role: 'Personal / Concept Project',
      duration: 'Self-Directed',
      scope: 'Mobile App, UX Research & UI Design',
      links: {
        behance: 'https://www.behance.net/gallery/241378235/Styla-Fashion-App-Streamlined-Shopping-Experience',
      },
    },
  },
  'aureum': {
    type: 'file', kind: 'case-study', title: 'Aureum.case', parent: 'work',
    data: {
      title: 'Aureum',
      tag: 'Web Platform · Personal Project, 2026',
      summary: 'A high-end jewelry house concept built around restraint and material presence, letting diamonds, gold, and negative space carry the luxury rather than heavy branding.',
      cover: 'assets/images/projects/aureum-cover.jpg',
      body: [
        'Designed Aureum as a digital jewelry house, opening with a cinematic "Exceptional Brilliance Awaits" hero and letting full-bleed product photography (diamond necklaces, statement earrings) do the selling instead of promotional copy.',
        'Paired an elegant serif display face with Inter for body text, and built a quiet, near-monochrome dark palette so the jewelry itself, not the interface, stayed the visual focus throughout Signature Collections and Curated Masterpieces.',
        'Extended the same restrained, gallery-like language into a private viewing selection and service pages, then adapted the full experience for mobile so the brand feel held up across devices.',
      ],
      role: 'Personal / Concept Project',
      duration: 'Self-Directed',
      scope: 'Web Platform, Desktop & Mobile',
      links: {
        behance: 'https://www.behance.net/gallery/245854745/AUREUM-High-End-Jewelry-House-UIUX-Case-Study',
      },
    },
  },
  'aetherix': {
    type: 'file', kind: 'case-study', title: 'Aetherix.case', parent: 'work',
    data: {
      title: 'Aetherix',
      tag: 'Landing Page · Personal Project, 2026',
      summary: 'A high-impact landing page for a premium drone brand, designed to balance aspirational, cinematic imagery with the hard technical specs serious buyers need.',
      cover: 'assets/images/projects/aetherix-cover.jpg',
      body: [
        'The high-end drone market tends to either drown users in technical data or oversell on lifestyle imagery. I designed Aetherix around Progressive Disclosure: an emotional, high-impact hero draws the user in first, then the page gradually introduces performance data and social proof as they scroll.',
        'Structured the flow through a simplified product architecture and a value-first "Perspectives Unlocked" gallery, letting real-world use cases (filmmaking, adventure photography, exploration) build desire before any spec sheet appears.',
        'Backed the direction with a defined user persona and a bold Clash Display type system, then carried the same guided, cinematic pacing through to the mobile layout so the experience held together at every size.',
      ],
      role: 'Personal / Concept Project',
      duration: 'Self-Directed',
      scope: 'Landing Page, Desktop & Mobile',
      links: {
        behance: 'https://www.behance.net/gallery/241963467/Aetherix-UXUI-Case-Study-2026',
      },
    },
  },
  'esivo': {
    type: 'file', kind: 'case-study', title: 'Esivo.case', parent: 'work',
    data: {
      title: 'ESIVO',
      tag: 'Web Platform · Collaborative Project, 2026',
      summary: 'A brand and product site for a next-generation GPU architecture company, designed to make deeply technical hardware feel as credible and precise as the engineering behind it.',
      cover: 'assets/images/projects/esivo-cover.jpg',
      body: [
        'Designed the ESIVO site around the idea that every component in the ESIVO-1 was a research paper before it was a product, translating that rigor into a confident, high-contrast red, black, and white system built for a technical, engineering-literate audience.',
        'Structured the story around ESIVO\u2019s six independent engineering systems (thermal, cooling, signal, power, compute, memory), optimized in isolation then calibrated together, and let hard performance numbers (128 TFLOPS, 2.4TB/s, 1.6TB/s optical bandwidth) carry as much visual weight as the product photography.',
        'Backed the product narrative with company credibility: team, funding, and founding story, then carried the same dense, engineered feel through to mobile.',
        'Worked on this collaboratively with Karina Kudina, a UX/UI designer from Ukraine.',
      ],
      role: 'Collaborative Project (with Karina Kudina)',
      duration: 'Collaborative Project, 2026',
      scope: 'Web Platform, Desktop & Mobile',
      links: {
        behance: 'https://www.behance.net/gallery/252029567/ESIVO-Next-Gen-GPU-Architecture-UXUI-Design',
      },
    },
  },
};

const desktopIconOrder = ['work', 'about', 'resume', 'notes', 'mail', 'social', 'trash'];
const dockOrder = ['work', 'about', 'notes', 'mail', 'social', 'resume', null, 'trash'];
const workFiles = Object.keys(filesystem).filter((k) => filesystem[k].parent === 'work');

/* ---------------------------------------------------------------------- */
/* Window manager                                                          */
/* ---------------------------------------------------------------------- */

const WM = {
  zCounter: 100,
  openWindows: new Set(),
  lastFocusedTrigger: null,

  getWindowEl(id) {
    return document.getElementById('win-' + id);
  },

  open(id, triggerEl) {
    const entry = filesystem[id];
    if (!entry) return;

    if (entry.kind === 'pdf') {
      openResume();
      return;
    }
    if (entry.kind === 'case-study') {
      this.openCaseStudy(id);
      return;
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
      requestAnimationFrame(() => el.classList.add('is-animated-in'));
    });

    const firstField = el.querySelector('input, textarea, button.finder-file, .window-body [tabindex]');
    if (firstField) setTimeout(() => firstField.focus(), 60);
  },

  openCaseStudy(id) {
    const data = filesystem[id].data;
    const el = document.getElementById('win-case-viewer');
    if (!el) return;

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
      linksRow.innerHTML = buttons.join('');
      linksRow.style.display = buttons.length ? 'flex' : 'none';
    }

    el.querySelector('.case-paragraphs').innerHTML = data.body.map((p) => `<p>${p}</p>`).join('');
    el.querySelector('.case-role').textContent = data.role;
    el.querySelector('.case-duration').textContent = data.duration;
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

  close(id) {
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

/* ---------------------------------------------------------------------- */
/* Dragging                                                                 */
/* ---------------------------------------------------------------------- */

function initDragging() {
  if (IS_MOBILE) return;
  document.querySelectorAll('.window-titlebar').forEach((bar) => {
    let dragging = false;
    let startX, startY, startLeft, startTop;
    const win = bar.closest('.os-window');

    bar.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.traffic-lights')) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = win.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      win.style.left = startLeft + 'px';
      win.style.top = startTop + 'px';
      WM.focus(win.id.replace('win-', ''));
      bar.setPointerCapture(e.pointerId);
    });

    bar.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      win.style.left = Math.max(0, startLeft + dx) + 'px';
      win.style.top = Math.max(28, startTop + dy) + 'px';
    });

    ['pointerup', 'pointercancel'].forEach((evt) => {
      bar.addEventListener(evt, () => { dragging = false; });
    });
  });
}

/* ---------------------------------------------------------------------- */
/* Desktop icons + dock + window triggers                                  */
/* ---------------------------------------------------------------------- */

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

/* ---------------------------------------------------------------------- */
/* Dock magnification                                                       */
/* ---------------------------------------------------------------------- */

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

/* ---------------------------------------------------------------------- */
/* Finder: populate work files from filesystem                             */
/* ---------------------------------------------------------------------- */

function renderFinder() {
  const grid = document.querySelector('.finder-grid');
  if (!grid) return;
  const docSvg = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none"><path d="M6 2.5H13.5L18.5 7.5V19.5C18.5 20.6 17.6 21.5 16.5 21.5H6C4.9 21.5 4 20.6 4 19.5V4.5C4 3.4 4.9 2.5 6 2.5Z" fill="#4a4a52"/><path d="M13.5 2.5V6.5C13.5 7.05 13.95 7.5 14.5 7.5H18.5" fill="#8a8a92"/><path d="M7 12H15M7 15.5H15M7 18.5H12" stroke="white" stroke-width="1.1" stroke-linecap="round"/></svg>';
  grid.innerHTML = workFiles.map((key) => {
    const f = filesystem[key];
    const cover = f.data && f.data.cover;
    const glyph = cover
      ? `<span class="icon-glyph thumb"><img src="${cover}" alt="" loading="lazy"></span>`
      : `<span class="icon-glyph doc">${docSvg}</span>`;
    return `<button class="finder-file" data-open="${key}">
      ${glyph}
      <span class="file-label">${f.title}</span>
      <span class="file-meta">Case Study</span>
    </button>`;
  }).join('');

  grid.querySelectorAll('[data-open]').forEach((el) => {
    el.addEventListener('click', () => { Sound.open(); WM.open(el.dataset.open, el); });
  });
}

/* ---------------------------------------------------------------------- */
/* Spotlight search                                                         */
/* ---------------------------------------------------------------------- */

function initSpotlight() {
  const overlay = document.querySelector('.spotlight-overlay');
  const input = document.querySelector('.spotlight-input');
  const results = document.querySelector('.spotlight-results');
  if (!overlay || !input || !results) return;

  let activeIndex = 0;
  let currentMatches = [];

  function allEntries() {
    return Object.keys(filesystem).map((key) => ({ key, ...filesystem[key] }));
  }

  function renderResults(query) {
    const q = query.trim().toLowerCase();
    currentMatches = allEntries().filter((f) => f.title.toLowerCase().includes(q));
    if (!q) currentMatches = allEntries();
    activeIndex = 0;

    if (!currentMatches.length) {
      results.innerHTML = '<div class="spotlight-empty">No results</div>';
      return;
    }

    results.innerHTML = currentMatches.map((f, i) => `
      <div class="spotlight-result ${i === 0 ? 'is-active' : ''}" data-key="${f.key}">
        <span>${f.title}</span>
      </div>
    `).join('');

    results.querySelectorAll('.spotlight-result').forEach((el) => {
      el.addEventListener('click', () => {
        Sound.open();
        WM.open(el.dataset.key);
        closeSpotlight();
      });
    });
  }

  function updateActive() {
    results.querySelectorAll('.spotlight-result').forEach((el, i) => {
      el.classList.toggle('is-active', i === activeIndex);
    });
    const activeEl = results.querySelector('.spotlight-result.is-active');
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
  }

  function openSpotlight() {
    Sound.click();
    overlay.classList.add('is-visible');
    input.value = '';
    renderResults('');
    setTimeout(() => input.focus(), 30);
  }

  function closeSpotlight() {
    overlay.classList.remove('is-visible');
  }

  window.openSpotlight = openSpotlight;

  input.addEventListener('input', () => renderResults(input.value));

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, currentMatches.length - 1);
      updateActive();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      updateActive();
    } else if (e.key === 'Enter') {
      const match = currentMatches[activeIndex];
      if (match) { WM.open(match.key); closeSpotlight(); }
    } else if (e.key === 'Escape') {
      closeSpotlight();
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSpotlight();
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSpotlight();
    }
  });

  const searchBtn = document.querySelector('.menu-search-btn');
  if (searchBtn) searchBtn.addEventListener('click', openSpotlight);
}

/* ---------------------------------------------------------------------- */
/* Menu bar clock                                                           */
/* ---------------------------------------------------------------------- */

function initClock() {
  const menuClock = document.querySelector('.menu-clock');
  const iosTime = document.querySelector('.ios-time');
  const widgetTimes = document.querySelectorAll('.clock-time');
  const widgetDates = document.querySelectorAll('.clock-date');

  function tick() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const shortTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
    if (menuClock) menuClock.textContent = timeStr;
    if (iosTime) iosTime.textContent = shortTime;
    widgetTimes.forEach((el) => { el.textContent = timeStr; });
    widgetDates.forEach((el) => {
      el.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + ' · Tangier';
    });
  }
  tick();
  setInterval(tick, 1000);
}

/* ---------------------------------------------------------------------- */
/* Coffee counter widget (localStorage)                                    */
/* ---------------------------------------------------------------------- */

function initCoffeeWidget() {
  const btns = document.querySelectorAll('.coffee-btn');
  const countEls = document.querySelectorAll('.coffee-count');
  if (!btns.length || !countEls.length) return;

  let count = 0;
  try { count = parseInt(localStorage.getItem('icon_coffee_count') || '0', 10) || 0; } catch (e) {}

  function render() {
    countEls.forEach((el) => { el.textContent = count; });
  }
  render();

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      Sound.coffee();
      count += 1;
      render();
      try { localStorage.setItem('icon_coffee_count', String(count)); } catch (e) {}
    });
  });
}

/* ---------------------------------------------------------------------- */
/* Design quote widget                                                      */
/* ---------------------------------------------------------------------- */

const designQuotes = [
  'Good design is as little design as possible.',
  'Structure first, ornament when it is earned.',
  'A user should never have to think about the interface.',
  'Every pixel should have a reason to exist.',
  'Research is the part nobody sees and the part that matters most.',
  'The grid is a promise you make to the user.',
  'If it needs a tutorial, the design failed first.',
];

function initQuoteWidget() {
  const p = document.querySelector('.widget-quote p');
  const btn = document.querySelector('.widget-quote button');
  if (!p || !btn) return;
  let last = -1;
  function next() {
    let i = Math.floor(Math.random() * designQuotes.length);
    if (i === last) i = (i + 1) % designQuotes.length;
    last = i;
    p.textContent = designQuotes[i];
  }
  next();
  btn.addEventListener('click', () => { Sound.click(); next(); });
}

/* ---------------------------------------------------------------------- */
/* Notes app (localStorage persistence)                                    */
/* ---------------------------------------------------------------------- */

function initNotes() {
  const textarea = document.querySelector('.notes-editor textarea');
  const status = document.querySelector('.notes-status');
  if (!textarea) return;

  const defaultNote = 'Feel free to play with this Notes app.\n\nIt actually saves what you type, right here in your browser.';
  let saved = null;
  try { saved = localStorage.getItem('icon_notes_content'); } catch (e) {}
  textarea.value = saved !== null ? saved : defaultNote;

  let timeout;
  textarea.addEventListener('input', () => {
    if (status) status.textContent = 'Editing…';
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      try { localStorage.setItem('icon_notes_content', textarea.value); } catch (e) {}
      if (status) status.textContent = 'Saved just now';
    }, 500);
  });
}

/* ---------------------------------------------------------------------- */
/* Mail app                                                                 */
/* ---------------------------------------------------------------------- */

function initMail() {
  const form = document.querySelector('.mail-form');
  if (!form) return;

  const successBox = document.querySelector('.mail-success');
  const errorBox = document.querySelector('.mail-error');
  const sendAgainBtn = document.querySelector('.mail-send-another-btn');
  const submitBtn = form.querySelector('.mail-send-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorBox) { errorBox.style.display = 'none'; errorBox.textContent = ''; }

    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const result = await response.json();

      if (result.success) {
        Sound.open();
        form.reset();
        form.classList.add('is-hidden');
        if (successBox) successBox.classList.add('is-visible');
      } else {
        throw new Error(result.message || 'Something went wrong.');
      }
    } catch (err) {
      if (errorBox) {
        errorBox.textContent = "That didn't go through, please try again or email noeman.elafia@outlook.com directly.";
        errorBox.style.display = 'block';
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });

  if (sendAgainBtn) {
    sendAgainBtn.addEventListener('click', () => {
      if (successBox) successBox.classList.remove('is-visible');
      form.classList.remove('is-hidden');
    });
  }
}

/* ---------------------------------------------------------------------- */
/* Boot sequence                                                           */
/* ---------------------------------------------------------------------- */

function initBoot() {
  const boot = document.getElementById('boot-screen');
  const skipBtn = document.querySelector('.boot-skip');
  if (!boot) return;

  const hide = () => {
    boot.classList.add('hidden');
    setTimeout(showWelcomeIfFirstVisit, 400);
  };

  const autoTimer = setTimeout(hide, REDUCED_MOTION ? 200 : 1700);
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      Sound.resume();
      Sound.boot();
      clearTimeout(autoTimer);
      hide();
    });
  }
}

function showWelcomeIfFirstVisit() {
  let seen = false;
  try { seen = localStorage.getItem('icon_welcome_seen') === '1'; } catch (e) {}
  if (seen) return;

  const overlay = document.querySelector('.welcome-overlay');
  const btn = document.querySelector('.welcome-continue-btn');
  if (!overlay || !btn) return;

  function dismiss() {
    overlay.classList.remove('is-animated-in');
    try { localStorage.setItem('icon_welcome_seen', '1'); } catch (e) {}
    setTimeout(() => overlay.classList.remove('is-visible'), 300);
  }

  overlay.classList.add('is-visible');
  requestAnimationFrame(() => { overlay.classList.add('is-animated-in'); });

  btn.addEventListener('click', () => { Sound.click(); dismiss(); }, { once: true });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) dismiss();
  });
}

/* ---------------------------------------------------------------------- */
/* Boot                                                                     */
/* ---------------------------------------------------------------------- */

function bootApp() {
  const plain = document.getElementById('plain-view');
  const os = document.getElementById('os-view');
  if (plain) plain.style.display = 'none';
  if (os) os.style.display = 'block';

  initBoot();
  initSound();
  renderFinder();
  initTriggers();
  initDragging();
  initDockMagnify();
  initSpotlight();
  initClock();
  initCoffeeWidget();
  initQuoteWidget();
  initNotes();
  initMail();
}

try {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootApp);
  } else {
    bootApp();
  }
} catch (err) {
  const plain = document.getElementById('plain-view');
  const os = document.getElementById('os-view');
  if (plain) plain.style.display = 'block';
  if (os) os.style.display = 'none';
}
