import type { Spec } from '../spec/types.js'

export type TimeTracker = ReturnType<typeof createTimeTracker>
export type TimeTrackersContext = {
  timeTrackers: TimeTracker[]
}

export function initTimeTrackers(): TimeTrackersContext {
  return { timeTrackers: [] }
}

export function createTimeTracker(
  { timeout = 1000 }: Pick<Spec.Options, 'timeout'>,
  onTimeout: (elapsed: number) => void
) {
  let handle: any
  let startTick: number
  let endTick: number
  let prevTick: number
  return {
    /**
     * Get the duration since the first `elapse()` call.
     */
    duration() {
      endTick = new Date().getTime()
      return endTick - startTick
    },
    /**
     * Get the elapsed time since the last `elapse()` call.
     * First `elapse()` call returns 0.
     */
    elapse() {
      if (!handle) {
        prevTick = startTick = new Date().getTime()
        // When the live code is very fast,
        // e.g. when writing plugin or internal testing
        // the simulation can be slower than live code.
        // Therefore, setting `timeout * 3` so that the test will not fail.
        // @todo may need to make this configurable,
        // as the live code can be fast at local,
        // but the simulation code very slow in CI.
        handle = setTimeout(() => this.terminate(), timeout * 3)
        return 0
      }
      else {
        const newTick = new Date().getTime()
        const elapsed = newTick - prevTick
        prevTick = newTick

        clearTimeout(handle)
        handle = setTimeout(() => this.terminate(), timeout * 3)

        return elapsed
      }
    },
    /**
     * Stop time tracker and return the total duration since the first `elapse()` call.
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
        const elapsed = newTick - prevTick
        onTimeout(elapsed)
        this.stop()
      }
    }
  }
}
