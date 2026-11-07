import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import { configureStore } from '@reduxjs/toolkit';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://ui.example.test/' });
const saved = new Map();
for (const [key, value] of Object.entries({
    window: dom.window, document: dom.window.document, navigator: dom.window.navigator,
    localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage,
    HTMLElement: dom.window.HTMLElement, HTMLInputElement: dom.window.HTMLInputElement,
    IS_REACT_ACT_ENVIRONMENT: true,
})) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
}

const { default: React, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { Provider } = await import('react-redux');
const { createMemoryRouter, RouterProvider, useParams } = await import('react-router-dom');
const element = React.createElement;
const queryDriver = '__sonarUiRegressionQuery';
let server, api, reducers, ConfirmEmail, Collection, Library, AccountSettings, ItemCard, NotificationProvider, useNotificationStore;

before(async () => {
    server = await createServer({
        mode: 'test',
        server: { middlewareMode: true, hmr: false, ws: false, watch: null },
        plugins: [{
            name: 'ui-regression-transport', enforce: 'pre',
            resolveId(source, importer) {
                const normalized = source.replaceAll('\\', '/');
                if (/\/rtkBaseQuery(?:\.ts)?$/.test(normalized)) return '\0ui-regression-query';
                if (normalized.endsWith('/lib/auth') && importer?.endsWith('/Collection.tsx')) return '\0ui-regression-user';
                if (/\/auth\/useCurrentUserId(?:\.ts)?$/.test(normalized) && importer?.endsWith('/AccountSettings.tsx')) return '\0ui-regression-user';
            },
            load(id) {
                if (id === '\0ui-regression-query') return 'export const rtkBaseQuery = args => globalThis.' + queryDriver + '(args);';
                if (id === '\0ui-regression-user') return 'export const useCurrentUserId = () => 1;';
            },
        }],
    });
    api = (await server.ssrLoadModule('/src/shared/api/rtkApi.ts')).rtkApi;
    ({ ConfirmEmail } = await server.ssrLoadModule('/src/pages/ConfirmEmail/ui/ConfirmEmail.tsx'));
    ({ Collection } = await server.ssrLoadModule('/src/pages/Collection/ui/Collection.tsx'));
    ({ Library } = await server.ssrLoadModule('/src/pages/Library/ui/Library.tsx'));
    ({ AccountSettings } = await server.ssrLoadModule('/src/pages/Settings/ui/AccountSettings.tsx'));
    ({ ItemCard } = await server.ssrLoadModule('/src/shared/ui/ItemCard/ItemCard.tsx'));
    ({ NotificationProvider, useNotificationStore } = await server.ssrLoadModule('/src/shared/store/notificationStore.tsx'));
    reducers = {
        [api.reducerPath]: api.reducer,
        auth: (await server.ssrLoadModule('/src/shared/store/features/auth/authSlice.ts')).default,
        player: (await server.ssrLoadModule('/src/shared/store/features/player/playerSlice.ts')).default,
        library: (await server.ssrLoadModule('/src/shared/store/features/library/librarySlice.ts')).default,
    };
});

after(async () => {
    await server?.close();
    delete globalThis[queryDriver];
    dom.window.close();
    for (const [key, descriptor] of saved) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
    }
});

const flush = async action => {
    await act(async () => {
        await action?.();
        await new Promise(resolve => setTimeout(resolve, 0));
    });
};

const defer = request => new Promise(resolve => {
    request.finish = result => {
        request.finish = undefined;
        resolve(result);
    };
});
const failed = { error: { status: 400, data: { message: 'Test request rejected' } } };
const accepted = { data: null };

async function mount(t, routes, initialPath, respond, { strict = false } = {}) {
    const requests = [];
    const unexpected = [];
    globalThis[queryDriver] = args => {
        const request = { args };
        requests.push(request);
        const result = respond(args, request);
        if (result !== undefined) return result;
        unexpected.push(args);
        return failed;
    };

    const store = configureStore({
        reducer: reducers,
        middleware: getDefault => getDefault().concat(api.middleware),
        enhancers: getDefault => getDefault({ autoBatch: false }),
    });
    const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
    const host = dom.window.document.createElement('div');
    dom.window.document.body.append(host);
    const root = createRoot(host);
    function Notifications() {
        const { notifications } = useNotificationStore();
        return element('output', { 'data-ui-notices': true }, notifications.map(item => item.message).join(' '));
    }
    const view = element(Provider, { store }, element(NotificationProvider, null, [
        element(RouterProvider, { key: 'router', router }),
        element(Notifications, { key: 'notices' }),
    ]));
    t.after(async () => {
        await flush(() => {
            root.unmount();
            for (const request of requests) request.finish?.(failed);
            store.dispatch(api.util.resetApiState());
        });
        router.dispose();
        host.remove();
        assert.deepEqual(unexpected, [], 'Unexpected fixture requests');
    });
    await flush(() => root.render(strict ? element(React.StrictMode, null, view) : view));

    const control = name => [...host.querySelectorAll('button, [role="button"]')]
        .find(el => (el.getAttribute('aria-label') || el.textContent.trim()) === name);
    return {
        requests, router, host, control,
        location: () => router.state.location.pathname + router.state.location.search,
        navigate: path => flush(() => router.navigate(path)),
        click: async name => {
            const target = control(name);
            assert(target && !target.disabled, 'Expected enabled control: ' + name);
            await flush(() => target.click());
        },
        finish: async (request, result) => {
            assert(request?.finish, 'Expected a pending request');
            await flush(() => request.finish(result));
        },
        status: () => host.querySelector('[role="alert"], [role="status"]')?.textContent,
        title: () => host.querySelector('h1')?.textContent,
        dialog: () => host.querySelector('[role="dialog"]'),
        notices: () => host.querySelector('[data-ui-notices]').textContent,
    };
}

const confirmRoutes = () => ['confirm-email', 'confirm-email-change']
    .map(path => ({ path: '/' + path, element: element(ConfirmEmail) }));
const confirmation = (token, path = 'confirm-email') =>
    '/' + path + '?email=fixture%40example.test&token=' + token;
const confirmationResponse = (args, request) => args.url.startsWith('Auth/confirm-email') ? defer(request) : undefined;

test('UI-01: incomplete links, same-link rerenders and operation changes use the correct attempt', async t => {
    const ui = await mount(t, confirmRoutes(), '/confirm-email', confirmationResponse, { strict: true });
    assert.match(ui.status(), /incomplete/);
    assert.equal(ui.requests.length, 0);

    await ui.navigate(confirmation('A'));
    assert.equal(ui.requests.length, 1);
    assert.equal(ui.status(), 'Confirming…');
    assert.deepEqual(ui.requests[0].args.params, { email: 'fixture@example.test', token: 'A' });
    await ui.finish(ui.requests[0], accepted);
    assert.equal(ui.status(), 'Email confirmed.');

    await ui.navigate(confirmation('A') + '&source=help&userId=9');
    assert.equal(ui.requests.length, 1);
    assert.equal(ui.status(), 'Email confirmed.');

    const change = confirmation('A', 'confirm-email-change');
    await ui.navigate(change + '&userId=1');
    assert.equal(ui.status(), 'Confirming…');
    assert.equal(ui.requests[1].args.url, 'Auth/confirm-email-change');
    assert.deepEqual(ui.requests[1].args.body, { email: 'fixture@example.test', token: 'A', userId: '1' });
    await ui.finish(ui.requests[1], failed);
    assert.match(ui.status(), /Unable to confirm/);

    await ui.navigate(change + '&userId=2');
    assert.equal(ui.status(), 'Confirming…');
    assert.equal(ui.requests.length, 3);
    assert.equal(String(ui.requests[2].args.body.userId), '2');
    await ui.finish(ui.requests[2], accepted);
    assert.equal(ui.status(), 'Email confirmed.');
});

for (const oldSucceeds of [true, false]) {
    test('UI-01: late ' + (oldSucceeds ? 'success' : 'error') + ' cannot change the current token result', async t => {
        const ui = await mount(t, confirmRoutes(), confirmation('A'), confirmationResponse);
        await ui.navigate(confirmation('B'));
        assert.equal(ui.requests.length, 2);
        assert.equal(ui.requests[1].args.params.token, 'B');
        assert.equal(ui.status(), 'Confirming…');
        await ui.finish(ui.requests[1], oldSucceeds ? failed : accepted);
        const current = ui.status();
        if (oldSucceeds) assert.match(current, /Unable to confirm/);
        else assert.equal(current, 'Email confirmed.');
        await ui.finish(ui.requests[0], oldSucceeds ? accepted : failed);
        assert.equal(ui.status(), current);
    });
}

const collections = {
    'Playlist/202': { id: 202, name: 'Owned A', creatorId: 1, coverId: 0 },
    'Playlist/203': { id: 203, name: 'Owned B', creatorId: 1, coverId: 0 },
    'Playlist/204': { id: 204, name: 'Guest playlist', creatorId: 2, coverId: 0 },
    'Album/202': { id: 202, name: 'Album with the same ID', coverId: 0 },
    'Album/101': { id: 101, name: 'First Light', coverId: 0 },
};

const track = (id, title) => ({ id, title, artists: [], coverId: 0, duration: 90 });
const collectionResponse = (args, request) => {
    if (args.method === 'PUT' || args.method === 'DELETE') return defer(request);
    if (collections[args.url]) return { data: collections[args.url] };
    if (args.url.endsWith('/tracks')) {
        const tracks = args.url === 'Playlist/202/tracks' ? [track(1, 'Song in A')]
            : args.url === 'Playlist/203/tracks' ? [track(2, 'Song in B')] : [];
        return { data: args.url.startsWith('Playlist/') ? { items: tracks, totalCount: tracks.length } : tracks };
    }
    if (args.url === 'Folder') return { data: [] };
};

function CollectionRoute() {
    const { kind } = useParams();
    return element(Collection, { type: kind });
}
const collectionRoutes = () => [
    { path: '/:kind/:id', element: element(CollectionRoute) },
    { path: '/library', element: element('h1', null, 'Library destination') },
];

const writes = ui => ui.requests.filter(({ args }) => args.method === 'PUT' || args.method === 'DELETE');

test('UI-02: A editor and tracks disappear while B loads, and a fresh editor targets B', async t => {
    let delayB = true;
    const ui = await mount(t, collectionRoutes(), '/playlist/202', (args, request) =>
        delayB && args.method === 'GET' && args.url.startsWith('Playlist/203') ? defer(request) : collectionResponse(args, request));
    await ui.click('edit');
    assert.equal(ui.dialog().querySelector('input').value, 'Owned A');
    await ui.click('Delete playlist');
    assert(ui.control('Confirm delete playlist'));

    await ui.navigate('/playlist/203');
    assert.equal(ui.dialog(), null);
    assert.equal(ui.control('edit'), undefined);
    assert.doesNotMatch(ui.host.textContent, /Owned A|Song in A/);
    assert.equal(writes(ui).length, 0);

    delayB = false;
    for (const request of ui.requests.filter(({ finish }) => finish)) {
        await ui.finish(request, collectionResponse(request.args, request));
    }
    assert.equal(ui.title(), 'Owned B');
    assert(ui.control('Play Song in B'));
    await ui.click('edit');
    assert.equal(ui.dialog().querySelector('input').value, 'Owned B');
    assert.equal(ui.control('Confirm delete playlist'), undefined);
    await ui.click('Save playlist');
    assert.deepEqual(writes(ui).map(({ args }) => [args.method, args.url, args.params.newName]),
        [['PUT', 'Playlist/203/update-name', 'Owned B']]);
    await ui.finish(writes(ui)[0], { data: collections['Playlist/203'] });
    assert.equal(ui.dialog(), null);
});

test('UI-02: type changes discard dialogs, and a guest playlist never inherits owner actions', async t => {
    const ui = await mount(t, collectionRoutes(), '/playlist/202', collectionResponse);
    await ui.click('edit');
    await ui.navigate('/album/202');
    assert.equal(ui.title(), 'Album with the same ID');
    assert.equal(ui.dialog(), null);
    assert.equal(ui.control('edit'), undefined);

    await ui.click('Collection actions');
    assert(ui.dialog());
    await ui.navigate('/playlist/204');
    assert.equal(ui.title(), 'Guest playlist');
    assert.equal(ui.dialog(), null);
    assert.equal(ui.control('edit'), undefined);
    assert.equal(writes(ui).length, 0);

    await ui.navigate('/playlist/203');
    await ui.click('edit');
    await ui.click('Delete playlist');
    await ui.click('Confirm delete playlist');
    assert.deepEqual(writes(ui).map(({ args }) => [args.method, args.url]), [['DELETE', 'Playlist/203']]);
    await ui.finish(writes(ui)[0], accepted);
    assert.equal(ui.location(), '/library');
});

for (const [operation, outcome] of [['rename', failed], ['delete', accepted]]) {
    test('UI-02: in-flight ' + operation + ' keeps its target and leaves the next editor alone', async t => {
        const ui = await mount(t, collectionRoutes(), '/playlist/202', collectionResponse);
        await ui.click('edit');
        if (operation === 'rename') await ui.click('Save playlist');
        else {
            await ui.click('Delete playlist');
            await ui.click('Confirm delete playlist');
        }
        const target = operation === 'rename' ? 'Playlist/202/update-name' : 'Playlist/202';
        assert.deepEqual(writes(ui).map(({ args }) => args.url), [target]);
        assert(ui.control('Save playlist').disabled);
        await ui.navigate('/playlist/203');
        await ui.click('edit');
        await ui.finish(writes(ui)[0], outcome);
        assert.equal(ui.location(), '/playlist/203');
        assert.equal(ui.dialog().querySelector('input').value, 'Owned B');
        assert.equal(ui.notices(), '');
        assert.equal(writes(ui).length, 1);
    });
}

test('UI-03: the avatar control opens the image input without submitting the account form', async t => {
    const user = { id: 1, userName: 'Test User', publicIdentifier: 'fixture', avatarImageId: 0 };
    const ui = await mount(t, [{ path: '/settings/account', element: element(AccountSettings) }], '/settings/account', args => {
        if (args.url === 'User') return { data: [user] };
        if (['User/1', 'User/1/profile'].includes(args.url)) return { data: user };
    });
    const input = ui.host.querySelector('input[type="file"]');
    let picker = 0;
    let submitted = 0;
    input.addEventListener('click', () => { picker++; });
    input.form.addEventListener('submit', event => { event.preventDefault(); submitted++; });
    assert.equal(ui.control('Choose Avatar').type, 'button');
    assert.equal(input.accept, 'image/*');
    await ui.click('Choose Avatar');
    assert.equal(picker, 1);
    assert.equal(submitted, 0);
});

test('UI-04: cards have the same accessible name during loading and after image failure', async t => {
    let played = 0;
    const ui = await mount(t, [
        { path: '/', element: element('main', null, [
            element(ItemCard, { key: 'missing', textContent: { title: 'Open the album' }, to: '/album/101' }),
            element(ItemCard, { key: 'loading', textContent: { title: 'Play the track' },
                image: 'https://ui.example.test/fixture.svg', onClick: () => { played++; } }),
        ]) },
        { path: '/album/101', element: element('h1', null, 'Album destination') },
    ], '/', () => undefined);
    const missing = ui.control('Open the album');
    const loading = ui.control('Play the track');
    assert(missing && loading);
    assert.equal(missing.querySelector('img'), null);
    const image = loading.querySelector('img');
    assert(image && !image.complete);
    await flush(() => image.dispatchEvent(new dom.window.Event('error')));
    assert.equal(loading.querySelector('img'), null);
    assert.equal(ui.control('Play the track'), loading);

    for (const key of [' ', 'Enter']) {
        await flush(() => loading.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })));
    }
    assert.equal(played, 2);
    await flush(() => missing.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })));
    assert.equal(ui.location(), '/album/101');
});

const summary = (id, name) => ({ id, name, subFolderCount: 0, collectionCount: 1, isProtected: false });
const folderFixtures = [
    { id: 1, name: 'Root', subFolders: [summary(2, 'For later')], collections: [] },
    { id: 2, name: 'For later', parentFolderId: 1, subFolders: [summary(3, 'Nested')],
        collections: [{ id: 101, name: 'First Light', type: 'Album', coverId: 0 }] },
    { id: 3, name: 'Nested', parentFolderId: 2, subFolders: [],
        collections: [{ id: 202, name: 'Owned A', type: 'Playlist', coverId: 0 }] },
];

const libraryRoutes = () => [
    { path: '/library', element: element(Library) },
    { path: '/:kind/:id', element: element(CollectionRoute) },
];
const libraryResponse = (args, request) => {
    if (args.url === 'Folder') return { data: folderFixtures };
    if (args.url.startsWith('Folder/')) return { data: folderFixtures.find(item => args.url === 'Folder/' + item.id) };
    return collectionResponse(args, request);
};

test('UI-05: nested folders and collection return restore the correct history entry', async t => {
    const ui = await mount(t, libraryRoutes(), '/library?source=fixture', libraryResponse);
    await ui.click('For later');
    assert.equal(ui.location(), '/library?source=fixture&folder=2');
    await ui.click('Nested');
    assert.equal(ui.location(), '/library?source=fixture&folder=3');
    assert(ui.control('Owned A'));

    await ui.navigate(-1);
    assert(ui.control('First Light'));
    await ui.navigate(1);
    assert(ui.control('Owned A'));
    await ui.click('Back to parent folder');
    assert.equal(ui.location(), '/library?source=fixture&folder=2');
    await ui.click('First Light');
    assert.equal(ui.title(), 'First Light');
    await ui.click('Back');
    assert.equal(ui.location(), '/library?source=fixture&folder=2');
    assert(ui.control('Back to parent folder'));
    assert(ui.control('First Light'));
    await ui.navigate(1);
    assert.equal(ui.location(), '/album/101');
});

test('UI-05: a fresh library deep link restores the folder and a parent action returns to root', async t => {
    const ui = await mount(t, libraryRoutes(), '/library?folder=2', libraryResponse);
    assert(ui.control('First Light'));
    await ui.click('Back to parent folder');
    assert.equal(ui.location(), '/library');
    assert(ui.control('For later'));
    assert.equal(ui.control('Back to parent folder'), undefined);
});
