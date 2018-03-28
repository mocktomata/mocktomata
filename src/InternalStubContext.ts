import { StubContext, SpecAction, ReturnAction, Plugin } from 'komondor-plugin'
import { plugins } from './plugin';

export class InternalStubContext implements StubContext {
  actions: SpecAction[] = []
  events: { [k: string]: ((action) => void)[] } = {}
  listenAll: ((action) => void)[] = []
  actionCounter = 0
  constructor(
    context,
    public specId: string,
    public plugin: Plugin<any>,
    public subject
  ) {
    this.actions = context.actions
    this.events = context.events
    this.listenAll = context.listenAll
  }
  next(): void {
    const action = this.actions[++this.actionCounter]
    if (action) {
      this.callListeners(action)
    }
  }
  peek<A extends SpecAction>(): A | undefined {
    return this.actions[this.actionCounter] as A
  }
  on(actionType: string, callback: (action: SpecAction) => void) {
    if (!this.events[actionType])
      this.events[actionType] = []
    this.events[actionType].push(callback)
  }
  onAny(callback: (action: SpecAction) => void) {
    this.listenAll.push(callback)
  }
  getStub(context: StubContext, action: ReturnAction) {
    const plugin = plugins.find(p => action && action.meta.returnType === p.type)
    if (plugin)
      return plugin.getStub(context, this.subject, action)
  }
  callListeners(action) {
    if (this.events[action.type]) {
      this.events[action.type].forEach(cb => cb(action))
    }
    if (this.listenAll.length > 0) {
      this.listenAll.forEach(cb => cb(action))
    }
  }
}
