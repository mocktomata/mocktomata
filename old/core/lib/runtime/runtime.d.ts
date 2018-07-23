import { Logger } from '@unional/logging';
import { IO } from '../io';
export declare type RuntimeContext = {
    io: IO;
    logger: Logger;
};
export declare type RuntimeOptions = {
    /**
     * Default libs to load.
     * Some enviornment may not support all default libs.
     * This option allows each environment controls what libs to load.
     */
    libs: string[];
    io: IO;
};
export declare function start({ libs, io }: RuntimeOptions): void;
export declare const ready: Promise<RuntimeContext>;
//# sourceMappingURL=runtime.d.ts.map