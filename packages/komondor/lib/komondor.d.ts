import { SpecMode } from '@komondor-lab/core';
export declare const ctx: import("async-fp").Context<{
    logger: import("@unional/logging").Logger;
    io: {
        readSpec(id: string): Promise<import("@komondor-lab/core").SpecRecord>;
        writeSpec(id: string, record: import("@komondor-lab/core").SpecRecord): Promise<void>;
        readScenario(id: string): Promise<any>;
        writeScenario(id: string, record: import("@komondor-lab/core").ScenarioRecord): Promise<void>;
        getPluginList(): Promise<string[]>;
        loadPlugin(name: string): Promise<import("@komondor-lab/plugin").PluginModule>;
    };
}>;
export declare const config: {
    spec(mode: SpecMode, ...filters: (string | RegExp)[]): void;
    scenario(mode: SpecMode, ...filters: (string | RegExp)[]): void;
};
//# sourceMappingURL=komondor.d.ts.map