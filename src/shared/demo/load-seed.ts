import rawSeed from '@demo-seed';

import { clone,validateSeed,type DemoSeed } from './database.ts';
export function loadSeed(): DemoSeed { const seed = rawSeed as DemoSeed; validateSeed(seed); return clone(seed); }
