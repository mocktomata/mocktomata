import { a } from 'assertron'
import { createTestContext, createZucchini } from '../index.js'
import { DuplicateStep, MissingStep } from './errors.js'
import t from 'node:assert'

describe(`${createZucchini.name}()`, () => {
  const { context } = createTestContext()
  const { scenario, defineStep, defineParameterType } = createZucchini(context)
  afterAll(() => scenario.teardown())
  describe(`${scenario.name}`, () => {
    describe(`setup()`, () => {
      it('throws MissingStep if not defined', async () => {
        const { setup } = scenario('no handler')
        a.throws(() => setup('no setup handler'), MissingStep)
      })

      it('passes additional params to step', async () => {
        const { setup, done } = scenario('pass params')
        const actual: any[] = []
        defineStep('passing setup arguments', (_, ...inputs) => {
          actual.push(...inputs)
        })
        await setup('passing setup arguments', 1, 2, 3)
        t.deepStrictEqual(actual, [1, 2, 3])
        await done()
      })

      it('can call same setup step twice', async () => {
        defineStep('setupTwice', async ({ spec }, expected) => {
          const s = await spec(async () => expected)
          const actual = await s()

          t.strictEqual(actual, expected)
        })

        const save = scenario.save('call setup twice')
        await save.setup('setupTwice', 0)
        await save.setup('setupTwice', 2)
        await save.done()

        const sim = scenario.simulate('call setup twice')
        await sim.setup('setupTwice', 0)
        await sim.setup('setupTwice', 2)
        await sim.done()
      })

      it('passes template value to hander before additional params', async () => {
        const values: any[] = []
        defineStep('setup template {number} {word}', (_, id, code, ...inputs) => {
          values.push(id, code, ...inputs)
        })
        const { setup } = scenario('setup with template')
        await setup('setup template 123 abc', 'x')
        t.deepStrictEqual(values, [123, 'abc', 'x'])
      })

      it('passes clause to the context', async () => {
        defineStep('return clause {int}', async ({ clause }) => clause)

        const { setup } = scenario('passes clause to the context')

        const actual = await setup('return clause 234')
        t.strictEqual(actual, 'return clause 234')
      })
    })

    describe('spec()', () => {
      it('is working as expected', async () => {
        const save = scenario('increment')
        let s = await save.spec((x: number) => x + 1)
        expect(s(1)).toBe(2)
        expect(save.mode()).toEqual('save')
        await save.done()

        const simulate = scenario('increment')
        s = await simulate.spec((x: number) => x + 1)
        expect(s(1)).toBe(2)
        expect(simulate.mode()).toEqual('simulate')
        await simulate.done()
      })
    })

    describe('.live()', () => {
      it('can be called without option', () => {
        scenario.live('live with no options')
      })
    })

    describe('.save()', () => {
      it('can be called without option', () => {
        scenario.save('save with no options')
      })
    })

    describe('.simulate()', () => {
      it('can be called without option', () => {
        scenario.simulate('simulate with no options')
      })
    })
  })

  describe(`${defineStep.name}()`, () => {
    it('can be called multiple times with the same arguments', () => {
      const handler = () => { }
      defineStep('same handler', handler)
      defineStep('same handler', handler)
    })

    it('throws DuplicateStep if the step is defined twice', () => {
      defineStep('a', () => 1)
      a.throws(() => defineStep('a', () => 2), DuplicateStep)

      defineStep(/abc/, () => 3)
      a.throws(() => defineStep(/abc/, () => 4), DuplicateStep)
    })

    it('can define step with arguments', async () => {
      defineStep(`step with {}`, (_, arg) => arg + 1)

      const { run } = scenario('template with argument')
      const result = await run('step with 2')
      expect(result).toEqual(`21`)
    })

    it('can specify argument type as number', async () => {
      defineStep(`step arg as number {number}`, (_, arg) => arg + 1)

      const { run } = scenario('template with argument')
      const result = await run('step arg as number 2')
      expect(result).toEqual(3)
    })

    it('can specify argument type as float', async () => {
      defineStep(`step arg as float {float}`, (_, arg) => arg + 1)

      const { run } = scenario('template with argument')
      const result = await run('step arg as float 2.1')
      expect(result).toEqual(3.1)
    })

    it('can specify argument type as boolean', async () => {
      defineStep(`step arg as boolean {boolean}`, (_, arg) => arg)

      const { run } = scenario('template with argument')
      expect(await run('step arg as boolean true')).toEqual(true)
      expect(await run('step arg as boolean false')).toEqual(false)
    })

    it('works with multiple params template', async () => {
      const values: any[] = []
      defineStep(`two regex {word} {int} throws`, (_, a, b) => {
        values.push({ a, b })
      })
      const { setup } = scenario('setup with regex template')
      await setup('two regex b 123 throws')
      a.satisfies(values, [{ a: 'b', b: 123 }])
    })

    it('can specify clause as regex', async () => {
      defineStep(/clause in regex/, (_, arg) => arg + 1)

      const { run } = scenario('template with argument')
      const result = await run('clause in regex', 1)
      expect(result).toEqual(2)
    })
  })

  describe(`${defineParameterType.name}()`, () => {
    it('define enum and regex type', async () => {

      defineParameterType({
        name: 'method',
        regexp: /(GET|POST|PUT|DELETE)/,
      })
      defineParameterType({
        name: 'uri',
        regexp: /[\w./?=]*/
      })
      const mm: any[] = []
      defineStep(`{method} {uri} throws`, (_, method, uri) => {
        mm.push(method, uri)
      })

      const { setup } = scenario('define enum and regex type')

      await setup('GET some/url/1.0/resources?a=b throws')
      t.strictEqual(mm[0], 'GET')
      t.strictEqual(mm[1], 'some/url/1.0/resources?a=b')
    })
  })
})
