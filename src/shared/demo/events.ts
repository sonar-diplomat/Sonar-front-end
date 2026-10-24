import type { LocalEvent } from './database.ts';
type Listener = (event: LocalEvent) => void;
const listeners = new Set<Listener>();
export function subscribeDemoEvents(listener: Listener): () => void { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function emitDemoEvent(event: LocalEvent): void { for (const listener of [...listeners]) { try { listener(event); } catch (error) { console.error('Demo event listener failed', error); } } }
