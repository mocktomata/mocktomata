import { SpecOptions } from './types';

export type TimeTracker = ReturnType<typeof createTimeTracker>

export function createTimeTracker({ timeout }: Pick<SpecOptions, 'timeout'>, callback: (timeout: number) => void) {
  let handle: NodeJS.Timeout
  let startTick: number
  let endTick: number
  let prevTick: number
  return {
    /**
     * Get the duration since the first `elaspe()` call.
     */
    duration() {
      endTick = new Date().getTime()
      return endTick - startTick
    },
    /**
     * Get the elasped time since the last `elaspe()` call.
     * First `elaspe()` call returns 0.
     */
    elaspe() {
      if (!handle) {
        prevTick = startTick = new Date().getTime()
        handle = setTimeout(callback, timeout)
        return 0
      }
      else {
        const newTick = new Date().getTime()
        const elasped = newTick - prevTick
        prevTick = newTick

        clearTimeout(handle)
        handle = setTimeout(callback, timeout)

        return elasped
      }
    },
    /**
     * Stop time tracker and return the total duration since the first `elaspe()` call.
     */
    stop() {
      const duration = this.duration()
      clearTimeout(handle)
      return duration
    }
  }
}
