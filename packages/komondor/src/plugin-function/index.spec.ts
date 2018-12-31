import t from 'assert';
import { testSpec } from '../support-util';

testSpec.save('work with identity function', (title, spec) => {
  test(title, async () => {
    const s = await spec((x: any) => x)
    t.strictEqual(s.subject(true), true)

    return s.done()
  })
})
