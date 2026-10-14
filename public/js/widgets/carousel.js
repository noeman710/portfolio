/* Widgets carousel
   Swipeable widget strip on mobile. */

function initWidgetsCarousel() {
  const track = document.querySelector('.ios-pages-track');
  const dots = document.querySelectorAll('.ios-widgets-dots .dot');
  if (!track || !dots.length) return;

  track.addEventListener('scroll', () => {
    const page = Math.round(track.scrollLeft / track.clientWidth);
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === page));
  }, { passive: true });
}
