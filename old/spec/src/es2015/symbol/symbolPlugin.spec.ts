import t from 'assert';
import k from '../../testUtil';

k.trio('value types subject is itself', (title, spec) => {
  test(title, async () => {
    const expected = Symbol()
    const s = await spec(expected)
    t.strictEqual(s.subject, expected)
  })
})
