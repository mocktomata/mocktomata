import { tersify } from 'tersify'

import { io } from './io'
import { log } from './log'
import { SpecAction, SpecPlayer, SpecRecorder } from './interfaces'

export interface SpecStore extends SpecPlayer, SpecRecorder {
  /**
   * Collected or loaded actions.
   */
  readonly actions: SpecAction[],
  readonly completed: Promise<SpecAction[]>,
  /**
   * Marking the spec store is completed.
   */
  readonly resolve: () => void,
  /**
   * String representation of the expectation of the Spec.
   */
  expectation: string,
  /**
   * Save the actions.
   */
  save(id: string),
  /**
   * Load the actions.
   */
  load(id: string),
  on(actionType: string, callback: Function),
  onAny(callback: Function)
}

export function createSpecStore(): SpecStore {
  const actions: SpecAction[] = []
  let i = 0
  let expectation

  let resolve
  const completed = new Promise<SpecAction[]>(a => {
    resolve = () => {
      a(actions)
    }
  })
  const events = {}
  const listenAll: any[] = []

  return {
    get actions() {
      return actions
    },
    get completed() {
      return completed
    },
    get resolve() {
      return resolve
    },
    get expectation() {
      return expectation
    },
    set expectation(value) {
      expectation = value
    },
    add(action: { type: string, payload: any, meta?: any }) {
      actions.push(action as any)
      if (events[action.type]) {
        events[action.type].forEach(cb => cb(action))
      }
      if (listenAll.length > 0) {
        listenAll.forEach(cb => cb(action))
      }
    },
    save(id) {
      return io.writeSpec(id, { expectation, actions })
    },
    async load(id) {
      try {
        const specRecord = await io.readSpec(id)
        expectation = specRecord.expectation
        actions.splice(0, actions.length, ...specRecord.actions)
      }
      catch (err) {
        log.warn(`Cannot load saved record for spec '${id}'.`)
        log.debug(tersify(err))
        expectation = ''
        actions.splice(0, actions.length)
      }
    },
    peek<A extends SpecAction>(): A | undefined {
      return actions[i] as any
    },
    next<A extends SpecAction>(): A | undefined {
      return actions[i++] as any
    },
    prune() {
      actions.splice(i, actions.length - i)
    },
    graft(...newActions) {
      actions.splice(i, actions.length - i, ...newActions)
    },
    on(actionType: string, callback) {
      if (!events[actionType])
        events[actionType] = []
      events[actionType].push(callback)
    },
    onAny(callback) {
      listenAll.push(callback)
    }
  }
}
