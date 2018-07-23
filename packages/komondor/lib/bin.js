#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cli_1 = require("./cli");
cli_1.cli.parse(process.argv)
    .catch(function (err) {
    console.error(err);
});
//# sourceMappingURL=bin.js.map