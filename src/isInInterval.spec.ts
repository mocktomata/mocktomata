import { test } from 'ava'

import {
  createSatisfier,
  isInClosedInterval,
  isInLeftClosedInterval,
  isInOpenInterval,
  isInRightClosedInterval
} from './index'


test('open interval', t => {
  t.false(createSatisfier(isInOpenInterval(1, 3)).test(1))
  t.true(createSatisfier(isInOpenInterval(1, 3)).test(2))
  t.false(createSatisfier(isInOpenInterval(1, 3)).test(3))
})

test('closed interval', t => {
  t.false(createSatisfier(isInClosedInterval(1, 3)).test(0))
  t.true(createSatisfier(isInClosedInterval(1, 3)).test(1))
  t.true(createSatisfier(isInClosedInterval(1, 3)).test(2))
  t.true(createSatisfier(isInClosedInterval(1, 3)).test(3))
  t.false(createSatisfier(isInClosedInterval(1, 3)).test(4))
})

test('left closed', t => {
  t.false(createSatisfier(isInLeftClosedInterval(1, 3)).test(0))
  t.true(createSatisfier(isInLeftClosedInterval(1, 3)).test(1))
  t.true(createSatisfier(isInLeftClosedInterval(1, 3)).test(2))
  t.false(createSatisfier(isInLeftClosedInterval(1, 3)).test(3))
})

test('right closed', t => {
  t.false(createSatisfier(isInRightClosedInterval(1, 3)).test(1))
  t.true(createSatisfier(isInRightClosedInterval(1, 3)).test(2))
  t.true(createSatisfier(isInRightClosedInterval(1, 3)).test(3))
  t.false(createSatisfier(isInRightClosedInterval(1, 3)).test(4))
})

test('nicer toString()', t => {
  t.is(isInOpenInterval(1, 3).toString(), '(1...3)')
  t.is(isInClosedInterval(1, 3).toString(), '[1...3]')
  t.is(isInLeftClosedInterval(1, 3).toString(), '[1...3)')
  t.is(isInRightClosedInterval(1, 3).toString(), '(1...3]')
})
