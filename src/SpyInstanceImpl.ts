import { SpyInstance, SpyCall, SpecAction } from 'komondor-plugin'
import { SpyContextImpl } from './SpyContextImpl'
import { SpyCallImpl } from './SpyCallImpl'

export class SpyInstanceImpl implements SpyInstance {
  instanceId: number
  invokeCount = 0
  constructor(public context: SpyContextImpl) {
    this.instanceId = context.getNextId(context.plugin.type)
  }
  construct(args: any[], meta: any) {
    const action = {
      name: 'construct',
      payload: args,
      meta,
      instanceId: this.instanceId
    }
    return this.context.addAction(action)
  }
  newCall(): SpyCall {
    return new SpyCallImpl(this, ++this.invokeCount)
  }
  addAction(action: Partial<SpecAction>) {
    action.instanceId = this.instanceId
    return this.context.addAction(action)
  }
  addReturnAction(action: Partial<SpecAction>) {
    return this.context.addReturnAction(action)
  }
  addCallbackAction(action: Partial<SpecAction>) {
    action.sourceInstanceId = this.instanceId
    return this.context.addCallbackAction(action)
  }
}
