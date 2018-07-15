import { addAppender, logLevel, removeAppender } from '@unional/logging'
import t from 'assert'
import a, { AssertOrder } from 'assertron'
import { MemoryAppender } from 'aurelia-logging-memory'
import fs from 'fs'

import { artifact, MissingHandler, DuplicateHandler, config, scenario, defineStep } from '.'

import { resetStore } from './store'
import { ensureFileNotExists } from './testUtil'
import { log } from './log';
import { io } from './io';
import { KOMONDOR_FOLDER } from './constants';

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
    defineStep('create user {username}', async ({ spec }, username, server) => {
      const s = await spec(ApiGateway)
      const api = new s.subject(server.host)
      const user = await api.createUser(username)
      await s.done()
      return user
    })
    defineStep('delete user {username}', async ({ spec }, username, server) => {
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
    defineStep('passing setup arguments', ({ }, ...inputs) => {
      actual.push(...inputs)
    })
    await setup('passing setup arguments', 1, 2, 3)
    t.deepEqual(actual, [1, 2, 3])
  })

  test('can call same setup step twice', async () => {
    defineStep('setupTwice', async ({ spec }, expected) => {
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
    defineStep('setup template {id} {code}', ({ }, id, code, ...inputs) => {
      values.push(...inputs, id, code)
    })
    const { setup } = scenario('setup with template')
    await setup('setup template 123 abc', 'x')
    t.deepEqual(values, ['x', '123', 'abc'])
  })
  test('template can specify type', async () => {
    let values: any[] = []
    defineStep('setup templateWithType {id:number} {enable:boolean} {pi:float}', ({ }, id, enable, pi, ...inputs) => {
      values.push(...inputs, id, enable, pi)
    })
    const { setup } = scenario('setup with template')
    await setup('setup templateWithType 123 true 3.14', 'x')
    t.equal(values[0], 'x')
    t.strictEqual(values[1], 123)
    t.strictEqual(values[2], true)
    t.strictEqual(values[3], 3.14)
  })

  test('setup id is used as spec id', async () => {
    let result
    let id
    defineStep('setup spec - ensure server is up', async ({ spec }, host) => {
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
    t.equal(id, 'setup spec - ensure server is up')
  })

  test('scenario.save() will cause spec in onSetup to save', async () => {
    defineStep('simple saving setup', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    const { setup, done } = scenario.save('save setup scenario')
    await setup('simple saving setup')
    await done()

    const record = await io.readScenario('save setup scenario')
    t(record.setups.find(s => s.id === 'simple saving setup'))
  })

  test('scenario.save() will cause spec in setup template step to save', async () => {
    const specPath = `${KOMONDOR_FOLDER}/specs/save setup spec template scenario/1-save template saving setup 1.json`
    ensureFileNotExists(specPath)
    defineStep('save template saving setup {id}', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    const { setup, done } = scenario.save('save setup spec template scenario')
    await setup('save template saving setup 1')
    await done()

    const record = await io.readScenario('save setup spec template scenario')
    t(record.setups.find(s => s.id === 'save template saving setup 1'))
  })

  test('scenario.simulate() will cause spec in setup to simulate', async () => {
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
    await prepare.done()

    const { setup } = scenario.simulate('simulate spec scenario')
    await setup('simulate setup')

    o.end()
  })

  test('thrown setup will pass and emit warning', async () => {
    defineStep('throw step', () => { throw new Error('foo') })
    const { setup } = scenario.save('throwing setup will pass and emit warning')
    log.warn('ignore next message, it is testing setup throwing error')
    const m = new MemoryAppender()
    addAppender(m)

    await setup('throw step')

    const actual = m.logs[0]
    t.deepEqual(actual, {
      id: 'komondor', level: logLevel.warn, messages: [
        `scenario.save(throwing setup will pass and emit warning)
- setup(throw step) throws, is it safe to ignore?

Error: foo`
      ]
    })
    removeAppender(m)
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
    defineStep('passing run arguments', ({ }, ...inputs) => {
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
    defineStep('run template {id} {code}', ({ }, id, code, ...inputs) => {
      values.push(...inputs, id, code)
    })
    const { run } = scenario('run with template')
    await run('run template 123 abc', 'x')
    t.deepEqual(values, ['x', '123', 'abc'])
  })
  test('template can specify type', async () => {
    let values: any[] = []
    defineStep('run templateWithType {id:number} {enable:boolean} {pi:float}', ({ }, id, enable, pi, ...inputs) => {
      values.push(...inputs, id, enable, pi)
    })
    const { run } = scenario('run with template')
    await run('run templateWithType 123 true 3.14', 'x')
    t.equal(values[0], 'x')
    t.strictEqual(values[1], 123)
    t.strictEqual(values[2], true)
    t.strictEqual(values[3], 3.14)
  })

  test('run id is used as spec id', async () => {
    let result
    let id
    defineStep('run spec - ensure server is up', async ({ spec }, host) => {
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
    t.equal(id, 'run spec - ensure server is up')
  })
  test('scenario.save() will cause spec in run to save', async () => {
    defineStep('simple saving run', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    const { run, done } = scenario.save('save run spec')
    await run('simple saving run')
    await done()

    const record = await io.readScenario('save run spec')
    t(record.runs.find(s => s.id === 'simple saving run'))
  })

  test('scenario.save() will cause spec in template onrun to save', async () => {
    defineStep('save template saving run {id}', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    const { run, done } = scenario.save('save run spec template')
    await run('save template saving run 1')
    await done()

    const record = await io.readScenario('save run spec template')
    t(record.runs.find(s => s.id === 'save template saving run 1'))
  })

  test('scenario.simulate() will cause spec in run to simulate', async () => {
    const o = new AssertOrder(2)
    defineStep('simulate run', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      o.on(1, () => t.equal(s.mode, 'save'))
      o.on(2, () => t.equal(s.mode, 'simulate'))
      o.any([1, 2])
      await s.subject(0)
      await s.done()
    })
    const prepare = scenario.save('simulate run spec')

    await prepare.run('simulate run')
    await prepare.done()

    const { run } = scenario.simulate('simulate run spec')
    await run('simulate run')

    o.end()
  })

  test('sub step', async () => {
    ensureFileNotExists(`${KOMONDOR_FOLDER}/scenarios/sub step.json`)

    defineStep('run leaf step {step}', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })

    defineStep('run substep {step}', async ({ spec, runSubStep }, step) => {
      await runSubStep(`run leaf step ${step}`)
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    defineStep('run with substep {step}', async ({ spec, runSubStep }, step) => {
      await runSubStep(`run substep ${step}`)
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    const saveScenario = scenario.save('sub step')
    await saveScenario.run('run with substep 1')
    await saveScenario.teardown('run with substep 2')
    await saveScenario.done()

    const simScenario = scenario.simulate('sub step')
    await simScenario.run('run with substep 1')
    await simScenario.teardown('run with substep 2')
    await simScenario.done()
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
    t.equal(s.id, 'spec')
  })

  test('spec mode follows scenario mode', async () => {
    const liveScenario = scenario('spec-scenario')
    const liveSpec = await liveScenario.spec(() => Promise.resolve(true))
    t.equal(liveSpec.mode, 'live')

    const saveScenario = scenario.save('spec-scenario')
    const saveSpec = await saveScenario.spec(() => Promise.resolve(true))
    t.equal(saveSpec.mode, 'save')
    const s = await saveScenario.spec(() => Promise.resolve(true))
    await s.done()
    await saveScenario.done()

    const simScenario = scenario.simulate('spec-scenario')
    const simSpec = await simScenario.spec(() => Promise.resolve(true))
    t.equal(simSpec.mode, 'simulate')
    await simScenario.done()
  })

  test('custom spec id is used if specified', async () => {
    const scenarioName = 'custom spec id'
    const { spec, done } = scenario.save(scenarioName)
    const s = await spec('specId', () => Promise.resolve(true))
    await s.done()
    await done()

    const record = await io.readScenario(scenarioName)
    t(record.runs.find(s => s.id === 'specId'))
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
    defineStep('passing teardown arguments', ({ }, ...inputs) => {
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
    defineStep('teardown template {id} {code}', ({ }, id, code, ...inputs) => {
      values.push(...inputs, id, code)
    })
    const { teardown } = scenario('teardown with template')
    await teardown('teardown template 123 abc', 'x')
    t.deepEqual(values, ['x', '123', 'abc'])
  })

  test('template can specify type', async () => {
    let values: any[] = []
    defineStep('teardown templateWithType {id:number} {enable:boolean} {pi:float}', ({ }, id, enable, pi, ...inputs) => {
      values.push(...inputs, id, enable, pi)
    })
    const { teardown } = scenario('teardown with template')
    await teardown('teardown templateWithType 123 true 3.14', 'x')
    t.equal(values[0], 'x')
    t.strictEqual(values[1], 123)
    t.strictEqual(values[2], true)
    t.strictEqual(values[3], 3.14)
  })

  test('scenario.save() will cause teardown spec in handle() to save', async () => {
    defineStep('simple saving teardown', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    const { teardown, done } = scenario.save('save teardown spec')
    await teardown('simple saving teardown')
    await done()

    const record = await io.readScenario('save teardown spec')
    t(record.teardowns.find(s => s.id === 'simple saving teardown'))
  })

  test('scenario.save() will cause teardown spec in template handle() to save', async () => {
    defineStep('save template saving teardown {id}', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    const { teardown, done } = scenario.save('save teardown template step')
    await teardown('save template saving teardown 1')
    await done()

    const record = await io.readScenario('save teardown template step')
    t(record.teardowns.find(s => s.id === 'save template saving teardown 1'))
  })

  test('scenario.simulate() will cause teardown spec in handle to simulate', async () => {
    const scenarioName = 'simulate teardown spec scenario'
    ensureFileNotExists(`${KOMONDOR_FOLDER}/scenarios/${scenarioName}.json`)
    const o = new AssertOrder(2)
    defineStep('simulate teardown', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      o.on(1, () => t.equal(s.mode, 'save'))
      o.on(2, () => t.equal(s.mode, 'simulate'))
      o.any([1, 2])
      await s.subject(0)
      await s.done()
    })
    const prepare = scenario.save(scenarioName)

    await prepare.teardown('simulate teardown')
    await prepare.done()

    const { teardown } = scenario.simulate(scenarioName)
    await teardown('simulate teardown')

    o.end()
  })

  test('thrown teardown will pass and emit warning', async () => {
    defineStep('throw step2', () => { throw new Error('foo') })
    const { teardown } = scenario.save('throwing teardown will pass and emit warning')
    log.warn('ignore next message, it is testing teardown throwing error')
    const m = new MemoryAppender()
    addAppender(m)

    await teardown('throw step2')
    const actual = m.logs[0]
    t.deepEqual(actual, {
      id: 'komondor', level: logLevel.warn, messages: [
        `scenario.save(throwing teardown will pass and emit warning)
- teardown(throw step2) throws, is it safe to ignore?

Error: foo`
      ]
    })
    removeAppender(m)
  })
})

describe('done()', () => {
  test('always resolve in live mode', async () => {
    const filename = `${KOMONDOR_FOLDER}/scenarios/done live.json`
    ensureFileNotExists(filename)

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
    fs.existsSync(filename)
  })

  test('resolves after scenario saved', async () => {
    const filename = `${KOMONDOR_FOLDER}/scenarios/done save.json`
    ensureFileNotExists(filename)

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

    t(fs.existsSync(filename))
  })

  test('resolves after scenario simulated', async () => {
    const scenarioPath = `${KOMONDOR_FOLDER}/scenarios/done simulate.json`
    ensureFileNotExists(scenarioPath)

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
    const filename = `${KOMONDOR_FOLDER}/scenarios/runSubStep save scenario.json`
    ensureFileNotExists(filename)

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
    t(fs.existsSync(filename))

    const record = await io.readScenario('runSubStep save scenario')
    t(record.runs.find(s => s.id === 'subStep save 2'))
  })

  test('runSubStep (simulate)', async () => {
    const filename = `${KOMONDOR_FOLDER}/scenarios/runSubStep simulate scenario.json`
    ensureFileNotExists(filename)
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
      t(fs.existsSync(filename))
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
  test('do not invoke step with missing words', async () => {
    defineStep('create car {name} in {location}', async () => {
      return
    })

    const { run } = scenario('do not invoke step with missing words')
    await a.throws(run('create car model-3 in fremont street'), MissingHandler)
  })

  test('isDefined() returns false for not yet defined step', async () => {
    t.equal(defineStep.isDefined('not yet defined'), false)
  })

  test('isDefined() returns true for already defined step', async () => {
    defineStep('run test {name}', () => { return })
    t.equal(defineStep.isDefined('run test {name}'), true)
  })
})

describe('ensure()', () => {
  test('throws MissingHandler if no handler is defined', async () => {
    const { ensure } = scenario('no handler')
    const err = await a.throws(() => ensure('no ensure handler'), MissingHandler)
    t.equal(err.message, `Handler for 'no ensure handler' not found.`)
  })

  test('arguments are passed to ensure handler as inputs', async () => {
    const { ensure } = scenario('')
    const actual: any[] = []
    defineStep('passing ensure arguments', ({ }, ...inputs) => {
      actual.push(...inputs)
    })
    await ensure('passing ensure arguments', 1, 2, 3)
    t.deepEqual(actual, [1, 2, 3])
  })

  test('can call same ensure step twice', async () => {
    defineStep('ensureTwice', async ({ spec }, expected) => {
      const s = await spec(() => Promise.resolve(expected))
      const actual = await s.subject()

      t.equal(actual, expected)
      await s.done()
    });

    await (async () => {
      const { ensure, done } = scenario.save('call ensure twice')
      await ensure('ensureTwice', 0)
      await ensure('ensureTwice', 2)
      await done()
    })()

    const { ensure, done } = scenario.simulate('call ensure twice')
    await ensure('ensureTwice', 0)
    await ensure('ensureTwice', 2)
    await done()
  })

  test('template match result is passed to handler after input', async () => {
    let values: any[] = []
    defineStep('ensure template {id} {code}', ({ }, id, code, ...inputs) => {
      values.push(...inputs, id, code)
    })
    const { ensure } = scenario('ensure with template')
    await ensure('ensure template 123 abc', 'x')
    t.deepEqual(values, ['x', '123', 'abc'])
  })
  test('template can specify type', async () => {
    let values: any[] = []
    defineStep('ensure templateWithType {id:number} {enable:boolean} {pi:float}', ({ }, id, enable, pi, ...inputs) => {
      values.push(...inputs, id, enable, pi)
    })
    const { ensure } = scenario('ensure with template')
    await ensure('ensure templateWithType 123 true 3.14', 'x')
    t.equal(values[0], 'x')
    t.strictEqual(values[1], 123)
    t.strictEqual(values[2], true)
    t.strictEqual(values[3], 3.14)
  })

  test('ensure id is used as spec id', async () => {
    let result
    let id
    defineStep('ensure spec - ensure server is up', async ({ spec }, host) => {
      // spec() has no overload of spec(id, subject)
      const s = await spec(_ => Promise.resolve(true))
      id = s.id
      result = await s.subject(host)
      await s.done()
      return result
    })

    const { ensure } = scenario('ensure spec')
    const host = artifact('ensure host', '10.0.0.1')
    const actual = await ensure('ensure spec - ensure server is up', host)
    t.equal(result, true)
    t.equal(actual, true)
    t.equal(id, 'ensure spec - ensure server is up')
  })

  test('scenario.save() will cause spec in step to save', async () => {
    defineStep('simple saving ensure', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    const { ensure, done } = scenario.save('save ensure scenario')
    await ensure('simple saving ensure')
    await done()

    const record = await io.readScenario('save ensure scenario')
    t(record.ensures.find(s => s.id === 'simple saving ensure'))
  })

  test('scenario.save() will cause spec in ensure template step to save', async () => {
    const specPath = `${KOMONDOR_FOLDER}/specs/save ensure spec template scenario/1-save template saving ensure 1.json`
    ensureFileNotExists(specPath)
    defineStep('save template saving ensure {id}', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    const { ensure, done } = scenario.save('save ensure spec template scenario')
    await ensure('save template saving ensure 1')
    await done()

    const record = await io.readScenario('save ensure spec template scenario')
    t(record.ensures.find(s => s.id === 'save template saving ensure 1'))
  })

  test('scenario.simulate() will cause spec in ensure to simulate', async () => {
    const o = new AssertOrder(2)
    defineStep('simulate ensure', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      o.on(1, () => t.equal(s.mode, 'save'))
      o.on(2, () => t.equal(s.mode, 'simulate'))
      o.any([1, 2])
      await s.subject(0)
      await s.done()
    })
    const prepare = scenario.save('simulate ensure scenario')
    await prepare.ensure('simulate ensure')
    await prepare.done()

    const { ensure } = scenario.simulate('simulate ensure scenario')
    await ensure('simulate ensure')

    o.end()
  })

  test('thrown ensure will pass and emit warning', async () => {
    defineStep('throw step', () => { throw new Error('foo') })
    const { ensure } = scenario.save('throwing ensure will pass and emit warning')
    log.warn('ignore next message, it is testing ensure throwing error')
    const m = new MemoryAppender()
    addAppender(m)

    await ensure('throw step')

    t.equal(m.logs.length, 0)
    removeAppender(m)
  })
})
