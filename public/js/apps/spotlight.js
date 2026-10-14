/* Spotlight search
   Cmd/Ctrl+K search over the filesystem. */

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
