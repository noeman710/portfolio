/* Music widget
   Favourite-songs player with a draggable timeline. */

const musicTracks = [
  { title: 'Fullmetal Alchemist: Brotherhood', artist: 'Opening Theme', src: '/assets/audio/track-06.mp3' },
  { title: 'Passionate Spectrum', artist: 'The Seven Deadly Sins — OP1', src: '/assets/audio/track-01.mp3' },
  { title: 'D-tecnoLife', artist: 'UVERworld — Bleach OP2', src: '/assets/audio/track-02.mp3' },
  { title: 'Asterisk', artist: 'ORANGE RANGE — Bleach OP1', src: '/assets/audio/track-03.mp3' },
  { title: 'Unravel', artist: 'TK from Ling tosite sigure — Tokyo Ghoul OP', src: '/assets/audio/track-04.mp3' },
  { title: 'ALONES', artist: 'Aqua Timez — Bleach OP', src: '/assets/audio/track-05.mp3' },
];

const playIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M8 5.5v13l11-6.5z"/></svg>';
const pauseIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="white"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';

function initMusicWidget() {
  const widgets = document.querySelectorAll('.widget-music');
  if (!widgets.length) return;

  const audio = new Audio();
  let index = 0;

  const refs = Array.from(widgets).map((widget) => ({
    widget,
    titleEl: widget.querySelector('.music-track-title'),
    artistEl: widget.querySelector('.music-track-artist'),
    playBtn: widget.querySelector('.music-play'),
    prevBtn: widget.querySelector('.music-prev'),
    nextBtn: widget.querySelector('.music-next'),
    progress: widget.querySelector('.music-progress'),
    progressFill: widget.querySelector('.music-progress-fill'),
  })).filter((r) => r.titleEl && r.playBtn);

  function loadTrack(i, autoplay) {
    index = (i + musicTracks.length) % musicTracks.length;
    const track = musicTracks[index];
    refs.forEach((r) => {
      r.titleEl.textContent = track.title;
      r.artistEl.textContent = track.artist;
      if (r.progressFill) r.progressFill.style.width = '0%';
    });
    audio.src = track.src;
    if (autoplay) audio.play().catch(() => {});
  }

  function setPlayingUI(isPlaying) {
    refs.forEach((r) => {
      r.playBtn.innerHTML = isPlaying ? pauseIcon : playIcon;
      r.playBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
    });
  }

  loadTrack(0, false);

  refs.forEach((r) => {
    r.playBtn.addEventListener('click', () => {
      Sound.click();
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
    });
    r.prevBtn.addEventListener('click', () => { Sound.click(); loadTrack(index - 1, !audio.paused); });
    r.nextBtn.addEventListener('click', () => { Sound.click(); loadTrack(index + 1, !audio.paused); });
    if (r.progress) {
      let dragging = false;
      const seekTo = (e) => {
        const rect = r.progress.getBoundingClientRect();
        const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
        const pct = ratio * 100 + '%';
        refs.forEach((o) => { if (o.progressFill) o.progressFill.style.width = pct; });
        if (audio.duration) audio.currentTime = ratio * audio.duration;
      };
      r.progress.addEventListener('pointerdown', (e) => {
        if (e.button !== undefined && e.button > 0) return;
        dragging = true;
        try { r.progress.setPointerCapture(e.pointerId); } catch (err) {}
        r.progress.classList.add('is-seeking');
        seekTo(e);
        e.preventDefault();
      });
      r.progress.addEventListener('pointermove', (e) => { if (dragging) seekTo(e); });
      const end = (e) => {
        if (!dragging) return;
        dragging = false;
        r.progress.classList.remove('is-seeking');
        try { r.progress.releasePointerCapture(e.pointerId); } catch (err) {}
      };
      r.progress.addEventListener('pointerup', end);
      r.progress.addEventListener('pointercancel', end);
    }
  });

  // Removing the music widget stops the song.
  window.addEventListener('music:stop', () => { audio.pause(); });

  audio.addEventListener('play', () => setPlayingUI(true));
  audio.addEventListener('pause', () => setPlayingUI(false));
  audio.addEventListener('ended', () => loadTrack(index + 1, true));
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration || refs.some((x) => x.progress && x.progress.classList.contains('is-seeking'))) return;
    const pct = (audio.currentTime / audio.duration) * 100 + '%';
    refs.forEach((r) => { if (r.progressFill) r.progressFill.style.width = pct; });
  });
}
