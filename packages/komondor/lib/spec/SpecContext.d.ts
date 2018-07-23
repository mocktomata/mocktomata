import { Logger } from '@unional/logging';
import { SpecAction } from './interfaces';
export declare type SpecRecord = {
    actions: SpecAction[];
};
export declare type SpecIO = {
    readSpec(id: string): Promise<SpecRecord>;
    writeSpec(id: string, record: SpecRecord): Promise<void>;
};
export declare type SpecContext = {
    io: SpecIO;
};
export declare type SpySpecContext = SpecContext & {
    logger: Logger;
};
//# sourceMappingURL=SpecContext.d.ts.map