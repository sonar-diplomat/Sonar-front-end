import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { configureStore } from '@reduxjs/toolkit';
import react from '@vitejs/plugin-react';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

import audioReducer, { play, playNext, setQueue } from '../src/shared/store/features/player/playerSlice.ts';

const audioDom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://audio.example.test/' });
const audioSavedGlobals = new Map();
for (const [key, value] of Object.entries({
    window: audioDom.window,
    document: audioDom.window.document,
    navigator: audioDom.window.navigator,
    localStorage: audioDom.window.localStorage,
    HTMLElement: audioDom.window.HTMLElement,
    DOMException: audioDom.window.DOMException,
    IS_REACT_ACT_ENVIRONMENT: true,
})) {
    audioSavedGlobals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
}
const { default: React, act: audioAct } = await import('react');
const { createRoot: audioCreateRoot } = await import('react-dom/client');
const audioDriverKey = '__sonarAudioRegression';
const audioMediaState = new WeakMap();
const audioCreatedUrls = [];
const audioRevokedUrls = [];
const audioOriginalCreateUrl = URL.createObjectURL;
const audioOriginalRevokeUrl = URL.revokeObjectURL;
let audioServer, AudioPlayerController, DemoPlayerSync, audioFixture;

function audioMedia(element) {
    if (!audioMediaState.has(element)) {
        audioMediaState.set(element, {
            paused: true, ended: false, readyState: 0, duration: NaN, currentTime: 0, error: null, playCalls: 0,
        });
    }
    return audioMediaState.get(element);
}

before(async () => {
    // jsdom has no decoder: control the media boundary, while mounting production components and reducer.
    for (const key of ['paused', 'ended', 'readyState', 'duration', 'currentTime', 'error']) {
        Object.defineProperty(audioDom.window.HTMLMediaElement.prototype, key, {
            configurable: true,
            get() { return audioMedia(this)[key]; },
            set(value) { audioMedia(this)[key] = value; },
        });
    }
    audioDom.window.HTMLMediaElement.prototype.pause = function () { audioMedia(this).paused = true; };
    audioDom.window.HTMLMediaElement.prototype.load = function () { Object.assign(audioMedia(this), { error: null, readyState: 0, ended: false }); };
    audioDom.window.HTMLMediaElement.prototype.play = function () {
        const media = audioMedia(this);
        media.playCalls++;
        media.paused = false;
        return Promise.resolve();
    };
    URL.createObjectURL = blob => { const url = audioOriginalCreateUrl(blob); audioCreatedUrls.push({ url, blob }); return url; };
    URL.revokeObjectURL = url => { audioRevokedUrls.push(url); audioOriginalRevokeUrl(url); };
    globalThis[audioDriverKey] = {
        store: {
            getState: () => audioFixture.store.getState(),
            dispatch: action => audioFixture.store.dispatch(action),
            subscribe: listener => audioFixture.store.subscribe(listener),
        },
        stream: (id, _options, config) => new Promise((resolve, reject) => {
            audioFixture.requests.push({ id, signal: config.signal, resolve, reject });
        }),
        get: id => audioFixture.get(id),
    };
    audioServer = await createServer({
        configFile: false,
        cacheDir: 'node_modules/.vite-audio-regressions',
        optimizeDeps: { noDiscovery: true, entries: [] },
        server: { middlewareMode: true, hmr: false, ws: false, watch: null },
        plugins: [react(), {
            name: 'audio-regression-boundaries', enforce: 'pre',
            resolveId(source) {
                const boundaries = {
                    '@shared/store': 'store',
                    '@entities/Music/api/api': 'stream',
                    '@shared/config/data-source': 'mode',
                    '@shared/demo/media': 'media',
                    '@shared/store/hooks': 'hooks',
                    '@shared/api/oldBaseApi': 'api',
                    '@shared/config': 'config',
                    '@shared/store/notificationStore': 'notifications',
                };
                if (boundaries[source]) return `\0audio-test-${boundaries[source]}`;
                if (source === '@shared/store/features/player/playerSlice') return fileURLToPath(new URL('../src/shared/store/features/player/playerSlice.ts', import.meta.url));
            },
            load(id) {
                if (id === '\0audio-test-store') return `export const store = globalThis.${audioDriverKey}.store;`;
                if (id === '\0audio-test-stream') return `export const Api = { stream: (...args) => globalThis.${audioDriverKey}.stream(...args) };`;
                if (id === '\0audio-test-mode') return 'export const isDemoMode = false;';
                if (id === '\0audio-test-media') return 'export const resolveDemoAudioUrl = () => undefined;';
                if (id === '\0audio-test-hooks') return `export const useAppDispatch = () => globalThis.${audioDriverKey}.store.dispatch;`;
                if (id === '\0audio-test-api') return `export const apiClient = { get: id => globalThis.${audioDriverKey}.get(id) };`;
                if (id === '\0audio-test-config') return 'export const API_ENDPOINTS = { track: { byId: id => id } };';
                if (id === '\0audio-test-notifications') return 'const showError = () => {}; export const useNotifications = () => ({ showError });';
            },
        }],
    });
    ({ AudioPlayerController } = await audioServer.ssrLoadModule('/src/shared/lib/audio/AudioPlayerController.tsx'));
    ({ DemoPlayerSync } = await audioServer.ssrLoadModule('/src/shared/lib/audio/DemoPlayerSync.tsx'));
});

after(async () => {
    await audioServer?.close();
    delete globalThis[audioDriverKey];
    URL.createObjectURL = audioOriginalCreateUrl;
    URL.revokeObjectURL = audioOriginalRevokeUrl;
    audioDom.window.close();
    for (const [key, descriptor] of audioSavedGlobals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
    }
});

const audioFlush = async action => audioAct(async () => { await action?.(); await new Promise(resolve => setTimeout(resolve, 0)); });
const audioTrack = id => ({
    id, title: `Song ${id}`, duration: null, isExplicit: false, drivingDisturbingNoises: false,
    visibilityStateId: 1, coverId: 101, lowQualityAudioFileId: id, mediumQualityAudioFileId: null,
    highQualityAudioFileId: null, genre: { id: 1, name: 'Test' },
});

async function audioMount(Component, { saved, unavailable = [] } = {}) {
    audioDom.window.localStorage.clear();
    audioCreatedUrls.length = 0;
    audioRevokedUrls.length = 0;
    const fixture = {
        store: configureStore({ reducer: { player: audioReducer }, enhancers: getDefault => getDefault({ autoBatch: false }) }),
        requests: [], gets: [],
        get: async id => {
            fixture.gets.push(id);
            return unavailable.includes(id) ? { success: false } : { success: true, data: audioTrack(id) };
        },
    };
    audioFixture = fixture;
    if (saved) {
        audioDom.window.localStorage.setItem('sonar-demo:player:v1', JSON.stringify({
            schemaVersion: 1, seedVersion: 1,
            state: { ...saved, volume: 1, muted: false, repeat: 'off', context: null },
        }));
    }
    const host = audioDom.window.document.createElement('div');
    audioDom.window.document.body.append(host);
    const root = audioCreateRoot(host);
    await audioFlush(() => root.render(React.createElement(Component)));
    let mounted = true;
    return {
        ...fixture, audio: host.querySelector('audio'),
        dispatch: action => audioFlush(() => fixture.store.dispatch(action)),
        close: async () => {
            if (!mounted) return;
            mounted = false;
            await audioFlush(() => root.unmount());
            host.remove();
        },
    };
}

async function audioStartFailedRequest(ui, failure = 'network') {
    await ui.dispatch(setQueue({ tracks: [audioTrack(1), audioTrack(2)] }));
    assert.equal(ui.requests.length, 1);
    await audioFlush(() => {
        if (failure === 'network') ui.requests[0].reject(new Error('Temporary stream outage'));
        else if (failure === 'http') ui.requests[0].resolve(new Response('Unavailable', { status: 503 }));
        else ui.requests[0].resolve({ ok: true, blob: async () => { throw new Error('Interrupted response body'); } });
    });
    assert.equal(ui.store.getState().player.isPlaying, false);
    assert.equal(ui.store.getState().player.playbackStatus, 'error');
    assert.equal(ui.audio.getAttribute('src'), null);
}

for (const failure of ['network', 'http', 'body']) test(`audio: Play retries the same source after a ${failure} preparation failure`, async () => {
    const ui = await audioMount(AudioPlayerController);
    try {
        await audioStartFailedRequest(ui, failure);
        await ui.dispatch(play());
        assert.equal(ui.requests.length, 2);
        assert.equal(ui.requests[1].id, 1);
        assert.equal(ui.store.getState().player.playbackStatus, 'loading');
        assert.equal(ui.store.getState().player.playbackError, null);
        // Repeated store updates while a retry is pending must not start duplicate requests.
        await ui.dispatch(play());
        assert.equal(ui.requests.length, 2);
        await audioFlush(() => ui.requests[1].resolve(new Response('Recovered audio')));
        assert.equal(audioCreatedUrls.length, 1);
        assert.equal(ui.audio.src, audioCreatedUrls[0].url);
        assert.equal(await audioCreatedUrls[0].blob.text(), 'Recovered audio');
        assert.equal(ui.store.getState().player.playbackStatus, 'playing');
        assert.equal(audioMedia(ui.audio).playCalls, 1);
    } finally { await ui.close(); }
    assert.deepEqual(audioRevokedUrls, audioCreatedUrls.map(item => item.url));
});

test('audio: a failed retry remains retryable without reselecting the track', async () => {
    const ui = await audioMount(AudioPlayerController);
    try {
        await audioStartFailedRequest(ui);
        await ui.dispatch(play());
        assert.equal(ui.requests.length, 2);
        await audioFlush(() => ui.requests[1].reject(new Error('Still unavailable')));
        assert.equal(ui.store.getState().player.isPlaying, false);
        assert.equal(ui.store.getState().player.playbackStatus, 'error');
        await ui.dispatch(play());
        assert.equal(ui.requests.length, 3);
        await audioFlush(() => ui.requests[2].resolve(new Response('Third attempt')));
        assert.equal(ui.store.getState().player.currentTrack.id, 1);
        assert.equal(ui.store.getState().player.playbackStatus, 'playing');
    } finally { await ui.close(); }
});

for (const lateResult of ['failure', 'body']) test(`audio: switching during retry aborts it and ignores a late ${lateResult}`, async () => {
    const ui = await audioMount(AudioPlayerController);
    try {
        await audioStartFailedRequest(ui);
        await ui.dispatch(play());
        assert.equal(ui.requests.length, 2);
        const retry = ui.requests[1];
        let finishBody;
        if (lateResult === 'body') await audioFlush(() => retry.resolve({ ok: true, blob: () => new Promise(resolve => { finishBody = resolve; }) }));
        await ui.dispatch(playNext());
        assert.equal(retry.signal.aborted, true);
        assert.equal(ui.requests.length, 3);
        assert.equal(ui.requests[2].id, 2);
        await audioFlush(() => ui.requests[2].resolve(new Response('Current track')));
        const currentUrl = ui.audio.src;
        await audioFlush(() => lateResult === 'failure' ? retry.reject(new Error('Late retry failure')) : finishBody(new Blob(['Stale track'])));
        assert.equal(ui.audio.src, currentUrl);
        assert.equal(audioCreatedUrls.length, 1);
        assert.equal(await audioCreatedUrls[0].blob.text(), 'Current track');
        assert.equal(ui.store.getState().player.currentTrack.id, 2);
        assert.equal(ui.store.getState().player.playbackStatus, 'playing');
        assert.equal(ui.store.getState().player.playbackError, null);
    } finally { await ui.close(); }
});

test('audio: unmount aborts a pending retry and discards its late response', async () => {
    const ui = await audioMount(AudioPlayerController);
    try {
        await audioStartFailedRequest(ui);
        await ui.dispatch(play());
        assert.equal(ui.requests.length, 2);
        const retry = ui.requests[1];
        await ui.close();
        assert.equal(retry.signal.aborted, true);
        await audioFlush(() => retry.resolve(new Response('Unmounted source')));
        assert.equal(audioCreatedUrls.length, 0);
        assert.equal(audioMedia(ui.audio).playCalls, 0);
    } finally { await ui.close(); }
});

const audioRestoreCases = [
    { name: 'an intact queue containing duplicates', ids: [1, 2, 2, 3], index: 2, unavailable: [], queue: [1, 2, 2, 3], expectedIndex: 2, time: 37 },
    { name: 'missing earlier item', ids: [1, 2, 3], index: 1, unavailable: [1], queue: [2, 3], expectedIndex: 0, time: 37 },
    { name: 'second duplicate occurrence after a missing item', ids: [1, 2, 2, 3], index: 2, unavailable: [1], queue: [2, 2, 3], expectedIndex: 1, time: 37 },
    { name: 'missing active item selects the next survivor', ids: [1, 2, 3], index: 1, unavailable: [2], queue: [1, 3], expectedIndex: 1, time: 0 },
    { name: 'missing final active item selects the previous survivor', ids: [1, 2, 3], index: 2, unavailable: [3], queue: [1, 2], expectedIndex: 1, time: 0 },
    { name: 'no survivors', ids: [1, 2], index: 1, unavailable: [1, 2], queue: [], expectedIndex: -1, time: 0 },
    { name: 'invalid earlier ID does not shift the active occurrence', ids: [null, 2, 3], index: 1, unavailable: [], queue: [2, 3], expectedIndex: 0, time: 37 },
];

for (const scenario of audioRestoreCases) test(`audio: paused restore preserves occurrence identity with ${scenario.name}`, async () => {
    const ui = await audioMount(DemoPlayerSync, { saved: { ids: scenario.ids, index: scenario.index, time: 37 }, unavailable: scenario.unavailable });
    try {
        const player = ui.store.getState().player;
        assert.deepEqual(player.queue.map(item => item.id), scenario.queue);
        assert.equal(player.queueIndex, scenario.expectedIndex);
        assert.equal(player.currentTrack?.id ?? null, scenario.queue[scenario.expectedIndex] ?? null);
        assert.equal(player.currentTime, scenario.time);
        assert.equal(player.isPlaying, false);
        assert.equal(new Set(player.queue.map(item => item._queueId)).size, player.queue.length);
        assert.deepEqual(ui.gets, [...new Set(scenario.ids.filter(id => Number.isInteger(id) && id > 0))]);
    } finally { await ui.close(); }
});
