import t from 'assert'
import a, { AssertOrder } from 'assertron'
import { Registrar } from 'komondor-plugin'

import { DuplicatePlugin } from '.'
import { loadConfig, registerPlugin } from './plugin'


describe('loadConfig()', () => {
  test('load config', () => {
    const config = loadConfig('./fixtures/singlePlugin')
    t.equal(config.plugins[0], 'komondor-plugin-ws')
  })
})

describe('registerPlugin()', () => {
  test('calling activate', () => {
    const o = new AssertOrder(1)
    registerPlugin({ activate() { o.once(1) } })
    o.end()
  })
  test('register with same name will throw', () => {
    registerPlugin({
      activate(r: Registrar) {
        r.register(
          'x',
          () => false,
          x => x,
          x => x
        )
        a.throws(() => r.register(
          'x',
          () => false,
          x => x,
          x => x
        ), DuplicatePlugin)
      }
    })
  })
})

