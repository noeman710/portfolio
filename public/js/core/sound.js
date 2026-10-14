/* Sound design
   Small synthesized UI sounds via the Web Audio API. Everything is generated tones/noise, no audio files.
   The audio context only starts after a real user gesture (autoplay policy); the mute state persists per browser. */

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
    masterGain.gain.value = muted ? 0 : 0.85;
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
      if (masterGain) masterGain.gain.value = muted ? 0 : 0.85;
    },

    open() { tone({ freq: 380, glideTo: 640, duration: 0.14, type: 'sine', gain: 0.2 }); },
    close() { tone({ freq: 460, glideTo: 220, duration: 0.13, type: 'sine', gain: 0.16 }); },
    click() { tone({ freq: 880, duration: 0.05, type: 'sine', gain: 0.1 }); },
    // Gravity mode: physical hit sounds. strength 0..1, kind = icon | card | widget | window
    impact(kind, strength = 0.5, bump = false) {
      const s = Math.max(0.05, Math.min(1, strength));
      const j = 0.9 + Math.random() * 0.25; // slight pitch variation so it never sounds looped
      if (kind === 'window') {
        tone({ freq: 120 * j, glideTo: 42, duration: 0.28, type: 'sine', gain: 0.5 * s });
        noiseBurst({ duration: 0.12, gain: 0.22 * s, filterFreq: 500 });
      } else if (kind === 'widget') {
        tone({ freq: 200 * j, glideTo: 70, duration: 0.17, type: 'sine', gain: 0.4 * s });
        noiseBurst({ duration: 0.06, gain: 0.16 * s, filterFreq: 1400 });
      } else if (kind === 'card') {
        tone({ freq: 340 * j, glideTo: 130, duration: 0.09, type: 'triangle', gain: 0.28 * s });
        noiseBurst({ duration: 0.035, gain: 0.1 * s, filterFreq: 3000 });
      } else {
        tone({ freq: 260 * j, glideTo: 90, duration: 0.12, type: 'sine', gain: 0.34 * s });
        noiseBurst({ duration: 0.045, gain: 0.13 * s, filterFreq: 2200 });
      }
      if (bump) tone({ freq: 1300 * j, duration: 0.03, type: 'square', gain: 0.03 * s }); // object-on-object tick
    },
    gravityOn() {
      tone({ freq: 700, glideTo: 90, duration: 0.55, type: 'sawtooth', gain: 0.07 });
      noiseBurst({ duration: 0.5, gain: 0.07, filterFreq: 900 });
    },
    gravityOff() { tone({ freq: 160, glideTo: 820, duration: 0.6, type: 'sine', gain: 0.14 }); },
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
