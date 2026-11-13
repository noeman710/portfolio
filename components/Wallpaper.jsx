'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import AeroShards from './AeroShards';

const KEY = 'icon_wallpaper'; // 'aero' (default) or 'liquid' (the original animated wallpaper)

// Same blue family as the liquid wallpaper (#66B3FF).
const SHARDS = {
  shardColor: '#4F8FE6',
  accentColor: '#66B3FF',
  placement: 'full',
  material: 'glass',
  markers: 'plus',
  depthOfField: 0.75,
  vignette: 0.3,
  mouseInteraction: true,
  pulseOnClick: true,
  holdToGather: true,
  dpr: 1.5,
};

// Phones: fewer shards keeps the frame rate and the battery happy.
const isPhone = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches;

function readChoice() {
  try { return localStorage.getItem(KEY) === 'liquid' ? 'liquid' : 'aero'; } catch { return 'aero'; }
}

export default function Wallpaper() {
  const [choice, setChoice] = useState('aero');
  const [failed, setFailed] = useState(false); // WebGPU missing or crashed: quietly use the liquid wallpaper
  const [host, setHost] = useState(null);

  // Mount point inside .desktop, right after the liquid canvas, so every desktop layer stays above it.
  useEffect(() => {
    const desktop = document.querySelector('.desktop');
    if (!desktop) return undefined;
    const el = document.createElement('div');
    el.className = 'wallpaper-aero';
    el.setAttribute('aria-hidden', 'true');
    const liquid = desktop.querySelector('.liquid-bg');
    if (liquid) liquid.after(el); else desktop.prepend(el);
    setHost(el);
    return () => el.remove();
  }, []);

  useEffect(() => {
    setChoice(readChoice());
    if (!('gpu' in navigator)) setFailed(true);
    const onSet = (e) => {
      const next = e.detail === 'liquid' ? 'liquid' : 'aero';
      try { localStorage.setItem(KEY, next); } catch {}
      setChoice(next);
    };
    window.addEventListener('wallpaper:set', onSet);
    return () => window.removeEventListener('wallpaper:set', onSet);
  }, []);

  const useAero = choice === 'aero' && !failed;

  // What is really on screen (the menu reads this, so a browser without WebGPU shows Liquid as selected).
  useEffect(() => {
    document.documentElement.dataset.wallpaper = useAero ? 'aero' : 'liquid';
  }, [useAero]);

  // Hide + pause the liquid canvas while the shards are showing, resume when it is chosen again.
  useEffect(() => {
    const canvas = document.querySelector('.liquid-bg');
    if (canvas) canvas.style.visibility = useAero ? 'hidden' : '';
    const t = setTimeout(() => {
      if (window.LiquidBg) useAero ? window.LiquidBg.pause() : window.LiquidBg.play();
    }, 0);
    return () => clearTimeout(t);
  }, [useAero]);

  if (!host || !useAero) return null;
  return createPortal(
    <AeroShards {...SHARDS} count={isPhone() ? 700 : 1300} onError={(err) => { console.warn('Aero Shards unavailable, using the liquid wallpaper.', err); setFailed(true); }} />,
    host,
  );
}
