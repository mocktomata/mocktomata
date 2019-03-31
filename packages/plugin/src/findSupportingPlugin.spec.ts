import { findSupportingPlugin, registerPlugin } from '.';
import { dummyPlugin } from './test-util/dummyPlugin';

test('not supported subject gets undefined', () => {
  const notSupportedSubject = { oh: 'no' }
  expect(findSupportingPlugin(notSupportedSubject)).toBe(undefined)
})

test('supported', () => {
  registerPlugin('dummy', {
    activate(context) {
      context.register(dummyPlugin)
    }
  })

  const actual = findSupportingPlugin({})

  expect(actual).not.toBeUndefined();
})
