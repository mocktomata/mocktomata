import { AsyncContext } from 'async-fp'
import { clearLogReporters, config, logLevel, LogLevel, setLogLevel } from 'standard-log'
import { createColorLogReporter } from 'standard-log-color'
import { required } from 'type-plus'
import { es2015 } from '../es2015'
import { Spec } from '../spec'
import { loadPlugins } from '../spec-plugin'
import { SpecPlugin } from '../spec-plugin/types'
import { SpecRecord } from '../spec-record/types'
import { store } from '../store'
import { createTestIO } from '../test-utils'

export namespace createTestHarness {
  export type TestHarness = {
    addPluginModule(pluginName: string, pluginModule: SpecPlugin.Module): void,
    enableLog(level?: LogLevel): void,
    reset(): void,
    logSpecRecord(title: string): void,
    getSpecRecord(title: string): SpecRecord,
    start(): Promise<TestHarness>
  }
  export type Options = {
    target: 'es2015',
    logLevel?: number,
  }
}
export function createTestHarness(context: AsyncContext<Spec.Context>, options?: createTestHarness.Options): createTestHarness.TestHarness {
  const opts = required<Required<createTestHarness.Options>>({ target: 'es2015', logLevel: logLevel.info }, options)
  const level = opts.logLevel

  config({ mode: 'test', reporters: [createColorLogReporter()], logLevel: level })
  const io = createTestIO()

  io.addPluginModule(es2015.name, es2015)

  context.set({ io, config: {}, plugins: store.value.plugins })

  store.reset()


  return {
    addPluginModule(pluginName, pluginModule) {
      io.addPluginModule(pluginName, pluginModule)
    },
    enableLog(level = logLevel.all) {
      setLogLevel(level)
    },
    getSpecRecord(title: string) {
      const entry = getSpecEntry(io, title)
      if (!entry) throw new Error(`Unable to find SpecRecord for: ${title}`)
      return JSON.parse(entry[1])
    },
    logSpecRecord(title: string) {
      const entry = getSpecEntry(io, title)
      if (!entry) throw new Error(`Unable to find SpecRecord for: ${title}`)
      console.info(`${entry[0]}:\n`, entry[1])
    },
    start() {
      return loadPlugins({ io }).then(() => this)
    },
    reset() {
      context.clear()
      clearLogReporters()
    },
  }
}

function getSpecEntry(io: createTestIO.TestIO, title: string) {
  const colonIndex = title.lastIndexOf(':')
  const specId = colonIndex === -1 ? title : title.slice(0, colonIndex)
  const specs = io.getAllSpecs()
  for (const e of specs) {
    if (e[0] === specId) return e
  }
}
