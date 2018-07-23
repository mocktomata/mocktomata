"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var clibuilder_1 = require("clibuilder");
var serveCommand_1 = require("./serveCommand");
var pjson = require('../../package.json');
exports.cli = new clibuilder_1.Cli({ name: 'komondor', version: pjson.version, commands: [serveCommand_1.serveCommand] });
//# sourceMappingURL=cli.js.map