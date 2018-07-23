#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var update_notifier_1 = __importDefault(require("update-notifier"));
var cli_1 = require("./cli");
var pkg = require('../package.json');
update_notifier_1.default({ pkg: pkg }).notify();
cli_1.cli.parse(process.argv)
    .catch(function (err) {
    console.error(err);
});
// putting the cli here for the moment.
// The cli will be moved into `komondor` itself.
//# sourceMappingURL=bin.js.map