import t from 'assert'
import a, { AssertOrder } from 'assertron'
import { Registrar } from 'komondor-plugin'

import { DuplicatePlugin, spec, InvalidPlugin } from '.'
import { loadConfig, registerPlugin, loadPlugin } from './plugin'

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
          (_context, subject) => subject
        )
        a.throws(() => r.register(
          'x',
          () => false,
          x => x,
          (_context, subject) => subject
        ), DuplicatePlugin)
      }
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

test('on() will trigger when the right action is added', async () => {
  const o = new AssertOrder(1)
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

  const s = await spec(function onTrigger() { return 'on-trigger' })
  s.on('on-trigger', 'invoke', () => o.once(1))

  s.subject()

  await s.satisfy([
    { type: 'on-trigger', name: 'construct' },
    { type: 'on-trigger', name: 'invoke' }])
  o.end()
})

test('on() will trigger when the right action is added (save)', async () => {
  const o = new AssertOrder(1)
  registerPlugin({
    activate(r: Registrar) {
      r.register(
        'on-trigger-save',
        subject => subject.name === 'onTriggerSave',
        context => () => context.newInstance().newCall().invoke([]),
        context => () => context.newInstance().newCall().result()
      )
    }
  })

  const s = await spec.save('plugin/on-trigger-save', function onTriggerSave() { return 'on-trigger-save' })
  s.on('on-trigger-save', 'invoke', () => o.once(1))
  s.subject()

  await s.satisfy([
    { type: 'on-trigger-save', name: 'construct' },
    { type: 'on-trigger-save', name: 'invoke' }])
  o.end()
})

test('on() will trigger when the right action is added (simulate)', async () => {
  const o = new AssertOrder(1)
  registerPlugin({
    activate(r: Registrar) {
      r.register(
        'on-trigger-simulate',
        subject => subject.name === 'onTriggerSimulate',
        context => () => context.newInstance().newCall().invoke([]),
        context => () => context.newInstance().newCall().result()
      )
    }
  })

  const s = await spec.simulate('plugin/on-trigger-simulate', function onTriggerSimulate() { return 'on-trigger-simulate' })
  s.on('on-trigger-simulate', 'invoke', () => o.once(1))

  s.subject()

  await s.satisfy([
    { type: 'on-trigger-simulate', name: 'construct' },
    { type: 'on-trigger-simulate', name: 'invoke' }])
  o.end()
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
    t.equal(err.pluginName, 'no-activate-plugin')
  })
})
