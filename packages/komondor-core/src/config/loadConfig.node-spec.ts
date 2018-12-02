import t from 'assert';
import a from 'assertron';
import { ConfigPropertyIsInvalid, ConfigPropertyNotRecognized } from './errors';
import { getConfig } from './getConfig';
import { loadConfig } from './loadConfig';
import { setConfig } from './setConfig';

afterEach(() => setConfig({}))

it('no config will be empty', () => {
  loadConfig('fixtures/config/no-config')
  t.deepStrictEqual(getConfig(), { plugins: [] })
})

it('not supported property throws', () => {
  a.throws(() => loadConfig('fixtures/config/invalid-prop'), ConfigPropertyNotRecognized)
})

it(`komondor.plugins must be an array`, () => {
  a.throws(() => loadConfig('fixtures/config/plugins-as-string'), ConfigPropertyIsInvalid)
})

it('plugins is stored', () => {
  loadConfig('./fixtures/config/single-plugin')
  t.strictEqual(getConfig().plugins![0], 'komondor-plugin-single')
})

