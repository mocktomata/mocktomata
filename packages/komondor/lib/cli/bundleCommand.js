"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
exports.bundleCommand = {
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
    run: function (args) {
        var config = args.config;
        var komondorConfig = fs_1.default.readFileSync(config, 'utf-8');
        console.info('not implemented. config:');
        console.info(komondorConfig);
    }
};
//# sourceMappingURL=bundleCommand.js.map