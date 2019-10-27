import { clearLogReporters, config, logLevel, setLogLevel } from 'standard-log';
import { createColorLogReporter } from 'standard-log-color';
import { required } from 'type-plus';
import { context } from '../context';
import { es2015 } from '../es2015';
import { loadPlugins } from '../spec';
import { store } from '../store';
import { createTestIO } from './createTestIO';
import { TestHarness, TestIO } from './types';

export type CreateTestHarnessOptions = {
  target: 'es2015',
  logLevel?: number,
}

export function createTestHarness(options?: CreateTestHarnessOptions): TestHarness {
  const opts = required<Required<CreateTestHarnessOptions>>({ target: 'es2015', logLevel: logLevel.info }, options)
  const level = opts.logLevel

  config({ mode: 'test', reporters: [createColorLogReporter()], logLevel: level })
  const io = createTestIO()
  context.set({ io })
  store.reset()

  switch (opts.target) {
    case 'es2015':
      io.addPluginModule(es2015.name, es2015)
  }

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
      return loadPlugins({ io })
    },
    reset() {
      context.clear()
      clearLogReporters()
    },
  }
}

function getSpecEntry(io: TestIO, title: string) {
  const colonIndex = title.lastIndexOf(':')
  const specId = colonIndex === -1 ? title : title.slice(0, colonIndex)
  const specs = io.getAllSpecs()
  for (const e of specs) {
    if (e[0] === specId) return e
  }
}
