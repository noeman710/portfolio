/* Router
   Gives each window a real URL so the mobile back / swipe-back gesture closes it. */

const ROUTE_APP_IDS = ['work', 'about', 'photos', 'notes', 'mail', 'maps'];
const ROUTE_CASE_IDS = Object.keys(filesystem).filter((k) => filesystem[k].kind === 'case-study');

let routeState = { app: null, case: null };
let routerBooted = false;

function routePathFor(state) {
  if (!state || !state.app) return '/';
  if (state.case) return '/' + state.app + '/' + state.case;
  return '/' + state.app;
}

function parseRoutePath(pathname) {
  const parts = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (parts.length === 0) return { app: null, case: null };
  const [first, second] = parts;
  if (first === 'work' && second && ROUTE_CASE_IDS.includes(second)) {
    return { app: 'work', case: second };
  }
  if (ROUTE_APP_IDS.includes(first)) {
    return { app: first, case: null };
  }
  return { app: null, case: null };
}

function applyRouteState(newState) {
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
  if (newState.case && newState.case !== old.case) {
    WM.openCaseStudy(newState.case, true);
  }
  routeState = newState;
}

function routeNavigate(appId, caseId) {
  const newState = { app: appId || null, case: caseId || null };
  const path = routePathFor(newState);
  if (routePathFor(routeState) === path) { routeState = newState; return; }
  history.pushState(newState, '', path);
  routeState = newState;
}

function initRouter() {
  const initial = parseRoutePath(window.location.pathname);
  history.replaceState({ app: null, case: null }, '', '/');
  routerBooted = true;
  if (initial.app) {
    const path = routePathFor(initial);
    history.pushState(initial, '', path);
    applyRouteState(initial);
  }

  window.addEventListener('popstate', (e) => {
    const state = e.state || { app: null, case: null };
    applyRouteState(state);
  });
}
