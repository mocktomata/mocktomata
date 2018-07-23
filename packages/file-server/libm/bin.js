#!/usr/bin/env node
import updateNotifier from 'update-notifier';
import { cli } from './cli';
const pkg = require('../package.json');
updateNotifier({ pkg }).notify();
cli.parse(process.argv)
    .catch(err => {
    console.error(err);
});
// putting the cli here for the moment.
// The cli will be moved into `komondor` itself.
//# sourceMappingURL=bin.js.map