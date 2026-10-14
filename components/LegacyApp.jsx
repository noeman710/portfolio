'use client';
import { useEffect } from 'react';

// The desktop markup is server-rendered by app/layout.jsx. This attaches the interactive layer
// (window manager, widgets, mail, gravity, trash), loading the scripts in order. They are plain
// browser scripts for now and can be converted to React components one by one.
const SCRIPTS = [
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  // visual effects (no dependencies)
  '/js/effects/liquid-bg.js',
  '/js/effects/gravity.js',
  // shared foundations
  '/js/core/constants.js',
  '/js/core/sound.js',
  '/js/data/filesystem.js',
  // window system
  '/js/core/router.js',
  '/js/core/window-manager.js',
  '/js/core/window-resize.js',
  '/js/core/window-drag.js',
  '/js/core/triggers.js',
  // desktop chrome
  '/js/desktop/dock-magnify.js',
  '/js/desktop/menu-bar.js',
  '/js/desktop/boot-sequence.js',
  // widgets
  '/js/widgets/carousel.js',
  '/js/widgets/coffee.js',
  '/js/widgets/quote.js',
  '/js/widgets/music.js',
  // apps
  '/js/apps/finder.js',
  '/js/apps/photos.js',
  '/js/apps/spotlight.js',
  '/js/apps/maps.js',
  '/js/apps/notes.js',
  '/js/apps/mail.js',
  '/js/effects/gravity-toggle.js',
  // start everything, then the features that hook into the running desktop
  '/js/boot.js',
  '/js/features/trash.js',
];

// Scripts download in parallel but run strictly in list order (async = false).
function loadAll(list) {
  return Promise.all(list.map((src) => new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.onload = resolve;
    s.onerror = resolve; // a failed CDN script must not stop the rest of the site
    document.body.appendChild(s);
  })));
}

export default function LegacyApp() {
  useEffect(() => {
    if (window.__legacyAppLoaded) return;
    window.__legacyAppLoaded = true;
    loadAll(SCRIPTS);
  }, []);
  return null;
}
