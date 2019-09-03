import a from 'assertron';
import { NotSpecable, spec, SpecIDCannotBeEmpty, SpecNotFound } from '..';
import k from '../test-utils';

beforeAll(async () => {
  k.createTestHarness()
})

test('spec id cannot be empty', async () => {
  await a.throws(spec(''), SpecIDCannotBeEmpty)
  await a.throws(spec.live(''), SpecIDCannotBeEmpty)
  await a.throws(spec.save(''), SpecIDCannotBeEmpty)
  await a.throws(spec.simulate(''), SpecIDCannotBeEmpty)
})

k.save(`primitive type '%s' is not specable`, (title, spec) => {
  test.each([undefined, null, 1, true, Symbol(), 'str'])(title, async (value) => {
    await a.throws(spec.mock(value), NotSpecable)
  })
})

k.save('array is not specable', (title, spec) => {
  test(title, async () => {
    await a.throws(spec.mock([]), NotSpecable)
  })
})

test('simulate throws if spec record does not exist', async () => {
  await a.throws(spec.simulate('not exist').then(s => s.mock((x: any) => x)), SpecNotFound)
})

test.todo('plugin with passive spy (same as subject spy)')
