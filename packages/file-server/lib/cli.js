"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var clibuilder_1 = require("clibuilder");
var version_1 = require("./version");
var commands_1 = require("./commands");
exports.cli = new clibuilder_1.Cli({
    name: 'uni',
    version: version_1.getVersion(),
    defaultConfig: { devpkgKeywords: ['uni-devpkg'] },
    commands: [commands_1.startCommand]
});
//# sourceMappingURL=cli.js.map