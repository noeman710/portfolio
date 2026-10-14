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
