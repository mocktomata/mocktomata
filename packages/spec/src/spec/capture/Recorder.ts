import { SpyContext, Spy, SpyCall, SpyInstance } from './types';
import { SpecAction, Meta } from '../types';

export class Recorder implements SpyContext {
  instanceIdMap: Record<string, number> = {}
  actions: SpecAction[] = []
  constructor(public pluginName: string) { }
  newSpy(args?: any[], meta?: Meta): Spy {
    const instanceId = this.getNewInstanceId()
    this.actions.push({
      name: 'construct',
      plugin: this.pluginName,
      instanceId,
      payload: args,
      meta
    })
    return createSpyRecorder(this, instanceId)
  }

  private getNewInstanceId() {
    const count = this.instanceIdMap[this.pluginName] || 0
    return this.instanceIdMap[this.pluginName] = count + 1
  }
}

function createSpyRecorder(recorder: Recorder, instanceId: number): Spy {
  let invokeId = 0
  return {
    instance(args: any[], meta?: Meta): SpyInstance {
      return {} as any
    },
    invoke(args: any[], meta?: Meta): SpyCall {
      recorder.actions.push({
        name: 'invoke',
        plugin: recorder.pluginName,
        instanceId,
        invokeId: ++invokeId,
        payload: args,
        meta
      })
      return {} as any
    },
    get(meta?: Meta) { return },
    set(value: any, meta?: Meta) { return }
  }
}

