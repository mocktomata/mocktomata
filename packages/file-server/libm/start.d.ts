import { ServerInfo } from 'hapi';
import { Options } from './types';
export declare function start(options?: Partial<Options>): Promise<{
    info: ServerInfo;
    stop(options?: {
        timeout: number;
    } | undefined): Promise<void>;
}>;
//# sourceMappingURL=start.d.ts.map