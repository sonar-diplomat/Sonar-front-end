import assert from 'node:assert/strict';
import test from 'node:test';

import type { TrackDTO } from '@entities/Music';

import reducer, { setQueue, playFromQueue, playNext, playPrevious, setRepeatMode, setDuration, seekTo, setCurrentTime, toggleShuffle, addToQueue, removeFromQueue, restoreQueue, setPlaybackError } from './playerSlice.ts';
const track = (id: number): TrackDTO => ({ id, title: `Song ${id}`, duration: null, isExplicit: false, drivingDisturbingNoises: false, visibilityStateId: 1, coverId: 101, lowQualityAudioFileId: id, mediumQualityAudioFileId: null, highQualityAudioFileId: null, genre: { id: 1, name: 'Test' } });
test('queue entries keep duplicate song identity and history', () => {
    let state = reducer(undefined, setQueue({ tracks: [track(1), track(1), track(2)] }));
    assert.notEqual(state.queue[0]._queueId, state.queue[1]._queueId);
    state = reducer(state, playFromQueue(state.queue[1]._queueId));
    assert.equal(state.queueIndex, 1);
    state = reducer(state, playPrevious());
    assert.equal(state.queueIndex, 0);
    assert.equal(state.queue.length, 3);
});
test('manual next advances in repeat-one and repeat-all wraps', () => {
    let state = reducer(undefined, setQueue({ tracks: [track(1), track(2)] }));
    state = reducer(state, setRepeatMode('one'));
    state = reducer(state, playNext());
    assert.equal(state.currentTrack?.id, 2);
    state = reducer(state, setRepeatMode('all'));
    state = reducer(state, playNext());
    assert.equal(state.currentTrack?.id, 1);
});
test('shuffle preserves current song and unshuffle retains additions/removals', () => {
    let state = reducer(undefined, setQueue({ tracks: [track(1), track(2), track(3)], startIndex: 1 }));
    state = reducer(state, toggleShuffle());
    assert.equal(state.queue[state.queueIndex].id, 2);
    state = reducer(state, addToQueue(track(4)));
    state = reducer(state, removeFromQueue(state.queue.findIndex(item => item.id === 3)));
    state = reducer(state, toggleShuffle());
    assert.deepEqual(state.queue.map(item => item.id), [1, 2, 4]);
    assert.equal(state.queue[state.queueIndex].id, 2);
});
test('unknown duration is finite, seek clamps, previous rewinds', () => {
    let state = reducer(undefined, setQueue({ tracks: [track(1)] }));
    state = reducer(state, setDuration(Infinity));
    assert.equal(state.duration, 0);
    state = reducer(state, seekTo(50));
    assert.equal(state.currentTime, 0);
    state = reducer(state, setDuration(100));
    state = reducer(state, seekTo(200));
    assert.equal(state.currentTime, 100);
    state = reducer(state, playPrevious());
    assert.equal(state.currentTime, 0);
    assert.ok(state.seekRevision > 0);
    state = reducer(state, setCurrentTime(NaN));
    assert.equal(state.currentTime, 0);
});
test('restore is paused and errors cannot keep play intent on', () => {
    let state = reducer(undefined, restoreQueue({ queue: [Object.freeze(track(1))], customQueue: [], queueIndex: 0, collectionContext: null, currentTime: 42 }));
    assert.equal(state.isPlaying, false);
    assert.equal(state.currentTime, 42);
    state = reducer(state, setPlaybackError('Unavailable'));
    assert.equal(state.isPlaying, false);
    assert.equal(state.playbackStatus, 'error');
    state = reducer(state, restoreQueue({ queue: [], customQueue: [], queueIndex: 0, collectionContext: null }));
    assert.equal(state.queueIndex, -1);
    assert.equal(state.currentTrack, null);
});
