import { a } from 'assertron'
import { logLevels } from 'standard-log'
import { createTestIO } from '../index.js'
import { ConfigPropertyInvalid, createConfigurator, loadConfig } from './index.js'

describe(`${loadConfig.name}()`, () => {
  function testLoadConfig(options?: createTestIO.Options) {
    const io = createTestIO(options)
    const configurator = createConfigurator()
    return loadConfig({ io, configurator })
  }
  describe(`logLevel`, () => {
    it('gets undefined when not configured', async () => {
      const result = await testLoadConfig()

      a.satisfies(result, { config: { logLevel: undefined } })
    })

    it('gets value from log level name', async () => {
      const result = await testLoadConfig({
        config: {
          logLevel: 'debug'
        }
      })

      a.satisfies(result, { config: { logLevel: logLevels.debug } })
    })

    it('gets value from log level number', async () => {
      const result = await testLoadConfig({
        config: {
          logLevel: 321
        }
      })

      a.satisfies(result, { config: { logLevel: 321 } })
    })

    it('throws when value is negative number', async () => {
      await a.throws(testLoadConfig({
        config: {
          logLevel: -123
        }
      }), ConfigPropertyInvalid)
    })

    it('throws when value is not string or number', async () => {
      await a.throws(testLoadConfig({
        config: {
          logLevel: true as any
        }
      }), ConfigPropertyInvalid)
    })

    it('throws when value is invalid', async () => {
      await a.throws(() => testLoadConfig({
        config: {
          logLevel: 'unknown' as any
        }
      }), ConfigPropertyInvalid)
    })

    // it('throws when value from file and env are not the same', () => {
    //   a.throws(() => loadConfig({
    //     configInput: {
    //       filePath: 'mocktomata.json',
    //       file: {
    //         logLevel: 'debug'
    //       },
    //       env: {
    //         MOCKTOMATA_LOG: 'info'
    //       }
    //     }
    //   }), ConfigPropertyMismatch)
    // })
  })
  describe(`ecmaVersion`, () => {
    it('gets "es2015" when not configured', async () => {
      const result = await testLoadConfig()

      a.satisfies(result, { config: { ecmaVersion: 'es2015' } })
    })

    it('gets value from file', async () => {
      const result = await testLoadConfig({
        config: {
          ecmaVersion: 'es2015'
        }
      })

      a.satisfies(result, { config: { ecmaVersion: 'es2015' } })
    })

    it('throws when value is not string', async () => {
      await a.throws(testLoadConfig({
        config: {
          ecmaVersion: 2015 as any
        }
      }), ConfigPropertyInvalid)
    })

    it('throws when value is invalid', async () => {
      await a.throws(testLoadConfig({
        config: {
          ecmaVersion: 'unknown' as any
        }
      }), ConfigPropertyInvalid)
    })
  })

  describe(`plugins`, () => {
    it('returns empty array if not configured', async () => {
      const result = await testLoadConfig()
      expect(result.config.plugins).toEqual([])
    })

    it('gets value from file', async () => {
      const result = await testLoadConfig({
        config: {
          plugins: ['plugin-a', 'plugin-b']
        }
      })
      expect(result.config.plugins).toEqual(['plugin-a', 'plugin-b'])
    })

    it('throws if not an array', async () => {
      await a.throws(testLoadConfig({
        config: {
          plugins: 123 as any
        }
      }), ConfigPropertyInvalid)
    })
  })


  describe(`filePathFilter`, () => {
    it('gets undefined when not configured', async () => {
      const result = await testLoadConfig()

      a.satisfies(result, { config: { filePathFilter: undefined } })
    })

    it('gets undefined if config with empty string', async () => {
      const result = await testLoadConfig({
        config: {
          specNameFilter: ''
        }
      })

      a.satisfies(result, { config: { specNameFilter: undefined } })
    })

    it('gets value', async () => {
      const result = await testLoadConfig({
        config: {
          filePathFilter: 'abc'
        }
      })

      a.satisfies(result, { config: { filePathFilter: /abc/ } })
    })

    it('throws when value is not string', async () => {
      await a.throws(testLoadConfig({
        config: {
          filePathFilter: 123 as any
        }
      }), ConfigPropertyInvalid)
    })
  })

  describe(`specNameFilter`, () => {
    it('gets undefined when not configured', async () => {
      const result = await testLoadConfig()

      a.satisfies(result, { config: { specNameFilter: undefined } })
    })

    it('gets undefined if config with empty string', async () => {
      const result = await testLoadConfig({
        config: {
          specNameFilter: ''
        }
      })

      a.satisfies(result, { config: { specNameFilter: undefined } })
    })

    it('gets value', async () => {
      const result = await testLoadConfig({
        config: {
          specNameFilter: 'abc'
        }
      })

      a.satisfies(result, { config: { specNameFilter: /abc/ } })
    })

    it('throws when value is not string', async () => {
      await a.throws(testLoadConfig({
        config: {
          specNameFilter: 123 as any
        }
      }), ConfigPropertyInvalid)
    })
  })

  describe(`overrideMode`, () => {
    it('gets undefined when not configured', async () => {
      const result = await testLoadConfig()

      a.satisfies(result, { config: { overrideMode: undefined } })
    })

    it('gets undefined if config with empty string', async () => {
      const result = await testLoadConfig({
        config: {
          overrideMode: '' as any
        }
      })

      a.satisfies(result, { config: { overrideMode: undefined } })
    })

    it('gets value', async () => {
      const result = await testLoadConfig({
        config: {
          overrideMode: 'save'
        }
      })

      a.satisfies(result, { config: { overrideMode: 'save' } })
    })

    it('throws when value is not string', async () => {
      await a.throws(testLoadConfig({
        config: {
          overrideMode: 123 as any
        }
      }), ConfigPropertyInvalid)
    })

    it('throws when value is not valid', async () => {
      await a.throws(testLoadConfig({
        config: {
          overrideMode: 'auto' as any
        }
      }), ConfigPropertyInvalid)
    })
  })
})
