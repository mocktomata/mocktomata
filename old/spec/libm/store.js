import { createStore } from 'global-store';
export const store = createStore('@komondor-lab/plugin', {
    specTypeIds: {},
    plugins: []
});
export function resetStore() {
    store.set({
        specTypeIds: {},
        plugins: []
    });
}
//# sourceMappingURL=store.js.map