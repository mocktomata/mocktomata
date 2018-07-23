import { PluginModule } from '@komondor-lab/core';
export declare type Repository = {
    readSpec(id: string): Promise<string>;
    writeSpec(id: string, data: string): Promise<void>;
    readScenario(id: string): Promise<string>;
    writeScenario(id: string, data: string): Promise<void>;
    getPluginList(): Promise<string[]>;
    loadPlugin(name: string): Promise<PluginModule>;
};
export declare function createFileRepository(cwd: string): Repository;
//# sourceMappingURL=createFileRepository.d.ts.map