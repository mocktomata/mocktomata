import a from 'assertron'
import axios from 'axios'
import { logLevels } from 'standard-log'
import { incubator } from '../index.js'
import { InvokeMetaMethodAfterSpec } from './errors.js'

afterAll(incubator.cleanup)

describe(`maskValue(string)`, () => {
  incubator('actual value is sent to the subject', { logLevel: logLevels.all }, (specName, spec, reporter) => {
    test(specName, async () => {
      spec.maskValue('secret')
      const s = await spec((value: string) => expect(value).toBe('secret'))
      s('secret')
      await spec.done()
      expect(reporter.getLogMessage()).not.toContain('secret')
    })
  })

  incubator.save('throws if called after spec', { logLevel: logLevels.all }, (specName, spec, reporter) => {
    test(specName, async () => {
      await spec(() => { })
      a.throws(() => spec.maskValue('secret'), InvokeMetaMethodAfterSpec)
    })
    expect(reporter.getLogMessage()).not.toContain('secret')
  })

  incubator('log (and spec record) does not contain masked value', { logLevel: logLevels.all }, (specName, spec, reporter) => {
    test(specName, async () => {
      spec.maskValue('secret')
      const s = await spec((v: string) => v)
      s('secret')
      await spec.done()
      // logLevels.all will print the spec record during `spec.done()`.
      // so checking the log message also checks for spec record
      expect(reporter.getLogMessage()).not.toContain('secret')
    })
  })

  incubator('invoke returns input value', { logLevel: logLevels.all }, (specName, spec, reporter) => {
    test(specName, async () => {
      // when the secret pass in as input and returned as is,
      // the value throws through the system unchanged.
      // so the result will still be the same secret
      spec.maskValue('secret')
      const s = await spec((v: string) => v)
      const actual = s('secret')
      expect(actual).toBe('secret')
      await spec.done()
      expect(reporter.getLogMessage()).not.toContain('secret')
    })
  })

  incubator.sequence('invoke returns new masked value during simulate', { logLevel: logLevels.all }, (specName, { save, simulate }, reporter) => {
    test(specName, async () => {
      // when the secret pass in as input and used to create a new return value,
      // the system can't track the relationship and save the delta in the spec record.
      // Therefore, the return value contains the masked value instead of the input value passing through.
      {
        save.maskValue('secret')
        const s = await save((v: string) => `some ${v}`)
        const actual = s('secret')
        expect(actual).toBe('some secret')
        await save.done()
        expect(reporter.getLogMessage()).not.toContain('secret')
      }
      {
        simulate.maskValue('secret')
        const s = await simulate((v: string) => `some ${v}`)
        const actual = s('secret')
        expect(actual).toBe('some [masked]')
        await simulate.done()
        expect(reporter.getLogMessage()).not.toContain('secret')
      }
    })
  })

  incubator.sequence('get returns masked value during simulate', { logLevel: logLevels.all }, (specName, { save, simulate }, reporter) => {
    test(specName, async () => {
      // the input object is serialized thus masked.
      // so the result received during simulation is also masked
      {
        save.maskValue('secret')
        const s = await save({ someProp: 'secret' })
        expect(s.someProp).toBe('secret')
        await save.done()
        expect(reporter.getLogMessage()).not.toContain('secret')
      }
      {
        simulate.maskValue('secret')
        const s = await simulate({ someProp: 'secret' })
        expect(s.someProp).toBe('[masked]')
        await simulate.done()
        expect(reporter.getLogMessage()).not.toContain('secret')
      }
    })
  })

  incubator.sequence('replace with custom value', { logLevel: logLevels.all }, (specName, { save, simulate }, reporter) => {
    test(specName, async () => {
      // the input object is serialized thus masked.
      // so the result received during simulation is also masked
      {
        save.maskValue('secret', 'bird')
        const s = await save({ someProp: 'secret' })
        expect(s.someProp).toBe('secret')
        await save.done()
        expect(reporter.getLogMessage()).not.toContain('secret')
      }
      {
        simulate.maskValue('secret', 'bird')
        const s = await simulate({ someProp: 'secret' })
        expect(s.someProp).toBe('bird')
        await simulate.done()
        expect(reporter.getLogMessage()).not.toContain('secret')
      }
    })
  })

  incubator.sequence('get returns new masked value during simulate', { logLevel: logLevels.all }, (specName, { save, simulate }, reporter) => {
    test(specName, async () => {
      {
        save.maskValue('secret')
        const s = await save({ someProp: 'secret', get s() { return `some ${this.someProp}` } })
        expect(s.s).toBe('some secret')
        await save.done()
        expect(reporter.getLogMessage()).not.toContain('secret')
      }
      {
        simulate.maskValue('secret')
        const s = await simulate({ someProp: 'secret', get s() { return `some ${this.someProp}` } })
        expect(s.s).toBe('some [masked]')
        await simulate.done()
        expect(reporter.getLogMessage()).not.toContain('secret')
      }
    })
  })

  incubator('invoke returns input in array gets original value', { logLevel: logLevels.all }, (specName, spec, reporter) => {
    test(specName, async () => {
      // Return value of a function is scanned and match against input.
      // therefore the original secret value can be pass through.
      spec.maskValue('secret')
      const s = await spec((v: string) => [v, 'world'])
      expect(s('secret')).toEqual(['secret', 'world'])
      await spec.done()
      expect(reporter.getLogMessage()).not.toContain('secret')
    })
  })

  incubator('invoke with array gets original value', { logLevel: logLevels.all }, (specName, spec, reporter) => {
    test(specName, async () => {
      // The outout gets value from input,
      // so the system can find the original reference,
      // thus able to return the original value
      spec.maskValue('secret')
      const s = await spec((v: string[]) => [v[1], v[0]])
      expect(s(['secret', 'world'])).toEqual(['world', 'secret'])
      await spec.done()
      expect(reporter.getLogMessage()).not.toContain('secret')
    })
  })

  incubator('invoke returning object gets original value', { logLevel: logLevels.all }, (specName, spec, reporter) => {
    test(specName, async () => {
      // Return value of a function is scanned and match against input.
      // therefore the original secret value can be pass through.
      spec.maskValue('secret')
      const s = await spec((value: string) => { return { value, b: 1 } })
      expect(s('secret')).toEqual({ value: 'secret', b: 1 })
      await spec.done()
      expect(reporter.getLogMessage()).not.toContain('secret')
    })
  })

  incubator('against object as input', { logLevel: logLevels.all }, (specName, spec, reporter) => {
    test(specName, async () => {
      // The outout gets value from input,
      // so the system can find the original reference,
      // thus able to return the original value
      spec.maskValue('secret')
      const s = await spec((v: Record<string, string>) => ({ value2: v.value }))
      expect(s({ value: 'secret' })).toEqual({ value2: 'secret' })
      await spec.done()
      expect(reporter.getLogMessage()).not.toContain('secret')
    })
  })

  incubator('against object containing null', { logLevel: logLevels.all }, (specName, spec, reporter) => {
    test(specName, async () => {
      spec.maskValue('secret')
      const s = await spec((value: string) => { return { value, b: null } })
      expect(s('secret')).toEqual({ value: 'secret', b: null })
      await spec.done()
      expect(reporter.getLogMessage()).not.toContain('secret')
    })
  })

  incubator.sequence('works with complex object (axios)', { logLevel: Infinity }, (specName, { save, simulate }, reporter) => {
    it(specName, async () => {
      {
        save.maskValue('secret')
        const s = await save(axios)
        const r = await s('http://postman-echo.com/get?foo=secret')
        expect(r.data.args).toEqual({ foo: 'secret' })
        const record = await save.done()

        expect(record.actions.length).toBeLessThan(20)
        expect(reporter.getLogMessage()).not.toContain('secret')
      }
      {
        simulate.maskValue('secret')
        const s = await simulate(axios)
        const r = await s('http://postman-echo.com/get?foo=secret')
        expect(r.data.args).toEqual({ foo: '[masked]' })
        const record = await simulate.done()

        expect(record.actions.length).toBeLessThan(20)
        expect(reporter.getLogMessage()).not.toContain('secret')
      }
    })
  })
})

describe(`maskValue(regex)`, () => {
  incubator.sequence('masks the matched value', { logLevel: logLevels.all }, (specName, { save, simulate }, reporter) => {
    test(specName, async () => {
      {
        save.maskValue(/secret/)
        const s = await save((v: string) => `some ${v}`)
        const actual = s('secret')
        expect(actual).toBe('some secret')
        await save.done()
        expect(reporter.getLogMessage()).not.toContain('secret')
      }
      {
        simulate.maskValue(/secret/)
        const s = await simulate((v: string) => `some ${v}`)
        const actual = s('secret')
        expect(actual).toBe('some [masked]')
        await simulate.done()
        expect(reporter.getLogMessage()).not.toContain('secret')
      }
    })
  })

  incubator.sequence('masks the matched value greedy', { logLevel: logLevels.all }, (specName, { save, simulate }, reporter) => {
    test(specName, async () => {
      {
        save.maskValue(/secret/g)
        const s = await save((v: string) => `some ${v} and ${v}`)
        const actual = s('secret')
        expect(actual).toBe('some secret and secret')
        await save.done()
        expect(reporter.getLogMessage()).not.toContain('secret')
      }
      {
        simulate.maskValue(/secret/)
        const s = await simulate((v: string) => `some ${v} and ${v}`)
        const actual = s('secret')
        expect(actual).toBe('some [masked] and [masked]')
        await simulate.done()
        expect(reporter.getLogMessage()).not.toContain('secret')
      }
    })
  })

  incubator.sequence('replace with custom value', { logLevel: logLevels.all }, (specName, { save, simulate }, reporter) => {
    test(specName, async () => {
      // the input object is serialized thus masked.
      // so the result received during simulation is also masked
      {
        save.maskValue(/secret/, 'bird')
        const s = await save({ someProp: 'secret' })
        expect(s.someProp).toBe('secret')
        await save.done()
        expect(reporter.getLogMessage()).not.toContain('secret')
      }
      {
        simulate.maskValue(/secret/, 'bird')
        const s = await simulate({ someProp: 'secret' })
        expect(s.someProp).toBe('bird')
        await simulate.done()
        expect(reporter.getLogMessage()).not.toContain('secret')
      }
    })
  })
})
