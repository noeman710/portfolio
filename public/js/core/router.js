/* Router
   Gives each window a real URL so the mobile back / swipe-back gesture closes it. */

const ROUTE_APP_IDS = ['work', 'about', 'photos', 'notes', 'mail', 'maps'];
const ROUTE_CASE_IDS = Object.keys(filesystem).filter((k) => filesystem[k].kind === 'case-study');

let routeState = { app: null, folder: null, case: null };
let routerBooted = false;

const emptyRoute = () => ({ app: null, folder: null, case: null });

// /work, /work/<folder>, /work/<folder>/<case>, /work/<case>, /about ...
function routePathFor(state) {
  if (!state || !state.app) return '/';
  return '/' + [state.app, state.folder, state.case].filter(Boolean).join('/');
}

function parseRoutePath(pathname) {
  const parts = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (parts.length === 0) return emptyRoute();
  const [first, second, third] = parts;
  if (first === 'work' && second) {
    const entry = filesystem[second];
    if (entry && entry.kind === 'folder') {
      const c = third && ROUTE_CASE_IDS.includes(third) && filesystem[third].parent === second ? third : null;
      return { app: 'work', folder: second, case: c };
    }
    if (ROUTE_CASE_IDS.includes(second)) {
      const parent = filesystem[second].parent;
      return { app: 'work', folder: parent !== 'work' ? parent : null, case: second };
    }
  }
  if (ROUTE_APP_IDS.includes(first)) return { app: first, folder: null, case: null };
  return emptyRoute();
}

function applyRouteState(newState) {
  newState = { app: newState.app || null, folder: newState.folder || null, case: newState.case || null };
  const old = routeState;
  if (old.case && old.case !== newState.case) {
    WM.close('case-viewer', true);
  }
  if (old.app && old.app !== newState.app) {
    WM.close(old.app, true);
  }
  if (newState.app && newState.app !== old.app) {
    WM.open(newState.app, null, true);
  }
  if (newState.app === 'work' && (newState.folder !== old.folder || newState.app !== old.app)) {
    openFinderFolder(newState.folder || 'work', true);
  }
  if (newState.case && newState.case !== old.case) {
    WM.openCaseStudy(newState.case, true);
  }
  routeState = newState;
}

function routeNavigate(appId, caseId, folderId) {
  const newState = { app: appId || null, folder: folderId || null, case: caseId || null };
  const path = routePathFor(newState);
  if (routePathFor(routeState) === path) { routeState = newState; return; }
  history.pushState(newState, '', path);
  routeState = newState;
}

function initRouter() {
  const initial = parseRoutePath(window.location.pathname);
  history.replaceState(emptyRoute(), '', '/');
  routerBooted = true;
  if (initial.app) {
    const path = routePathFor(initial);
    history.pushState(initial, '', path);
    applyRouteState(initial);
  }

  window.addEventListener('popstate', (e) => {
    applyRouteState(e.state || emptyRoute());
  });
}
