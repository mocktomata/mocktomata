export declare function getIO(): Promise<{
    readSpec(id: string): Promise<any>;
    writeSpec(id: string, record: import("@komondor-lab/io-client").SpecRecord): Promise<boolean>;
    readScenario(id: string): Promise<any>;
    writeScenario(id: string, record: any): Promise<boolean>;
    loadConfig(): Promise<any>;
    loadPlugin(name: string): Promise<void>;
    _deps: {
        fetch: {
            (input: RequestInfo, init?: RequestInit | undefined): Promise<Response>;
            (input: RequestInfo, init?: RequestInit | undefined): Promise<Response>;
        };
    };
}>;
//# sourceMappingURL=getIO-browser.d.ts.map