import { test } from 'ava'

import { spec } from '../index'

const childProcess = {
  increment(remote, x) {
    return new Promise((a, r) => {
      const result: any[] = []
      const cp = remote('increment', [x])
      cp.on('close', code => a({ result, code }))
      cp.on('error', err => r(err))
      cp.stdout.on('data', chunk => {
        result.push(['stdout', chunk])
      })
      cp.stderr.on('data', chunk => {
        result.push(['stderr', chunk])
      })
    })
  },
  spawnSuccess(_cmd, args) {
    let x = args[0]
    const stdout: any = {}
    const stderr: any = {}
    const cp: any = {}
    setImmediate(() => {
      stdout.data(++x)
      stdout.data(++x)
      stdout.data(++x)
      cp.close(0)
    })
    return {
      stdout: {
        on(event, callback) {
          stdout[event] = callback
        }
      },
      stderr: {
        on(event, callback) {
          stderr[event] = callback
        }
      },
      on(event, callback) {
        cp[event] = callback
      }
    }
  },
  spawnFail(_cmd, args) {
    let x = args[0]
    const stdout: any = {}
    const stderr: any = {}
    const cp: any = {}
    setImmediate(() => {
      stdout.data(++x)
      stderr.data(++x)
      cp.close(1)
    })
    return {
      stdout: {
        on(event, callback) {
          stdout[event] = callback
        }
      },
      stderr: {
        on(event, callback) {
          stderr[event] = callback
        }
      },
      on(event, callback) {
        cp[event] = callback
      }
    }
  }
}

test('childProcess verify', async t => {
  const speced = await spec(childProcess.spawnSuccess)
  const actual = await childProcess.increment(speced.subject, 2)
  t.deepEqual(actual, {
    result: [['stdout', 3], ['stdout', 4], ['stdout', 5]],
    code: 0
  })

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['increment', [2]] },
    { type: 'fn/return', payload: {}, meta: { returnType: 'childProcess' } },
    { type: 'childProcess', payload: [3], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [4], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [5], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [0], meta: { site: ['on'], event: 'close' } }
  ])
})

test('childProcess save', async t => {
  const speced = await spec.save('childProcess/success', childProcess.spawnSuccess)
  const actual = await childProcess.increment(speced.subject, 2)
  t.deepEqual(actual, {
    result: [['stdout', 3], ['stdout', 4], ['stdout', 5]],
    code: 0
  })

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['increment', [2]] },
    { type: 'fn/return', payload: {}, meta: { returnType: 'childProcess' } },
    { type: 'childProcess', payload: [3], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [4], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [5], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [0], meta: { site: ['on'], event: 'close' } }
  ])
})

test('childProcess simulate', async t => {
  const speced = await spec.simulate('childProcess/success', childProcess.spawnSuccess)
  const actual = await childProcess.increment(speced.subject, 2)
  t.deepEqual(actual, {
    result: [['stdout', 3], ['stdout', 4], ['stdout', 5]],
    code: 0
  })

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['increment', [2]] },
    { type: 'fn/return', payload: {}, meta: { returnType: 'childProcess' } },
    { type: 'childProcess', payload: [3], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [4], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [5], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [0], meta: { site: ['on'], event: 'close' } }
  ])
})

test('childProcess fail case verify', async t => {
  const speced = await spec(childProcess.spawnFail)
  const actual = await childProcess.increment(speced.subject, 2)
  t.deepEqual(actual, {
    result: [['stdout', 3], ['stderr', 4]],
    code: 1
  })

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['increment', [2]] },
    { type: 'fn/return', payload: {}, meta: { returnType: 'childProcess' } },
    { type: 'childProcess', payload: [3], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [4], meta: { site: ['stderr', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [1], meta: { site: ['on'], event: 'close' } }
  ])
})

test('childProcess fail case save', async t => {
  const speced = await spec.save('childProcess/fail', childProcess.spawnFail)
  const actual = await childProcess.increment(speced.subject, 2)
  t.deepEqual(actual, {
    result: [['stdout', 3], ['stderr', 4]],
    code: 1
  })

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['increment', [2]] },
    { type: 'fn/return', payload: {}, meta: { returnType: 'childProcess' } },
    { type: 'childProcess', payload: [3], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [4], meta: { site: ['stderr', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [1], meta: { site: ['on'], event: 'close' } }
  ])
})

test('childProcess fail case replay', async t => {
  const speced = await spec.simulate('childProcess/fail', childProcess.spawnFail)
  const actual = await childProcess.increment(speced.subject, 2)
  t.deepEqual(actual, {
    result: [['stdout', 3], ['stderr', 4]],
    code: 1
  })

  await speced.satisfy([
    { type: 'fn/invoke', payload: ['increment', [2]] },
    { type: 'fn/return', payload: {}, meta: { returnType: 'childProcess' } },
    { type: 'childProcess', payload: [3], meta: { site: ['stdout', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [4], meta: { site: ['stderr', 'on'], event: 'data' } },
    { type: 'childProcess', payload: [1], meta: { site: ['on'], event: 'close' } }
  ])
})
