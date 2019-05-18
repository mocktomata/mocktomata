import createStore from 'global-store';

const store = createStore<{
  instanceIds: Record<string, number>
}>(
  '@komondor-lab/spec/instanceId',
  { instanceIds: {} }
)

export class InstanceIdGenerator {
  newId(pluginType: string) {
    const count = store.get().instanceIds[pluginType] || 0
    return store.get().instanceIds[pluginType] = count + 1
  }
}
