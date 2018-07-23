export declare function createScenarioRepository(komondorFolder: string): {
    readScenario(id: string): Promise<string>;
    writeScenario(id: string, data: string): Promise<void>;
};
export declare function getScenarioFolder(komondorFolder: string): string;
//# sourceMappingURL=scenario.d.ts.map