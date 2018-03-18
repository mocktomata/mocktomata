import t from 'assert'

import { loadConfig } from './plugin'

test('load config', () => {
  const config = loadConfig('./fixtures/singlePlugin')
  t.equal(config.plugins[0], 'komondor-plugin-ws')
})
