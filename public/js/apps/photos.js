/* Photos + lightbox
   Populates the Photos folder and the full-screen viewer. */

function renderPhotosGrid() {
  const grid = document.querySelector('.photos-grid');
  if (!grid) return;
  grid.innerHTML = photoFiles.map((key) => {
    const f = filesystem[key];
    return `<button class="finder-file photo-file" data-open="${key}">
      <span class="icon-glyph thumb"><img src="${f.data.src}" alt="${f.data.alt || ''}" loading="lazy"></span>
      <span class="file-label">${f.title}</span>
      <span class="file-meta">Image</span>
    </button>`;
  }).join('');

  grid.querySelectorAll('[data-open]').forEach((el) => {
    el.addEventListener('click', () => { Sound.open(); WM.open(el.dataset.open, el); });
  });
}

function openLightbox(src, alt) {
  const overlay = document.querySelector('.lightbox');
  const img = overlay && overlay.querySelector('.lightbox-img');
  if (!overlay || !img) return;
  img.src = src;
  img.alt = alt || '';
  overlay.classList.add('is-visible');
  overlay.setAttribute('aria-hidden', 'false');
  Sound.open();
}

function closeLightbox() {
  const overlay = document.querySelector('.lightbox');
  if (!overlay || !overlay.classList.contains('is-visible')) return;
  overlay.classList.remove('is-visible');
  overlay.setAttribute('aria-hidden', 'true');
  Sound.close();
}

function initLightbox() {
  const overlay = document.querySelector('.lightbox');
  if (!overlay) return;

  overlay.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-visible')) closeLightbox();
  });

  document.querySelectorAll('.lightbox-trigger').forEach((img) => {
    img.addEventListener('click', () => openLightbox(img.getAttribute('src'), img.getAttribute('alt')));
  });
}
