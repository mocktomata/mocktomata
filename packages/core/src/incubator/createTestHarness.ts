import { addLogReporter, clearLogReporters, config, createMemoryLogReporter, logLevel, LogReporter, setLogLevel } from 'standard-log';
import { createColorLogReporter } from 'standard-log-color';
import { required } from 'type-plus';
import { context } from '../context';
import { SpecRecord } from '../spec';
import { store } from '../store';
import { createTestIO } from './createTestIO';

export function createTestHarness(options?: Partial<{ level: number, showLog: boolean }>) {
  const opts = required({ level: logLevel.info, showLog: false }, options)
  const level = opts.level

  const reporter = createMemoryLogReporter()
  const reporters: LogReporter[] = [reporter]

  if (opts.showLog) reporters.push(createColorLogReporter())
  config({ mode: 'test', reporters, logLevel: level })
  const io = createTestIO()
  context.set({ io })
  store.reset()

  return {
    io,
    reporter,
    showLog(level = Infinity) {
      if (!opts.showLog) {
        addLogReporter(createColorLogReporter())
        opts.showLog = true
      }
      setLogLevel(level)
    },
    reset() {
      context.clear()
      clearLogReporters()
    },
    async getSpec(id: string): Promise<SpecRecord> {
      return io.readSpec(id)
    },
    logSpec(title: string) {
      const colonIndex = title.lastIndexOf(':')
      const specId = colonIndex === -1 ? title : title.slice(0, colonIndex)
      logSpecs(io.getAllSpecs(), e => e[0] === specId)
    },
    logSpecs() {
      logSpecs(io.getAllSpecs())
    }
  }
}

function logSpecs(specs: IterableIterator<[string, string]>, predicate: (entry: [string, string]) => boolean = () => true) {
  for (const e of specs) {
    if (predicate(e)) console.info(`${e[0]}:\n`, e[1])
  }
}
