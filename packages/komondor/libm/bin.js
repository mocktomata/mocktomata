#!/usr/bin/env node
import { cli } from './cli';
cli.parse(process.argv)
    .catch((err) => {
    console.error(err);
});
//# sourceMappingURL=bin.js.map