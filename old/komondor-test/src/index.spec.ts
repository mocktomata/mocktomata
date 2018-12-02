import t from 'assert'

import k from '.'

test('default export shape', () => {
  t.equal(typeof k.live, 'function')
  t.equal(typeof k.save, 'function')
  t.equal(typeof k.simulate, 'function')
  t.equal(typeof k.trio, 'function')
})
