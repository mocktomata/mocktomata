import t from 'assert';
import { loadConfig } from '.';
import { registerConfigHandler } from './registerConfigHandler';

it('when there is no config, handler will not be invoked', () => {
  let called = false
  registerConfigHandler(() => called = true)
  loadConfig('fixtures/config/no-config')
  t.strictEqual(called, false)
})

// it('not supported property throws', () => {
//   a.throws(() => loadConfig('fixtures/config/invalid-prop'), ConfigPropertyNotRecognized)
// })

// it(`komondor.plugins must be an array`, () => {
//   a.throws(() => loadConfig('fixtures/config/plugins-as-string'), ConfigPropertyIsInvalid)
// })

// it('plugins is stored', () => {
//   loadConfig('./fixtures/config/single-plugin')
//   t.strictEqual(getConfig().plugins![0], 'komondor-plugin-single')
// })

