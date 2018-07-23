import fs from 'fs';
export const bundleCommand = {
    name: 'bundle-plugins',
    description: 'Bundle plugins for browser usage',
    options: {
        string: {
            config: {
                description: 'config file to load',
                default: 'komondor.config.js'
            },
            output: {
                description: 'path for the output bundled file'
            }
        }
    },
    run(args) {
        const { config } = args;
        const komondorConfig = fs.readFileSync(config, 'utf-8');
        console.info('not implemented. config:');
        console.info(komondorConfig);
    }
};
//# sourceMappingURL=bundleCommand.js.map