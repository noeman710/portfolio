/* Coffee counter widget
   Counter persisted in localStorage. */

function initCoffeeWidget() {
  const btns = document.querySelectorAll('.coffee-btn');
  const countEls = document.querySelectorAll('.coffee-count');
  if (!btns.length || !countEls.length) return;

  let count = 0;
  try { count = parseInt(localStorage.getItem('icon_coffee_count') || '0', 10) || 0; } catch (e) {}

  function render() {
    countEls.forEach((el) => { el.textContent = count; });
  }
  render();

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      Sound.coffee();
      count += 1;
      render();
      try { localStorage.setItem('icon_coffee_count', String(count)); } catch (e) {}
    });
  });
}
