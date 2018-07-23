export declare function startup(): Promise<{
    io: {
        readSpec(id: string): Promise<import("@komondor-lab/io-local").SpecRecord>;
        writeSpec(id: string, record: import("@komondor-lab/io-local").SpecRecord): Promise<undefined>;
        readScenario(id: string): Promise<any>;
        writeScenario(id: string, record: any): Promise<undefined>;
        loadConfig(): Promise<Record<string, any>>;
        loadPlugin(name: string): Promise<any>;
        _deps: {
            loadConfig: typeof import("@komondor-lab/io-fs").loadConfig;
            loadPlugin: typeof import("@komondor-lab/io-local/lib/loadPlugin").loadPlugin;
            spec: {
                read(id: string): Promise<string>;
                write(id: string, data: string): Promise<undefined>;
            };
            scenario: {
                read(id: string): Promise<any>;
                write(id: string, data: string): Promise<undefined>;
            };
        };
    };
    logger: import("@unional/logging").Logger;
}>;
//# sourceMappingURL=startup.d.ts.map