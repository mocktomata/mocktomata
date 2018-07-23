import t from 'assert'
import a, { AssertOrder } from 'assertron'
import { Registrar } from 'komondor-plugin'

import { DuplicatePlugin, spec, InvalidPlugin } from '.'
import { loadConfig, registerPlugin, loadPlugin, plugins } from './plugin'
import k from './testUtil'

describe('loadConfig()', () => {
  test('load config', () => {
    const config = loadConfig('./fixtures/single-plugin')
    t.strictEqual(config.plugins[0], 'komondor-plugin-single')
  })
})

describe('registerPlugin()', () => {
  test('calling activate', () => {
    const o = new AssertOrder(1)
    registerPlugin({ activate() { o.once(1) } })
    o.end()
  })
  test('register with same name will throw', () => {
    return new Promise(resolve => {
      registerPlugin({
        activate(r: Registrar) {
          r.register(
            'x',
            () => false,
            x => x,
            (_context, subject) => subject
          )
          resolve(a.throws(() => r.register(
            'x',
            () => false,
            x => x,
            (_context, subject) => subject
          ), DuplicatePlugin))
        }
      })
    })
  })
})

test('on() will not trigger if not adding the specific action type', async () => {
  const o = new AssertOrder(1)
  registerPlugin({
    activate(r: Registrar) {
      r.register(
        'on-not-trigger',
        subject => subject.name === 'onNotTrigger',
        (context, subject) => {
          o.once(1)
          context.newInstance().newCall().invoke([])
          return subject
        },
        (_context, subject) => {
          return subject
        }
      )
    }
  })

  const s = await spec(function onNotTrigger() { return 'on-not-trigger' })
  s.on('on-not-trigger', 'action1', a => t.fail(a.toString()))
  s.subject()
  o.end()
})

registerPlugin({
  activate(r: Registrar) {
    r.register(
      'on-trigger',
      subject => subject.name === 'onTrigger',
      context => () => context.newInstance().newCall().invoke([]),
      context => () => context.newInstance().newCall().result()
    )
  }
})

k.trio('on() will trigger when the right action is added', 'plugin/on-trigger', (title, spec) => {
  test(title, async () => {
    const o = new AssertOrder(1)
    const s = await spec(function onTrigger() { return 'on-trigger' })
    s.on('on-trigger', 'invoke', () => o.once(1))

    s.subject()

    await s.satisfy([
      { type: 'on-trigger', name: 'construct' },
      { type: 'on-trigger', name: 'invoke' }])
    o.end()
  })
})

test('onAny() will trigger when any aciton is added', async () => {
  const o = new AssertOrder(1)
  registerPlugin({
    activate(r: Registrar) {
      r.register(
        'onAny',
        subject => subject.name === 'onAny',
        context => () => context.newInstance().newCall().invoke([]),
        context => () => context.newInstance().newCall().result()
      )
    }
  })

  const s = await spec(function onAny() { return 'onAny' })
  s.onAny(() => o.any([1, 2]))
  s.subject()
  o.end()
})

describe('loadPlugin()', () => {
  test('load a plugin without activate() will throw', async () => {
    const err = await a.throws(() => loadPlugin('fixtures/no-activate', 'no-activate-plugin'), InvalidPlugin)
    t.strictEqual(err.pluginName, 'no-activate-plugin')
  })
  test('load a plugin', async () => {
    loadPlugin('fixtures/single-plugin', 'komondor-plugin-single')
    const actual = plugins[0]
    t.strictEqual(actual.type, 'single')
    plugins.splice(0, 1)
  })
})
