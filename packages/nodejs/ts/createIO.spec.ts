import { SpecNotFound } from '@mocktomata/framework'
import { execCommand } from '@unional/fixture'
import { a } from 'assertron'
import t from 'node:assert'
import { existsSync } from 'node:fs'
import { createStandardLogForTest } from 'standard-log'
import { MOCKTOMATA_FILE_PATH_FILTER, MOCKTOMATA_LOG_LEVEL, MOCKTOMATA_MODE, MOCKTOMATA_SPEC_NAME_FILTER } from './config/constants.js'
import { createIO } from './createIO.js'
import { fixturePath } from './util/fixturePath.js'
import { ensureFileNotExist } from './util/fs.js'

describe(`${createIO.name}()`, () => {
  afterEach(() => {
    delete process.env[MOCKTOMATA_MODE]
    delete process.env[MOCKTOMATA_LOG_LEVEL]
    delete process.env[MOCKTOMATA_FILE_PATH_FILTER]
    delete process.env[MOCKTOMATA_SPEC_NAME_FILTER]
  })
  function setupIOTest(fixture: string, envValues?: Record<string, any>) {
    if (envValues) {
      Object.keys(envValues).forEach(k => process.env[k] = envValues[k])
    }
    const cwd = fixturePath(fixture)
    const sl = createStandardLogForTest()
    const log = sl.getLogger('test')
    return [createIO({ cwd, log }), sl.reporter] as const
  }
  describe(`loadConfig()`, () => {
    it('returns empty object when there is no config', async () => {
      const [io] = setupIOTest('no-config')
      const config = await io.loadConfig()
      expect(config).toStrictEqual({})
    })

    it('loads config from package.json', async () => {
      const [io] = setupIOTest('pjson')
      const config = await io.loadConfig()
      expect(config).toStrictEqual({
        ecmaVersion: 'ES2015',
        plugins: [`@mocktomata/plugin-fixture-dummy`],
        mocktomataDir: '.mockto',
        logLevel: 'trace'
      })
    })

    it('returns empty object when package.json does not have mocktomata config', async () => {
      const [io] = setupIOTest('pjson-no-config')
      const config = await io.loadConfig()
      t.deepStrictEqual(config, {})
    })

    it('loads from mocktomata.json', async () => {
      const [io] = setupIOTest('mjson')
      const config = await io.loadConfig()
      t.deepStrictEqual(config, { plugins: ['@mocktomata/plugin-fixture-dummy'] })
    })

    it('loads from mocktomata.json with comment', async () => {
      const [io] = setupIOTest('mjson-with-comment')
      const config = await io.loadConfig()
      t.deepStrictEqual(config, { plugins: ['@mocktomata/plugin-fixture-dummy'] })
    })


    it('loads config from environment', async () => {
      const [io] = setupIOTest('no-config', {
        [MOCKTOMATA_MODE]: 'live',
        [MOCKTOMATA_LOG_LEVEL]: 'debug',
        [MOCKTOMATA_FILE_PATH_FILTER]: 'hello',
        [MOCKTOMATA_SPEC_NAME_FILTER]: 'world'
      })
      const config = await io.loadConfig()
      expect(config).toStrictEqual({
        overrideMode: 'live',
        logLevel: 'debug',
        filePathFilter: 'hello',
        specNameFilter: 'world'
      })
    })

    it('takes env value over file', async () => {
      const [io] = setupIOTest('pjson', {
        [MOCKTOMATA_LOG_LEVEL]: 700
      })
      const config = await io.loadConfig()
      expect(config).toStrictEqual({
        ecmaVersion: 'ES2015',
        plugins: [`@mocktomata/plugin-fixture-dummy`],
        mocktomataDir: '.mockto',
        logLevel: 700
      })
    })

    it('merges two or more configs and emits a warning', async () => {
      const [io, reporter] = setupIOTest('two-configs')
      const config = await io.loadConfig()
      expect(config).toStrictEqual({
        plugins: ['plugin-b']
      })

      expect(reporter.getLogMessages()).toEqual([`Multiple configurations detected.
Please consolidate them into a single config.

configs:
- package.json
- mocktomata.json`])
    })

    it('returns only known properties and emit a warning for extra props', async () => {
      const [io, reporter] = setupIOTest('with-extra-prop')
      const config = await io.loadConfig()
      expect(config).toEqual({})

      expect(reporter.getLogMessagesWithIdAndLevel()).toEqual([
        `test (WARN) Config file 'mocktomata.json' contains unrecognized properties: abc, def`
      ])
    })
  })

  describe(`loadPlugin()`, () => {
    it('loads cjs plugin', async () => {
      const { stdout } = await execCommand({
        casePath: fixturePath('plugin-cjs'),
        command: 'node',
        args: ['loadPlugin.mjs', '@mocktomata/plugin-fixture-cjs-a']
      })
      expect(stdout).toEqual('function')
    })

    it('loads cjs plugin with .cjs extension', async () => {
      const { stdout } = await execCommand({
        casePath: fixturePath('plugin-cjs'),
        command: 'node',
        args: ['loadPlugin.mjs', '@mocktomata/plugin-fixture-cjs-b']
      })
      expect(stdout).toEqual('function')
    })

    it('loads deep link plugin', async () => {
      const { stdout } = await execCommand({
        casePath: fixturePath('plugin-esm'),
        command: 'node',
        args: ['loadPlugin.mjs', '@mocktomata/plugin-fixture-deep-link/pluginA.js']
      })
      expect(stdout).toEqual('function')
    })

    it('loads esm plugin', async () => {
      const { stdout } = await execCommand({
        casePath: fixturePath('plugin-esm'),
        command: 'node',
        args: ['loadPlugin.mjs', '@mocktomata/plugin-fixture-esm-a']
      })
      expect(stdout).toEqual('function')
    })

    it('loads esm plugin with .mjs extension', async () => {
      const { stdout } = await execCommand({
        casePath: fixturePath('plugin-esm'),
        command: 'node',
        args: ['loadPlugin.mjs', '@mocktomata/plugin-fixture-esm-b']
      })
      expect(stdout).toEqual('function')
    })

    it('throws PluginNotFound when no such package', async () => {
      const { stderr } = await execCommand({
        casePath: fixturePath('plugin-esm'),
        command: 'node',
        args: ['loadPlugin.mjs', 'not-exist']
      })
      a.satisfies(stderr, /PluginNotFound: Could not locate plugin 'not-exist'/)
    })

    it('throws PluginNotFound when package have not activate export', async () => {
      const { stderr } = await execCommand({
        casePath: fixturePath('plugin-esm'),
        command: 'node',
        args: ['loadPlugin.mjs', '@mocktomata/plugin-fixture-no-activate']
      })
      a.satisfies(stderr, /PluginModuleNotConforming: @mocktomata\/plugin-fixture-no-activate is not a valid plugin module./)
    })

    it('throws PluginNotFound when package activate is not a fuction', async () => {
      const { stderr } = await execCommand({
        casePath: fixturePath('plugin-esm'),
        command: 'node',
        args: ['loadPlugin.mjs', '@mocktomata/plugin-fixture-activate-not-fn']
      })
      a.satisfies(stderr, /PluginModuleNotConforming: @mocktomata\/plugin-fixture-activate-not-fn is not a valid plugin module./)
    })
  })

  describe(`readSpec()`, () => {
    it(`reads from .mocktomata/specs by default`, async () => {
      const [io] = setupIOTest('no-config')
      const specRecord = await io.readSpec('some spec', 'src/code-a.ts')
      expect(specRecord).toEqual({
        actions: [],
        refs: []
      })
    })

    it('reads from alternative folder from config', async () => {
      const [io] = setupIOTest('pjson')
      // loadConfig() will have the side effect of updating the path
      await io.loadConfig()
      const specRecord = await io.readSpec('some spec', 'src/code-a.ts')
      expect(specRecord).toEqual({
        actions: [],
        refs: []
      })
    })

    it('throws SpecNotFound', async () => {
      const [io] = setupIOTest('no-config')
      await a.throws(io.readSpec('not exist', 'src/code-a.ts'), SpecNotFound)
    })
  })

  describe('writeSpec()', () => {
    it('writes to .mocktomata/specs by default', async () => {
      const filePath = fixturePath('no-config/.mocktomata/specs/src/write-target.ts/some-spec')
      ensureFileNotExist(filePath)

      const [io] = setupIOTest('no-config')
      await io.writeSpec('some spec', './src/write-target.ts', { actions: [], refs: [] })

      expect(existsSync(filePath)).toBeTruthy()
    })

    it('writes to alternative folder from config', async () => {
      const filePath = fixturePath('pjson/.mockto/specs/src/write-target.ts/some-spec')
      ensureFileNotExist(filePath)

      const [io] = setupIOTest('pjson')
      // loadConfig() will have the side effect of updating the path
      await io.loadConfig()
      await io.writeSpec('some spec', './src/write-target.ts', { actions: [], refs: [] })

      expect(existsSync(filePath)).toBeTruthy()
    })
  })
})
