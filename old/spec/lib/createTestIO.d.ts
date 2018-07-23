import { SpecIO } from '../spec/types';
import { PluginIO, PluginModule, KomondorPlugin } from '../types';
export declare type MemoryIO = {
    addPluginModule(moduleName: string, pluginModule: PluginModule): void;
    addPlugin(moduleName: string, plugin: KomondorPlugin): void;
} & SpecIO & PluginIO;
export declare function createTestIO(): MemoryIO;
//# sourceMappingURL=createTestIO.d.ts.map
