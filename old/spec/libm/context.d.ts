import { Logger } from '@unional/logging';
import { PluginIO } from './types';
import { SpecIO } from './spec/types';
export declare const context: import("async-fp").Context<SpecContext>;
export declare type SpecContext = {
    log: Logger;
    io: SpecIO & PluginIO;
};
//# sourceMappingURL=context.d.ts.map