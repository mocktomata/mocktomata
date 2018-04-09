import { SpecAction, SimulationMismatch, SpecCallbackAction } from 'komondor-plugin'

export class ActionTracker {
  callbacks: { action: SpecAction, callback: Function }[] = []
  events: { [type: string]: { [name: string]: ((action) => void)[] } } = {}
  listenAll: ((action) => void)[] = []
  actualActions: SpecAction[] = []
  constructor(public specId: string, public actions: SpecAction[]) { }
  nextAction(actual) {
    const expected = this.peek()

    if (SimulationMismatch.mismatch(actual, expected)) {
      throw new SimulationMismatch(this.specId, expected, actual)
    }

    this.actualActions.push(actual)
    this.process(actual)
  }
  succeed() {
    const expected = this.peek()
    return expected && expected.name === 'return'
  }
  result() {
    const expected = this.peek()
    this.actualActions.push(expected)

    const result = this.getResultOf(expected)
    setImmediate(() => this.process())
    return result
  }
  blockUntil(action) {
    let expected = this.peek()
    while (expected && !SimulationMismatch.mismatch(expected, action)) {
      this.process()
      expected = this.peek()
    }
  }
  onAction(action, callback) {
    this.callbacks.push({ action, callback })
  }
  on(actionType: string, name: string, callback) {
    if (!this.events[actionType])
      this.events[actionType] = {}
    if (!this.events[actionType][name])
      this.events[actionType][name] = []
    this.events[actionType][name].push(callback)
  }
  onAny(callback: (action: SpecAction) => void) {
    this.listenAll.push(callback)
    const action = this.peek()
    if (action) {
      callback(action)
    }
  }
  private getResultOf(returnAction: SpecAction) {
    if (!returnAction.returnType) return returnAction.payload

    let nextAction = this.peek()
    while (nextAction && !isResultOf(returnAction, nextAction)) {
      this.process()
      nextAction = this.peek()
    }

    if (!nextAction) throw new SimulationMismatch(this.specId, {
      type: returnAction.returnType,
      instanceId: returnAction.returnInstanceId
    })
    let result
    return result !== undefined ? result : returnAction.payload
  }
  private process(invokeAction?: SpecAction) {
    let expected = this.peek()
    if (!expected) {
      if (invokeAction) {
        throw new SimulationMismatch(this.specId,
          {
            type: invokeAction.type,
            name: 'return',
            instanceId: invokeAction.instanceId,
            invokeId: invokeAction.invokeId
          })
      }
      else {
        return
      }
    }

    if (invokeAction && isReturnAction(invokeAction, expected)) return

    if (isCallbackAction(expected)) {
      const callback = this.getCallback(expected)
      callback(...expected.payload)
      this.actualActions.push(expected)
      this.process()
    }
  }
  private peek() {
    return this.actions[this.actualActions.length]
  }
  private getCallback({ sourceType, sourceInstanceId, sourceInvokeId, sourcePath }: SpecCallbackAction) {
    const source = this.actualActions.find(a => a.type === sourceType && a.instanceId === sourceInstanceId && a.invokeId === sourceInvokeId)
    if (source) {
      return sourcePath.reduce((p, v) => {
        return p[v]
      }, source.payload)
    }
  }
  // private callListeners(action) {
  //   if (this.events[action.type]) {
  //     if (this.events[action.type][action.name])
  //       this.events[action.type][action.name].forEach(cb => cb(action))
  //   }
  //   if (this.listenAll.length > 0) {
  //     this.listenAll.forEach(cb => cb(action))
  //   }
  // }
}
function isResultOf(returnAction: SpecAction, nextAction: SpecAction) {
  return returnAction.returnType === nextAction.type &&
    returnAction.returnInstanceId === nextAction.instanceId
  // and invokeId
}
function isReturnAction(action, nextAction) {
  // may need to compare meta too.
  return action.type === nextAction.type &&
    nextAction.name === 'return' &&
    action.instanceId === nextAction.instanceId &&
    action.invokeId === nextAction.invokeId
}
function isCallbackAction(action): action is SpecCallbackAction {
  return action.type === 'komondor' && action.name === 'callback'
}
