import a from 'assertron'

import { spec, SpecNotFound } from '.'

test('simulate but file does not exists', async () => {
  a.throws(spec.simulate('not exist', x => x), SpecNotFound)
})
