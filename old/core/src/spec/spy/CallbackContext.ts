import { unpartial } from 'unpartial';
import { SpyCall, SpyInstance } from '.';
import { Meta } from '../interfaces';
import { SpecAction } from '../specAction';
import { Call, Instance, InvocationContext } from './InvocationContext';

export class CallbackContext extends InvocationContext {
  constructor(context: { actions: SpecAction[], instanceIds: Record<string, number> }, pluginType: string, private spyCall: Call, private sourceSite: Array<string | number>) {
    super(context, pluginType)
  }

  construct({ args, meta }: { args?: any[], meta?: Meta }): SpyInstance {
    const instanceId = this.getNextId(this.pluginType)
    const action = {
      name: 'construct',
      payload: args,
      meta,
      instanceId,
      sourceType: this.spyCall.instance.invocation.pluginType,
      sourceInstanceId: this.spyCall.instance.instanceId,
      sourceInvokeId: this.spyCall.invokeId,
      sourceSite: this.sourceSite
    }
    this.addAction(action as any)
    return new CallbackInstance(this, instanceId, this.pluginType)
  }
}

export class CallbackInstance extends Instance {
  newCall(callMeta: Meta): SpyCall {
    return new CallbackCall(this, ++this.invokeCount, callMeta)
  }
}

export class CallbackCall extends Call {
  invoke<T extends any[]>(args: T, meta?: { [k: string]: any }): T {
    this.instance.addAction({
      name: 'invoke',
      payload: args,
      meta: this.callMeta ? unpartial(this.callMeta, meta) : meta,
      invokeId: this.invokeId
    })
    return args
  }
}
