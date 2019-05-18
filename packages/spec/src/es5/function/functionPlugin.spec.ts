import a from 'assertron';
import { createTestHarness } from '../../createTestHarness';
import { loadPlugins } from '../../plugin';
import k from '../../testUtil';
import { errorPlugin } from '../error';
import { functionPlugin } from '../function';
import { primitivePlugin } from '../primitive';
import { Dummy } from '../test-util/Dummy';
import { simpleCallback } from './testSuites';

let harness: ReturnType<typeof createTestHarness>

beforeAll(() => {
  harness = createTestHarness()
  harness.io.addPlugin('@komondor-lab/es5', primitivePlugin, errorPlugin, functionPlugin)
  return loadPlugins(harness)
})

describe('support()', () => {
  test('do not supports primitive types other than functions', () => {
    expect(functionPlugin.support(undefined)).toBe(false)
    expect(functionPlugin.support(null)).toBe(false)
    expect(functionPlugin.support(0)).toBe(false)
    expect(functionPlugin.support(true)).toBe(false)
    expect(functionPlugin.support('a')).toBe(false)
    expect(functionPlugin.support(Symbol())).toBe(false)
    expect(functionPlugin.support({})).toBe(false)
    expect(functionPlugin.support([])).toBe(false)
  })

  test('support simple function', () => {
    expect(functionPlugin.support(function foo() { return })).toBeTruthy()
    expect(functionPlugin.support(function () { return })).toBeTruthy()
  })

  test('support arrow function', () => {
    expect(functionPlugin.support(() => false)).toBeTruthy()
  })

  test('not support class', () => {
    expect(functionPlugin.support(Dummy)).toBeFalsy()
  })
})

k.trio('es5/function: function without argument', (title, spec) => {
  test(title, async () => {
    const s = await spec(() => 'abc')
    const actual = s.subject()
    expect(actual).toBe('abc')

    await s.done()
  })
})

k.trio('es5/function: function without callback', (title, spec) => {
  test(title, async () => {
    const s = await spec((x: number, y: number) => x + y)
    const actual = s.subject(1, 2)

    expect(actual).toBe(3)

    await s.done()
  })
})

k.trio('es5/function: simple callback success (direct)', (title, spec) => {
  test(title, async () => {
    const s = await spec(simpleCallback.success)

    let actual
    s.subject(2, (_, result) => {
      actual = result
    })

    expect(actual).toBe(3)

    await s.done()
  })
})

k.trio('es5/function: simple callback success', (title, spec) => {
  test(title, async () => {
    const s = await spec(simpleCallback.success)

    const actual = await simpleCallback.increment(s.subject, 2)

    expect(actual).toBe(3)

    await s.done()
  })
})


k.trio('es5/function: simple callback fail', (title, spec) => {
  test.only(title, async () => {
    const s = await spec(simpleCallback.fail)

    const err = await a.throws(simpleCallback.increment(s.subject, 2))

    expect(err.message).toBe('fail')

    await s.done()

    harness.logSpecs()
  })
})
