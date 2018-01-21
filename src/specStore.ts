import { FluxStandardAction } from 'flux-standard-action'

import { io } from './io'
import { tersify } from 'tersify';

export interface SpecAction {
  type: string,
  payload: any,
  meta?: any
}
export interface SpecStore {
  actions: FluxStandardAction<any, any>[],
  expectation: string,
  add(action: SpecAction),
  save(id: string),
  load(id: string),
  next(): FluxStandardAction<any, any>,
  peek(): FluxStandardAction<any, any>,
  prune(): void,
  graft(...actions: SpecAction[]): void,
  on(actionType: string, callback: Function),
  onAny(callback: Function)
}

export function createSpecStore(): SpecStore {
  const actions: FluxStandardAction<any, any>[] = []
  let i = 0
  let expectation

  const events = {}
  const listenAll: any[] = []

  return {
    actions,
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
        console.warn(`Cannot load saved record for spec '${id}'.`)
        console.debug(tersify(err))
        expectation = ''
        actions.splice(0, actions.length)
      }
    },
    peek() {
      return actions[i]
    },
    next() {
      return actions[i++]
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
