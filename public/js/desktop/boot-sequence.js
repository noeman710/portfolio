/* Boot sequence
   Boot screen and the first-visit welcome overlay. */

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
