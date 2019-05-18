import { addAppender, logLevel, LogLevel, removeAppender, setLevel } from '@unional/logging';
import { ColorAppender } from 'aurelia-logging-color';
import { MemoryAppender } from 'aurelia-logging-memory';
import { forEachKey, required } from 'type-plus';
import { context } from './context';
import { resetStore } from './store';
import { createTestIO } from './test-util';
import { SpecRecord2 } from './spec/SpecRecord';

export type TestHarness = ReturnType<typeof createTestHarness>

export function createTestHarness(options?: Partial<{ level: LogLevel, showLog: boolean }>) {
  const { level, showLog } = required({ level: logLevel.info, showLog: true }, options)
  const appender = new MemoryAppender()
  addAppender(appender)
  if (showLog) addAppender(new ColorAppender())
  setLevel(level)

  const io = createTestIO()
  context.set({ io })
  resetStore()

  return {
    io,
    appender,
    reset() {
      context.clear()
      removeAppender(appender)
    },
    getSpec(id: string): SpecRecord2 {
      const spec = io.specs[id]
      return JSON.parse(spec)
    },
    logSpecs() {
      forEachKey(io.specs, key => {
        console.info(`${key}:\n`, io.specs[key])
      })
    }
  }
}
