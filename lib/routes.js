// Server-side list of valid URLs, read from the same filesystem data the desktop uses,
// so an unknown address returns a real 404 instead of an empty desktop.
import fs from 'node:fs';
import path from 'node:path';

export const APPS = ['work', 'about', 'photos', 'notes', 'mail', 'maps', 'trash'];

function readEntries() {
  const src = fs.readFileSync(path.join(process.cwd(), 'public/js/data/filesystem.js'), 'utf8');
  const re = /^ {2}'([\w-]+)': \{\s*\n\s+type: '\w+', kind: '([\w-]+)', title: '[^']*'(?:, parent: '([\w-]+)')?/gm;
  const entries = {};
  let m;
  while ((m = re.exec(src))) entries[m[1]] = { kind: m[2], parent: m[3] || null };
  return entries;
}

export function isValidSlug(slug = []) {
  if (slug.length === 0) return true;
  const [app, second, third] = slug;
  if (!APPS.includes(app)) return false;
  if (slug.length === 1) return true;
  if (app !== 'work' || slug.length > 3) return false;
  const entries = readEntries();
  const a = entries[second];
  if (!a) return false;
  if (slug.length === 2) return a.kind === 'folder' || a.kind === 'case-study';
  const b = entries[third];
  return a.kind === 'folder' && !!b && b.kind === 'case-study' && b.parent === second;
}

// Every valid URL, as slug arrays (used by the sitemap and by static generation).
export function allSlugs() {
  const entries = readEntries();
  const out = [[]];
  APPS.forEach((a) => { if (a !== 'trash') out.push([a]); });
  Object.entries(entries).forEach(([id, e]) => {
    const top = !e.parent || e.parent === 'work';
    if ((e.kind === 'folder' || e.kind === 'case-study') && top) out.push(['work', id]);
    else if (e.kind === 'case-study' && entries[e.parent]?.kind === 'folder') out.push(['work', e.parent, id]);
  });
  return out;
}

export const APP_TITLES = { work: 'Work', about: 'About Me', photos: 'Photos', notes: 'Notes', mail: 'Contact', maps: 'Maps', trash: 'Trash' };
