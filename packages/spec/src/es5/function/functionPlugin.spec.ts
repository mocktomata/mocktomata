import a from 'assertron';
import { createTestHarness } from '../../createTestHarness';
import { NotSpecable } from '../../errors';
import { loadPlugins } from '../../plugin';
import { spec } from '../../spec';
import k from '../../testUtil';
import { functionPlugin } from '../function';
import { primitivePlugin } from '../primitive';
import { Dummy } from '../test-util/Dummy';
import { simpleCallback, nodeCallback } from './testSuites';

let harness: ReturnType<typeof createTestHarness>

beforeAll(() => {
  harness = createTestHarness()
  harness.io.addPlugin('@komondor-lab/es5', primitivePlugin, functionPlugin)
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

k.trio('es5/function: success callback', (title, spec) => {
  test.only(title, async () => {
    const s = await spec(nodeCallback.increment)

    const actual = await nodeCallback.invoke(s.subject, 2)

    expect(actual).toBe(3)

    await s.done()
    harness.logSpecs()
  })
})


// function increment(x) {
//   return x + 1;
// }
// function doThrow() {
//   throw new Error('throwing');
// }
