import { createSpecRecordValidator } from './record.js'
import a from 'assertron'
import { PluginsNotLoaded } from './errors.js'

test('throw PluginsNotLoaded when loaded record uses not loaded plugins', () => {
  a.throws(() => createSpecRecordValidator('', { refs: [{ plugin: 'unknown', profile: 'target' }], actions: [] }), PluginsNotLoaded)
})
