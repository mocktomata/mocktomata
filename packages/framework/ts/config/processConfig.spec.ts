import { a } from 'assertron'
import { logLevels } from 'standard-log'
import { ConfigPropertyInvalid, ConfigPropertyMismatch, ConfigHasUnrecognizedProperties, processConfig } from './index.js'

describe(`${processConfig.name}()`, () => {
  it('throws if file config has unrecognized property', () => {
    a.throws(() => processConfig({
      configInput: { file: { abc: 1 } as any }
    }), ConfigHasUnrecognizedProperties)
  })
  describe(`logLevel`, () => {
    it('gets undefined when not configured', () => {
      const result = processConfig({ configInput: {} })

      a.satisfies(result, { config: { logLevel: undefined } })
    })

    it('gets value from file', () => {
      const result = processConfig({
        configInput: {
          file: {
            logLevel: 'debug'
          }
        }
      })

      a.satisfies(result, { config: { logLevel: logLevels.debug } })
    })

    it('gets value as number from file', () => {
      const result = processConfig({
        configInput: {
          file: {
            logLevel: 321
          }
        }
      })

      a.satisfies(result, { config: { logLevel: 321 } })
    })

    it('throws when value is negative number', () => {
      a.throws(() => processConfig({
        configInput: {
          file: {
            logLevel: -123
          }
        }
      }), ConfigPropertyInvalid)
    })

    it('throws when value is not string or number', () => {
      a.throws(() => processConfig({
        configInput: {
          file: {
            logLevel: true
          }
        }
      }), ConfigPropertyInvalid)
    })

    it('throws when value is invalid', () => {
      a.throws(() => processConfig({
        configInput: {
          file: {
            logLevel: 'unknown'
          }
        }
      }), ConfigPropertyInvalid)
    })

    it('gets value from env', () => {
      const result = processConfig({
        configInput: {
          env: {
            MOCKTOMATA_LOG: 'debug'
          }
        }
      })
      a.satisfies(result, { config: { logLevel: logLevels.debug } })
    })

    it('throws when value from env is invalid', () => {
      a.throws(() => processConfig({
        configInput: {
          env: {
            MOCKTOMATA_LOG: 'unknown'
          }
        }
      }), ConfigPropertyInvalid)
    })

    it('throws when value from file and env are not the same', () => {
      a.throws(() => processConfig({
        configInput: {
          filePath: 'mocktomata.json',
          file: {
            logLevel: 'debug'
          },
          env: {
            MOCKTOMATA_LOG: 'info'
          }
        }
      }), ConfigPropertyMismatch)
    })
  })

  describe(`ecmaVersion`, () => {
    it('gets "es2015" when not configured', () => {
      const result = processConfig({ configInput: {} })

      a.satisfies(result, { config: { ecmaVersion: 'es2015' } })
    })

    it('gets value from file', () => {
      const result = processConfig({
        configInput: {
          file: {
            ecmaVersion: 'es2015'
          }
        }
      })

      a.satisfies(result, { config: { ecmaVersion: 'es2015' } })
    })

    it('throws when value is not string', () => {
      a.throws(() => processConfig({
        configInput: {
          file: {
            ecmaVersion: 2015
          }
        }
      }), ConfigPropertyInvalid)
    })

    it('throws when value is invalid', () => {
      a.throws(() => processConfig({
        configInput: {
          file: {
            ecmaVersion: 'unknown'
          }
        }
      }), ConfigPropertyInvalid)
    })
  })

  describe(`plugins`, () => {
    it('returns empty array if not configured', () => {
      const result = processConfig({ configInput: {} })
      expect(result.config.plugins).toEqual([])
    })

    it('gets value from file', () => {
      const result = processConfig({
        configInput: {
          file: {
            plugins: ['plugin-a', 'plugin-b']
          }
        }
      })
      expect(result.config.plugins).toEqual(['plugin-a', 'plugin-b'])
    })

    it('throws if not an array', () => {
      a.throws(() => processConfig({
        configInput: {
          file: {
            plugins: 123
          }
        }
      }), ConfigPropertyInvalid)
    })
  })

  describe(`filePathFilter`, () => {
    it('gets undefined when not configured', () => {
      const result = processConfig({ configInput: {} })

      a.satisfies(result, { config: { filePathFilter: undefined } })
    })

    it('gets undefined if config with empty string', () => {
      const result = processConfig({
        configInput: {
          file: { specNameFilter: '' }
        }
      })

      a.satisfies(result, { config: { specNameFilter: undefined } })
    })

    it('gets value from file', () => {
      const result = processConfig({
        configInput: {
          file: {
            filePathFilter: 'abc'
          }
        }
      })

      a.satisfies(result, { config: { filePathFilter: /abc/ } })
    })

    it('throws when value is not string', () => {
      a.throws(() => processConfig({
        configInput: {
          file: {
            filePathFilter: 123
          }
        }
      }), ConfigPropertyInvalid)
    })

    it('gets value from env', () => {
      const result = processConfig({
        configInput: {
          env: {
            MOCKTOMATA_FILE_FILTER: 'abc'
          }
        }
      })

      a.satisfies(result, { config: { filePathFilter: /abc/ } })
    })


    it('throws when value from file and env are not the same', () => {
      a.throws(() => processConfig({
        configInput: {
          filePath: 'mocktomata.json',
          file: {
            filePathFilter: 'abc'
          },
          env: {
            MOCKTOMATA_FILE_FILTER: 'def'
          }
        }
      }), ConfigPropertyMismatch)
    })
  })

  describe(`specNameFilter`, () => {
    it('gets undefined when not configured', () => {
      const result = processConfig({ configInput: {} })

      a.satisfies(result, { config: { specNameFilter: undefined } })
    })

    it('gets undefined if config with empty string', () => {
      const result = processConfig({
        configInput: {
          file: { specNameFilter: '' }
        }
      })

      a.satisfies(result, { config: { specNameFilter: undefined } })
    })

    it('gets value from file', () => {
      const result = processConfig({
        configInput: {
          file: {
            specNameFilter: 'abc'
          }
        }
      })

      a.satisfies(result, { config: { specNameFilter: /abc/ } })
    })

    it('throws when value is not string', () => {
      a.throws(() => processConfig({
        configInput: {
          file: {
            specNameFilter: 123
          }
        }
      }), ConfigPropertyInvalid)
    })

    it('gets value from env', () => {
      const result = processConfig({
        configInput: {
          env: {
            MOCKTOMATA_SPEC_FILTER: 'abc'
          }
        }
      })

      a.satisfies(result, { config: { specNameFilter: /abc/ } })
    })


    it('throws when value from file and env are not the same', () => {
      a.throws(() => processConfig({
        configInput: {
          filePath: 'mocktomata.json',
          file: {
            specNameFilter: 'abc'
          },
          env: {
            MOCKTOMATA_SPEC_FILTER: 'def'
          }
        }
      }), ConfigPropertyMismatch)
    })
  })


  describe(`overrideMode`, () => {
    it('gets undefined when not configured', () => {
      const result = processConfig({ configInput: {} })

      a.satisfies(result, { config: { overrideMode: undefined } })
    })

    it('gets undefined if config with empty string', () => {
      const result = processConfig({
        configInput: {
          file: { overrideMode: '' }
        }
      })

      a.satisfies(result, { config: { overrideMode: undefined } })
    })

    it('gets value from file', () => {
      const result = processConfig({
        configInput: {
          file: {
            overrideMode: 'save'
          }
        }
      })

      a.satisfies(result, { config: { overrideMode: 'save' } })
    })

    it('throws when value is not string', () => {
      a.throws(() => processConfig({
        configInput: {
          file: {
            overrideMode: 123
          }
        }
      }), ConfigPropertyInvalid)
    })

    it('throws when value is not valid', () => {
      a.throws(() => processConfig({
        configInput: {
          file: {
            overrideMode: 'auto' // auto is not a valid value
          }
        }
      }), ConfigPropertyInvalid)
    })

    it('gets value from env', () => {
      const result = processConfig({
        configInput: {
          env: {
            MOCKTOMATA_MODE: 'save'
          }
        }
      })

      a.satisfies(result, { config: { overrideMode: 'save' } })
    })


    it('throws when value from file and env are not the same', () => {
      a.throws(() => processConfig({
        configInput: {
          filePath: 'mocktomata.json',
          file: {
            overrideMode: 'save'
          },
          env: {
            MOCKTOMATA_MODE: 'live'
          }
        }
      }), ConfigPropertyMismatch)
    })
  })
})
