# ICON — Noemane El Afia (portfolio)

An interactive portfolio built as a working desktop (windows, dock, widgets, gravity mode, Trash).
Now a **Next.js** project.

## Run it
```
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Structure
```
app/
  layout.jsx            page shell: <head>, server-rendered markup, analytics
  [[...slug]]/page.jsx  makes /, /work, /about, /photos ... resolve (the app handles the URL itself)
  globals.css           imports the files in styles/, in cascade order
  styles/               one CSS file per area (base, desktop, dock, windows, mobile, trash ...), apps/ for app windows
components/
  PlainView.jsx         text version of the site (SEO / no-JS), hidden once the desktop loads
  LegacyApp.jsx         loads the interactive scripts in order
content/
  desktop.html          desktop markup (menu bar, icons, dock, windows) — rendered on the server
public/
  assets/ icons/        images, audio, PDFs, icon set
  js/
    core/               constants, sound, router, window manager / drag / resize, triggers
    data/               virtual filesystem (icons, projects, photos)
    desktop/            menu bar, dock magnify, boot sequence
    widgets/            clock-side widgets: coffee, quote, music, carousel
    apps/               finder, photos, spotlight, maps, notes, mail
    effects/            gravity (+ toggle), liquid background
    features/           trash
    boot.js             starts everything (load order lives in components/LegacyApp.jsx)
```

The interactive layer (`public/js/*`) is still plain browser JavaScript; the Next.js shell hosts it
unchanged, so behaviour is identical to the previous static site. Next steps are converting
pieces (windows, widgets, mail, Trash) into React components one at a time.

Deployed on Vercel (`vercel.json` pins the Next.js framework).
