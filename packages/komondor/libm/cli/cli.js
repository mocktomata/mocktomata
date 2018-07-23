import { Cli } from 'clibuilder';
import { serveCommand } from './serveCommand';
const pjson = require('../../package.json');
export const cli = new Cli({ name: 'komondor', version: pjson.version, commands: [serveCommand] });
//# sourceMappingURL=cli.js.map