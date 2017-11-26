import { test } from 'ava'

import { createSatisfier } from './index'

test('support generics', t => {
  const s = createSatisfier<{ a: number }>({ a: 1 })
  t.true(s.test({ a: 1 }))
  t.false(s.test({ a: 2 }))
})
