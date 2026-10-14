/* Maps app
   Leaflet map of Tangier. */

let tangierMap = null;

function ensureTangierMap() {
  if (tangierMap || typeof L === 'undefined') return;
  const container = document.getElementById('tangier-map');
  if (!container) return;

  const coords = [35.7595, -5.8340];

  tangierMap = L.map(container, {
    zoomControl: true,
    attributionControl: false,
  }).setView(coords, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(tangierMap);

  const pinHtml = `
    <div class="maps-pin-marker">
      <span class="maps-pin-pulse"></span>
      <span class="maps-pin-pulse maps-pin-pulse-delay"></span>
      <img class="maps-pin-avatar" src="/assets/images/portrait.jpg" alt="Noemane El Afia" title="Noemane El Afia — UX/UI Designer, Tangier, Morocco">
    </div>
  `;

  const icon = L.divIcon({
    html: pinHtml,
    className: 'maps-pin',
    iconSize: [0, 0],
    iconAnchor: [0, 26],
  });

  L.marker(coords, { icon, interactive: false, keyboard: false }).addTo(tangierMap);

  // Critical fix: Leaflet computes its tile grid from the container's size at
  // creation time. If the window (and therefore the map container) is later
  // resized — via the window resize handles, maximize, or orientation change —
  // Leaflet never finds out unless told, leaving blank tile gaps. A
  // ResizeObserver keeps it in sync automatically, regardless of what caused
  // the resize.
  const resizeObserver = new ResizeObserver(() => {
    if (tangierMap) tangierMap.invalidateSize();
  });
  resizeObserver.observe(container);
  window.tangierMap = tangierMap;
}
