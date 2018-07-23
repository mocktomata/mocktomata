import { KomondorPlugin, PluginIO, PluginModule } from '../plugin/types';
import { SpecIO } from '../spec';
export declare type TestIO = {
    specs: Record<string, string>;
    addPluginModule(moduleName: string, pluginModule: PluginModule): void;
    addPlugin(moduleName: string, ...plugins: KomondorPlugin[]): void;
} & SpecIO & PluginIO;
export declare function createTestIO(): TestIO;
//# sourceMappingURL=createTestIO.d.ts.map