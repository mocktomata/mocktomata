import t from 'assert'
import a from 'assertron'

import { spec, SpecNotFound, NotSpecable, InvalidID, artifact } from '.'
import k from './testUtil'

test('simulate but file does not exists', async () => {
  await a.throws(spec.simulate('not exist', x => x), SpecNotFound)
})

k.trio('subject not specable will throw', 'spec/notSpecable', (title, spec) => {
  test(title, async () => {
    await a.throws(spec(true), NotSpecable)
  })
})

k.trio('done() same as satisfy', 'spec/done', (title, spec) => {
  test(title, async () => {
    const s = await spec(x => x)
    t.strictEqual(s.subject(1), 1)

    await s.done()
  })
})

k.trio('Error payload will pass instanceof', 'spec/errorPassInstanceof', (title, spec) => {
  test(title, async () => {
    const s = await spec(() => { throw new Error('err') })
    const err = a.throws(() => s.subject()) as any

    t(err instanceof Error)
    await s.done()
  })
})

k.trio('CustomError properties are kept', 'spec/errorCustomProperty', (title, spec) => {
  test(title, async () => {
    class CustomError extends Error {
      x = 'x'
      one = 1
    }
    const s = await spec(() => { throw new CustomError('err') })
    const err = a.throws(() => s.subject()) as any

    t(err instanceof Error)
    t.strictEqual(err.message, 'err')
    t.strictEqual(err.x, 'x')
    t.strictEqual(err.one, 1)
    await s.done()
  })
})

test('spec id containing invalid path character should throws InvalidID', () => {
  return Promise.all([
    'a > b',
    'new: some-condition'
  ].map(p => {
    return Promise.all([
      a.throws(() => spec(p, () => ({})), InvalidID),
      a.throws(() => spec.save(p, () => ({})), InvalidID),
      a.throws(() => spec.simulate(p, () => ({})), InvalidID)
    ])
  }))
})

test('spec id containing path should work', () => {
  return Promise.all([
    'spec/done',
    'spec\\done'
  ].map(p => {
    return spec(p, () => ({}))
  }))
})

export function echo(a, callback) {
  callback(a)
}

test('changes in artifact value is ignored in simulation', async () => {
  const server = artifact('server', { host: '127.0.0.1' })
  const s = await spec.save('spec/artifact/echo', echo)
  let actualHost
  s.subject(server.host, host => actualHost = host)
  // tslint:disable-next-line:triple-equals
  t(actualHost == server.host)
  await s.done()

  const server2 = artifact('server', { host: '10.3.1.1' })
  const s2 = await spec.simulate('spec/artifact/echo', echo)
  s2.subject(server2.host, host => actualHost = host)
  // tslint:disable-next-line:triple-equals
  t(actualHost == server.host)
})

k.trio('spec/undefined', (title, spec) => {
  test.skip(title, async () => {
    const s = await spec(echo)
    let actual = 1
    s.subject(undefined, a => actual = a)

    t.strictEqual(actual, undefined)

    await s.done()
  })
})

k.trio('spec/null', (title, spec) => {
  test(title, async () => {
    const s = await spec(echo)
    let actual = 1
    s.subject(null, a => actual = a)

    t.strictEqual(actual, null)

    await s.done()
  })
})

describe('on()', () => {
  k.trio('listen twice', 'spec/on/twice', (title, spec) => {
    test(title, async () => {
      const s = await spec(() => Promise.resolve())
      let count = 0
      s.on('function', 'invoke', () => count++)
      s.on('function', 'invoke', () => count++)
      await s.subject()

      t.strictEqual(count, 2)
      await s.done()
    })
  })
})
