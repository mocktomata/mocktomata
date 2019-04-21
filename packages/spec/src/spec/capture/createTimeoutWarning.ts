import { Logger } from '@unional/logging';

export function createTimeoutWarning(log: Logger, timeout: number) {
  const timeoutHandle = setTimeout(() => {
    log.warn(`done() was not called in ${timeout} ms. Did the test takes longer than expected or you forget to call done()?`)
  }, timeout)
  return { stop() { clearTimeout(timeoutHandle) } }
}
