import { Cli } from 'clibuilder'
import { serveCommand } from './serveCommand';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pjson = require('../../package.json')

export const cli = new Cli({ name: 'komondor', version: pjson.version, commands: [serveCommand] })
