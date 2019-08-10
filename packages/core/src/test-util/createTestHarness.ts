import { addLogReporter, clearLogReporters, config, createMemoryLogReporter, logLevel, LogReporter, setLogLevel } from 'standard-log';
import { createColorLogReporter } from 'standard-log-color';
import { required } from 'type-plus';
import { context } from '../context';
import { SpecRecord } from '../spec';
import { resetStore } from '../store';
import { createTestIO } from './createTestIO';

export type TestHarness = ReturnType<typeof createTestHarness>

export function createTestHarness(options?: Partial<{ level: number, showLog: boolean }>) {
  let { level, showLog } = required({ level: logLevel.info, showLog: false }, options)

  const reporter = createMemoryLogReporter()
  const reporters: LogReporter[] = [reporter]

  if (showLog) reporters.push(createColorLogReporter())
  config({ mode: 'test', reporters, logLevel: level })
  const io = createTestIO()
  context.set({ io })
  resetStore()

  return {
    io,
    reporter,
    showLog(level?: number) {
      if (!showLog) {
        addLogReporter(createColorLogReporter())
        showLog = true
      }
      if (level !== undefined) setLogLevel(level)
    },
    reset() {
      context.clear()
      clearLogReporters()
    },
    async getSpec(id: string): Promise<SpecRecord> {
      return io.readSpec(id)
    },
    logSpecs() {
      for (let e of io.getAllSpecs()) {
        console.info(`${e[0]}:\n`, e[1])
      }
    }
  }
}
