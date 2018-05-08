import t from 'assert'
import a, { AssertOrder } from 'assertron'
import fs from 'fs'

import { artifact, MissingHandler, DuplicateHandler, config, scenario, onFixture } from '.'
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
    onFixture('create user {username}', async ({ spec, inputs }, username) => {
      const server = inputs[0]
      const s = await spec(ApiGateway)
      const api = new s.subject(server.host)
      const user = await api.createUser(username)
      await s.done()
      return user
    })
    onFixture('delete user {username}', async ({ spec, inputs }, username) => {
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
    onFixture('passing setup arguments', ({ inputs }) => {
      actual.push(...inputs)
    })
    await setup('passing setup arguments', 1, 2, 3)
    t.deepEqual(actual, [1, 2, 3])
  })

  test('duplicate handler throws DuplicateHandler', async () => {
    onFixture('duplicate setup', () => { return })
    const err = await a.throws(() => onFixture('duplicate setup', () => { return }), DuplicateHandler)
    t.equal(err.message, `Handler for 'duplicate setup' is already defined.`)
  })

  test('regex matches handler', async () => {
    let input
    onFixture(/setup regexNoGroup \w*/, ({ inputs }) => {
      input = inputs[0]
    })
    const { setup } = scenario('setup with regex')
    await setup('setup regexNoGroup asurada-11', 'x')
    t.equal(input, 'x')
  })

  test('regex group result is passed to handler after input', async () => {
    let actual
    let input
    onFixture(/setup regex (\d+)/, ({ inputs }, value) => {
      input = inputs[0]
      actual = value
    })
    const { setup } = scenario('setup with regex')
    await setup('setup regex 123', 'x')
    t.equal(input, 'x')
    t.equal(actual, 123)
  })
  test('template match result is passed to handler after input', async () => {
    let values: any[] = []
    onFixture('setup template {id} {code}', ({ inputs }, id, code) => {
      values.push(...inputs, id, code)
    })
    const { setup } = scenario('setup with template')
    await setup('setup template 123 abc', 'x')
    t.deepEqual(values, ['x', '123', 'abc'])
  })
  test('template can specify type', async () => {
    let values: any[] = []
    onFixture('setup templateWithType {id:number} {enable:boolean} {pi:float}', ({ inputs }, id, enable, pi) => {
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
    onFixture('setup spec - ensure server is up', async ({ spec, inputs }) => {
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
    t.equal(id, 'setup spec/setup spec - ensure server is up')
  })
  test('scenario.save() will cause spec in onSetup to save', async () => {
    const specPath = `__komondor__/specs/save spec scenario/simple saving setup.json`
    ensureFileNotExists(specPath)
    onFixture('simple saving setup', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    const { setup } = scenario.save('save spec scenario')
    await setup('simple saving setup')

    t(fs.existsSync(specPath))
  })

  test('scenario.save() will cause spec in template onSetup to save', async () => {
    const specPath = `__komondor__/specs/save spec scenario/save template saving setup 1.json`
    ensureFileNotExists(specPath)
    onFixture('save template saving setup {id}', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    const { setup } = scenario.save('save spec scenario')
    await setup('save template saving setup 1')

    t(fs.existsSync(specPath))
  })

  test('scenario.save() will cause spec in regex onSetup to save', async () => {
    const specPath = `__komondor__/specs/save spec scenario/regex saving setup 1.json`
    ensureFileNotExists(specPath)
    onFixture(/regex saving setup \d+/, async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    const { setup } = scenario.save('save spec scenario')
    await setup('regex saving setup 1')

    t(fs.existsSync(specPath))
  })
  test('scenario.simulate() will cause spec in onSetup to simulate', async () => {
    const specPath = `__komondor__/specs/simulate spec scenario/simulate setup.json`
    ensureFileNotExists(specPath)
    const o = new AssertOrder(2)
    onFixture('simulate setup', async ({ spec }) => {

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

describe('spec()', () => {
  test('spec does not have spec.save and spec.simulate', async () => {
    const { spec } = scenario('spec without save and simulate')
    t.equal(spec['save'], undefined)
    t.equal(spec['simulate'], undefined)
  })

  test('spec id is optional', async () => {
    const { spec } = scenario('optional-spec-id')
    const s = await spec(() => Promise.resolve(true))
    t.equal(s.id, 'optional-spec-id/default')
  })

  test('actual spec id is `scenarioId/specId`', async () => {
    const { spec } = scenario('spec-scenario')
    const s = await spec('specId', () => Promise.resolve(true))
    t.equal(s.id, 'spec-scenario/specId')
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
    onFixture('passing teardown arguments', ({ inputs }) => {
      actual.push(...inputs)
    })
    await teardown('passing teardown arguments', 1, 2, 3)
    t.deepEqual(actual, [1, 2, 3])
  })

  test('duplicate handler throws DuplicateHandler', async () => {
    onFixture('duplicate teardown', () => { return })
    const err = await a.throws(() => onFixture('duplicate teardown', () => { return }), DuplicateHandler)
    t.equal(err.message, `Handler for 'duplicate teardown' is already defined.`)
  })

  test('regex matches handler', async () => {
    let input
    onFixture(/teardown regexNoGroup \w*/, ({ inputs }) => {
      input = inputs[0]
    })
    const { teardown } = scenario('teardown with regex')
    await teardown('teardown regexNoGroup asurada-11', 'x')
    t.equal(input, 'x')
  })

  test('regex group result is passed to handler after input', async () => {
    let actual
    let input
    onFixture(/teardown regex (\d+)/, ({ inputs }, value) => {
      input = inputs[0]
      actual = value
    })
    const { teardown } = scenario('teardown with regex')
    await teardown('teardown regex 123', 'x')
    t.equal(input, 'x')
    t.equal(actual, 123)
  })

  test('template match result is passed to handler after input', async () => {
    let values: any[] = []
    onFixture('teardown template {id} {code}', ({ inputs }, id, code) => {
      values.push(...inputs, id, code)
    })
    const { teardown } = scenario('teardown with template')
    await teardown('teardown template 123 abc', 'x')
    t.deepEqual(values, ['x', '123', 'abc'])
  })

  test('template can specify type', async () => {
    let values: any[] = []
    onFixture('teardown templateWithType {id:number} {enable:boolean} {pi:float}', ({ inputs }, id, enable, pi) => {
      values.push(...inputs, id, enable, pi)
    })
    const { teardown } = scenario('teardown with template')
    await teardown('teardown templateWithType 123 true 3.14', 'x')
    t.equal(values[0], 'x')
    t.strictEqual(values[1], 123)
    t.strictEqual(values[2], true)
    t.strictEqual(values[3], 3.14)
  })

  test('spec id in teardown is predefined to `scenarioId/teardownId` and not configurable', async () => {
    let result
    let id
    onFixture('teardown spec - ensure server is up', async ({ spec, inputs }) => {
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
    t.equal(id, 'teardown spec/teardown spec - ensure server is up')
  })
  test('scenario.save() will cause teardown spec in handle() to save', async () => {
    const specPath = `__komondor__/specs/save teardown spec scenario/simple saving teardown.json`
    ensureFileNotExists(specPath)
    onFixture('simple saving teardown', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    const { teardown } = scenario.save('save teardown spec scenario')
    await teardown('simple saving teardown')

    t(fs.existsSync(specPath))
  })

  test('scenario.save() will cause teardown spec in template handle() to save', async () => {
    const specPath = `__komondor__/specs/save teardown spec scenario/save template saving teardown 1.json`
    ensureFileNotExists(specPath)
    onFixture('save template saving teardown {id}', async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    const { setup } = scenario.save('save teardown spec scenario')
    await setup('save template saving teardown 1')

    t(fs.existsSync(specPath))
  })

  test('scenario.save() will cause teardown spec in regex handle() to save', async () => {
    const specPath = `__komondor__/specs/save teardown spec scenario/teardown regex saving 1.json`
    ensureFileNotExists(specPath)
    onFixture(/teardown regex saving \d+/, async ({ spec }) => {
      const s = await spec(_ => Promise.resolve(true))
      await s.subject(0)
      await s.done()
    })
    const { setup } = scenario.save('save teardown spec scenario')
    await setup('teardown regex saving 1')

    t(fs.existsSync(specPath))
  })

  test('scenario.simulate() will cause teardown spec in handle to simulate', async () => {
    const specPath = `__komondor__/specs/simulate teardown spec scenario/simulate teardown.json`
    ensureFileNotExists(specPath)
    const o = new AssertOrder(2)
    onFixture('simulate teardown', async ({ spec }) => {
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
    ensureFileNotExists(`__komondor__/scenarios/done live.json`)
    ensureFileNotExists(`__komondor__/specs/done live/setup done.json`)
    ensureFileNotExists(`__komondor__/specs/done live/default.json`)
    ensureFileNotExists(`__komondor__/specs/done live/teardown done.json`)

    const { setup, spec, teardown, done } = scenario('done live')
    onFixture('setup done', async ({ spec }) => {
      const s = await spec(() => Promise.resolve())
      await s.subject()
      await s.done()
    })
    onFixture('teardown done', async ({ spec }) => {
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

    t(!fs.existsSync(`__komondor__/scenarios/done live.json`))
    t(!fs.existsSync(`__komondor__/specs/done live/setup done.json`))
    t(!fs.existsSync(`__komondor__/specs/done live/default.json`))
    t(!fs.existsSync(`__komondor__/specs/done live/teardown done.json`))
  })

  test('resolves after scenario saved', async () => {
    ensureFileNotExists(`__komondor__/scenarios/done save.json`)
    ensureFileNotExists(`__komondor__/specs/done save/setup save done.json`)
    ensureFileNotExists(`__komondor__/specs/done save/default.json`)
    ensureFileNotExists(`__komondor__/specs/done save/teardown save done.json`)

    const { setup, spec, teardown, done } = scenario.save('done save')
    onFixture('setup save done', async ({ spec }) => {
      const s = await spec(() => Promise.resolve())
      await s.subject()
      await s.done()
    })
    onFixture('teardown save done', async ({ spec }) => {
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

    t(fs.existsSync(`__komondor__/scenarios/done save.json`))
    t(fs.existsSync(`__komondor__/specs/done save/setup save done.json`))
    t(fs.existsSync(`__komondor__/specs/done save/default.json`))
    t(fs.existsSync(`__komondor__/specs/done save/teardown save done.json`))
  })

  test('resolves after scenario simulated', async () => {
    const scenarioPath = `__komondor__/scenarios/done simulate.json`
    const setupPath = `__komondor__/specs/done simulate/setup simulate done.json`
    const specPath = `__komondor__/specs/done simulate/default.json`
    const teardownPath = `__komondor__/specs/done simulate/teardown simulate done.json`
    ensureFileNotExists(scenarioPath)
    ensureFileNotExists(setupPath)
    ensureFileNotExists(specPath)
    ensureFileNotExists(teardownPath)

    onFixture('setup simulate done', async ({ spec }) => {
      const s = await spec(() => Promise.resolve())
      await s.subject()
      await s.done()
    })
    onFixture('teardown simulate done', async ({ spec }) => {
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
