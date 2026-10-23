import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const script = `
import { loadConfigFromFile } from 'vite';
const loaded = await loadConfigFromFile({ command: 'build', mode: process.env.TEST_MODE });
const c = loaded.config;
console.log('PROFILE_RESULT:' + JSON.stringify({
  dataSource: JSON.parse(c.define['import.meta.env.VITE_DATA_SOURCE']),
  base: c.base,
  aliases: c.resolve.alias,
  proxy: Boolean(c.server.proxy),
}));`;

function load(mode, overrides = {}) {
  const env = { ...process.env, TEST_MODE: mode };
  delete env.VITE_DATA_SOURCE;
  delete env.VITE_BASE_PATH;
  Object.assign(env, overrides);
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], { env, encoding: 'utf8' });
  const line = result.stdout.split('\n').find(value => value.startsWith('PROFILE_RESULT:'));
  return { ...result, profile: line ? JSON.parse(line.slice('PROFILE_RESULT:'.length)) : null };
}

test('an ordinary build defaults to API aliases without demo source paths', () => {
  const result = load('production');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.profile.dataSource, 'api');
  assert.equal(result.profile.base, '/');
  assert.equal(result.profile.proxy, true);
  for (const name of ['@demo-runtime', '@demo-dispatcher', '@demo-seed', '@demo-media']) {
    assert.match(result.profile.aliases[name], /src[\\/]shared[\\/]config[\\/]/);
    assert.doesNotMatch(result.profile.aliases[name], /[\\/]demo[\\/]/);
  }
});

test('demo production configuration selects manifest/seed and project base explicitly', () => {
  const result = load('demo');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.profile.dataSource, 'mock');
  assert.equal(result.profile.base, '/Sonar-front-end/');
  assert.equal(result.profile.proxy, false);
  assert.match(result.profile.aliases['@demo-seed'], /demo[\\/]data[\\/]seed\.json$/);
  assert.match(result.profile.aliases['@demo-media'], /demo[\\/]media-manifest\.json$/);
});

test('unknown and empty data sources stop configuration instead of silently selecting API', () => {
  for (const value of ['invalid', '', 'MOCK']) {
    const result = load('production', { VITE_DATA_SOURCE: value });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /VITE_DATA_SOURCE must be api or mock/);
  }
});

test('explicit environment controls source/base; malformed static bases fail', () => {
  const custom = load('demo', { VITE_DATA_SOURCE: 'api', VITE_BASE_PATH: '/custom/' });
  assert.equal(custom.status, 0, custom.stderr);
  assert.equal(custom.profile.dataSource, 'api');
  assert.equal(custom.profile.base, '/custom/');
  for (const base of ['relative/', '/missing-slash', '//external/', '/a/../']) {
    const result = load('demo', { VITE_BASE_PATH: base });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /VITE_BASE_PATH must be an absolute pathname/);
  }
});
