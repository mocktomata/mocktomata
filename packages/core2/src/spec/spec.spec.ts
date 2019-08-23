import a from 'assertron';
import { NotSpecable, spec, SpecIDCannotBeEmpty, SpecNotFound } from '..';
import k from '../test-utils';

beforeAll(() => {
  k.createTestHarness()
})

test('spec id cannot be empty', async () => {
  await a.throws(spec('', {}), SpecIDCannotBeEmpty)
  await a.throws(spec.live('', {}), SpecIDCannotBeEmpty)
  await a.throws(spec.save('', {}), SpecIDCannotBeEmpty)
  await a.throws(spec.simulate('', {}), SpecIDCannotBeEmpty)
})

k.trio('primitive types are not specable',(description, spec) => {
  test(description, async () => {
    await a.throws(spec(undefined), NotSpecable)
    await a.throws(spec(null), NotSpecable)
    await a.throws(spec(1), NotSpecable)
    await a.throws(spec(true), NotSpecable)
    await a.throws(spec('abc'), NotSpecable)
    await a.throws(spec(Symbol()), NotSpecable)
  })
})

k.trio('array is not specable', (description, spec) => {
  test(description, async () => {
    await a.throws(spec([]), NotSpecable)
  })
})

test('simulate throws if spec record does not exist', async () => {
  await a.throws(spec.simulate('not exist', (x: any) => x), SpecNotFound)
})
