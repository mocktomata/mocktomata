import { tersify } from 'tersify'

import { io } from './io'
import { log } from './log'
import { SpecAction, SpecPlayer, SpecRecorder } from './interfaces'

export interface SpecStore extends SpecPlayer, SpecRecorder {
  /**
   * Collected or loaded actions.
   */
  readonly actions: SpecAction[],
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
  load(id: string)
}

export function createSpecStore(): SpecStore {
  const actions: SpecAction[] = []
  let i = 0
  let expectation

  const events = {}
  const listenAll: any[] = []
  function callListeners(action) {
    if (events[action.type]) {
      events[action.type].forEach(cb => cb(action))
    }
    if (listenAll.length > 0) {
      listenAll.forEach(cb => cb(action))
    }
  }

  return {
    get actions() {
      return actions
    },
    get expectation() {
      return expectation
    },
    set expectation(value) {
      expectation = value
    },
    add(action: { type: string }) {
      actions.push(action as any)
      callListeners(action)
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
    next(): void {
      const action = actions[++i]
      if (action) {
        callListeners(action)
      }
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
      const action = actions[i]
      if (action && action.type === actionType) {
        callback(action)
      }
    },
    onAny(callback) {
      listenAll.push(callback)
    }
  }
}
