import { SpecAction, SpecPlayer, SpecRecorder, SpecContext, ReturnAction, SpecMode } from 'komondor-plugin'
import { tersify } from 'tersify'

import { MissingSpecID } from './errors'
import { io } from './io'
import { log } from './log'
import { plugins } from './plugin'

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

function getStub(context: SpecContext, subject: any, action: ReturnAction | undefined) {
  const plugin = plugins.find(p => (action && action.meta.returnType === p.type) || p.support(subject))
  if (plugin)
    return plugin.getStub(context, subject, action)
}

export async function createSpecStore(specId, subject, mode): Promise<SpecStore & SpecContext> {
  const actions: SpecAction[] = []
  let actionCounter = 0

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
  const typesCounter = {}
  let expectation
  function fillMetaId(type, action) {
    action.meta = action.meta || {}
    action.meta.id = getNextTypeCounter(type)
    return action
  }
  function getNextTypeCounter(type) {
    const counter = typesCounter[type] || 0
    return typesCounter[type] = counter + 1
  }
  function getSpy(context: SpecContext, subject: any, action: ReturnAction | undefined) {
    const plugin = plugins.find(p => p.support(subject))
    if (plugin) {
      if (action) {
        action.meta.returnType = plugin.type
        action.meta.returnId = getNextTypeCounter(plugin.type)
      }
      return plugin.getSpy(context, subject, action)
    }
  }
  const store: any = {
    mode,
    specId,
    getSpy,
    getStub: (context, action) => getStub(context, undefined, action),
    get actions() {
      return actions
    },
    get expectation() {
      return expectation
    },
    set expectation(value) {
      expectation = value
    },
    add(type: string, payload?: any, meta?: object) {
      const a = fillMetaId(type, { type, payload, meta })
      actions.push(a)
      callListeners(a)
      return a
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
      return actions[actionCounter] as any
    },
    next(): void {
      const action = actions[++actionCounter]
      if (action) {
        callListeners(action)
      }
    },
    prune() {
      actions.splice(actionCounter, actions.length - actionCounter)
    },
    on(actionType: string, callback) {
      if (!events[actionType])
        events[actionType] = []
      events[actionType].push(callback)
      const action = actions[actionCounter]
      if (action && action.type === actionType) {
        callback(action)
      }
    },
    onAny(callback) {
      listenAll.push(callback)
    }
  }
  if (!specId && !isRecordingMode(mode))
    throw new MissingSpecID(mode)

  if (mode === 'simulate') {
    await store.load(specId)
    store.subject = getStub(store, subject, undefined)
  }
  else {
    store.subject = getSpy(store, subject, undefined)
  }

  return store
}

function isRecordingMode(mode: SpecMode) {
  return mode === 'live'
}
