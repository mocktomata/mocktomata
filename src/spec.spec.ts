import a from 'assertron'

import { spec, SpecNotFound, NotSpecable } from '.'

test('simulate but file does not exists', async () => {
  a.throws(spec.simulate('not exist', x => x), SpecNotFound)
})

test('subject not specable will throw', async () => {
  await a.throws(spec(true), NotSpecable)
})
