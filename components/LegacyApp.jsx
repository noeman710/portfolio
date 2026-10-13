'use client';
import { useEffect } from 'react';

// The desktop markup is server-rendered by app/layout.jsx. This attaches the interactive layer
// (window manager, widgets, mail, gravity, trash), loading the scripts in order. They are plain
// browser scripts for now and can be converted to React components one by one.
const SCRIPTS = [
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  '/js/liquid-bg.js',
  '/js/gravity.js',
  '/js/main.js',
  '/js/trash.js',
];

function load(src) {
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = resolve; // a failed CDN script must not stop the rest of the site
    document.body.appendChild(s);
  });
}

export default function LegacyApp() {
  useEffect(() => {
    if (window.__legacyAppLoaded) return;
    window.__legacyAppLoaded = true;
    (async () => { for (const src of SCRIPTS) await load(src); })();
  }, []);
  return null;
}
