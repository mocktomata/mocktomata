import a from 'assertron'
import axios from 'axios'
import { logLevels } from 'standard-log'
import { incubator } from '../index.js'
import { InvokeMetaMethodAfterSpec } from './errors.js'

describe('maskValue', () => {
  incubator('actual value is sent to the subject', { logLevel: logLevels.all }, (specName, spec, reporter) => {
    test(specName, async () => {
      spec.maskValue('secret')
      const s = await spec((value: string) => expect(value).toBe('secret'))
      s('secret')
      await spec.done()
      expect(reporter.getLogMessage()).not.toContain('secret')
    })
  })

  incubator.save('call after spec throws', { logLevel: logLevels.all }, (specName, spec, reporter) => {
    test(specName, async () => {
      await spec(() => { })
      a.throws(() => spec.maskValue('secret'), InvokeMetaMethodAfterSpec)
    })
    expect(reporter.getLogMessage()).not.toContain('secret')
  })

  incubator('not save masked value in log', { logLevel: logLevels.all }, (specName, spec, reporter) => {
    test(specName, async () => {
      spec.maskValue('secret')
      const s = await spec((v: string) => v)
      s('secret')
      await spec.done()
      expect(reporter.getLogMessage()).not.toContain('secret')
    })
  })

  incubator('invoke returns masked value', { logLevel: logLevels.all }, (specName, spec, reporter) => {
    test(specName, async () => {
      spec.maskValue('secret')
      const s = await spec((v: string) => v)
      const actual = s('secret')
      expect(actual).toBe('[masked]')
      await spec.done()
      expect(reporter.getLogMessage()).not.toContain('secret')
    })
  })

  incubator('get returns masked value', { logLevel: logLevels.all }, (specName, spec, reporter) => {
    test(specName, async () => {
      spec.maskValue('secret')
      const s = await spec({ someProp: 'secret' })
      expect(s.someProp).toBe('[masked]')
      await spec.done()
      expect(reporter.getLogMessage()).not.toContain('secret')
    })
  })

  incubator('against array', { logLevel: logLevels.all }, (specName, spec, reporter) => {
    test(specName, async () => {
      spec.maskValue('secret')
      const s = await spec((v: string) => [v, 'world'])
      expect(s('secret')).toEqual(['[masked]', 'world'])
      await spec.done()
      expect(reporter.getLogMessage()).not.toContain('secret')
    })
  })

  incubator('against object', { logLevel: logLevels.all }, (specName, spec, reporter) => {
    test(specName, async () => {
      spec.maskValue('secret')
      const s = await spec((value: string) => { return { value, b: 1 } })
      expect(s('secret')).toEqual({ value: '[masked]', b: 1 })
      await spec.done()
      expect(reporter.getLogMessage()).not.toContain('secret')
    })
  })

  incubator('against object containing null', { logLevel: logLevels.all }, (specName, spec, reporter) => {
    test(specName, async () => {
      spec.maskValue('secret')
      const s = await spec((value: string) => { return { value, b: null } })
      expect(s('secret')).toEqual({ value: '[masked]', b: null })
      await spec.done()
      expect(reporter.getLogMessage()).not.toContain('secret')
    })
  })

  incubator.save('works with complex object (axios)', { emitLog: true, logLevel: Infinity }, (specName, spec) => {
    it.skip(specName, async () => {
      spec.maskValue('secret')
      const s = await spec(axios.default)
      const r = await s('http://postman-echo.com/get?foo=secret')
      expect(r.data.args).toEqual({ foo: '[masked]' })
      const record = await spec.done()

      expect(record.actions.length).toBeLessThan(10)
    })
  })
})
