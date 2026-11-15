/* About page: roadmap + problem-solving graph
   The nodes are plain HTML in content/desktop.html (so they are readable without JavaScript).
   This file draws the links between them as SVG curves and handles hover / tap highlighting. */

(function () {
  const graph = document.getElementById('about-graph');
  if (!graph) return;
  const svg = graph.querySelector('.ag-svg');
  const detail = document.getElementById('ag-detail');
  const hint = detail.textContent;
  const NS = 'http://www.w3.org/2000/svg';
  const nodes = [...graph.querySelectorAll('.ag-node')];
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const roads = nodes.filter((n) => n.classList.contains('ag-road'));
  const procs = nodes.filter((n) => n.classList.contains('ag-proc'));

  // [from, to, kind]: chain = next step in a column, cross = roadmap feeds the process, loop = iterate
  const links = [];
  [roads, procs].forEach((col) => col.slice(1).forEach((n, i) => links.push([col[i].id, n.id, 'chain'])));
  roads.forEach((r) => (r.dataset.links || '').split(',').filter(Boolean).forEach((t) => links.push([r.id, t, 'cross'])));
  links.push([procs[procs.length - 1].id, procs[1].id, 'loop']);

  let pinned = null;
  let hovered = null;
  const active = () => hovered || pinned;

  const box = (n) => ({ x: n.offsetLeft, y: n.offsetTop, w: n.offsetWidth, h: n.offsetHeight });
  const el = (name, attrs) => {
    const e = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  };

  function draw() {
    if (!graph.offsetWidth) return;
    graph.toggleAttribute('data-narrow', graph.offsetWidth < 460); // one column when there is no room for two
    const W = graph.offsetWidth, H = graph.offsetHeight;
    const wide = !graph.hasAttribute('data-narrow');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.replaceChildren();
    const defs = el('defs', {});
    const marker = el('marker', { id: 'ag-arrow', viewBox: '0 0 8 8', refX: 7, refY: 4, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' });
    marker.appendChild(el('path', { d: 'M0,0 L8,4 L0,8 z', class: 'ag-arrow' }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    links.forEach(([from, to, kind]) => {
      if (kind === 'cross' && !wide) return; // too narrow: the highlight still shows the relation
      const a = box(byId[from]), b = box(byId[to]);
      let d;
      if (kind === 'chain') {
        d = `M${a.x + a.w / 2},${a.y + a.h} L${b.x + b.w / 2},${b.y}`;
      } else if (kind === 'cross') {
        const x1 = a.x + a.w, y1 = a.y + a.h / 2, x2 = b.x, y2 = b.y + b.h / 2, mx = (x1 + x2) / 2;
        d = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
      } else {
        const x1 = a.x + a.w, y1 = a.y + a.h / 2, x2 = b.x + b.w, y2 = b.y + b.h / 2, out = Math.min(W - 6, x1 + 26);
        d = `M${x1},${y1} C${out},${y1} ${out},${y2} ${x2},${y2}`;
      }
      const path = el('path', { d, class: `ag-link ag-${kind}`, 'data-from': from, 'data-to': to, 'marker-end': 'url(#ag-arrow)' });
      svg.appendChild(path);
    });
    paint();
  }

  function related(id) {
    const set = new Set([id]);
    links.forEach(([f, t]) => { if (f === id) set.add(t); if (t === id) set.add(f); });
    return set;
  }

  function paint() {
    const id = active();
    const rel = id ? related(id) : null;
    nodes.forEach((n) => {
      n.classList.toggle('is-active', n.id === id);
      n.classList.toggle('is-related', !!rel && rel.has(n.id) && n.id !== id);
      n.classList.toggle('is-dim', !!rel && !rel.has(n.id));
    });
    svg.querySelectorAll('.ag-link').forEach((p) => {
      const hit = id && (p.dataset.from === id || p.dataset.to === id);
      p.classList.toggle('is-hit', !!hit);
      p.classList.toggle('is-dim', !!id && !hit);
    });
    if (!id) { detail.textContent = hint; return; }
    const n = byId[id];
    const title = n.querySelector('.ag-name').textContent;
    const others = [...related(id)].filter((x) => x !== id).map((x) => byId[x].querySelector('.ag-name').textContent);
    detail.replaceChildren();
    const h = document.createElement('strong'); h.textContent = title;
    const p = document.createElement('span'); p.textContent = n.dataset.detail;
    detail.append(h, p);
    if (others.length) {
      const c = document.createElement('em'); c.textContent = 'Connected to: ' + others.join(', ');
      detail.append(c);
    }
  }

  nodes.forEach((n) => {
    n.addEventListener('mouseenter', () => { hovered = n.id; paint(); });
    n.addEventListener('mouseleave', () => { hovered = null; paint(); });
    n.addEventListener('focus', () => { hovered = n.id; paint(); });
    n.addEventListener('blur', () => { hovered = null; paint(); });
    n.addEventListener('click', () => { pinned = pinned === n.id ? null : n.id; paint(); });
  });

  // Links must be redrawn whenever the layout changes: window opening, resizing, maximising, rotating a phone.
  new ResizeObserver(draw).observe(graph);
  draw();
})();
