import a from 'assertron';
import { spec } from '.';
import k from '../test-util';
import { IDCannotBeEmpty, NotSpecable } from './errors';

it('id cannot be an empty string', async () => {
  await a.throws(() => spec('', { a: 1 }), IDCannotBeEmpty)
  await a.throws(() => spec.live('', { a: 1 }), IDCannotBeEmpty)
  await a.throws(() => spec.save('', { a: 1 }), IDCannotBeEmpty)
  await a.throws(() => spec.simulate('', { a: 1 }), IDCannotBeEmpty)
})

k.trio('subject not specable will throw', 'spec/notSpecable', (title, spec) => {
  it(title, async () => {
    await a.throws(spec(true), NotSpecable)
  })
})

// it('live invoke getSpy', () => {
//   store.get().plugins.push({
//     name: 'x'
//   })
// })
