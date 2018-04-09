import { StubInstance, StubCall, SimulationMismatch } from 'komondor-plugin'
import { tersify } from 'tersify'

import { log } from './log'
import { StubContextImpl } from './StubContextImpl'
import { StubCallImpl } from './StubCallImpl'

export class StubInstanceImpl implements StubInstance {
  instanceId: number;
  invokeCount = 0
  calls: StubCall[] = []
  constructor(public context: StubContextImpl, args, meta) {
    this.instanceId = context.instances.filter(c => c.type === context.plugin.type).length + 1
    context.instances.push({ type: context.plugin.type, instanceId: this.instanceId, instance: this })
    const action = this.context.peek()
    log.onDebug(() => `${this.debugId()}: invoked(${tersify(args)}), for ${tersify(action, { maxLength: Infinity })}`)

    this.ensureMatching(action, {
      type: this.context.plugin.type,
      name: 'construct',
      payload: args,
      meta,
      instanceId: this.instanceId
    })

    this.context.callListeners(action)
    this.context.next()
  }
  newCall(): StubCall {
    const call = new StubCallImpl(this, ++this.invokeCount)
    this.calls.push(call)
    return call
  }
  private debugId() {
    return `(${this.context.plugin.type}, ${this.instanceId})`
  }
  private ensureMatching(action, expected) {
    if (SimulationMismatch.mismatch(action, expected)) {
      throw new SimulationMismatch(this.context.specId, expected, action)
    }
  }
}
