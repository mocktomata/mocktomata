const t = require('assert')
const komondor = require('..')

class Foo {
  do() { return 1 }
}
test('class/simple', async () => {
  const { spec } = komondor
  const s = await spec.save('js/class/sync', Foo)
  const foo = new s.subject()
  t.equal(foo.do(), 1)

  await s.done()
})
