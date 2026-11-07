import assert from 'node:assert/strict';
import { after, afterEach, before, test } from 'node:test';

import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://sonar.example.test/login' });
const saved = new Map();
for (const [key, value] of Object.entries({
  window: dom.window, document: dom.window.document, navigator: dom.window.navigator,
  localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage,
  HTMLElement: dom.window.HTMLElement, HTMLInputElement: dom.window.HTMLInputElement, IS_REACT_ACT_ENVIRONMENT: true,
})) {
  saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
  Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
}

const { default: React, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { Provider } = await import('react-redux');
const { MemoryRouter, Route, Routes } = await import('react-router-dom');

const requests = [];
const originalFetch = globalThis.fetch;
let server, store, auth, authApi, authManager, apiClient, rtkBaseQuery, Login;
let useInfiniteSearchTracks, useCatalogSearch, addSearchResults;
let NotificationProvider, useNotificationStore;

before(async () => {
  globalThis.fetch = (input, init = {}) => new Promise(resolve => {
    const url = new URL(input, 'https://sonar.example.test/');
    requests.push({ url, init, resolve });
  });
  server = await createServer({
    mode: 'test',
    server: { middlewareMode: true, hmr: false, watch: null, ws: false },
  });
  ({ store } = await server.ssrLoadModule('/src/shared/store/index.ts'));
  auth = await server.ssrLoadModule('/src/shared/store/features/auth/authSlice.ts');
  ({ authApi } = await server.ssrLoadModule('/src/features/auth/api/rtkApi.ts'));
  ({ authManager } = await server.ssrLoadModule('/src/shared/lib/auth/auth-manager.ts'));
  ({ apiClient } = await server.ssrLoadModule('/src/shared/api/oldBaseApi.ts'));
  ({ rtkBaseQuery } = await server.ssrLoadModule('/src/shared/api/rtkBaseQuery.ts'));
  ({ Login } = await server.ssrLoadModule('/src/pages/Login/ui/Login.tsx'));
  ({ NotificationProvider, useNotificationStore } = await server.ssrLoadModule('/src/shared/store/notificationStore.tsx'));
  ({ addSearchResults } = await server.ssrLoadModule('/src/shared/store/features/search/searchSlice.ts'));
  ({ useInfiniteSearchTracks } = await server.ssrLoadModule('/src/shared/store/features/search/useInfiniteSearchTracks.ts'));
  ({ useCatalogSearch } = await server.ssrLoadModule('/src/shared/store/features/search/useCatalogSearch.ts'));
});

afterEach(() => {
  store?.dispatch(auth.logout());
  requests.length = 0;
});

after(async () => {
  await server?.close();
  globalThis.fetch = originalFetch;
  dom.window.close();
  for (const [key, descriptor] of saved) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
});

const delay = () => new Promise(resolve => setTimeout(resolve, 0));
const flush = action => act(async () => { action?.(); await delay(); await delay(); });

async function take(endpoint) {
  const suffix = '/' + endpoint.toLowerCase();
  for (let i = 0; i < 20; i++) {
    const index = requests.findIndex(request => request.url.pathname.toLowerCase().endsWith(suffix));
    if (index !== -1) return requests.splice(index, 1)[0];
    await delay();
  }
  assert.fail('No request for ' + endpoint);
}

function reply(request, data, status = 200, message = 'OK') {
  request.resolve(Response.json({ success: status === 200, message, ...(data === undefined ? {} : { data }) }, { status }));
}

function credentials(sessionId) {
  const payload = Buffer.from(JSON.stringify({ sub: sessionId, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
  return { accessToken: 'e30.' + payload + '.fixture', refreshToken: 'refresh-' + sessionId, sessionId };
}

test('switching accounts resets local projections and drops in-flight results from the prior session', async () => {
  store.dispatch(auth.setCredentials(credentials(1)));
  store.dispatch({ type: 'library/setFoldersList', payload: [{ id: 1, name: 'A private library' }] });
  store.dispatch(addSearchResults({ query: 'A', users: [{ id: 1, userName: 'A' }] }));
  const sessions = authApi.endpoints.getSessions;
  const initial = store.dispatch(sessions.initiate(undefined, { subscribe: false }));
  reply(await take('Auth/sessions'), [{ id: 1 }]);
  await initial.unwrap();

  const stale = store.dispatch(sessions.initiate(undefined, { subscribe: false, forceRefetch: true }));
  const staleRequest = await take('Auth/sessions');
  store.dispatch(auth.setCredentials(credentials(2)));
  assert.equal(store.getState().library.foldersList, null);
  assert.equal(store.getState().library.isDirty, true);
  assert.deepEqual(store.getState().search.cache, []);
  assert.equal(sessions.select()(store.getState()).data, undefined);
  reply(staleRequest, [{ id: 99 }]);
  assert.equal(await stale.unwrap(), undefined);
  assert.equal(sessions.select()(store.getState()).data, undefined);

  const fresh = store.dispatch(sessions.initiate(undefined, { subscribe: false }));
  reply(await take('Auth/sessions'), [{ id: 2 }]);
  assert.deepEqual(await fresh.unwrap(), [{ id: 2 }]);
  await authManager.logout();
  assert.equal(sessions.select()(store.getState()).data, undefined);
  assert.equal(store.getState().auth.isAuthenticated, false);
});

test('late refresh cannot restore logout or overwrite a newer session refresh', async () => {
  store.dispatch(auth.setCredentials(credentials(1)));
  const first = authManager.refreshAccessToken();
  const firstRequest = await take('Auth/refresh-token');
  await authManager.logout();
  reply(firstRequest, { newAccessToken: 'obsolete', refreshToken: 'obsolete' });
  assert.equal(await first, null);
  assert.equal(store.getState().auth.accessToken, null);
  assert.equal(dom.window.localStorage.getItem('sonar_refresh_token'), null);

  store.dispatch(auth.setCredentials(credentials(2)));
  const old = authManager.refreshAccessToken();
  const oldRequest = await take('Auth/refresh-token');
  store.dispatch(auth.setCredentials(credentials(3)));
  const current = authManager.refreshAccessToken();
  const currentRequest = await take('Auth/refresh-token');
  assert.equal(JSON.parse(currentRequest.init.body), 'refresh-3');
  reply(oldRequest, undefined, 400, 'Old session expired');
  assert.equal(await old, null);
  assert.equal(store.getState().auth.sessionId, 3);
  reply(currentRequest, { newAccessToken: credentials(4).accessToken, refreshToken: 'rotated-3' });
  assert.equal(await current, credentials(4).accessToken);
  assert.equal(store.getState().auth.sessionId, 3);
  assert.equal(store.getState().auth.refreshToken, 'rotated-3');
});

test('email change serializes a JSON string and adapters keep empty lists separate from payload-free success', async () => {
  store.dispatch(auth.setCredentials(credentials(1)));
  const email = 'changed@example.test';
  const mutation = store.dispatch(authApi.endpoints.requestEmailChange.initiate(email));
  const emailRequest = await take('Auth/request-email-change');
  assert.equal(new Headers(emailRequest.init.headers).get('content-type'), 'application/json');
  assert.equal(JSON.parse(emailRequest.init.body), email);
  reply(emailRequest);
  assert.equal(await mutation.unwrap(), undefined);
  mutation.reset();

  for (const data of ['empty list', undefined]) {
    const legacy = apiClient.get('fixture/legacy', { withAuth: false });
    reply(await take('fixture/legacy'), data);
    const normalized = await legacy;
    assert.equal(Object.hasOwn(normalized, 'data'), data !== undefined);
    if (data !== undefined) assert.deepEqual(normalized.data, []);

    const rtk = rtkBaseQuery({ url: 'fixture/rtk', withAuth: false }, { signal: new AbortController().signal }, {});
    reply(await take('fixture/rtk'), data);
    assert.deepEqual((await rtk).data, data === undefined ? null : []);
  }
});

test('search cache replaces first pages, merges later offsets, and removes a stale page on empty response', () => {
  const write = (tracks, offset = 0) => store.dispatch(addSearchResults({ query: 'mix', tracks, offset }));
  const tracks = () => store.getState().search.cache[0].tracks;
  write([{ id: 1, title: 'Old' }, { id: 2, title: 'Deleted' }]);
  write([{ id: 1, title: 'Renamed' }, { id: 3, title: 'Later page' }], 2);
  assert.deepEqual(tracks().map(track => track.title), ['Renamed', 'Deleted', 'Later page']);
  write([], 2);
  assert.deepEqual(tracks().map(track => track.id), [1, 2]);
  write([{ id: 1, title: 'Fresh' }]);
  assert.deepEqual(tracks().map(track => track.title), ['Fresh']);
  write([]);
  assert.deepEqual(tracks(), []);
});

async function mountSearch(hook, query) {
  const host = dom.window.document.createElement('div');
  dom.window.document.body.append(host);
  const root = createRoot(host);
  let state;
  function Probe(props) { state = hook(props.query); return null; }
  const render = async value => {
    await flush(() => root.render(React.createElement(React.StrictMode, null,
      React.createElement(Provider, { store }, React.createElement(Probe, { query: value })))));
    await flush();
  };
  await render(query);
  return { render, state: () => state, close: async () => { await flush(() => root.unmount()); host.remove(); } };
}

test('catalog search rejects an earlier generation even after returning to the same query', async () => {
  const view = await mountSearch(useCatalogSearch, 'A');
  try {
    const first = await take('Search');
    await view.render('B');
    const second = await take('Search');
    await view.render('A');
    const third = await take('Search');
    await flush(() => reply(third, { query: 'A', totalResults: 1, tracks: { total: 1, items: [{ id: 3, title: 'Fresh' }] } }));
    await flush(() => reply(first, { query: 'A', totalResults: 1, tracks: { total: 1, items: [{ id: 1, title: 'Stale' }] } }));
    await flush(() => reply(second, undefined, 400, 'Stale search error'));
    assert.equal(view.state().data.tracks.items[0].title, 'Fresh');
    assert.equal(view.state().error, undefined);
    assert.equal(view.state().isLoading, false);
  } finally { await view.close(); }
});

test('stale loadMore cannot append or change loading and pagination for the new track query', async () => {
  const view = await mountSearch(useInfiniteSearchTracks, 'A');
  try {
    const first = await take('Search/tracks');
    await flush(() => reply(first, { items: [{ id: 1 }], total: 2 }));
    await flush(() => view.state().loadMore());
    const page = await take('Search/tracks');
    assert.equal(page.url.searchParams.get('offset'), '1');

    await view.render('B');
    const fresh = await take('Search/tracks');
    await flush(() => reply(page, { items: [{ id: 2 }], total: 2 }));
    assert.equal(view.state().isLoading, true);
    assert.deepEqual(view.state().tracks, []);
    await flush(() => reply(fresh, { items: [{ id: 9 }], total: 1 }));
    assert.deepEqual(view.state().tracks, [{ id: 9 }]);
    assert.equal(view.state().hasMore, false);
    assert.equal(view.state().isLoadingMore, false);
  } finally { await view.close(); }
});

async function mountLogin() {
  const host = dom.window.document.createElement('div');
  dom.window.document.body.append(host);
  const root = createRoot(host);
  let notices;
  function Notices() { notices = useNotificationStore().notifications; return null; }
  const app = React.createElement(Provider, { store },
    React.createElement(NotificationProvider, null, React.createElement(Notices),
      React.createElement(MemoryRouter, { initialEntries: ['/login'] },
        React.createElement(Routes, null,
          React.createElement(Route, { path: '/login', element: React.createElement(Login) }),
          React.createElement(Route, { path: '/home', element: React.createElement('div', { id: 'home' }) }),
        ))));
  await flush(() => root.render(app));
  const click = text => [...host.querySelectorAll('button')].find(button => button.textContent.trim() === text).click();
  const setInput = (input, value) => {
    Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(input, value);
    input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  };
  const codeInputs = () => [...host.querySelectorAll('input[inputmode="numeric"]')];
  return {
    step: () => codeInputs().length > 0 ? 'verify' : host.querySelector('form') ? 'login' : undefined,
    submit: async (identifier = 'visitor') => {
      await flush(() => {
        setInput(host.querySelector('input[placeholder="example@sonar.com"]'), identifier);
        setInput(host.querySelector('input[type="password"]'), 'fixture-only');
      });
      await flush(() => host.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })));
    },
    verify: async code => {
      const inputs = codeInputs();
      for (const [index, digit] of [...code].entries()) await flush(() => setInput(inputs[index], digit));
      await flush(() => click('Sign in'));
    },
    back: () => flush(() => click('Back')),
    notices: () => notices,
    close: async () => { await flush(() => root.unmount()); host.remove(); },
  };
}

const challenge = (token = 'opaque-challenge', expiresAt = new Date(Date.now() + 300_000).toISOString()) => ({
  requiresTwoFactor: true, challengeToken: token, expiresAt,
});

test('fresh 2FA login sends no bearer, preserves wrong-code retry, and stores credentials only after verification', async () => {
  const ui = await mountLogin();
  try {
    await ui.submit();
    const login = await take('Auth/login');
    const device = new Headers(login.init.headers).get('x-device-name');
    assert.equal(login.url.searchParams.get('userIdentifier'), 'visitor');
    await flush(() => reply(login, challenge()));
    assert.equal(ui.step(), 'verify');
    assert.equal(store.getState().auth.sessionId, null);
    assert.equal(dom.window.localStorage.length, 0);
    assert.equal(dom.window.sessionStorage.length, 0);

    await ui.verify('12ab56');
    assert.equal(requests.length, 0);
    await ui.verify('111111');
    const wrong = await take('Auth/verify-2fa');
    assert.equal(new Headers(wrong.init.headers).has('authorization'), false);
    assert.equal(new Headers(wrong.init.headers).get('x-device-name'), device);
    assert.deepEqual(JSON.parse(wrong.init.body), { challengeToken: 'opaque-challenge', code: '111111' });
    await flush(() => reply(wrong, undefined, 400, 'Wrong code'));
    assert.equal(ui.step(), 'verify');
    assert.equal(store.getState().auth.sessionId, null);

    await ui.verify('222222');
    const correct = await take('Auth/verify-2fa');
    await flush(() => reply(correct, credentials(42)));
    assert.equal(store.getState().auth.sessionId, 42);
    assert.equal(dom.window.sessionStorage.getItem('sonar_session_id'), '42');
    assert.equal(ui.step(), undefined);
  } finally { await ui.close(); }
});

test('expired challenge stays on sign-in and a cancelled verify cannot replace a later login', async () => {
  const ui = await mountLogin();
  try {
    await ui.submit();
    const expired = await take('Auth/login');
    await flush(() => reply(expired, challenge('expired', new Date(Date.now() - 10_000).toISOString())));
    assert.equal(ui.step(), 'login');
    assert(ui.notices().some(n => /expired/.test(n.message)));

    await ui.submit();
    const fresh = await take('Auth/login');
    await flush(() => reply(fresh, challenge()));
    await ui.verify('123456');
    const obsolete = await take('Auth/verify-2fa');
    await ui.back();
    assert.equal(ui.step(), 'login');
    assert.equal(obsolete.init.signal.aborted, true);
    await ui.submit('second');
    const second = await take('Auth/login');
    await flush(() => reply(second, credentials(53)));
    await flush(() => reply(obsolete, credentials(31)));
    assert.equal(store.getState().auth.sessionId, 53);
    assert.equal(dom.window.localStorage.getItem('sonar_refresh_token'), 'refresh-53');
  } finally { await ui.close(); }
});
