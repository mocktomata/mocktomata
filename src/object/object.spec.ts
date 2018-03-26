import t from 'assert'

import { spec } from '..'
import { isFunction } from 'util';

test.skip('', async () => {
  const objSpec = await spec(() => ({ f() { return 'foo' } }))

  const actual = objSpec.subject()
  t.equal(actual.f(), 'foo')

  return objSpec.satisfy([
    { type: 'function/invoke' },
    { type: 'function/return', payload: { f: isFunction }, meta: { returnType: 'komondor/obj', returnId: 1 } },
    { type: 'function/invoke', meta: { sourceType: 'komondor/obj', sourceId: 1, sourcePath: ['f'], id: 2 } },
    { type: 'function/return', payload: 'foo', meta: { id: 2 } }
  ])
})
