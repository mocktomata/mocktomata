import { LoadPluginContext } from './typesInternal';
/**
 * Load plugins to the system.
 */
export declare function loadPlugins({ io }: LoadPluginContext): Promise<void[]>;
export declare function loadPlugin({ io }: LoadPluginContext, moduleName: string): Promise<void>;
//# sourceMappingURL=loadPlugins.d.ts.map