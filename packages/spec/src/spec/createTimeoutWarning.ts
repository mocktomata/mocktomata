import { log } from '../log';

export function createTimeoutWarning(timeout: number) {
  const timeoutHandle = setTimeout(() => {
    log.warn(`done() was not called in ${timeout} ms. Did the test takes longer than expected or you forget to call done()?`)
  }, timeout)
  return { stop() { clearTimeout(timeoutHandle) } }
}
