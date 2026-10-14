/* Finder (Work)
   Shows the Work folder from the filesystem. Entries with kind 'folder' (e.g. Mediassive) open
   in place, with a "‹ Work" bar to go back. */

let finderFolder = 'work';

function openFinderFolder(id) {
  finderFolder = filesystem[id] && filesystem[id].kind === 'folder' ? id : 'work';
  renderFinder();
}

function renderFinder() {
  const grid = document.querySelector('.finder-grid');
  if (!grid) return;
  const body = grid.parentElement;
  const docSvg = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none"><path d="M6 2.5H13.5L18.5 7.5V19.5C18.5 20.6 17.6 21.5 16.5 21.5H6C4.9 21.5 4 20.6 4 19.5V4.5C4 3.4 4.9 2.5 6 2.5Z" fill="#4a4a52"/><path d="M13.5 2.5V6.5C13.5 7.05 13.95 7.5 14.5 7.5H18.5" fill="#8a8a92"/><path d="M7 12H15M7 15.5H15M7 18.5H12" stroke="white" stroke-width="1.1" stroke-linecap="round"/></svg>';

  // path bar (only inside a sub-folder)
  let bar = body.querySelector('.finder-path');
  if (finderFolder === 'work') {
    if (bar) bar.remove();
  } else {
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'finder-path';
      body.insertBefore(bar, grid);
    }
    bar.innerHTML = `<button class="finder-back" type="button">\u2039 Work</button><span class="finder-path-name">${filesystem[finderFolder].title}</span>`;
    bar.querySelector('.finder-back').addEventListener('click', () => { Sound.click(); openFinderFolder('work'); });
  }

  const keys = Object.keys(filesystem).filter((k) => filesystem[k].parent === finderFolder);
  grid.innerHTML = keys.map((key) => {
    const f = filesystem[key];
    if (f.kind === 'folder') {
      const n = Object.keys(filesystem).filter((k) => filesystem[k].parent === key).length;
      return `<button class="finder-file finder-folder" data-open="${key}">
      <span class="icon-glyph folder"></span>
      <span class="file-label">${f.title}</span>
      <span class="file-meta">${n} items</span>
    </button>`;
    }
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
    el.addEventListener('click', () => {
      Sound.open();
      if (filesystem[el.dataset.open].kind === 'folder') openFinderFolder(el.dataset.open);
      else WM.open(el.dataset.open, el);
    });
  });
}
