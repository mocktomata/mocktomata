import { StubContext, SpecAction, Plugin, StubInstance } from 'komondor-plugin'
import { StubInstanceImpl } from './StubInstanceImpl'

export class Tracker {
  constructor(public actions: SpecAction[]) { }
}

export class ActionTracker {
  currentIndex = 0
  constructor(public actions: SpecAction[]) { }
  peek() {
    return this.actions[this.currentIndex]
  }
  next() {
    this.currentIndex++
  }
}

export class StubContextImpl implements StubContext {
  actionTracker: ActionTracker
  events: { [type: string]: { [name: string]: ((action) => void)[] } } = {}
  listenAll: ((action) => void)[] = []
  instances: { type: string, instanceId: number, instance: StubInstanceImpl }[]
  constructor(
    context,
    public specId: string,
    public plugin: Plugin<any>,
    public subject
  ) {
    this.actionTracker = context.actionTracker
    this.instances = context.instances || []
  }
  newInstance(): StubInstance {
    return new StubInstanceImpl(this)
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
  next(): void {
    this.actionTracker.next()
  }
  peek(): SpecAction | undefined {
    return this.actionTracker.peek()
  }
  callListeners(action) {
    if (this.events[action.type]) {
      if (this.events[action.type][action.name])
        this.events[action.type][action.name].forEach(cb => cb(action))
    }
    if (this.listenAll.length > 0) {
      this.listenAll.forEach(cb => cb(action))
    }
  }
  createChildContext(plugin) {
    const childContext = new StubContextImpl(
      this,
      this.specId,
      plugin,
      undefined
    )
    return childContext
  }
}
