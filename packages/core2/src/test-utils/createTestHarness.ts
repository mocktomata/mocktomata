import { addLogReporter, clearLogReporters, config, createMemoryLogReporter, logLevel, LogReporter, setLogLevel } from 'standard-log';
import { createColorLogReporter } from 'standard-log-color';
import { required } from 'type-plus';
import { context } from '../context';
import { SpecRecord } from '../spec';
import { store } from '../store';
import { createTestIO } from './createTestIO';

export type TestHarness = ReturnType<typeof createTestHarness>

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
      const specId = title.slice(0, title.lastIndexOf(':'))
      for (const e of io.getAllSpecs()) {
        if (e[0] === specId) console.info(`${e[0]}:\n`, e[1])
      }
    },
    logSpecs() {
      for (const e of io.getAllSpecs()) {
        console.info(`${e[0]}:\n`, e[1])
      }
    }
  }
}
