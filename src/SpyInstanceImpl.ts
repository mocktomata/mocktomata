import { SpyInstance, SpyCall } from 'komondor-plugin'

export class SpyInstanceImpl implements SpyInstance {
  instanceId: number;
  newCall(): SpyCall {
    throw new Error('Method not implemented.');
  }
}
