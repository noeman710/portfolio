'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import AeroShards from './AeroShards';
import GradientWaves from './GradientWaves';

const KEY = 'icon_wallpaper'; // 'aero' (default), 'waves' or 'liquid' (the original animated wallpaper)
const CHOICES = ['aero', 'waves', 'liquid'];

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
  dpr: 1, // soft, glowing shards look the same at 1x and cost about half as much as 1.5x
};

// Gradient Waves recoloured to the same blue family.
const WAVES = {
  horizonColor: '#1450B8',
  waveColor: '#5AA0F5',
  crestColor: '#CFE6FF',
  speed: 0.4,
  amplitude: 2.5,
  relief: 1,
  brightness: 1.3,
  lightAngle: 120,
  mouseInteraction: true,
  swellOnClick: true,
  dpr: 1,
};

// Phones: fewer shards keeps the frame rate and the battery happy.
const isPhone = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches;

function readChoice() {
  try { const v = localStorage.getItem(KEY); return CHOICES.includes(v) ? v : 'aero'; } catch { return 'aero'; }
}

export default function Wallpaper() {
  const [choice, setChoice] = useState('aero');
  const [failed, setFailed] = useState(false); // WebGPU missing or crashed: quietly use the liquid wallpaper
  const [noGL2, setNoGL2] = useState(false);
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
    try { if (!document.createElement('canvas').getContext('webgl2')) setNoGL2(true); } catch { setNoGL2(true); }
    const onSet = (e) => {
      const next = CHOICES.includes(e.detail) ? e.detail : 'aero';
      try { localStorage.setItem(KEY, next); } catch {}
      setChoice(next);
    };
    window.addEventListener('wallpaper:set', onSet);
    return () => window.removeEventListener('wallpaper:set', onSet);
  }, []);

  // What is really on screen: a wallpaper that can't run here quietly becomes the liquid one.
  const shown = choice === 'aero' && !failed ? 'aero' : choice === 'waves' && !noGL2 ? 'waves' : 'liquid';
  const useAero = shown !== 'liquid'; // true while a canvas wallpaper covers the liquid one

  // What is really on screen (the menu reads this, so a browser without WebGPU shows Liquid as selected).
  useEffect(() => {
    document.documentElement.dataset.wallpaper = shown;
  }, [shown]);

  // Hide + pause the liquid canvas while the shards are showing, resume when it is chosen again.
  useEffect(() => {
    const canvas = document.querySelector('.liquid-bg');
    if (canvas) canvas.style.visibility = useAero ? 'hidden' : '';
    const t = setTimeout(() => {
      if (window.LiquidBg) useAero ? window.LiquidBg.pause() : window.LiquidBg.play();
    }, 0);
    return () => clearTimeout(t);
  }, [useAero]);

  // Phones show windows as full-page opaque sheets: stop rendering the wallpaper behind them completely.
  useEffect(() => {
    if (!host) return undefined;
    const covered = () => isPhone() && !!document.querySelector('.os-window.is-visible, .trash-panel:not([hidden])');
    const sync = () => { host.style.display = useAero && !covered() ? '' : 'none'; };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    return () => mo.disconnect();
  }, [host, useAero]);

  // GradientWaves removes its own canvas if the GPU refuses the shader; then use the liquid wallpaper instead of an empty screen.
  useEffect(() => {
    if (shown !== 'waves' || !host) return undefined;
    const t = setTimeout(() => { if (!host.querySelector('canvas.gradient-waves-canvas')) setNoGL2(true); }, 600);
    return () => clearTimeout(t);
  }, [shown, host]);

  if (!host || !useAero) return null;
  if (shown === 'waves') return createPortal(<GradientWaves key="waves" {...WAVES} quality={isPhone() ? 'low' : 'medium'} />, host);
  return createPortal(
    <AeroShards key="aero" {...SHARDS} count={isPhone() ? 400 : 800} onError={(err) => { console.warn('Aero Shards unavailable, using the liquid wallpaper.', err); setFailed(true); }} />,
    host,
  );
}
