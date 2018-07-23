import { RequiredPick } from 'type-plus';
import { KomondorPlugin, PluginIO } from './types';
export declare type PluginInstance = RequiredPick<KomondorPlugin, 'name'>;
export declare type LoadPluginContext = {
    io: PluginIO;
};
//# sourceMappingURL=typesInternal.d.ts.map