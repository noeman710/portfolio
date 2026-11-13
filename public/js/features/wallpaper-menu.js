/* Wallpaper menu
   Adds "Change wallpaper" rows to the desktop right-click menu (see rowsForDesk in trash.js).
   The choice itself is applied by components/Wallpaper.jsx, which listens for 'wallpaper:set'. */

(function () {
  const KEY = 'icon_wallpaper';
  const OPTIONS = [
    { id: 'aero', text: 'Aero Shards' },
    { id: 'liquid', text: 'Liquid (classic)' },
  ];

  function current() {
    const shown = document.documentElement.dataset.wallpaper; // what is really on screen
    if (shown) return shown;
    try { return localStorage.getItem(KEY) || 'aero'; } catch (e) { return 'aero'; }
  }

  window.deskMenuExtras = function () {
    const now = current();
    return [
      '-',
      { head: 'Wallpaper' },
      ...OPTIONS.map((o) => ({
        text: o.text,
        check: o.id === now,
        run: () => window.dispatchEvent(new CustomEvent('wallpaper:set', { detail: o.id })),
      })),
    ];
  };
})();
