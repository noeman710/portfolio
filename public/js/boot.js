/* Boot
   Starts every module once the DOM is ready (a failing module never stops the others). */

function bootApp() {
  const plain = document.getElementById('plain-view');
  const os = document.getElementById('os-view');
  if (plain) plain.style.display = 'none';
  if (os) os.style.display = 'block';

  const safe = (fn, label) => {
    try { fn(); } catch (err) {
      console.error('[bootApp] ' + label + ' failed:', err);
    }
  };

  safe(initBoot, 'initBoot');
  safe(initSound, 'initSound');
  safe(initGravity, 'initGravity');
  safe(renderFinder, 'renderFinder');
  safe(renderPhotosGrid, 'renderPhotosGrid');
  safe(initLightbox, 'initLightbox');
  safe(initRouter, 'initRouter');
  safe(initTriggers, 'initTriggers');
  safe(initDragging, 'initDragging');
  safe(initWindowResize, 'initWindowResize');
  safe(initDockMagnify, 'initDockMagnify');
  safe(initWidgetsCarousel, 'initWidgetsCarousel');
  safe(initSpotlight, 'initSpotlight');
  safe(initClock, 'initClock');
  safe(initBatteryStatus, 'initBatteryStatus');
  safe(initCoffeeWidget, 'initCoffeeWidget');
  safe(initQuoteWidget, 'initQuoteWidget');
  safe(initMusicWidget, 'initMusicWidget');
  safe(initNotes, 'initNotes');
  safe(initMail, 'initMail');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}
