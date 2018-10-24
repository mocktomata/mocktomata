const t = require('assert')
const k = require('../testUtil')

class Foo {
  do() { return 1 }
}

k.testTrio('js/class/simple', (title, spec) => {
  test(title, async () => {
    const s = await spec(Foo)
    const foo = new s.subject()
    t.strictEqual(foo.do(), 1)

    await s.done()
  })
})
