export declare function createSpecRepository(komondorFolder: string): {
    readSpec(id: string): Promise<string>;
    writeSpec(id: string, data: string): Promise<void>;
};
export declare function getSpecFolder(komondorFolder: string): string;
//# sourceMappingURL=spec.d.ts.map