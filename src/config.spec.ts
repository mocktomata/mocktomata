import { test } from 'ava'

import { store } from './store'
import { config } from './index'

test.afterEach(() => {
  config({})
})

test('enable replay', t => {
  t.false(store.replay)
  config({ replay: true })
  t.true(store.replay)
})
