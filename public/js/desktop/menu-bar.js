/* Menu bar
   Battery status and the live clock. */

function initBatteryStatus() {
  const fillEl = document.querySelector('.ios-battery-fill');
  const pctEl = document.querySelector('.ios-battery-pct');
  if (!fillEl || !navigator.getBattery) return;

  navigator.getBattery().then((battery) => {
    function render() {
      const pct = Math.round(battery.level * 100);
      fillEl.setAttribute('width', (16 * battery.level).toFixed(1));
      pctEl.textContent = pct + '%';
    }
    render();
    battery.addEventListener('levelchange', render);
  }).catch(() => {});
}

function initClock() {
  const menuClock = document.querySelector('.menu-clock');
  const iosTime = document.querySelector('.ios-time');
  const widgetTimes = document.querySelectorAll('.clock-time');
  const widgetDates = document.querySelectorAll('.clock-date');

  function tick() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const shortTime = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (menuClock) menuClock.textContent = timeStr;
    if (iosTime) iosTime.textContent = shortTime;
    widgetTimes.forEach((el) => { el.textContent = timeStr; });
    widgetDates.forEach((el) => {
      el.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + ' · Tangier';
    });
  }
  tick();
  setInterval(tick, 1000);
}
