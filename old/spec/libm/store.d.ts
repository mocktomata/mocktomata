import { PluginInstance } from './types';
export declare type SpecStore = {
    specTypeIds: Record<string, number>;
    plugins: PluginInstance[];
};
export declare const store: import("global-store").Store<SpecStore>;
export declare function resetStore(): void;
//# sourceMappingURL=store.d.ts.map