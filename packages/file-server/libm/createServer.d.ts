import { ServerInfo } from 'hapi';
import { Options } from './interfaces';
/**
 * @param options.port The port number to start the server with.
 * This should not be specified in normal use. For testing only.
 */
export declare function createServer(options?: Partial<Options>): {
    info: ServerInfo;
    start(): Promise<void>;
    stop(): Promise<void>;
};
//# sourceMappingURL=createServer.d.ts.map