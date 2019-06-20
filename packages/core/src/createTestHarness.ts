import { addAppender, clearAppenders, logLevel, setLevel } from '@unional/logging';
import { ColorAppender } from 'aurelia-logging-color';
import { MemoryAppender } from 'aurelia-logging-memory';
import { required } from 'type-plus';
import { context } from './context';
import { SpecRecord } from './spec';
import { resetStore } from './store';
import { createTestIO } from './test-util';

export type TestHarness = ReturnType<typeof createTestHarness>

export function createTestHarness(options?: Partial<{ level: number, showLog: boolean }>) {
  let { level, showLog } = required({ level: logLevel.info, showLog: false }, options)
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
    showLog() {
      if (!showLog)
        addAppender(new ColorAppender())
    },
    reset() {
      context.clear()
      clearAppenders()
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
