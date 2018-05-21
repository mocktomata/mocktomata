import t from 'assert'
import a, { AssertOrder } from 'assertron'
import fs from 'fs'

import { artifact, MissingHandler, DuplicateHandler, config, scenario, defineStep } from '.'
import { resetStore } from './store'
import { ensureFileNotExists } from './testUtil'

const users: any[] = []
class ApiGateway {
  constructor(public host: string) { }
  createUser(username: string) {
    return new Promise(a => {
      setImmediate(() => {
        const user = { username }
        users.push(user)
        a(user)
      })
    })
  }
  getUser(username: string) {
    return new Promise<any>(a => {
      setImmediate(() => {
        const user = users.find(u => u.username === username)
        a(user)
      })
    })
  }
  renameUser(oldUsername: string, newUsername: string) {
    return this.getUser(oldUsername)
      .then(user => {
        if (user) {
          user.username = newUsername
          return user
        }
        else {
          throw new Error('user not found')
        }
      })
  }
  deleteUser(username: string) {
    return new Promise<any>(a => {
      setImmediate(() => {
        const i = users.findIndex(u => u.username === username)
        if (i >= 0)
          users.splice(i, 1)
        a()
      })
    })
  }
}

describe('acceptance', () => {
  test('basic', async () => {
    defineStep('create user {username}', async ({ spec, inputs }, username) => {
      const server = inputs[0]
      const s = await spec(ApiGateway)
      const api = new s.subject(server.host)
      const user = await api.createUser(username)
      await s.done()
      return user
    })
    defineStep('delete user {username}', async ({ spec, inputs }, username) => {
      const server = inputs[0]
      const s = await spec(ApiGateway)
      const api = new s.subject(server.host)
      const user = await api.deleteUser(username)
      await s.done()
      return user
    })

    const { setup, spec, teardown, done } = scenario('rename user')
    const server = artifact('server', { host: '1.2.3.4' })

    await setup('create user unional', server)

    const s = await spec(ApiGateway)
    const api = new s.subject(server.host)

    await api.renameUser('unional', 'homa')
    const user = await api.getUser('homa')

    t.equal(user.username, 'homa')
    await s.done()

    await teardown('delete user homa', server)
    await done()
  })
})

describe('setup()', () => {
  test('throws MissingHandler if no handler is defined', async () => {
    const { setup } = scenario('no handler')
    const err = await a.throws(() => setup('no setup handler'), MissingHandler)
    t.equal(err.message, `Handler for 'no setup handler' not found.`)
  })

  test('arguments are passed to setup handler as inputs', async () => {
    const { setup } = scenario('')
    const actual: any[] = []
    defineStep('passing setup arguments', ({ inputs }) => {
      actual.push(...inputs)
    })
    await setup('passing setup arguments', 1, 2, 3)
    t.deepEqual(actual, [1, 2, 3])
  })

  test('can call same setup step twice', async () => {
    defineStep('setupTwice', async ({ spec, inputs }) => {
      const expected = inputs[0]
      const s = await spec(() => Promise.resolve(expected))
      const actual = await s.subject()

      t.equal(actual, expected)
      await s.done()
    });

    await (async () => {
      const { setup, done } = scenario.save('call setup twice')
      await setup('setupTwice', 0)
      await setup('setupTwice', 2)
      await done()
    })()

    const { setup, done } = scenario.simulate('call setup twice')
    await setup('setupTwice', 0)
    await setup('setupTwice', 2)
    await done()
  })

  test('template match result is passed to handler after input', async () => {
    let values: any[] = []
    defineStep('setup template {id} {code}', ({ inputs }, id, code) => {
      values.push(...inputs, id, code)
    })
    const { setup } = scenario('setup with template')
    await setup('setup template 123 abc', 'x')
    t.deepEqual(values, ['x', '123', 'abc'])
  })
  test('template can specify type', async () => {
    let values: any[] = []
    defineStep('setup templateWithType {id:number} {enable:boolean} {pi:float}', ({ inputs }, id, enable, pi) => {
      values.push(...inputs, id, enable, pi)
    })
    const { setup } = scenario('setup with template')
    await setup('setup templateWithType 123 true 3.14', 'x')
    t.equal(values[0], 'x')
    t.strictEqual(values[1], 123)
    t.strictEqual(values[2], true)
    t.strictEqual(values[3], 3.14)
  })

  test('spec id in setup is predefined to `scenario/setup` and not configurable', async () => {
    let result
    let id
    defineStep('setup spec - ensure server is up', async ({ spec, inputs }) => {
      const host = inputs[0]

      // spec() has no overload of spec(id, subject)
      const s = await spec(_ => Promise.resolve(true))
      id = s.id
      result = await s.subject(host)
      await s.done()
      return result
    })

    const { setup } = scenario('setup spec')
    const host = artifact('setup host', '10.0.0.1')
    const actual = await setup('setup spec - ensure server is up', host)
    t.equal(result, true)
    t.equal(actual, true)
    t.equal(id, 'setup spec/1-setup spec - ensure server is up')
  })
  test('scenario.save() will cause spec in onSetup to save', async () => {
    const specPath = `__komondor__/specs/save spec scenario/1-simple saving setup.json`
    ensureFileNotExists(specPath)
    defineStep('simple saving setup', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    const { setup } = scenario.save('save spec scenario')
    await setup('simple saving setup')

    t(fs.existsSync(specPath))
  })

  test('scenario.save() will cause spec in template onSetup to save', async () => {
    const specPath = `__komondor__/specs/save setup spec template scenario/1-save template saving setup 1.json`
    ensureFileNotExists(specPath)
    defineStep('save template saving setup {id}', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    const { setup } = scenario.save('save setup spec template scenario')
    await setup('save template saving setup 1')

    t(fs.existsSync(specPath))
  })

  test('scenario.simulate() will cause spec in onSetup to simulate', async () => {
    const specPath = `__komondor__/specs/simulate spec scenario/1-simulate setup.json`
    ensureFileNotExists(specPath)
    const o = new AssertOrder(2)
    defineStep('simulate setup', async ({ spec }) => {

      const s = await spec(_ => Promise.resolve(true))
      o.on(1, () => t.equal(s.mode, 'save'))
      o.on(2, () => t.equal(s.mode, 'simulate'))
      o.any([1, 2])
      await s.subject(0)
      await s.done()
    })
    const prepare = scenario.save('simulate spec scenario')

    await prepare.setup('simulate setup')
    t(fs.existsSync(specPath))

    const { setup } = scenario.simulate('simulate spec scenario')
    await setup('simulate setup')

    o.end()
  })
})

describe('run()', () => {
  test('throws MissingHandler if no handler is defined', async () => {
    const { run } = scenario('no handler')
    const err = await a.throws(() => run('no run handler'), MissingHandler)
    t.equal(err.message, `Handler for 'no run handler' not found.`)
  })

  test('arguments are passed to run handler as inputs', async () => {
    const { run } = scenario('')
    const actual: any[] = []
    defineStep('passing run arguments', ({ inputs }) => {
      actual.push(...inputs)
    })
    await run('passing run arguments', 1, 2, 3)
    t.deepEqual(actual, [1, 2, 3])
  })

  test('duplicate handler throws DuplicateHandler', async () => {
    defineStep('duplicate run', () => { return })
    const err = await a.throws(() => defineStep('duplicate run', () => { return }), DuplicateHandler)
    t.equal(err.message, `Handler for 'duplicate run' is already defined.`)
  })

  test('template match result is passed to handler after input', async () => {
    let values: any[] = []
    defineStep('run template {id} {code}', ({ inputs }, id, code) => {
      values.push(...inputs, id, code)
    })
    const { run } = scenario('run with template')
    await run('run template 123 abc', 'x')
    t.deepEqual(values, ['x', '123', 'abc'])
  })
  test('template can specify type', async () => {
    let values: any[] = []
    defineStep('run templateWithType {id:number} {enable:boolean} {pi:float}', ({ inputs }, id, enable, pi) => {
      values.push(...inputs, id, enable, pi)
    })
    const { run } = scenario('run with template')
    await run('run templateWithType 123 true 3.14', 'x')
    t.equal(values[0], 'x')
    t.strictEqual(values[1], 123)
    t.strictEqual(values[2], true)
    t.strictEqual(values[3], 3.14)
  })

  test('spec id in run is predefined to `scenario/run` and not configurable', async () => {
    let result
    let id
    defineStep('run spec - ensure server is up', async ({ spec, inputs }) => {
      const host = inputs[0]

      // spec() has no overload of spec(id, subject)
      const s = await spec(_ => Promise.resolve(true))
      id = s.id
      result = await s.subject(host)
      await s.done()
      return result
    })

    const { run } = scenario('run spec')
    const host = artifact('run host', '10.0.0.1')
    const actual = await run('run spec - ensure server is up', host)
    t.equal(result, true)
    t.equal(actual, true)
    t.equal(id, 'run spec/1-run spec - ensure server is up')
  })
  test('scenario.save() will cause spec in onrun to save', async () => {
    const specPath = `__komondor__/specs/save spec scenario/1-simple saving run.json`
    ensureFileNotExists(specPath)
    defineStep('simple saving run', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    const { run } = scenario.save('save spec scenario')
    await run('simple saving run')

    t(fs.existsSync(specPath))
  })

  test('scenario.save() will cause spec in template onrun to save', async () => {
    const specPath = `__komondor__/specs/save run spec template scenario/1-save template saving run 1.json`
    ensureFileNotExists(specPath)
    defineStep('save template saving run {id}', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    const { run } = scenario.save('save run spec template scenario')
    await run('save template saving run 1')

    t(fs.existsSync(specPath))
  })

  test('scenario.simulate() will cause spec in onrun to simulate', async () => {
    const specPath = `__komondor__/specs/simulate run spec scenario/1-simulate run.json`
    ensureFileNotExists(specPath)
    const o = new AssertOrder(2)
    defineStep('simulate run', async ({ spec }) => {

      const s = await spec(_ => Promise.resolve(true))
      o.on(1, () => t.equal(s.mode, 'save'))
      o.on(2, () => t.equal(s.mode, 'simulate'))
      o.any([1, 2])
      await s.subject(0)
      await s.done()
    })
    const prepare = scenario.save('simulate run spec scenario')

    await prepare.run('simulate run')
    t(fs.existsSync(specPath))

    const { run } = scenario.simulate('simulate run spec scenario')
    await run('simulate run')

    o.end()
  })
})

describe('spec()', () => {
  test('spec does not have spec.save and spec.simulate', async () => {
    const { spec } = scenario('spec without save and simulate')
    t.equal(spec['save'], undefined)
    t.equal(spec['simulate'], undefined)
  })

  test('spec id is optional', async () => {
    const { spec } = scenario('optional-spec-id')
    const s = await spec(() => Promise.resolve(true))
    t.equal(s.id, 'optional-spec-id/1-spec')
  })

  test('actual spec id is `scenarioId/1-specId`', async () => {
    const { spec } = scenario('spec-scenario')
    const s = await spec('specId', () => Promise.resolve(true))
    t.equal(s.id, 'spec-scenario/1-specId')
  })

  test('spec runs in live mode', async () => {
    const { spec } = scenario('spec-scenario')
    const s = await spec('specId', () => Promise.resolve(true))

    t.equal(s.mode, 'live')
    const actual = await s.subject()
    t.equal(actual, true)
    await s.done()
  })

  test('scenario.save causes spec to run in save mode', async () => {
    const { spec } = scenario.save('spec-scenario')
    const s = await spec('specId', () => Promise.resolve(true))

    t.equal(s.mode, 'save')
    const actual = await s.subject()
    t.equal(actual, true)
    await s.done()
  })

  test('scenario.simulate causes spec to run in simulate mode', async () => {
    const { spec } = scenario.simulate('spec-scenario')
    const s = await spec('specId', () => Promise.resolve(true))

    t.equal(s.mode, 'simulate')
  })
})

describe('teardown()', () => {
  test('throws MissingHandler if no handler is defined', async () => {
    const { teardown } = scenario('no teardown handler')
    const err = await a.throws(() => teardown('no teardown handler'), MissingHandler)
    t.equal(err.message, `Handler for 'no teardown handler' not found.`)
  })
  test('arguments are passed to teardown handler as inputs', async () => {
    const { teardown } = scenario('')
    const actual: any[] = []
    defineStep('passing teardown arguments', ({ inputs }) => {
      actual.push(...inputs)
    })
    await teardown('passing teardown arguments', 1, 2, 3)
    t.deepEqual(actual, [1, 2, 3])
  })

  test('duplicate handler throws DuplicateHandler', async () => {
    defineStep('duplicate teardown', () => { return })
    const err = await a.throws(() => defineStep('duplicate teardown', () => { return }), DuplicateHandler)
    t.equal(err.message, `Handler for 'duplicate teardown' is already defined.`)
  })

  test('template match result is passed to handler after input', async () => {
    let values: any[] = []
    defineStep('teardown template {id} {code}', ({ inputs }, id, code) => {
      values.push(...inputs, id, code)
    })
    const { teardown } = scenario('teardown with template')
    await teardown('teardown template 123 abc', 'x')
    t.deepEqual(values, ['x', '123', 'abc'])
  })

  test('template can specify type', async () => {
    let values: any[] = []
    defineStep('teardown templateWithType {id:number} {enable:boolean} {pi:float}', ({ inputs }, id, enable, pi) => {
      values.push(...inputs, id, enable, pi)
    })
    const { teardown } = scenario('teardown with template')
    await teardown('teardown templateWithType 123 true 3.14', 'x')
    t.equal(values[0], 'x')
    t.strictEqual(values[1], 123)
    t.strictEqual(values[2], true)
    t.strictEqual(values[3], 3.14)
  })

  test('spec id in teardown is predefined to `scenarioId/n-teardownId` and not configurable', async () => {
    let result
    let id
    defineStep('teardown spec - ensure server is up', async ({ spec, inputs }) => {
      const host = inputs[0]

      // spec() has no overload of spec(id, subject)
      const s = await spec(_ => Promise.resolve(true))
      id = s.id
      result = await s.subject(host)
      await s.done()
      return result
    })

    const { teardown } = scenario('teardown spec')
    const host = artifact('teardown host', '10.0.0.1')
    const actual = await teardown('teardown spec - ensure server is up', host)
    t.equal(result, true)
    t.equal(actual, true)
    t.equal(id, 'teardown spec/1-teardown spec - ensure server is up')
  })
  test('scenario.save() will cause teardown spec in handle() to save', async () => {
    const specPath = `__komondor__/specs/save teardown spec scenario/1-simple saving teardown.json`
    ensureFileNotExists(specPath)
    defineStep('simple saving teardown', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    const { teardown } = scenario.save('save teardown spec scenario')
    await teardown('simple saving teardown')

    t(fs.existsSync(specPath))
  })

  test('scenario.save() will cause teardown spec in template handle() to save', async () => {
    const specPath = `__komondor__/specs/save teardown spec scenario/1-save template saving teardown 1.json`
    ensureFileNotExists(specPath)
    defineStep('save template saving teardown {id}', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    const { setup } = scenario.save('save teardown spec scenario')
    await setup('save template saving teardown 1')

    t(fs.existsSync(specPath))
  })

  test('scenario.simulate() will cause teardown spec in handle to simulate', async () => {
    const specPath = `__komondor__/specs/simulate teardown spec scenario/1-simulate teardown.json`
    ensureFileNotExists(specPath)
    const o = new AssertOrder(2)
    defineStep('simulate teardown', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      o.on(1, () => t.equal(s.mode, 'save'))
      o.on(2, () => t.equal(s.mode, 'simulate'))
      o.any([1, 2])
      await s.subject(0)
      await s.done()
    })
    const prepare = scenario.save('simulate teardown spec scenario')

    await prepare.teardown('simulate teardown')
    t(fs.existsSync(specPath))

    const { teardown } = scenario.simulate('simulate teardown spec scenario')
    await teardown('simulate teardown')

    o.end()
  })
})

describe('done()', () => {
  test('always resolve in live mode', async () => {
    const files = [`__komondor__/scenarios/done live.json`,
      `__komondor__/specs/done live/1-setup done.json`,
      `__komondor__/specs/done live/2-default.json`,
      `__komondor__/specs/done live/3-teardown done.json`]

    files.forEach(ensureFileNotExists)

    const { setup, spec, teardown, done } = scenario('done live')
    defineStep('setup done', async ({ spec }) => {
      const s = await spec(() => Promise.resolve())
      await s.subject()
      await s.done()
    })
    defineStep('teardown done', async ({ spec }) => {
      const s = await spec(() => Promise.resolve())
      await s.subject()
      await s.done()
    })

    await setup('setup done')
    const s = await spec(() => Promise.resolve())

    await s.subject()
    await s.done()

    await teardown('teardown done')
    await a.resolves(done())

    files.forEach(f => t(!fs.existsSync(f)))
  })

  test('resolves after scenario saved', async () => {
    const files = [`__komondor__/scenarios/done save.json`,
      `__komondor__/specs/done save/1-setup save done.json`,
      `__komondor__/specs/done save/2-spec.json`,
      `__komondor__/specs/done save/3-teardown save done.json`]

    files.forEach(ensureFileNotExists)

    const { setup, spec, teardown, done } = scenario.save('done save')
    defineStep('setup save done', async ({ spec }) => {
      const s = await spec(() => Promise.resolve())
      await s.subject()
      await s.done()
    })
    defineStep('teardown save done', async ({ spec }) => {
      const s = await spec(() => Promise.resolve())
      await s.subject()
      await s.done()
    })

    await setup('setup save done')
    const s = await spec(() => Promise.resolve())

    await s.subject()
    await s.done()

    await teardown('teardown save done')
    await a.resolves(done())

    files.forEach(f => t(fs.existsSync(f)))
  })

  test('resolves after scenario simulated', async () => {
    const scenarioPath = `__komondor__/scenarios/done simulate.json`
    const setupPath = `__komondor__/specs/done simulate/1-setup simulate done.json`
    const specPath = `__komondor__/specs/done simulate/2-spec.json`
    const teardownPath = `__komondor__/specs/done simulate/3-teardown simulate done.json`
    ensureFileNotExists(scenarioPath)
    ensureFileNotExists(setupPath)
    ensureFileNotExists(specPath)
    ensureFileNotExists(teardownPath)

    defineStep('setup simulate done', async ({ spec }) => {
      const s = await spec(() => Promise.resolve())
      await s.subject()
      await s.done()
    })
    defineStep('teardown simulate done', async ({ spec }) => {
      const s = await spec(() => Promise.resolve())
      await s.subject()
      await s.done()
    })

    async function prepare() {
      const { setup, spec, teardown, done } = scenario.save('done simulate')

      await setup('setup simulate done')
      const s = await spec(() => Promise.resolve())

      await s.subject()
      await s.done()

      await teardown('teardown simulate done')
      await a.resolves(done())

      t(fs.existsSync(scenarioPath))
      t(fs.existsSync(setupPath))
      t(fs.existsSync(specPath))
      t(fs.existsSync(teardownPath))
    }
    await prepare()
    const { setup, spec, teardown, done } = scenario.simulate('done simulate')
    await setup('setup simulate done')
    const s = await spec(() => Promise.resolve())

    await s.subject()
    await s.done()

    await teardown('teardown simulate done')
    await a.resolves(done())
  })
})

describe('config.scenario()', () => {
  test('force simulate to live with string', () => {
    resetStore()
    config.scenario('live', 'override to live')
    const s = scenario.simulate('override to live')
    t.equal(s.mode, 'live')
  })

  test('force simulate to live with regex', () => {
    resetStore()
    config.scenario('live', /override/)
    const s = scenario.simulate('override to live')
    t.equal(s.mode, 'live')
  })

  test('force simulate to save with string', () => {
    resetStore()
    config.scenario('save', 'override to save')
    const s = scenario.simulate('override to save')
    t.equal(s.mode, 'save')
  })

  test('force simulate to save with regex', () => {
    resetStore()
    config.scenario('save', /override/)
    const s = scenario.simulate('override to save')
    t.equal(s.mode, 'save')
  })
})

describe('defineStep()', () => {
  test('duplicate handler throws DuplicateHandler', async () => {
    defineStep('duplicate setup', () => { return })
    const err = await a.throws(() => defineStep('duplicate setup', () => { return }), DuplicateHandler)
    t.equal(err.message, `Handler for 'duplicate setup' is already defined.`)
  })

  test('calling multiple times with same handler is ok', async () => {
    const handler = () => { return }
    defineStep('same handler', handler)
    defineStep('same handler', handler)
  })

  test('runSubStep (live)', async () => {
    let subStepCalled = false
    defineStep('subStep live 1', async ({ spec }) => {
      const s = await spec(() => Promise.resolve())
      await s.subject()
      await s.done()
      subStepCalled = true
    })
    defineStep('runSubStep live', async ({ runSubStep }) => {
      await runSubStep('subStep live 1')
    })

    const s = scenario('runSubStep live scenario')
    await s.run('runSubStep live')
    await s.done()

    t(subStepCalled)
  })
  test('runSubStep saves scenario with specs containing step chain', async () => {
    const files = [
      `__komondor__/scenarios/runSubStep save scenario.json`,
      `__komondor__/specs/runSubStep save scenario/1-subStep save 2.json`
    ]
    files.forEach(ensureFileNotExists)
    let subStepCalled = false
    defineStep('subStep save 2', async ({ spec }) => {
      const s = await spec(() => Promise.resolve())
      await s.subject()
      await s.done()
      subStepCalled = true
    })

    defineStep('subStep save 1', async ({ runSubStep }) => {
      await runSubStep('subStep save 2')
    })
    defineStep('runSubStep save', async ({ runSubStep }) => {
      await runSubStep('subStep save 1')
    })

    const s = scenario.save('runSubStep save scenario')
    await s.run('runSubStep save')
    await s.done()

    t(subStepCalled)
    files.forEach(f => t(fs.existsSync(f)))

    const scenarioJson = JSON.parse(fs.readFileSync(files[0], 'utf-8'))
    t.equal(scenarioJson.specs[0], '1-subStep save 2')
  })

  test('runSubStep (simulate)', async () => {
    const files = [
      `__komondor__/scenarios/runSubStep simulate scenario.json`,
      `__komondor__/specs/runSubStep simulate scenario/1-subStep simulate 1.json`
    ]
    files.forEach(ensureFileNotExists)
    defineStep('subStep simulate 1', async ({ spec }) => {
      const s = await spec(() => Promise.resolve())
      await s.subject()
      await s.done()
    })
    defineStep('runSubStep simulate', async ({ runSubStep }) => {
      await runSubStep('subStep simulate 1')
    })

    async function prepare() {
      const s = scenario.save('runSubStep simulate scenario')
      await s.run('runSubStep simulate')
      await s.done()

      files.forEach(f => t(fs.existsSync(f)))
    }
    await prepare()

    const s = scenario.simulate('runSubStep simulate scenario')
    await s.run('runSubStep simulate')
    await s.done()
  })

  test(`supports '-' in template`, async () => {
    let actual
    defineStep('templateWithDash {id}', (_, id) => {
      actual = id
    })

    const { setup } = scenario('template with dash')
    await setup('templateWithDash a-b-c')

    t.equal(actual, 'a-b-c')
  })
})
