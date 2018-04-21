import { SpyInstance, SpyCall, SpecAction } from 'komondor-plugin'
import { SpyContextImpl } from './SpyContextImpl'
import { SpyCallImpl } from './SpyCallImpl'

export class SpyInstanceImpl implements SpyInstance {
  invokeCount = 0
  constructor(public context: SpyContextImpl, public instanceId: number) {
  }
  newCall(callMeta?: { [k: string]: any }): SpyCall {
    return new SpyCallImpl(this, ++this.invokeCount, callMeta)
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
