import { clearLogReporters, config, createMemoryLogReporter, logLevel, LogReporter, setLogLevel } from 'standard-log';
import { createColorLogReporter } from 'standard-log-color';
import { required } from 'type-plus';
import { context } from '../context';
import { es2015 } from '../es2015';
import { loadPlugins } from '../mockto';
import { store } from '../store';
import { createTestIO } from './createTestIO';
import { TestHarness } from './types';

export type CreateTestHarnessOptions = {
  target: 'es2015',
  logLevel?: number,
}

export function createTestHarness(options?: CreateTestHarnessOptions): TestHarness {
  const opts = required<Required<CreateTestHarnessOptions>>({ target: 'es2015', logLevel: logLevel.none }, options)
  const level = opts.logLevel

  const reporter = createMemoryLogReporter()
  const reporters: LogReporter[] = [reporter, createColorLogReporter()]
  config({ mode: 'test', reporters, logLevel: level })
  const io = createTestIO()
  context.set({ io })
  store.reset()

  switch (opts.target) {
    case 'es2015':
      io.addPluginModule(es2015.name, es2015)
  }

  return {
    reporter,
    addPluginModule(pluginName, pluginModule) {
      io.addPluginModule(pluginName, pluginModule)
    },
    setLogLevel(level = logLevel.all) {
      setLogLevel(level)
    },
    reset() {
      context.clear()
      clearLogReporters()
    },
    logSpecRecord(title: string) {
      const colonIndex = title.lastIndexOf(':')
      const specId = colonIndex === -1 ? title : title.slice(0, colonIndex)
      logSpecs(io.getAllSpecs(), e => e[0] === specId)
    },
    start() {
      return loadPlugins({ io })
    }
  }
}

function logSpecs(specs: IterableIterator<[string, string]>, predicate: (entry: [string, string]) => boolean = () => true) {
  for (const e of specs) {
    if (predicate(e)) console.info(`${e[0]}:\n`, e[1])
  }
}
