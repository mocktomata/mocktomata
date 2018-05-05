import t from 'assert'
import a from 'assertron'
import { SimulationMismatch } from 'komondor-plugin'

import { spec, SpecNotFound, NotSpecable, InvalidID, artifact } from '.'
import { simpleCallback } from './function/testSuites'
import k from './testUtil'

test('simulate but file does not exists', async () => {
  a.throws(spec.simulate('not exist', x => x), SpecNotFound)
})

k.trio('subject not specable will throw', 'spec/notSpecable', (title, spec) => {
  test(title, async () => {
    await a.throws(spec(true), NotSpecable)
  })
})

test('missing return record will throw', async () => {
  const subject = () => 3
  const s = await spec.simulate('spec/missedReturn', subject)

  // s.subject()
  // await s.satisfy([])
  await a.throws(() => s.subject(), SimulationMismatch)
})

test('missing record will throw', async () => {
  const s = await spec.simulate('spec/incompleteRecords', simpleCallback.success)

  t.equal(await simpleCallback.increment(s.subject, 2), 3)
  // simpleCallback.increment(s.subject, 4)
  await a.throws(simpleCallback.increment(s.subject, 4), SimulationMismatch)
  await s.done()
})

k.trio('done() same as satisfy', 'spec/done', (title, spec) => {
  test(title, async () => {
    const s = await spec(x => x)
    t.equal(s.subject(1), 1)

    await s.done()
  })
})

k.trio('Error payload will pass instanceof', 'spec/errorPassInstanceof', (title, spec) => {
  test(title, async () => {
    const s = await spec(() => { throw new Error('err') })
    const err = await a.throws(() => s.subject())

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
    const err = await a.throws(() => s.subject())

    t(err instanceof Error)
    t.equal(err.message, 'err')
    t.equal(err.x, 'x')
    t.equal(err.one, 1)
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
  t.equal(actualHost, server.host)
  await s.done()

  const server2 = artifact('server', { host: '10.3.1.1' })
  const s2 = await spec.simulate('spec/artifact/echo', echo)
  s2.subject(server2.host, host => actualHost = host)
  t.equal(actualHost, server.host)
})

k.trio('spec/undefined', (title, spec) => {
  test(title, async () => {
    const s = await spec(echo)
    let actual = 1
    s.subject(undefined, a => actual = a)

    t.equal(actual, undefined)

    await s.done()
  })
})

k.trio('spec/null', (title, spec) => {
  test(title, async () => {
    const s = await spec(echo)
    let actual = 1
    s.subject(null, a => actual = a)

    t.equal(actual, null)

    await s.done()
  })
})
