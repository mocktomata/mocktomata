import { test } from 'ava'

import { store } from './store'
import { config } from './index'

test.afterEach(() => {
  config({})
})

test('enable replay', t => {
  t.is(store.mode, 'verify')
  config({ mode: 'replay' })
  t.is(store.mode, 'replay')
})
