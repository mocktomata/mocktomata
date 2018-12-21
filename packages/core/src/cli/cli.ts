import { Cli } from 'clibuilder'

const pjson = require('../../package.json')

export const cli = new Cli({ name: 'komondor', version: pjson.version, commands: [] })
