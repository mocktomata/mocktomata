import t from 'assert'
import { functionConstructed, functionInvoked, functionReturned } from 'komondor'
import k from 'komondor-test'
import { childProcessConstructed, childProcessInvoked, childProcessReturned } from '..'
import cp from 'child_process'

describe('acceptance test', () => {
  k.save('childProcess/acceptance/spawn', (title, spec) => {
    // additional on('end') are called internally.
    // need to filter them out before it is workable.
    test.only(title, async () => {
      const s = await spec(cp.spawn)
      // s.onAny(a => console.log(a))
      const child = s.subject('node', ['--version'])
      const actual = await new Promise<string>(a => {
        let msg = ''
        child.on('close', () => a(msg))
        child.stdout.on('data', chunk => msg += chunk)
      })
      t(/v*/.test(actual))

      await s.done()
    })
  })
})


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

k.trio('childProcess/success', (title, spec) => {
  test(title, async () => {
    const s = await spec(childProcess.spawnSuccess)
    const actual = await childProcess.increment(s.subject, 2)
    t.deepStrictEqual(actual, {
      result: [['stdout', 3], ['stdout', 4], ['stdout', 5]],
      code: 0
    })

    await s.satisfy([
      { ...functionConstructed({ functionName: 'spawnSuccess' }), instanceId: 1 },
      { ...functionInvoked('increment', [2]), instanceId: 1, invokeId: 1 },
      { ...functionReturned(), instanceId: 1, invokeId: 1, returnType: 'node/childProcess', returnInstanceId: 1 },
      { ...childProcessConstructed(), instanceId: 1 },
      { ...childProcessInvoked(['on'], 'close'), instanceId: 1, invokeId: 1 },
      { ...functionConstructed(), instanceId: 2, sourceType: 'node/childProcess', sourceInstanceId: 1, sourceInvokeId: 1, sourceSite: [1] },
      { ...childProcessReturned(['on']), instanceId: 1, invokeId: 1 },
      { ...childProcessInvoked(['on'], 'error'), instanceId: 1, invokeId: 2 },
      { ...functionConstructed(), instanceId: 3, sourceType: 'node/childProcess', sourceInstanceId: 1, sourceInvokeId: 2, sourceSite: [1] },
      { ...childProcessReturned(['on']), instanceId: 1, invokeId: 2 },
      { ...childProcessInvoked(['stdout', 'on'], 'data'), instanceId: 1, invokeId: 3 },
      { ...functionConstructed(), instanceId: 4, sourceType: 'node/childProcess', sourceInstanceId: 1, sourceInvokeId: 3, sourceSite: [1] },
      { ...childProcessReturned(['stdout', 'on']), instanceId: 1, invokeId: 3 },
      { ...childProcessInvoked(['stderr', 'on'], 'data'), instanceId: 1, invokeId: 4 },
      { ...functionConstructed(), instanceId: 5, sourceType: 'node/childProcess', sourceInstanceId: 1, sourceInvokeId: 4, sourceSite: [1] },
      { ...childProcessReturned(['stderr', 'on']), instanceId: 1, invokeId: 4 },
      { ...functionInvoked(3), instanceId: 4, invokeId: 1 },
      { ...functionReturned(), instanceId: 4, invokeId: 1 },
      { ...functionInvoked(4), instanceId: 4, invokeId: 2 },
      { ...functionReturned(), instanceId: 4, invokeId: 2 },
      { ...functionInvoked(5), instanceId: 4, invokeId: 3 },
      { ...functionReturned(), instanceId: 4, invokeId: 3 }
    ])
  })
})


k.trio('childProcess/fail', (title, spec) => {
  test(title, async () => {
    const s = await spec(childProcess.spawnFail)
    const actual = await childProcess.increment(s.subject, 2)
    t.deepStrictEqual(actual, {
      result: [['stdout', 3], ['stderr', 4]],
      code: 1
    })

    await s.satisfy([
      { ...functionConstructed({ functionName: 'spawnFail' }), instanceId: 1 },
      { ...functionInvoked('increment', [2]), instanceId: 1, invokeId: 1 },
      { ...functionReturned(), instanceId: 1, invokeId: 1, returnType: 'node/childProcess', returnInstanceId: 1 },
      { ...childProcessConstructed(), instanceId: 1 },
      { ...childProcessInvoked(['on'], 'close'), instanceId: 1, invokeId: 1 },
      { ...functionConstructed(), instanceId: 2, sourceType: 'node/childProcess', sourceInstanceId: 1, sourceInvokeId: 1, sourceSite: [1] },
      { ...childProcessReturned(['on']), instanceId: 1, invokeId: 1 },
      { ...childProcessInvoked(['on'], 'error'), instanceId: 1, invokeId: 2 },
      { ...functionConstructed(), instanceId: 3, sourceType: 'node/childProcess', sourceInstanceId: 1, sourceInvokeId: 2, sourceSite: [1] },
      { ...childProcessReturned(['on']), instanceId: 1, invokeId: 2 },
      { ...childProcessInvoked(['stdout', 'on'], 'data'), instanceId: 1, invokeId: 3 },
      { ...functionConstructed(), instanceId: 4, sourceType: 'node/childProcess', sourceInstanceId: 1, sourceInvokeId: 3, sourceSite: [1] },
      { ...childProcessReturned(['stdout', 'on']), instanceId: 1, invokeId: 3 },
      { ...childProcessInvoked(['stderr', 'on'], 'data'), instanceId: 1, invokeId: 4 },
      { ...functionConstructed(), instanceId: 5, sourceType: 'node/childProcess', sourceInstanceId: 1, sourceInvokeId: 4, sourceSite: [1] },
      { ...childProcessReturned(['stderr', 'on']), instanceId: 1, invokeId: 4 },
      { ...functionInvoked(3), instanceId: 4, invokeId: 1 },
      { ...functionReturned(), instanceId: 4, invokeId: 1 },
      { ...functionInvoked(4), instanceId: 5, invokeId: 1 },
      { ...functionReturned(), instanceId: 5, invokeId: 1 },
      { ...functionInvoked(1), instanceId: 2, invokeId: 1 },
      { ...functionReturned(), instanceId: 2, invokeId: 1 }
    ])
  })
})
