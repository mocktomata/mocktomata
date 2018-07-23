import { SpecIO } from '../spec/types';
import { PluginIO, PluginModule } from '../types';
export declare type MemoryIO = {
    addPlugin(name: string, plugin: PluginModule): void;
} & SpecIO & PluginIO;
export declare function createMemoryIO(): MemoryIO;
//# sourceMappingURL=createMemoryIO.d.ts.map