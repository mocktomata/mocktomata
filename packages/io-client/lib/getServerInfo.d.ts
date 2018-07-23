import { CreateIOOptions } from './types';
import { Context } from './typesInternal';
export declare type ServerInfo = {
    version: string;
    url: string;
    plugins: string[];
};
export declare function getServerInfo(context: Context, options?: CreateIOOptions): Promise<ServerInfo>;
//# sourceMappingURL=getServerInfo.d.ts.map