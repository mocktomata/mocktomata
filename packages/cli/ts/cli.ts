import { cli } from 'clibuilder'
import { serveCommand } from './serve_command.js'
import require from 'uni-require'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pjson = require('./package.json')

export const app = cli({ name: 'mtmt', version: pjson.version }).command(serveCommand)
