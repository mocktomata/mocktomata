const t = require('assert')
const komondor = require('..')
const k = require('../testUtil')

const { spec } = komondor

class Foo {
  do() { return 1 }
}

k.testTrio('js/class/simple', (title, spec) => {
  test(title, async () => {
    const s = await spec(Foo)
    const foo = new s.subject()
    t.equal(foo.do(), 1)

    await s.done()
  })
})
