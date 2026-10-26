import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import { configureStore } from '@reduxjs/toolkit';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://demo.example.test/' });
const saved = new Map();
for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document, navigator: dom.window.navigator, localStorage: dom.window.localStorage, HTMLElement: dom.window.HTMLElement, HTMLInputElement: dom.window.HTMLInputElement, IS_REACT_ACT_ENVIRONMENT: true })) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
}
const { default: React, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { Provider } = await import('react-redux');
const users = {
    demo: { id: 1, userName: 'Current user', publicIdentifier: 'demo' },
    alpha: { id: 2, userName: 'Member A', publicIdentifier: 'alpha' },
    beta: { id: 3, userName: 'Member B', publicIdentifier: 'beta' },
    existing: { id: 4, userName: 'Existing member', publicIdentifier: 'existing' },
};
const requests = [];
let server, api, CreateGroupChatModal, AddMembersModal;
const driverKey = '__sonarMemberSearchTest';

before(async () => {
    globalThis[driverKey] = async args => {
        const identifier = /^User\/profile\/(.+)$/.exec(args.url)?.[1];
        if (identifier) return new Promise(resolve => requests.push({ identifier, resolve }));
        if (args.url === 'Chat') return { data: [] };
        throw new Error(`Unexpected test request: ${args.url}`);
    };
    server = await createServer({
        mode: 'test',
        server: { middlewareMode: true, hmr: false, watch: null },
        plugins: [{
            name: 'member-dialog-test-transport', enforce: 'pre',
            resolveId(source, importer) {
                const normalized = source.replaceAll('\\', '/');
                if (normalized.endsWith('/rtkBaseQuery') || normalized.endsWith('/rtkBaseQuery.ts') || source === './rtkBaseQuery') return '\0member-test-query';
                if ((source === '@shared/lib/auth/useCurrentUserId' || /\/auth\/useCurrentUserId(?:\.ts)?$/.test(normalized)) && /(?:CreateGroupChatModal|AddMembersModal)\.tsx$/.test(importer ?? '')) return '\0member-test-user';
            },
            load(id) {
                if (id === '\0member-test-query') return `export const rtkBaseQuery = args => globalThis.${driverKey}(args);`;
                if (id === '\0member-test-user') return 'export const useCurrentUserId = () => 1;';
            },
        }],
    });
    // Initialize the shared API before UI barrels, matching application bootstrap order.
    api = (await server.ssrLoadModule('/src/shared/api/rtkApi.ts')).rtkApi;
    ({ CreateGroupChatModal } = await server.ssrLoadModule('/src/widgets/CreateGroupChatModal/ui/CreateGroupChatModal.tsx'));
    ({ AddMembersModal } = await server.ssrLoadModule('/src/widgets/AddMembersModal/ui/AddMembersModal.tsx'));
});

after(async () => {
    await server?.close();
    delete globalThis[driverKey];
    dom.window.close();
    for (const [key, descriptor] of saved) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
    }
});

const flush = async action => { await act(async () => { await action?.(); await new Promise(resolve => setTimeout(resolve, 0)); }); };

async function mount(kind) {
    requests.length = 0;
    const store = configureStore({ reducer: { [api.reducerPath]: api.reducer }, middleware: getDefault => getDefault().concat(api.middleware), enhancers: getDefault => getDefault({ autoBatch: false }) });
    const host = dom.window.document.createElement('div'); dom.window.document.body.append(host);
    const root = createRoot(host);
    const Component = kind === 'create' ? CreateGroupChatModal : AddMembersModal;
    const view = isOpen => React.createElement(Provider, { store }, React.createElement(Component, { isOpen, onClose: () => root.render(view(false)), chatId: 10, existingUserIds: [1, 4] }));
    const render = async isOpen => flush(() => root.render(view(isOpen)));
    await render(true);
    const input = () => host.querySelector('input[aria-label="Search by public identifier"]');
    const button = name => [...host.querySelectorAll('button')].find(el => (el.getAttribute('aria-label') || el.textContent.trim()) === name);
    const click = async name => { const target = button(name); assert(target, `Missing button: ${name}`); assert(!target.disabled, `Disabled button: ${name}`); await flush(() => target.click()); };
    const search = async identifier => {
        await flush(() => {
            Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(input(), identifier);
            input().dispatchEvent(new dom.window.Event('input', { bubbles: true }));
        });
        await click('Search members');
    };
    const complete = async (identifier, fail = false) => {
        const index = requests.findIndex(item => item.identifier === identifier);
        assert(index >= 0, `No pending request for ${identifier}`);
        const [request] = requests.splice(index, 1);
        await flush(() => request.resolve(fail || !users[identifier] ? { error: { status: 404, data: { message: 'Not found' } } } : { data: users[identifier] }));
    };
    const close = async () => { await flush(() => root.unmount()); store.dispatch(api.util.resetApiState()); host.remove(); };
    return { host, input, button, click, search, complete, render, close };
}

for (const kind of ['create', 'add']) {
    test(`${kind}: select A and B, remove A, close and reopen without stale results or false errors`, async () => {
        const ui = await mount(kind);
        try {
            for (const identifier of ['alpha', 'beta']) {
                await ui.search(identifier); await ui.complete(identifier); await ui.click('Add');
                assert.equal(ui.input().value, '');
                assert.equal(ui.button('Add'), undefined);
                assert.doesNotMatch(ui.host.textContent, /already (?:added|selected)/);
            }
            assert.match(ui.host.textContent, /Member A/); assert.match(ui.host.textContent, /Member B/);
            await ui.click('Remove Member A');
            assert.doesNotMatch(ui.host.textContent, /Member A/); assert.match(ui.host.textContent, /Member B/);
            await ui.click('Close'); assert.equal(ui.input(), null); await ui.render(true);
            assert.equal(ui.input().value, ''); assert.equal(ui.button('Add'), undefined);
            assert.doesNotMatch(ui.host.textContent, /Member [AB]|Selected members|User not found/);
        } finally { await ui.close(); }
    });

    for (const fail of [false, true]) test(`${kind}: late A ${fail ? 'error' : 'success'} cannot replace the current B result`, async () => {
        const ui = await mount(kind);
        try {
            await ui.search('alpha'); await ui.search('beta');
            assert.equal(ui.button('Add'), undefined);
            await ui.complete('beta'); assert.match(ui.host.textContent, /Member B/);
            await ui.complete('alpha', fail);
            assert.match(ui.host.textContent, /Member B/);
            assert.doesNotMatch(ui.host.textContent, /Member A|User not found/);
            assert(ui.button('Add'));
        } finally { await ui.close(); }
    });

    test(`${kind}: an old result stays hidden during a new search and after a late response across reopen`, async () => {
        const ui = await mount(kind);
        try {
            await ui.search('alpha'); await ui.complete('alpha');
            await ui.search('beta');
            assert.equal(ui.button('Add'), undefined); assert.doesNotMatch(ui.host.textContent, /Member A/);
            await ui.render(false); await ui.render(true); await ui.complete('beta');
            assert.equal(ui.button('Add'), undefined);
            assert.doesNotMatch(ui.host.textContent, /Member [AB]|User not found/);
        } finally { await ui.close(); }
    });

    test(`${kind}: self, selected and existing-member guards still apply and reset on close`, async () => {
        const ui = await mount(kind);
        try {
            await ui.search('demo'); await ui.complete('demo'); assert.match(ui.host.textContent, /You cannot add yourself/); assert.equal(ui.button('Add'), undefined);
            await ui.search('beta'); await ui.complete('beta'); await ui.click('Add');
            await ui.search('beta'); await ui.complete('beta'); assert.match(ui.host.textContent, /already (?:added|selected)/); assert.equal(ui.button('Add'), undefined);
            if (kind === 'add') { await ui.search('existing'); await ui.complete('existing'); assert.match(ui.host.textContent, /already a member/); assert.equal(ui.button('Add'), undefined); }
            await ui.search('missing'); await ui.complete('missing'); assert.match(ui.host.textContent, /User not found/);
            await ui.render(false); await ui.render(true);
            assert.doesNotMatch(ui.host.textContent, /already|User not found|Selected members/);
        } finally { await ui.close(); }
    });
}
