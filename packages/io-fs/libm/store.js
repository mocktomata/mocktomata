import { createStore } from 'global-store';
const store = createStore('@komondor-lab/io-fs', { config: undefined });
export { store };
export function resetStore() {
    store.set({ config: undefined });
}
//# sourceMappingURL=store.js.map