import { clone,SCHEMA_VERSION,SEED_VERSION,STORAGE_KEY,validateState,type DemoState } from './database.ts';

export interface DemoStorage { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
export type PersistenceStatus = { persistent: boolean; reason: string | null; reset: boolean };
export class DemoPersistence {
  readonly status: PersistenceStatus = { persistent: true, reason: null, reset: false };
  private storage?: DemoStorage;
  constructor(storage?: DemoStorage) { this.storage = storage; if (!storage) this.fail('Storage unavailable; changes last for this tab only.'); }
  private fail(reason: string): void { this.status.persistent = false; this.status.reason = reason; }
  load(seed: DemoState, fallback: DemoState = seed): DemoState {
    if (!this.storage) return clone(seed);
    let raw: string | null;
    try { raw = this.storage.getItem(STORAGE_KEY); }
    catch { this.fail('Demo storage cannot be read; changes last for this tab only.'); return clone(fallback); }
    try {
      if (!raw) return clone(seed);
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !('schemaVersion' in parsed) || parsed.schemaVersion !== SCHEMA_VERSION || !('seedVersion' in parsed) || parsed.seedVersion !== SEED_VERSION || !('state' in parsed)) throw new Error('Incompatible demo version');
      const state = parsed.state as DemoState;
      validateState(state);
      return clone(state);
    } catch (error) {
      this.status.reset = true;
      this.status.reason = error instanceof Error ? error.message : 'Invalid demo storage';
      return clone(seed);
    }
  }
  save(state: DemoState): void {
    if (!this.storage) return;
    try { this.storage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION, seedVersion: SEED_VERSION, state })); this.status.persistent = true; if (!this.status.reset) this.status.reason = null; }
    catch { this.fail('Demo storage is full or blocked; changes last for this tab only.'); }
  }
}
