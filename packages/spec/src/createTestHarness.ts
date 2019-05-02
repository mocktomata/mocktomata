import { addAppender, removeAppender, setLevel, logLevel } from '@unional/logging';
import { MemoryAppender } from 'aurelia-logging-memory';
import { context } from './context';
import { resetStore } from './store';
import { createTestIO } from './test-util';
import { forEachKey } from 'type-plus';

export function createTestHarness() {
  const appender = new MemoryAppender()
  addAppender(appender)
  setLevel(logLevel.debug)

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
    logSpecs() {
      forEachKey(io.specs, key => {
        console.info(`${key}:\n`, io.specs[key])
      })
    }
  }
}
