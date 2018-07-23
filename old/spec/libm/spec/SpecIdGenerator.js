import createStore from 'global-store';
const store = createStore('@komondor-lab/spec/instanceId', { instanceIds: {} });
export class InstanceIdGenerator {
    newId(pluginType) {
        const count = store.get().instanceIds[pluginType] || 0;
        return store.get().instanceIds[pluginType] = count + 1;
    }
}
//# sourceMappingURL=SpecIdGenerator.js.map