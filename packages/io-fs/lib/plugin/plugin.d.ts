export declare function createPluginRepository({ cwd, config }: {
    cwd: string;
    config: {
        plugins?: string[];
    };
}): {
    getPluginList(): Promise<string[]>;
    loadPlugin(name: string): Promise<any>;
};
//# sourceMappingURL=plugin.d.ts.map