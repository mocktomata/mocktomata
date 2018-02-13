import { test } from 'ava'

import { loadConfig } from './plugin'

test('load config', t => {
  const config = loadConfig('./fixtures/singlePlugin')
  t.is(config.plugins[0], 'komondor-plugin-ws')
})
