import { Spec } from './types'

export type TimeTracker = ReturnType<typeof createTimeTracker>

export function createTimeTracker({ timeout }: Pick<Spec.Options, 'timeout'>, onTimeout: (elasped: number) => void) {
  let handle: any
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
        handle = setTimeout(() => this.terminate(), timeout)
        return 0
      }
      else {
        const newTick = new Date().getTime()
        const elasped = newTick - prevTick
        prevTick = newTick

        clearTimeout(handle)
        handle = setTimeout(() => this.terminate(), timeout)

        return elasped
      }
    },
    /**
     * Stop time tracker and return the total duration since the first `elaspe()` call.
     */
    stop() {
      const duration = this.duration()
      clearTimeout(handle)
      handle = undefined
      return duration
    },
    terminate() {
      if (handle) {
        const newTick = new Date().getTime()
        const elasped = newTick - prevTick
        onTimeout(elasped)
        this.stop()
      }
    }
  }
}
