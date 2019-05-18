import { InvocationContext } from './InvocationContext';
import { SpecAction, ReturnAction } from '../specAction';
import { Meta } from '../interfaces';

export class ReturnValueContext extends InvocationContext {
  constructor(context: { actions: SpecAction[], instanceIds: Record<string, number> }, pluginType: string, private returnAction: Partial<ReturnAction>) {
    super(context, pluginType)
  }
  construct(options: { args?: any[], meta?: Meta }) {
    const instance = super.construct(options)
    this.returnAction.returnInstanceId = instance.instanceId
    return instance
  }
}
