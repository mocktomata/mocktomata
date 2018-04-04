import { SpyInstance, SpyCall } from 'komondor-plugin'
import { SpyContextImpl } from './SpyContextImpl'

export class SpyInstanceImpl implements SpyInstance {
  instanceId: number
  constructor(public context: SpyContextImpl) {
    // this.instanceId = context.idTracker.getNextId(context.plugin.type)
    this.instanceId = context.instanceId
  }
  newCall(): SpyCall {
    return this.context.newCall()
  }
  add(type: string, name: string, payload?: any, meta: any = {}) {
    return this.context.add(type, name, payload, meta)
  }
}
