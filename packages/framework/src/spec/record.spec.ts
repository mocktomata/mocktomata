import { createSpecRecordValidator } from './record'
import a from 'assertron'
import { PluginsNotLoaded } from './errors'

test('throw PluginsNotLoaded when loaded record uses not loaded plugins', () => {
  a.throws(() => createSpecRecordValidator('', { refs: [{ plugin: 'unknown', profile: 'target' }], actions: [] }), PluginsNotLoaded)
})
