import a from 'assertron'
import k from './testUtil'
import { NotSpecable } from './errors';

k.live('spec on primitive value throws NotSpecable', (title, spec) => {
  test(title, async () => {
    await a.throws(spec(true), NotSpecable)
  })
})
