import { LogLevel } from '@unional/logging';
import { MemoryAppender } from 'aurelia-logging-memory';
import { SpecRecord } from './spec';
export declare type TestHarness = ReturnType<typeof createTestHarness>;
export declare function createTestHarness(options?: Partial<{
    level: LogLevel;
    showLog: boolean;
}>): {
    io: import("./test-util").TestIO;
    appender: MemoryAppender;
    reset(): void;
    getSpec(id: string): SpecRecord;
    logSpecs(): void;
};
//# sourceMappingURL=createTestHarness.d.ts.map